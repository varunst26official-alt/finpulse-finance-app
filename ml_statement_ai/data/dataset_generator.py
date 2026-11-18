"""
Dataset Generator for Indian Bank Statements (HDFC, SBI, ICICI, Axis)
Generates tabular statement layouts with token bounding boxes and entity ground truth.
Enforces 100% mathematical consistency on the generated ground truth.
"""

import random
import json
from decimal import Decimal, ROUND_HALF_UP
from typing import List, Dict, Any, Tuple


BANKS = ["HDFC BANK", "STATE BANK OF INDIA", "ICICI BANK", "AXIS BANK"]

UPI_MERCHANTS = [
    "UPI/SWIGGY/428190/Bangalore",
    "UPI/ZOMATO/519283/Gurgaon",
    "UPI/AMAZON PAY/819230/Retail",
    "UPI/FLIPKART/918234/Online",
    "UPI/UBER INDIA/281934/Rides",
    "UPI/ZEPTO/381920/QuickCommerce",
    "UPI/BLINKIT/718293/Grocery",
    "UPI/TATA 1MG/618293/Pharmacy",
    "UPI/APOLLO PHARMACY/918230",
    "UPI/RELIANCE RETAIL/518293",
    "UPI/SHELL FUEL/618290/Petrol",
    "UPI/IOCL PETROL/918203/Fuel",
    "UPI/STARBUCKS COFFEE/418290",
]

INCOME_SOURCES = [
    "ACH CR/ENTERPRISE LEAD SALARY/HDFC001",
    "NEFT CR/CONSULTING ADVISORY/ICIC002",
    "IMPS CR/FLAT RENTAL YIELD/SBIN003",
    "INT CR/QUARTERLY SAVINGS INTEREST",
    "DIVIDEND CR/MUTUAL FUND CAS/CAMS",
]

EXPENSE_TYPES = [
    "ACH DR/HDFC HOME LOAN EMI/918230",
    "ACH DR/TATA AIA TERM INSURANCE/4182",
    "ACH DR/NIFTY 50 INDEX SIP CONTRIBUTION",
    "NEFT DR/MAINTENANCE SOCIETY CHARGES",
    "BILLPAY/ELECTRICITY DISCOM TANGEDCO",
    "BILLPAY/AIRTEL BROADBAND FIBER",
]

LABEL_MAP = {
    "O": 0,
    "HEADER": 1,
    "OPENING_BALANCE": 2,
    "CLOSING_BALANCE": 3,
    "TXN_DATE": 4,
    "TXN_NARRATION": 5,
    "TXN_REF": 6,
    "TXN_DEBIT": 7,
    "TXN_CREDIT": 8,
    "TXN_BALANCE": 9,
}

ID2LABEL = {v: k for k, v in LABEL_MAP.items()}


def format_inr(val: Decimal) -> str:
    """Format Decimal into Indian number notation e.g. 1,52,100.00"""
    s = f"{val:.2f}"
    parts = s.split(".")
    integer_part = parts[0]
    decimal_part = parts[1]

    if len(integer_part) <= 3:
        formatted = integer_part
    else:
        last3 = integer_part[-3:]
        rest = integer_part[:-3]
        groups = []
        while len(rest) > 2:
            groups.insert(0, rest[-2:])
            rest = rest[:-2]
        if rest:
            groups.insert(0, rest)
        formatted = ",".join(groups) + "," + last3

    return f"{formatted}.{decimal_part}"


class BankStatementSynthesizer:
    def __init__(self, seed: int = 42):
        random.seed(seed)

    def generate_statement(self, num_transactions: int = 15) -> Dict[str, Any]:
        bank = random.choice(BANKS)
        account_no = f"XXXXXX{random.randint(1000, 9999)}"
        ifsc = f"{bank[:4]}000{random.randint(100, 999)}"
        opening_balance = Decimal(str(random.randint(40000, 150000))).quantize(Decimal("0.01"))

        running_balance = opening_balance
        transactions = []
        tokens = []
        boxes = []
        labels = []

        # 1. Header Tokens
        y_cursor = 40
        header_text = f"{bank} ACCOUNT STATEMENT FOR ACCOUNT {account_no} IFSC {ifsc}"
        for word in header_text.split():
            tokens.append(word)
            boxes.append([50, y_cursor, 400, y_cursor + 15])
            labels.append(LABEL_MAP["HEADER"])

        # Opening Balance Line
        y_cursor += 30
        op_text = f"OPENING BALANCE AS ON 01/10/2026 : {format_inr(opening_balance)}"
        tokens.extend(["OPENING", "BALANCE", ":", format_inr(opening_balance)])
        boxes.extend([
            [50, y_cursor, 120, y_cursor + 15],
            [125, y_cursor, 190, y_cursor + 15],
            [195, y_cursor, 205, y_cursor + 15],
            [210, y_cursor, 320, y_cursor + 15],
        ])
        labels.extend([
            LABEL_MAP["HEADER"],
            LABEL_MAP["HEADER"],
            LABEL_MAP["O"],
            LABEL_MAP["OPENING_BALANCE"],
        ])

        # Table Column Headers
        y_cursor += 35
        cols = ["DATE", "NARRATION", "CHQ/REF", "DEBIT", "CREDIT", "BALANCE"]
        col_x = [50, 140, 320, 420, 520, 620]
        for c_idx, c in enumerate(cols):
            tokens.append(c)
            boxes.append([col_x[c_idx], y_cursor, col_x[c_idx] + 70, y_cursor + 14])
            labels.append(LABEL_MAP["HEADER"])

        # 2. Transactions
        day = 1
        for t_idx in range(num_transactions):
            y_cursor += 22
            day = min(30, day + random.choice([0, 1, 2]))
            date_str = f"{day:02d}/10/2026"

            is_credit = random.random() < 0.35
            ref_no = f"UPI{random.randint(10000000, 99999999)}"

            if is_credit:
                narration = random.choice(INCOME_SOURCES)
                credit_amt = Decimal(str(random.randint(500, 85000))).quantize(Decimal("0.01"))
                debit_amt = Decimal("0.00")
                running_balance += credit_amt
            else:
                narration = random.choice(UPI_MERCHANTS if random.random() < 0.7 else EXPENSE_TYPES)
                debit_amt = Decimal(str(random.randint(100, 25000))).quantize(Decimal("0.01"))
                credit_amt = Decimal("0.00")
                running_balance -= debit_amt

            transactions.append({
                "date": date_str,
                "description": narration,
                "reference": ref_no,
                "debit": float(debit_amt),
                "credit": float(credit_amt),
                "balance": float(running_balance),
            })

            # Add Token Bounding Boxes
            # Date
            tokens.append(date_str)
            boxes.append([50, y_cursor, 130, y_cursor + 14])
            labels.append(LABEL_MAP["TXN_DATE"])

            # Narration
            tokens.append(narration)
            boxes.append([140, y_cursor, 310, y_cursor + 14])
            labels.append(LABEL_MAP["TXN_NARRATION"])

            # Reference
            tokens.append(ref_no)
            boxes.append([320, y_cursor, 410, y_cursor + 14])
            labels.append(LABEL_MAP["TXN_REF"])

            # Debit
            debit_str = format_inr(debit_amt) if debit_amt > 0 else "-"
            tokens.append(debit_str)
            boxes.append([420, y_cursor, 510, y_cursor + 14])
            labels.append(LABEL_MAP["TXN_DEBIT"] if debit_amt > 0 else LABEL_MAP["O"])

            # Credit
            credit_str = format_inr(credit_amt) if credit_amt > 0 else "-"
            tokens.append(credit_str)
            boxes.append([520, y_cursor, 610, y_cursor + 14])
            labels.append(LABEL_MAP["TXN_CREDIT"] if credit_amt > 0 else LABEL_MAP["O"])

            # Balance
            bal_str = format_inr(running_balance)
            tokens.append(bal_str)
            boxes.append([620, y_cursor, 730, y_cursor + 14])
            labels.append(LABEL_MAP["TXN_BALANCE"])

        # Closing Balance Line
        y_cursor += 30
        close_text = f"CLOSING BALANCE AS ON 31/10/2026 : {format_inr(running_balance)}"
        tokens.extend(["CLOSING", "BALANCE", ":", format_inr(running_balance)])
        boxes.extend([
            [50, y_cursor, 120, y_cursor + 14],
            [125, y_cursor, 195, y_cursor + 14],
            [200, y_cursor, 210, y_cursor + 14],
            [215, y_cursor, 330, y_cursor + 14],
        ])
        labels.extend([
            LABEL_MAP["HEADER"],
            LABEL_MAP["HEADER"],
            LABEL_MAP["O"],
            LABEL_MAP["CLOSING_BALANCE"],
        ])

        return {
            "bank": bank,
            "account_no": account_no,
            "opening_balance": float(opening_balance),
            "closing_balance": float(running_balance),
            "transactions": transactions,
            "tokens": tokens,
            "boxes": boxes,
            "labels": labels,
            "width": 800,
            "height": y_cursor + 50,
        }

    def generate_batch(self, count: int = 100) -> List[Dict[str, Any]]:
        batch = []
        for i in range(count):
            num_txns = random.randint(10, 25)
            stmt = self.generate_statement(num_transactions=num_txns)
            batch.append(stmt)
        return batch


if __name__ == "__main__":
    synthesizer = BankStatementSynthesizer(seed=123)
    sample = synthesizer.generate_statement(5)
    print(f"Generated sample statement for: {sample['bank']}")
    print(f"Total Tokens: {len(sample['tokens'])}, Transactions: {len(sample['transactions'])}")
    print(f"Opening: {sample['opening_balance']}, Closing: {sample['closing_balance']}")
