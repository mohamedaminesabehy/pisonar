import os
import sys
import json
import numpy as np
import pandas as pd
from pymongo import MongoClient
from sklearn.preprocessing import MultiLabelBinarizer, StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score
from xgboost import XGBClassifier

# --- 1. Entraînement sur le dataset CSV ---
script_dir = os.path.dirname(os.path.abspath(__file__))
csv_path = os.path.join(script_dir, "patient_dataset_10000.csv")
if not os.path.isfile(csv_path):
    print(json.dumps({
        "error": "Dataset file not found",
        "path": csv_path
    }), file=sys.stderr)
    sys.exit(1)

df_train = pd.read_csv(csv_path)
bp = df_train["bloodPressure"].str.split("/", expand=True).astype(int)
df_train["bp_sys"], df_train["bp_dia"] = bp[0], bp[1]
df_train.drop("bloodPressure", axis=1, inplace=True)

df_train["sym_list"] = df_train["symptoms"].str.split(",")
mlb = MultiLabelBinarizer()
sym_train = pd.DataFrame(
    mlb.fit_transform(df_train["sym_list"]),
    columns=[f"sym_{s.strip()}" for s in mlb.classes_],
    index=df_train.index
)
df_train = pd.concat([df_train, sym_train], axis=1)
df_train.drop(["symptoms", "sym_list"], axis=1, inplace=True)

le = LabelEncoder()
df_train["state_enc"] = le.fit_transform(df_train["state"])
df_train.drop("state", axis=1, inplace=True)

X_train = df_train.drop("state_enc", axis=1)
y_train = df_train["state_enc"]

num_cols = ["age", "glycemicIndex", "oxygenSaturation", "bp_sys", "bp_dia"]
scaler = StandardScaler()
X_train[num_cols] = scaler.fit_transform(X_train[num_cols])

model = XGBClassifier(
    n_estimators=200,
    max_depth=3,
    learning_rate=0.1,
    eval_metric="mlogloss",
    random_state=42
)
model.fit(X_train, y_train)

# (Optional) log training accuracy
y_train_pred = model.predict(X_train)
train_acc = accuracy_score(y_train, y_train_pred)
print(f"Training accuracy: {train_acc:.4f}", file=sys.stderr)


# --- 2. Chargement depuis MongoDB ---
MONGO_URI = os.getenv('MONGODB_URI')
client = MongoClient(MONGO_URI)
db = client["pidevDB"]
collection = db["patientdatas"]

docs = list(collection.find())
if not docs:
    print(json.dumps([], ensure_ascii=False))
    sys.exit(0)

df_clust = pd.DataFrame(docs)
if "_id" in df_clust.columns:
    df_clust["_id"] = df_clust["_id"].astype(str)
    df_clust.rename(columns={"_id": "id"}, inplace=True)

# a) Blood pressure — keep the original string!
df_clust = df_clust[df_clust["bloodPressure"].notna()]
bp2 = df_clust["bloodPressure"].astype(str).str.split("/", expand=True)
df_clust["bp_sys"] = pd.to_numeric(bp2[0], errors="coerce")
df_clust["bp_dia"] = pd.to_numeric(bp2[1], errors="coerce")
df_clust.dropna(subset=["bp_sys", "bp_dia"], inplace=True)
df_clust[["bp_sys", "bp_dia"]] = df_clust[["bp_sys", "bp_dia"]].astype(int)
# **note**: we no longer drop "bloodPressure" so the original "##/##" string remains

# b) Symptoms
df_clust["symptoms"] = df_clust["symptoms"].fillna("").astype(str)
df_clust["sym_list"] = df_clust["symptoms"].apply(lambda x: x.split(",") if x else [])
sym_clust = pd.DataFrame(
    mlb.transform(df_clust["sym_list"]),
    columns=[f"sym_{s.strip()}" for s in mlb.classes_],
    index=df_clust.index
)
df_clust = pd.concat([df_clust, sym_clust], axis=1)
df_clust.drop(["symptoms", "sym_list"], axis=1, inplace=True)

# c) Encode true state if it exists
has_truth = "state" in df_clust.columns
if has_truth:
    df_clust["state_enc"] = le.transform(df_clust["state"])
    df_clust.drop("state", axis=1, inplace=True)

# d) Prepare features for prediction
X_clust = df_clust.drop("state_enc", axis=1) if has_truth else df_clust.copy()
existing = [c for c in num_cols if c in X_clust.columns]
X_clust[existing] = scaler.transform(X_clust[existing])
X_clust = X_clust.select_dtypes(include=["int64", "float64", "bool"])
expected = model.get_booster().feature_names
X_clust = X_clust[[c for c in X_clust.columns if c in expected]]

# --- 3. Prédiction et export JSON final ---
y_pred = model.predict(X_clust)
if has_truth:
    db_acc = accuracy_score(df_clust["state_enc"], y_pred)
    print(f"DB-data accuracy: {db_acc:.4f}", file=sys.stderr)

# copy model prediction into "state"
df_clust["state"] = le.inverse_transform(y_pred)

# clean up temporary columns
df_clust.drop(columns=["state_enc", "predicted_state"], inplace=True, errors="ignore")

# turn any remaining NaN into null
df_clust = df_clust.replace({np.nan: None})

df_clust.sort_values(by=["id"], inplace=True)
print(
    json.dumps(
        df_clust.to_dict(orient="records"),
        ensure_ascii=False,
        default=str
    )
)
