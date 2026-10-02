import { Title, TrustCard } from "../ui";
const FLOW = ["Patient Data", "Machine Learning", "Risk Prediction", "SHAP Explanation", "Health Insights"];
const TECH = ["React", "TypeScript", "Tailwind CSS", "FastAPI", "Python", "Scikit-learn", "Random Forest", "SHAP", "Pandas", "NumPy"];
export default function About() {
  return (<div className="space-y-6">
    <Title sub="DiaInsight AI is an academic healthcare application that combines machine learning and explainable AI to provide diabetes risk insights.">About DiaInsight AI</Title>
    <section className="card"><h2 className="h-display text-2xl">Objective</h2><p className="mt-2">To develop an AI-based healthcare application that predicts diabetes risk and explains the factors influencing the prediction.</p>
      <p className="mt-2 text-muted">Full title: DiaInsight AI: Explainable AI-Based Diabetes Risk Assessment &amp; Health Analytics. Academic Mini Project – AI for Healthcare.</p></section>
    <section className="card"><h2 className="h-display text-2xl">How it works</h2>
      <ol className="mt-4 flex flex-col items-stretch gap-2 md:flex-row md:items-center">{FLOW.map((s, i) => <li key={s} className="flex flex-col items-center gap-2 md:flex-row">
        <span className="w-full rounded-2xl bg-[var(--mint-soft)] px-4 py-3 text-center font-bold md:w-auto">{s}</span>{i < FLOW.length - 1 && <span aria-hidden className="text-mint">↓<span className="hidden md:inline">→</span></span>}</li>)}</ol></section>
    <section className="card"><h2 className="h-display text-2xl">Dataset</h2>
      <p className="mt-2">768 records with 8 features (Pregnancies, Glucose, Blood Pressure, Skin Thickness, Insulin, BMI, Diabetes Pedigree Function, Age). Target: Outcome (0 = No Diabetes, 1 = Diabetes).</p>
      <p className="mt-2 text-muted">BMI_Category is excluded from the model because it is derived from BMI and would add redundant information. The model uses an 80/20 stratified split and a 100-tree Random Forest.</p></section>
    <section className="card"><h2 className="h-display text-2xl">Technologies</h2><ul className="mt-3 flex flex-wrap gap-2">{TECH.map(t => <li key={t} className="rounded-full bg-[var(--lavender)] px-4 py-2 font-semibold">{t}</li>)}</ul>
      <p className="mt-3 text-muted">AI techniques: Machine Learning, Ensemble Learning, Explainable AI.</p></section>
    <TrustCard /></div>);
}
