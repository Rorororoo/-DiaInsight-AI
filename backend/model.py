"""Train the Random Forest once and persist it (run: python model.py)."""
from pathlib import Path
import json, joblib, pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "cleaned_diabetes.csv"
ARTIFACT = Path(__file__).resolve().parent / "diabetes_model.joblib"
FEATURES = ["Pregnancies", "Glucose", "BloodPressure", "SkinThickness",
            "Insulin", "BMI", "DiabetesPedigreeFunction", "Age"]  # BMI_Category excluded (derived from BMI)
TARGET = "Outcome"

def load_data() -> pd.DataFrame:
    if not DATA.exists():
        raise FileNotFoundError(f"Dataset not found at {DATA}")
    return pd.read_csv(DATA)

def train():
    df = load_data()
    X, y = df[FEATURES], df[TARGET]
    Xtr, Xte, ytr, yte = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    model = RandomForestClassifier(n_estimators=100, random_state=42).fit(Xtr, ytr)
    pred, proba = model.predict(Xte), model.predict_proba(Xte)[:, 1]
    metrics = {"accuracy": accuracy_score(yte, pred), "precision": precision_score(yte, pred),
               "recall": recall_score(yte, pred), "f1": f1_score(yte, pred),
               "roc_auc": roc_auc_score(yte, proba), "train_size": len(Xtr), "test_size": len(Xte)}
    ref = {c: {"min": float(X[c].min()), "max": float(X[c].max()),
               "p25": float(X[c].quantile(.25)), "p50": float(X[c].quantile(.5)),
               "p75": float(X[c].quantile(.75)), "p90": float(X[c].quantile(.9))} for c in FEATURES}
    joblib.dump({"model": model, "metrics": metrics, "reference": ref, "X_test": Xte}, ARTIFACT)
    return metrics

if __name__ == "__main__":
    print(json.dumps(train(), indent=2))
