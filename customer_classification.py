from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime
from typing import List
import uvicorn
from pymongo import MongoClient  # MongoDB connection

# Initialize FastAPI
app = FastAPI(title="Customer Classification API")

# MongoDB connection
MONGO_URI = "mongodb+srv://rasenadheera_db_user:dY9bjEne4o1DYZGn@mayfashion.vv9xibz.mongodb.net/?retryWrites=true&w=majority"
client = MongoClient(MONGO_URI)
db = client["retail_db"]          # Database name
purchases_collection = db["newdatabase"]  # Collection name

# Input data model
class CustomerData(BaseModel):
    name: str  # Add name to save in DB
    total_purchases_last_6_months: int
    last_purchase_date: str  # format: 'YYYY-MM-DD'
    avg_spending_amount: float
    lifetime_spending_amount: float
    purchased_categories: List[str]  # e.g. ["mens", "womens", "kids"]
    current_date: str  # format: 'YYYY-MM-DD'
    festive_period: bool = False

# Root endpoint
@app.get("/")
def read_root():
    return {
        "service": "Customer Classification API",
        "status": "running",
        "database": "MongoDB - retail_db.newdatabase",
        "port": 8002,
        "endpoints": {
            "classify_customer": "/classify_customer (POST)"
        }
    }

@app.get("/favicon.ico")
def favicon():
    return {"message": "No favicon"}

# Endpoint
@app.post("/classify_customer")
def classify_customer(data: CustomerData):
    # Convert dates
    last_purchase = datetime.strptime(data.last_purchase_date, "%Y-%m-%d")
    current_date = datetime.strptime(data.current_date, "%Y-%m-%d")
    days_since_last_purchase = (current_date - last_purchase).days

    # Purchase type
    if data.total_purchases_last_6_months == 1:
        purchase_type = "New Customer"
    elif data.total_purchases_last_6_months >= 5:
        purchase_type = "Loyal Customer"
    elif days_since_last_purchase > 90:
        purchase_type = "Lapsed Customer"
    elif data.festive_period:
        purchase_type = "Seasonal Customer"
    else:
        purchase_type = "Regular Customer"

    # Spending type
    if data.avg_spending_amount >= 15000 or data.lifetime_spending_amount >= 150000:
        spending_type = "High Value Customer"
    elif data.lifetime_spending_amount < 10000:
        spending_type = "Low Value Customer"
    else:
        spending_type = "Medium Value Customer"

    # Category type
    categories = [c.lower() for c in data.purchased_categories]
    if all(cat in categories for cat in ["mens", "womens", "kids"]):
        category_type = "Family Customer"
    elif "womens" in categories and "mens" in categories:
        category_type = "Family Customer"
    elif categories.count("womens") > categories.count("mens") and categories.count("womens") > categories.count("kids"):
        category_type = "Womens Customer"
    elif categories.count("mens") > categories.count("womens") and categories.count("mens") > categories.count("kids"):
        category_type = "Mens Customer"
    elif categories.count("kids") > categories.count("mens") and categories.count("kids") > categories.count("womens"):
        category_type = "Kids Customer"
    else:
        category_type = "General Customer"

    # Save to MongoDB
    customer_record = data.dict()
    customer_record.update({
        "purchase_type": purchase_type,
        "spending_type": spending_type,
        "category_type": category_type,
        "created_at": datetime.utcnow()
    })
    purchases_collection.insert_one(customer_record)

    # Return classification
    return {
        "purchase_type": purchase_type,
        "spending_type": spending_type,
        "category_type": category_type
    }

# Run server
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8002)
