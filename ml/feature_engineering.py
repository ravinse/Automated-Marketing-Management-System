import pandas as pd
from pymongo import MongoClient
from urllib.parse import quote_plus

username = "rasenadheera_db_user"
password = quote_plus("dY9bjEne4o1DYZGn")
db_name = "retail_db"

client = MongoClient(f"mongodb+srv://{username}:{password}@mayfashion.vv9xibz.mongodb.net/{db_name}?retryWrites=true&w=majority")
db = client[db_name]
collection = db["purchases"]

data = list(collection.find())
df = pd.DataFrame(data)

# Create separate columns for customer info
df['customer_id'] = df['customer'].apply(lambda x: x['id'])
df['customer_name'] = df['customer'].apply(lambda x: x['name'])
df['customer_gender'] = df['customer'].apply(lambda x: x['gender'])

# Drop the original dict column
df.drop(columns=['customer'], inplace=True)

# Feature engineering
df['date'] = pd.to_datetime(df['date'])
df['year'] = df['date'].dt.year
df['month'] = df['date'].dt.month
df['day'] = df['date'].dt.day
df['day_of_week'] = df['date'].dt.dayofweek
df['hour'] = pd.to_datetime(df['time'], format='%H:%M:%S', errors='coerce').dt.hour

# Aggregate by customer_id
customer_features = df.groupby('customer_id')['total_amount_lkr'].agg([
    ('total_spent', 'sum'),
    ('avg_spent', 'mean'),
    ('purchase_count', 'count')
]).reset_index()

customer_features = customer_features.merge(
    df[['customer_id', 'customer_gender']].drop_duplicates(),
    on='customer_id',
    how='left'
)

customer_features = pd.get_dummies(customer_features, columns=['customer_gender'], drop_first=True)

customer_features.to_csv('customer_features.csv', index=False)
print("Customer feature engineering completed.")
