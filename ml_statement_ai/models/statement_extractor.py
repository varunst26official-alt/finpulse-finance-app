"""
Spatial Layout-Aware Neural Network for Bank Statement Entity Extraction
Fuses 1D Token Embeddings with 2D Spatial Bounding-Box Coordinates.
Optimized for low-VRAM training & sub-10ms edge inference on NVIDIA GTX 1650.
"""

import math
import torch
import torch.nn as nn
import torch.nn.functional as F
from typing import Dict, Any, Tuple


class SpatialCoordinateEmbedding(nn.Module):
    """
    Embeds 2D bounding boxes (x0, y0, x1, y1, width, height) into dense vector space.
    Normalizes coordinates to [0, 1000] standard layout grid.
    """

    def __init__(self, hidden_dim: int = 128, max_coord: int = 1000):
        super().__init__()
        self.x0_emb = nn.Embedding(max_coord + 1, hidden_dim // 4)
        self.y0_emb = nn.Embedding(max_coord + 1, hidden_dim // 4)
        self.x1_emb = nn.Embedding(max_coord + 1, hidden_dim // 4)
        self.y1_emb = nn.Embedding(max_coord + 1, hidden_dim // 4)

        self.dense = nn.Linear(hidden_dim, hidden_dim)
        self.layer_norm = nn.LayerNorm(hidden_dim)

    def forward(self, boxes: torch.Tensor) -> torch.Tensor:
        # boxes shape: [batch_size, seq_len, 4] -> clamped to [0, 1000]
        clamped = torch.clamp(boxes, 0, 1000).long()
        x0 = self.x0_emb(clamped[:, :, 0])
        y0 = self.y0_emb(clamped[:, :, 1])
        x1 = self.x1_emb(clamped[:, :, 2])
        y1 = self.y1_emb(clamped[:, :, 3])

        concat = torch.cat([x0, y0, x1, y1], dim=-1)
        spatial_features = self.layer_norm(self.dense(concat))
        return spatial_features


class BankStatementNeuralExtractor(nn.Module):
    """
    Hybrid 2D Spatial Layout Transformer for Bank Statements.
    Predicts token labels (Date, Narration, Ref, Debit, Credit, Balance, Opening, Closing).
    """

    def __init__(
        self,
        vocab_size: int = 2500,
        hidden_dim: int = 192,
        num_layers: int = 3,
        num_heads: int = 4,
        num_classes: int = 10,
        dropout: float = 0.1,
    ):
        super().__init__()
        self.hidden_dim = hidden_dim
        self.token_embedding = nn.Embedding(vocab_size, hidden_dim, padding_idx=0)
        self.spatial_embedding = SpatialCoordinateEmbedding(hidden_dim=hidden_dim)

        self.fusion_norm = nn.LayerNorm(hidden_dim)
        self.dropout = nn.Dropout(dropout)

        encoder_layer = nn.TransformerEncoderLayer(
            d_model=hidden_dim,
            nhead=num_heads,
            dim_feedforward=hidden_dim * 2,
            dropout=dropout,
            batch_first=True,
            activation="gelu",
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)

        self.classifier = nn.Sequential(
            nn.Linear(hidden_dim, hidden_dim),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim, num_classes),
        )

    def forward(
        self,
        input_ids: torch.Tensor,
        boxes: torch.Tensor,
        attention_mask: torch.Tensor = None,
    ) -> torch.Tensor:
        """
        input_ids: [batch_size, seq_len]
        boxes: [batch_size, seq_len, 4] (x0, y0, x1, y1)
        attention_mask: [batch_size, seq_len] (1 for valid token, 0 for pad)
        """
        token_feats = self.token_embedding(input_ids)
        spatial_feats = self.spatial_embedding(boxes)

        # Fused multi-modal representations (Semantic + Spatial coordinates)
        fused = self.fusion_norm(token_feats + spatial_feats)
        fused = self.dropout(fused)

        src_key_padding_mask = (
            (attention_mask == 0) if attention_mask is not None else None
        )
        contextual_feats = self.transformer(
            fused, src_key_padding_mask=src_key_padding_mask
        )

        logits = self.classifier(contextual_feats)
        return logits
