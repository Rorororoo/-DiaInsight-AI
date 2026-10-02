const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") || "http://localhost:8000";
export type Patient = Record<string, number>;
export interface Contribution { feature: string; value: number; shap: number; direction: "increase" | "decrease" }
export interface PredictResult { prediction: number; prediction_label: string; probability: number; risk_percentage: number;
  base_value: number; top_features: string[]; explanation: Contribution[]; insights: string[] }
export interface GlobalExplain { importance: { feature: string; mean_abs_shap: number }[];
  summary: Record<string, { shap: number; norm: number }[]>; metrics: Record<string, number> }
export interface Row { Pregnancies: number; Glucose: number; BloodPressure: number; SkinThickness: number; Insulin: number;
  BMI: number; DiabetesPedigreeFunction: number; Age: number; Outcome: number; BMI_Category: string }

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try { res = await fetch(BASE + path, init); }
  catch { throw new Error("We couldn't reach the DiaInsight server. Check that the backend is running, then try again."); }
  let body: any = null;
  try { body = await res.json(); } catch { /* non-JSON */ }
  if (!res.ok) throw new Error(body?.detail && typeof body.detail === "string" ? body.detail : "The server returned an unexpected response.");
  if (body === null) throw new Error("The server returned an unexpected response.");
  return body as T;
}
export const predict = (p: Patient) => call<PredictResult>("/predict", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(p) });
export const getGlobal = () => call<GlobalExplain>("/explain/global");
export const getRecords = () => call<{ records: Row[] }>("/analytics").then(r => r.records);
