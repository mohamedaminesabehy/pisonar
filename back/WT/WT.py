#!/usr/bin/env python3
import os
import sys
import json

import pandas as pd
import numpy as np
from pymongo import MongoClient
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score
from xgboost import XGBRegressor

def main():
    # 1) TRAIN on CSV
    script_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(script_dir, "patient_dataset_WT.csv")
    if not os.path.isfile(csv_path):
        print(json.dumps({
            "error": "Dataset file not found",
            "path": csv_path
        }), file=sys.stderr)
        sys.exit(1)

    df = pd.read_csv(csv_path)

    # encode 'state' for features, but keep the string
    if "state" in df.columns:
        df["state_enc"] = df["state"].astype("category").cat.codes

    # split off target
    if "waiting_time_minutes" not in df.columns:
        print(json.dumps({"error": "waiting_time_minutes column missing"}), file=sys.stderr)
        sys.exit(1)
    y = df["waiting_time_minutes"]
    X = df.drop(columns=["waiting_time_minutes"])

    # drop non-numeric (we leave state_enc)
    non_num = X.select_dtypes(include=["object"]).columns
    X = X.drop(columns=non_num)

    # scale
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # train/val split
    X_tr, X_val, y_tr, y_val = train_test_split(
        X_scaled, y, test_size=0.2, random_state=42
    )

    # fit regression model
    model = XGBRegressor(
        objective="reg:squarederror",
        n_estimators=100,
        max_depth=9,
        learning_rate=0.01,
        random_state=42
    )
    model.fit(X_tr, y_tr)

    # validate
    y_val_pred = model.predict(X_val)
    mse_val = mean_squared_error(y_val, y_val_pred)
    r2_val  = r2_score(y_val, y_val_pred)

    # 2) LOAD test set from WT
    MONGO_URI = os.getenv('MONGODB_URI')
    client = MongoClient(MONGO_URI)
    db = client["pidevDB"]
    docs = list(db["WT"].find())

    if not docs:
        output = {
            "validation": {"mse": mse_val, "r2": r2_val},
            "test": None,
            "predictions": []
        }
        print(json.dumps(output, ensure_ascii=False, default=str))
        return

    # build DataFrame
    df_test = pd.DataFrame(docs)
    # stringify ObjectId
    if "_id" in df_test.columns:
        df_test["_id"] = df_test["_id"].astype(str)

    # 3) capture raw output BEFORE encoding
    raw = df_test.to_dict(orient="records")

    # 4) encode state for features, leaving raw['state'] intact
    if "state" in df_test.columns:
        df_test["state_enc"] = df_test["state"].astype("category").cat.codes

    # prepare test features: drop all object columns but keep state_enc
    drop_cols = df_test.select_dtypes(include=["object"]).columns
    X_test = df_test.drop(columns=drop_cols)

    # pull out target if present (unlikely in WT)
    y_test = None
    if "waiting_time_minutes" in X_test.columns:
        y_test = X_test["waiting_time_minutes"].values
        X_test = X_test.drop(columns=["waiting_time_minutes"])

    # align to training columns
    X_test = X_test.reindex(columns=X.columns, fill_value=0)

    # scale & predict
    X_test_scaled = scaler.transform(X_test)
    y_pred = model.predict(X_test_scaled)

    # optional test metrics
    test_metrics = None
    if y_test is not None:
        mse_test = mean_squared_error(y_test, y_pred)
        r2_test  = r2_score(y_test, y_pred)
        test_metrics = {"mse": mse_test, "r2": r2_test}

    # 5) build final predictions array
    predictions = []
    for doc, pred in zip(raw, y_pred):
        entry = dict(doc)
        entry["predicted_waiting_time"] = float(pred)
        # drop createdAt if present
        entry.pop("createdAt", None)
        predictions.append(entry)

    # 6) output JSON
    output = {
        "validation": {"mse": mse_val, "r2": r2_val},
        "test": test_metrics,
        "predictions": predictions
    }
    print(json.dumps(output, ensure_ascii=False, default=str))

if __name__ == "__main__":
    main()
