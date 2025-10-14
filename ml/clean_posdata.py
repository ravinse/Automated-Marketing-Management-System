"""Clean POS transactional dataset and load to MongoDB Atlas.

Usage (after creating/activating a virtual environment and installing requirements):
    python ml/clean_posdata.py \
        --input db/posdata.csv \
        --mongo-uri "$MONGODB_URI" \
        --database retail_db \
        --collection newdatabase

Environment variables:
    MONGODB_URI can be provided instead of --mongo-uri flag.

The script performs:
1. Read CSV with dtype inference.
2. Standardize column names (snake_case).
3. Trim whitespace in object columns.
4. Deduplicate exact duplicate rows (keep first).
5. Parse Date column into ISO datetime (assumes m/d/yy or m/d/yyyy).
6. Coerce numeric columns to ints (Quantity) and floats (Price, Total) then validate Total≈Quantity*Price.
7. Fill missing Clothing_Category with 'Unknown'.
8. Validate key uniqueness for Order_ID; generate _id = Order_ID.
9. Basic email + phone format sanity checks (log but do not drop rows unless completely invalid pattern).
10. Upload in batches to MongoDB (ordered=False for resilience).

Outputs:
 - Prints summary stats.
 - Writes an optional cleaned parquet/csv if --export specified.
"""

from __future__ import annotations

import argparse
import os
import re
import sys
from datetime import datetime
from typing import Iterable, List

import pandas as pd
from pymongo import MongoClient, errors


EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[A-Za-z]{2,}$")
PHONE_RE = re.compile(r"^[0-9]{9,15}$")  # simple numeric phone check


NUMERIC_COLUMNS = {
    "quantity": int,
    "price_lkr": float,
    "total_amount_lkr": float,
}


def snake_case(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", name.strip().lower()).strip("_")


def parse_date(value: str) -> datetime | None:
    if not value or pd.isna(value):
        return None
    value = str(value).strip()
    fmts = ["%m/%d/%y", "%m/%d/%Y"]
    for fmt in fmts:
        try:
            return datetime.strptime(value, fmt)
        except ValueError:
            continue
    return None


def validate_and_adjust_totals(df: pd.DataFrame, tolerance: float = 0.01) -> pd.DataFrame:
    calc = df["quantity"] * df["price_lkr"]
    diff = (df["total_amount_lkr"] - calc).abs()
    mismatches = diff > tolerance
    if mismatches.any():
        # Replace inconsistent totals with calculated value
        df.loc[mismatches, "total_amount_lkr"] = calc[mismatches]
    return df


def clean_dataframe(df: pd.DataFrame) -> pd.DataFrame:
    # Column name normalization
    df.columns = [snake_case(c) for c in df.columns]

    # Trim object columns
    for col in df.select_dtypes(include=["object"]).columns:
        df[col] = df[col].astype(str).str.strip()

    # Deduplicate
    before = len(df)
    df = df.drop_duplicates()
    dup_removed = before - len(df)

    # Parse date
    if "date" in df.columns:
        df["order_date"] = df["date"].apply(parse_date)
        df.drop(columns=["date"], inplace=True)

    # Numeric coercion
    for col, typ in NUMERIC_COLUMNS.items():
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")
            if typ is int:
                df[col] = df[col].fillna(0).astype(int)
            else:
                df[col] = df[col].fillna(0.0).astype(float)

    # Fill missing clothing_category
    if "clothing_category" in df.columns:
        df["clothing_category"] = df["clothing_category"].replace({"": None})
        df["clothing_category"] = df["clothing_category"].fillna("Unknown")

    # Adjust totals
    if all(col in df.columns for col in ["quantity", "price_lkr", "total_amount_lkr"]):
        df = validate_and_adjust_totals(df)

    # Basic email / phone validity flags
    if "email" in df.columns:
        df["email_valid"] = df["email"].apply(lambda x: bool(EMAIL_RE.match(str(x))))
    if "phone_number" in df.columns:
        # Ensure string type before str operations
        df["phone_number"] = df["phone_number"].astype(str)
        cleaned_phone = df["phone_number"].str.replace(r"[+\-\s]", "", regex=True)
        df["phone_valid"] = cleaned_phone.apply(lambda x: bool(PHONE_RE.match(str(x))))

    # Derive order_year, month
    if "order_date" in df.columns:
        df["order_year"] = df["order_date"].dt.year
        df["order_month"] = df["order_date"].dt.month

    # Ensure order_id uniqueness & set _id
    if "order_id" in df.columns:
        if df["order_id"].duplicated().any():
            # If duplicates exist, append a suffix to make unique _id
            counts = df.groupby("order_id").cumcount()
            df["_id"] = df["order_id"] + counts.replace(0, "").astype(str)
        else:
            df["_id"] = df["order_id"]

    return df


def chunk_iterable(it: Iterable, size: int) -> Iterable[List]:
    batch = []
    for item in it:
        batch.append(item)
        if len(batch) >= size:
            yield batch
            batch = []
    if batch:
        yield batch


def upload_to_mongo(df: pd.DataFrame, mongo_uri: str, database: str, collection: str, batch_size: int = 1000) -> None:
    client = MongoClient(mongo_uri)
    coll = client[database][collection]
    records = df.to_dict(orient="records")
    inserted = 0
    for batch in chunk_iterable(records, batch_size):
        try:
            res = coll.insert_many(batch, ordered=False)
            inserted += len(res.inserted_ids)
        except errors.BulkWriteError as e:
            # Count successful inserts
            write_errors = e.details.get("writeErrors", [])
            inserted += len(batch) - len(write_errors)
            # Optionally log the first few errors
            print(f"Bulk write had {len(write_errors)} errors (likely duplicates). Continuing...", file=sys.stderr)
    print(f"Inserted {inserted} documents into {database}.{collection}")


def main():
    parser = argparse.ArgumentParser(description="Clean POS data and upload to MongoDB Atlas")
    parser.add_argument("--input", required=True, help="Path to input CSV file")
    parser.add_argument("--mongo-uri", default=os.getenv("MONGODB_URI"), help="MongoDB connection URI (or set MONGODB_URI env var)")
    parser.add_argument("--database", default="retail_db", help="Target Mongo database name")
    parser.add_argument("--collection", default="newdatabase", help="Target Mongo collection name")
    parser.add_argument("--export", help="Optional path to export cleaned data (csv or parquet)")
    parser.add_argument("--no-upload", action="store_true", help="Skip Mongo upload (for testing)")
    args = parser.parse_args()

    if not args.mongo_uri and not args.no_upload:
        parser.error("--mongo-uri or MONGODB_URI environment variable required unless --no-upload is set")

    if not os.path.exists(args.input):
        print(f"Input file not found: {args.input}", file=sys.stderr)
        sys.exit(1)

    df = pd.read_csv(args.input)
    original_rows = len(df)
    df = clean_dataframe(df)

    print("=== Cleaning Summary ===")
    print(f"Original rows: {original_rows}")
    print(f"Cleaned rows: {len(df)}")
    if "email_valid" in df.columns:
        print(f"Invalid emails: {(~df.email_valid).sum()}")
    if "phone_valid" in df.columns:
        print(f"Invalid phones: {(~df.phone_valid).sum()}")

    if args.export:
        export_path = args.export
        if export_path.lower().endswith(".parquet"):
            df.to_parquet(export_path, index=False)
        else:
            df.to_csv(export_path, index=False)
        print(f"Exported cleaned data to {export_path}")

    if not args.no_upload:
        upload_to_mongo(df, args.mongo_uri, args.database, args.collection)


if __name__ == "__main__":
    main()
