import pandas as pd
from pymongo import MongoClient

CSV_FILE = "purchase_records.csv"
DB_NAME = "retail_db"
COLLECTION_NAME = "purchases"

client = MongoClient(
    "mongodb+srv://rasenadheera_db_user:dY9bjEne4o1DYZGn@mayfashion.vv9xibz.mongodb.net/?retryWrites=true&w=majority&appName=mayfashion"
)
db = client[DB_NAME]
collection = db[COLLECTION_NAME]

# Clear existing data (optional for testing)
collection.delete_many({})

df = pd.read_csv(CSV_FILE)

# ===== TRANSFORM & INSERT =====
for _, row in df.iterrows():
    doc = {
        "order_id": row["Order_ID"],
        "bill_id": row["Bill_ID"],
        "customer": {
            "id": row["Customer_ID"],
            "name": row["Customer_Name"],
            "gender": row["Gender"]
        },
        "product": {
            "id": row["Product_ID"],
            "name": row["Product_Name"],
            "category": row["Product_Category"],
            "sub_category": str(row["Clothing_Category"]) if pd.notna(row["Clothing_Category"]) else None
        },
        "quantity": int(row["Quantity"]),
        "price_lkr": float(row["Price_LKR"]),
        "total_amount_lkr": float(row["Total_Amount_LKR"]),
        "date": pd.to_datetime(row["Date"], errors="coerce").strftime("%Y-%m-%d") if pd.notna(row["Date"]) else None,
        "time": str(row["Time"]),
        "payment_method": row["Payment_Method"]
    }
    collection.insert_one(doc)

print(f"Inserted {collection.count_documents({})} records into {DB_NAME}.{COLLECTION_NAME}")
