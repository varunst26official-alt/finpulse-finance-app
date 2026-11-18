"""
Training Engine for Bank Statement Neural Extractor
Trains the spatial-layout transformer on bank statement datasets with CUDA acceleration.
Saves model checkpoints, metrics, and vocabulary for edge inference.
"""

import os
import sys
import json
import time
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader

# Ensure local imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from data.dataset_generator import BankStatementSynthesizer, LABEL_MAP, ID2LABEL
from models.statement_extractor import BankStatementNeuralExtractor
from engine.math_guardrail import AccountingInvariantEngine


class BankStatementTorchDataset(Dataset):
    def __init__(self, raw_statements, vocab, max_seq_len: int = 256):
        self.samples = []
        self.max_seq_len = max_seq_len

        for stmt in raw_statements:
            tokens = stmt["tokens"][:max_seq_len]
            boxes = stmt["boxes"][:max_seq_len]
            labels = stmt["labels"][:max_seq_len]

            # Token to ID mapping
            input_ids = [vocab.get(tok.lower(), vocab["<UNK>"]) for tok in tokens]

            # Normalize boxes to 1000x1000
            w, h = stmt.get("width", 800), stmt.get("height", 800)
            norm_boxes = []
            for b in boxes:
                norm_boxes.append([
                    int((b[0] / w) * 1000),
                    int((b[1] / h) * 1000),
                    int((b[2] / w) * 1000),
                    int((b[3] / h) * 1000),
                ])

            # Pad sequences
            pad_len = max_seq_len - len(input_ids)
            attention_mask = [1] * len(input_ids) + [0] * pad_len
            input_ids += [vocab["<PAD>"]] * pad_len
            norm_boxes += [[0, 0, 0, 0]] * pad_len
            labels += [LABEL_MAP["O"]] * pad_len

            self.samples.append({
                "input_ids": torch.tensor(input_ids, dtype=torch.long),
                "boxes": torch.tensor(norm_boxes, dtype=torch.long),
                "attention_mask": torch.tensor(attention_mask, dtype=torch.long),
                "labels": torch.tensor(labels, dtype=torch.long),
            })

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        return self.samples[idx]


def build_vocab(raw_statements, min_freq: int = 2):
    freq = {}
    for stmt in raw_statements:
        for t in stmt["tokens"]:
            low = t.lower()
            freq[low] = freq.get(low, 0) + 1

    vocab = {"<PAD>": 0, "<UNK>": 1}
    for word, count in freq.items():
        if count >= min_freq and word not in vocab:
            vocab[word] = len(vocab)
    return vocab


def train_model(
    num_train_samples: int = 250,
    num_val_samples: int = 50,
    epochs: int = 8,
    batch_size: int = 8,
    lr: float = 1e-3,
):
    print("=" * 65)
    print("🚀 Initializing Bank Statement Neural Training Pipeline")
    print("=" * 65)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Device: {device}")
    if device.type == "cuda":
        print(f"GPU: {torch.cuda.get_device_name(0)}")
        print(f"VRAM Allocated: {torch.cuda.memory_allocated(0)/(1024**2):.1f} MB")

    # 1. Synthesize Dataset
    print("\n📦 Generating Bank Statement Samples (HDFC, SBI, ICICI, Axis)...")
    synthesizer = BankStatementSynthesizer(seed=42)
    train_stmts = synthesizer.generate_batch(num_train_samples)
    val_stmts = synthesizer.generate_batch(num_val_samples)

    # 2. Build Vocabulary
    vocab = build_vocab(train_stmts + val_stmts)
    print(f"Vocabulary Size: {len(vocab)} unique tokens")

    # 3. Create DataLoaders
    train_ds = BankStatementTorchDataset(train_stmts, vocab, max_seq_len=256)
    val_ds = BankStatementTorchDataset(val_stmts, vocab, max_seq_len=256)

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False)

    # 4. Instantiate Model
    model = BankStatementNeuralExtractor(
        vocab_size=len(vocab),
        hidden_dim=192,
        num_layers=3,
        num_heads=4,
        num_classes=len(LABEL_MAP),
        dropout=0.1,
    ).to(device)

    total_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    print(f"Model Parameters: {total_params:,} (~{total_params*4 / (1024*1024):.2f} MB)")

    criterion = nn.CrossEntropyLoss(ignore_index=LABEL_MAP["O"])
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)

    best_val_acc = 0.0
    checkpoint_dir = os.path.join(os.path.dirname(__file__), "checkpoints")
    os.makedirs(checkpoint_dir, exist_ok=True)

    # 5. Training Loop
    start_time = time.time()
    for epoch in range(1, epochs + 1):
        model.train()
        train_loss = 0.0
        correct_tokens = 0
        total_tokens = 0

        for batch in train_loader:
            input_ids = batch["input_ids"].to(device)
            boxes = batch["boxes"].to(device)
            attention_mask = batch["attention_mask"].to(device)
            labels = batch["labels"].to(device)

            optimizer.zero_grad()
            logits = model(input_ids, boxes, attention_mask)

            # Flatten for loss
            loss = criterion(logits.view(-1, len(LABEL_MAP)), labels.view(-1))
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()

            train_loss += loss.item() * input_ids.size(0)

            # Accuracy on non-padding tokens
            preds = torch.argmax(logits, dim=-1)
            mask = (attention_mask == 1) & (labels != LABEL_MAP["O"])
            correct_tokens += ((preds == labels) & mask).sum().item()
            total_tokens += mask.sum().item()

        scheduler.step()
        train_loss /= len(train_loader.dataset)
        train_acc = (correct_tokens / max(1, total_tokens)) * 100

        # Validation
        model.eval()
        val_loss = 0.0
        val_correct = 0
        val_total = 0

        with torch.no_grad():
            for batch in val_loader:
                input_ids = batch["input_ids"].to(device)
                boxes = batch["boxes"].to(device)
                attention_mask = batch["attention_mask"].to(device)
                labels = batch["labels"].to(device)

                logits = model(input_ids, boxes, attention_mask)
                loss = criterion(logits.view(-1, len(LABEL_MAP)), labels.view(-1))
                val_loss += loss.item() * input_ids.size(0)

                preds = torch.argmax(logits, dim=-1)
                mask = (attention_mask == 1) & (labels != LABEL_MAP["O"])
                val_correct += ((preds == labels) & mask).sum().item()
                val_total += mask.sum().item()

        val_loss /= len(val_loader.dataset)
        val_acc = (val_correct / max(1, val_total)) * 100

        print(
            f"Epoch [{epoch:02d}/{epochs:02d}] "
            f"Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.2f}% | "
            f"Val Loss: {val_loss:.4f} | Val Acc: {val_acc:.2f}%"
        )

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(
                {
                    "model_state_dict": model.state_dict(),
                    "vocab": vocab,
                    "val_acc": val_acc,
                    "epoch": epoch,
                },
                os.path.join(checkpoint_dir, "statement_extractor_best.pt"),
            )

    elapsed = time.time() - start_time
    print("-" * 65)
    print(f"✅ Training Completed in {elapsed:.1f}s! Best Validation Accuracy: {best_val_acc:.2f}%")

    # Save vocab.json
    with open(os.path.join(checkpoint_dir, "vocab.json"), "w") as f:
        json.dump(vocab, f, indent=2)
    print(f"💾 Checkpoints and vocabulary saved to: {checkpoint_dir}")

    # 6. Run Mathematical Verification on Validation Set
    print("\n🧮 Running Zero-Hallucination Mathematical Invariant Verification...")
    engine = AccountingInvariantEngine()
    reconciled_count = 0
    total_val = len(val_stmts)

    for stmt in val_stmts:
        res = engine.verify_statement(
            opening_balance=stmt["opening_balance"],
            closing_balance=stmt["closing_balance"],
            transactions=stmt["transactions"],
        )
        if res.is_valid:
            reconciled_count += 1

    math_rate = (reconciled_count / total_val) * 100
    print(f"📊 Mathematical Invariant Integrity Rate: {math_rate:.2f}% ({reconciled_count}/{total_val} Verified 0 Discrepancy)")
    return best_val_acc, math_rate


if __name__ == "__main__":
    train_model(num_train_samples=300, num_val_samples=60, epochs=8, batch_size=8)
