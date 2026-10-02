# DiaLens AI: Explainable AI-Based Diabetes Risk Assessment & Health Analytics
*Understand your health, one insight at a time.* Academic Mini Project, AI for Healthcare.

> Educational use only. This application does not provide a medical diagnosis. Please consult a qualified healthcare professional for medical advice.

## Features
- Health check form (3 grouped cards, validation, progress bar), result with **model-estimated probability**
- **Real SHAP** explanations per patient (`shap.TreeExplainer`) and global (mean |SHAP| on the test set + summary plot)
- Rule-based educational insights (no diagnosis, no medication advice)
- Analytics explorer (KPIs, 7 charts, filters for outcome / age group / BMI category) computed from the CSV
- Responsive (desktop, tablet, mobile), accessible, reduced-motion friendly

## Tech stack
React, TypeScript, Tailwind CSS, Recharts, Lucide · FastAPI, Python, scikit-learn, Random Forest, SHAP, pandas, NumPy, joblib

## Dataset
`data/cleaned_diabetes.csv`: 768 rows. Features: Pregnancies, Glucose, BloodPressure, SkinThickness, Insulin, BMI, DiabetesPedigreeFunction, Age. Target `Outcome` (0 = No Diabetes, 1 = Diabetes). `BMI_Category` is **excluded** from the model (derived from BMI, redundant); it is only used as an analytics filter. The CSV is never modified.

## ML methodology
`train_test_split(test_size=0.2, random_state=42, stratify=y)` → `RandomForestClassifier(n_estimators=100, random_state=42)` → metrics on the test set → saved to `backend/diabetes_model.joblib` once (also auto-trained on first start if missing). Predictions use `predict()` and `predict_proba()`. Nothing is hardcoded.

Test-set results from this build: accuracy 77.9%, precision 72.7%, recall 59.3%, F1 65.3%, ROC-AUC 81.9%.

## XAI methodology
`shap.TreeExplainer(model)` is built once at startup. Per request, SHAP values for class 1 (diabetes) are computed for the submitted row; positive values push toward higher predicted risk, negative toward lower. Global importance = mean absolute SHAP over the 154 test rows.

## Architecture
```
dialens/
├── backend/  main.py (API) · model.py (train/persist) · explainability.py (SHAP) · requirements.txt · Procfile
├── data/     cleaned_diabetes.csv
├── frontend/ src/{App,api,ui,Logo}.tsx · src/pages/{Home,Assess,Result,Insights,Analytics,About}.tsx
├── render.yaml  (backend deploy)   frontend/vercel.json
└── README.md
```

## Run locally
```bash
# Backend (Terminal 1)
cd backend
python -m venv .venv && source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python model.py                                       # trains + saves diabetes_model.joblib
uvicorn main:app --reload --port 8000

# Frontend (Terminal 2)
cd frontend
npm install
cp .env.example .env        # VITE_API_URL=http://localhost:8000
npm run dev                 # http://localhost:5173
```

## API
| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | status |
| POST | `/predict` | prediction, probability, SHAP explanation, insights |
| GET | `/analytics` | dataset records (for dashboard) |
| GET | `/explain/global` | global SHAP importance, summary points, test metrics |

Interactive docs at `/docs`.

Request:
```json
{"Pregnancies":6,"Glucose":148,"BloodPressure":72,"SkinThickness":35,"Insulin":125,"BMI":33.6,"DiabetesPedigreeFunction":0.627,"Age":50}
```
Response (abridged):
```json
{"prediction":1,"prediction_label":"Diabetes Risk","probability":0.94,"risk_percentage":94.0,
 "top_features":["Glucose","Age","BMI","DiabetesPedigreeFunction"],
 "explanation":[{"feature":"Glucose","value":148,"shap":0.16,"direction":"increase"}],
 "insights":["Your entered glucose value is relatively high compared with the values observed in the dataset."]}
```
Invalid input returns HTTP 422 `{"detail":"Please check these values: Pregnancies."}`. Stack traces are never returned.

## Deploy (free)
1. Push this folder to GitHub.
2. **Backend → Render:** New → Blueprint → select repo (uses `render.yaml`), or New Web Service with root `backend`, build `pip install -r requirements.txt && python model.py`, start `uvicorn main:app --host 0.0.0.0 --port $PORT`. Set `ALLOWED_ORIGINS` to your Vercel URL. Note the service URL. (Free tier sleeps; the first request can take ~30-60 s.)
3. **Frontend → Vercel:** Import repo, root directory `frontend`, framework Vite, add env var `VITE_API_URL=https://<your-render-url>`, deploy.
4. Open the Vercel URL; check `https://<render-url>/health`.

## Screenshots
_Add screenshots here (Home, Health Check, Result, AI Insights, Analytics)._

## Limitations
Small dataset (768 records, a specific population); moderate recall (59%) so cases can be missed; zero values for Insulin/SkinThickness in the original data were cleaned upstream; SHAP explains the model, not causation; not clinically validated.

## Future enhancements
Calibrated probabilities, model comparison (XGBoost, logistic regression), cross-validation, what-if sliders, multilingual UI, clinical validation with larger datasets.
