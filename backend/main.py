import os, logging
import joblib, pandas as pd
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from model import ARTIFACT, FEATURES, load_data, train
from explainability import Explainer

log = logging.getLogger("dialens")
app = FastAPI(title="DiaLens AI API", version="1.0.0")
origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_origin_regex=os.getenv("ALLOWED_ORIGIN_REGEX"),
                   allow_methods=["*"], allow_headers=["*"])

STATE = {"error": None}
try:
    if not ARTIFACT.exists():
        train()  # first start: train once and persist
    bundle = joblib.load(ARTIFACT)
    STATE.update(model=bundle["model"], metrics=bundle["metrics"], ref=bundle["reference"],
                 explainer=Explainer(bundle["model"], bundle["X_test"], FEATURES))
except Exception:
    log.exception("Model load failed")
    STATE["error"] = "The prediction model could not be loaded."

class Patient(BaseModel):
    Pregnancies: float = Field(ge=0, le=20)
    Glucose: float = Field(ge=40, le=250)
    BloodPressure: float = Field(ge=20, le=140)
    SkinThickness: float = Field(ge=0, le=100)
    Insulin: float = Field(ge=0, le=900)
    BMI: float = Field(ge=10, le=70)
    DiabetesPedigreeFunction: float = Field(ge=0, le=3)
    Age: float = Field(ge=18, le=100)

@app.exception_handler(RequestValidationError)
async def validation_handler(_: Request, exc: RequestValidationError):
    fields = [".".join(str(p) for p in e["loc"][1:]) for e in exc.errors()]
    return JSONResponse(status_code=422, content={"detail": f"Please check these values: {', '.join(fields) or 'request body'}."})

@app.exception_handler(Exception)
async def generic_handler(_: Request, exc: Exception):
    log.exception("Unhandled error")
    return JSONResponse(status_code=500, content={"detail": "Something went wrong on our side. Please try again."})

def ready():
    return None if not STATE["error"] else JSONResponse(status_code=503, content={"detail": STATE["error"]})

def insights(p: dict, top: list, prob: float):
    ref, out = STATE["ref"], []
    if p["Glucose"] >= ref["Glucose"]["p75"]:
        out.append("Your entered glucose value is relatively high compared with the values observed in the dataset.")
    if p["BMI"] >= ref["BMI"]["p75"]:
        out.append("Your entered BMI is in a higher range compared with the dataset.")
    if p["Age"] >= ref["Age"]["p75"]:
        out.append("Age is one of the features considered by the model, and your entered age is higher than most records in the dataset.")
    if p["DiabetesPedigreeFunction"] >= ref["DiabetesPedigreeFunction"]["p75"]:
        out.append("Your diabetes pedigree value is on the higher side of the dataset.")
    n_up = sum(1 for t in top if t["direction"] == "increase")
    if prob >= 0.5 and n_up >= 3:
        out.append("Several entered measurements contributed to this model's higher-risk prediction.")
    elif prob < 0.5:
        out.append("Most entered measurements pushed the model toward a lower predicted risk.")
    out.append(f"{top[0]['feature']} was the most influential factor for this prediction.")
    out.append("A model cannot replace a clinical assessment. If you have concerns about your health, please speak with a qualified healthcare professional.")
    return out

@app.get("/health")
def health():
    return {"status": "ok" if not STATE["error"] else "degraded"}

@app.post("/predict")
def predict(patient: Patient):
    if (r := ready()): return r
    row = pd.DataFrame([patient.model_dump()])[FEATURES]
    model = STATE["model"]
    pred = int(model.predict(row)[0])
    prob = float(model.predict_proba(row)[0][1])
    base, explanation = STATE["explainer"].local(row)
    return {"prediction": pred, "prediction_label": "Diabetes Risk" if pred else "No Diabetes",
            "probability": prob, "risk_percentage": round(prob * 100, 1),
            "base_value": base, "top_features": [e["feature"] for e in explanation[:4]],
            "explanation": explanation, "insights": insights(patient.model_dump(), explanation, prob)}

@app.get("/analytics")
def analytics():
    try:
        df = load_data()
    except FileNotFoundError:
        return JSONResponse(status_code=503, content={"detail": "The dataset file is missing on the server."})
    return {"records": df.to_dict(orient="records")}

@app.get("/explain/global")
def global_explain():
    if (r := ready()): return r
    ex = STATE["explainer"]
    return {"importance": ex.global_importance(), "summary": ex.summary_points(), "metrics": STATE["metrics"]}
