import { useState } from "react"; import { predict, type PredictResult, type Patient } from "../api";
import { ErrorBox, Loading, Title, Disclaimer } from "../ui"; import type { Page } from "../App";

interface F { key: string; label: string; unit: string; help: string; min: number; max: number; step: number; int?: boolean }
const CARDS: { title: string; emoji: string; fields: F[] }[] = [
  { title: "About You", emoji: "🌿", fields: [
    { key: "Age", label: "Age", unit: "years", help: "Your age in years (18–100).", min: 18, max: 100, step: 1, int: true },
    { key: "Pregnancies", label: "Pregnancies", unit: "count", help: "Number of times pregnant. Enter 0 if not applicable.", min: 0, max: 20, step: 1, int: true }] },
  { title: "Health Measurements", emoji: "🩺", fields: [
    { key: "Glucose", label: "Glucose", unit: "mg/dL", help: "Blood glucose measurement (40–250).", min: 40, max: 250, step: 1 },
    { key: "BloodPressure", label: "Blood Pressure", unit: "mmHg", help: "Diastolic blood pressure (20–140).", min: 20, max: 140, step: 1 },
    { key: "SkinThickness", label: "Skin Thickness", unit: "mm", help: "Triceps skinfold thickness (0–100).", min: 0, max: 100, step: 1 },
    { key: "Insulin", label: "Insulin", unit: "µU/mL", help: "2-hour serum insulin (0–900).", min: 0, max: 900, step: 1 },
    { key: "BMI", label: "BMI", unit: "kg/m²", help: "Body mass index (10–70).", min: 10, max: 70, step: 0.1 }] },
  { title: "Health Profile", emoji: "🧬", fields: [
    { key: "DiabetesPedigreeFunction", label: "Diabetes Pedigree Function", unit: "score", help: "Measure associated with family history patterns in the dataset (0–3).", min: 0, max: 3, step: 0.001 }] },
];
const ALL = CARDS.flatMap(c => c.fields);
const SAMPLE: Record<string, string> = { Pregnancies: "6", Glucose: "148", BloodPressure: "72", SkinThickness: "35", Insulin: "125", BMI: "33.6", DiabetesPedigreeFunction: "0.627", Age: "50" };

function check(f: F, v: string): string | null {
  if (v.trim() === "") return `Enter your ${f.label.toLowerCase()}.`;
  const n = Number(v);
  if (!Number.isFinite(n)) return "Enter a valid number.";
  if (n < 0) return "Negative values aren't possible here.";
  if (f.int && !Number.isInteger(n)) return "Enter a whole number.";
  if (n < f.min || n > f.max) return `Enter a value between ${f.min} and ${f.max}.`;
  return null;
}

export default function Assess({ onDone }: { go: (p: Page) => void; onDone: (r: PredictResult, p: Patient) => void }) {
  const [vals, setVals] = useState<Record<string, string>>(Object.fromEntries(ALL.map(f => [f.key, ""])));
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const errors = Object.fromEntries(ALL.map(f => [f.key, check(f, vals[f.key])]));
  const done = ALL.filter(f => !errors[f.key]).length;

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    setTouched(Object.fromEntries(ALL.map(f => [f.key, true])));
    if (done < ALL.length) { setErr("Please fix the highlighted fields first."); return; }
    const p: Patient = Object.fromEntries(ALL.map(f => [f.key, Number(vals[f.key])]));
    setBusy(true);
    try { const r = await predict(p); if (typeof r.probability !== "number" || !Array.isArray(r.explanation)) throw new Error("The server returned an unexpected response."); onDone(r, p); }
    catch (x) { setErr((x as Error).message); setBusy(false); }
  }
  if (busy) return <Loading text="Generating your insight…" />;
  return (
    <form onSubmit={submit} noValidate className="pb-24 md:pb-0">
      <Title sub="A few basic health measurements are all we need to generate your AI-powered insight.">Let's get to know your health 💚</Title>
      <div className="mb-6" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={ALL.length} aria-label="Form progress">
        <div className="mb-1 flex justify-between text-sm font-semibold text-muted"><span>{done} of {ALL.length} measurements ready</span>
          <button type="button" className="text-mintdeep underline" onClick={() => { setVals(SAMPLE); setErr(""); }}>Fill sample values</button></div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--lavender)]"><div className="h-full rounded-full bg-mint transition-all duration-500" style={{ width: `${(done / ALL.length) * 100}%` }} /></div>
      </div>
      {err && <div className="mb-6"><ErrorBox msg={err} /></div>}
      <div className="grid gap-5 lg:grid-cols-2">
        {CARDS.map((c, i) => (
          <fieldset key={c.title} className={`card ${i === 1 ? "lg:row-span-2" : ""}`}>
            <legend className="h-display px-1 text-xl">{c.emoji} {c.title}</legend>
            <div className={`mt-3 grid gap-5 ${i === 1 ? "" : "sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"}`}>
              {c.fields.map(f => { const e = touched[f.key] ? errors[f.key] : null; return (
                <div key={f.key} className={f.key === "DiabetesPedigreeFunction" ? "sm:col-span-2 lg:col-span-1 xl:col-span-2" : ""}>
                  <label htmlFor={f.key} className="font-bold">{f.label}</label>
                  <div className={`mt-1 flex min-h-[52px] items-center rounded-2xl border-2 bg-white pr-4 focus-within:border-mint ${e ? "border-coral" : "border-[var(--line)]"}`}>
                    <input id={f.key} inputMode="decimal" type="number" step={f.step} min={f.min} max={f.max} value={vals[f.key]}
                      aria-invalid={!!e} aria-describedby={`${f.key}-h`} placeholder={String(SAMPLE[f.key])}
                      onChange={ev => { setVals({ ...vals, [f.key]: ev.target.value }); setErr(""); }} onBlur={() => setTouched({ ...touched, [f.key]: true })}
                      className="min-w-0 flex-1 rounded-2xl bg-transparent px-4 py-3 text-lg outline-none" />
                    <span className="text-sm text-muted">{f.unit}</span></div>
                  <p id={`${f.key}-h`} className={`mt-1 text-sm ${e ? "font-semibold text-coral" : "text-muted"}`}>{e || f.help}</p>
                </div>); })}
            </div>
          </fieldset>))}
      </div>
      <div className="fixed inset-x-0 bottom-0 z-20 border-t bg-[var(--cream)] p-3 md:static md:mt-6 md:border-0 md:bg-transparent md:p-0" style={{ borderColor: "var(--line)" }}>
        <button type="submit" className="btn-primary w-full md:w-auto">✨ Generate My Insight</button></div>
      <div className="mt-6"><Disclaimer /></div>
    </form>
  );
}
