#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import json
import io
from datetime import datetime, timedelta
from contextlib import redirect_stdout

import pandas as pd
import numpy as np
from sklearn.preprocessing import OneHotEncoder, StandardScaler, MultiLabelBinarizer
from sklearn.model_selection import train_test_split
from sklearn.multioutput import MultiOutputClassifier
from xgboost import XGBClassifier
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score
from pymongo import MongoClient
from bson import ObjectId

# ─── CONFIGURATION ─────────────────────────────────────────────────────────────
MONGO_URI = "mongodb+srv://mohamedmaamar:I6Yyrxr8KVWJ2uNY@ecom.spbtj0n.mongodb.net/"
DB_NAME   = "pidevDB"
COL_EVENTS= "events"
COL_USERS = "users"
CSV_NAME  = "generated_events.csv"


def load_events() -> pd.DataFrame:
    base_dir = os.path.dirname(os.path.abspath(__file__))
    path = os.path.join(base_dir, CSV_NAME)
    if not os.path.isfile(path):
        raise FileNotFoundError(f"Pas trouvé : {path}")
    return pd.read_csv(path, parse_dates=['start', 'end'])


def build_features(df: pd.DataFrame):
    df['day_of_week']  = df['start'].dt.dayofweek
    df['day_of_month'] = df['start'].dt.day
    df['month']        = df['start'].dt.month
    df['quarter']      = (df['start'].dt.month - 1) // 3 + 1

    enc_shift = OneHotEncoder(sparse_output=False, drop='if_binary')
    shift_ohe = enc_shift.fit_transform(df[['shift']])
    shift_cols = [f"shift_{c}" for c in enc_shift.categories_[0]]
    df_ohe = pd.DataFrame(shift_ohe, columns=shift_cols, index=df.index)
    df = pd.concat([df, df_ohe], axis=1)

    docs = df['assignedDoctors'].fillna('').str.split('|')
    nurs = df['assignedNurses'].fillna('').str.split('|')
    mlb_docs = MultiLabelBinarizer()
    mlb_nurs = MultiLabelBinarizer()
    Y_docs = mlb_docs.fit_transform(docs)
    Y_nurs = mlb_nurs.fit_transform(nurs)

    feature_cols = ['day_of_week','day_of_month','month','quarter','rating'] + shift_cols
    X = df[feature_cols]

    return X, Y_docs, Y_nurs, mlb_docs, mlb_nurs, feature_cols


def train_and_evaluate(X, Y, role: str, mlb: MultiLabelBinarizer):
    X_tr, X_te, Y_tr, Y_te = train_test_split(X, Y, test_size=0.2, random_state=42)
    pipe = Pipeline([
        ("scale", StandardScaler()),
        ("xgb", XGBClassifier(
            n_estimators=200,
            max_depth=6,
            learning_rate=0.1,
            eval_metric='logloss'
        ))
    ])
    model = MultiOutputClassifier(pipe, n_jobs=-1) if Y.shape[1] > 1 else pipe
    model.fit(X_tr, Y_tr)
    Y_pred = model.predict(X_te)

    print(f"\n=== Résultats pour {role} ===")
    print("Accuracy :", accuracy_score(Y_te, Y_pred))
    if Y.shape[1] > 1:
        for i, cls in enumerate(mlb.classes_):
            print(f"\n-- {cls} --")
            print(classification_report(Y_te[:, i], Y_pred[:, i], zero_division=0))
    else:
        print(classification_report(Y_te, Y_pred, zero_division=0))
    return model


def load_all_users(role: str):
    """Fetch all ObjectId of users with given role from MongoDB."""
    client = MongoClient(MONGO_URI)
    coll = client[DB_NAME][COL_USERS]
    return [u['_id'] for u in coll.find({'role': role}, {'_id': 1})]


def ensure_daily_assignment(events_day, all_docs, all_nurs):
    """
    Make sure each doctor and nurse appears in at least one of the day's events.
    events_day: list of dicts for one day's shifts.
    """
    assigned_docs = set(doc for ev in events_day for doc in ev['assignedDoctors'])
    assigned_nurs = set(nur for ev in events_day for nur in ev['assignedNurses'])

    for d in all_docs:
        if d not in assigned_docs:
            ev = min(events_day, key=lambda e: len(e['assignedDoctors']))
            ev['assignedDoctors'].append(d)

    for n in all_nurs:
        if n not in assigned_nurs:
            ev = min(events_day, key=lambda e: len(e['assignedNurses']))
            ev['assignedNurses'].append(n)

    return events_day


def generate_next_week(df, model_docs, model_nurs, mlb_docs, mlb_nurs, feature_cols):
    today = datetime.now()
    next_mon = today + timedelta(days=(7 - today.weekday()))
    shifts = ['Morning', 'Evening', 'Night']
    shifts_hours = {'Morning': (8, 16), 'Evening': (16, 24), 'Night': (0, 8)}

    # Load every user from DB
    all_docs = load_all_users('Doctor')
    all_nurs = load_all_users('Nurse')

    rating_mean = df.groupby('shift')['rating'].mean().to_dict()
    default_creator = df['createdBy'].mode()[0]

    events = []
    for d in range(7):
        day = next_mon + timedelta(days=d)
        quarter = (day.month - 1) // 3 + 1

        # build all shifts for this day first
        events_day = []
        for sh in shifts:
            h0, h1 = shifts_hours[sh]
            feat = {
                'day_of_week':  day.weekday(),
                'day_of_month': day.day,
                'month':        day.month,
                'quarter':      quarter,
                'rating':       rating_mean.get(sh, df['rating'].mean())
            }
            for s in shifts:
                feat[f"shift_{s}"] = 1 if s == sh else 0

            Xf = pd.DataFrame([feat])[feature_cols]
            pred_docs = model_docs.predict(Xf)[0]
            pred_nurs = model_nurs.predict(Xf)[0]

            assigned_docs = [
                ObjectId(mlb_docs.classes_[i])
                for i, flag in enumerate(pred_docs) if flag
            ]
            assigned_nurs = [
                ObjectId(mlb_nurs.classes_[i])
                for i, flag in enumerate(pred_nurs) if flag
            ]

            ev = {
                'title':           f'Event {day.date()} {sh}',
                'start':           day.replace(hour=h0, minute=0, second=0),
                'end':             (day + timedelta(days=1) if h1 == 24 else day)
                                     .replace(hour=h1 % 24, minute=0, second=0),
                'assignedDoctors': assigned_docs,
                'assignedNurses':  assigned_nurs,
                'shift':           sh,
                'description':     'Auto-scheduled',
                'createdBy':       ObjectId(default_creator),
                'rating':          float(feat['rating'])
            }
            events_day.append(ev)

        # ensure everyone has at least one shift today
        events_day = ensure_daily_assignment(events_day, all_docs, all_nurs)
        events.extend(events_day)

    return events


def insert_into_mongo(events: list):
    client = MongoClient(MONGO_URI)
    coll = client[DB_NAME][COL_EVENTS]
    result = coll.insert_many(events)
    return len(result.inserted_ids)


if __name__ == '__main__':
    log_buffer = io.StringIO()
    with redirect_stdout(log_buffer):
        df = load_events()
        X, Yd, Yn, mlb_docs, mlb_nurs, feature_cols = build_features(df)
        model_docs = train_and_evaluate(X, Yd, role='docs', mlb=mlb_docs)
        model_nurs = train_and_evaluate(X, Yn, role='nurs', mlb=mlb_nurs)

        next_week = generate_next_week(
            df, model_docs, model_nurs, mlb_docs, mlb_nurs, feature_cols
        )
        created_count = insert_into_mongo(next_week)

    output = {
        "message":      "Weekly scheduling completed",
        "createdCount": created_count,
        "log":          log_buffer.getvalue().strip()
    }
    print(json.dumps(output, ensure_ascii=False, indent=2))
