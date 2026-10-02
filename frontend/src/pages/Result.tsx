import { Bar, BarChart, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";
import type { PredictResult, Patient } from "../api"; import type { Page } from "../App";
import { CORAL, MINT, LABELS, TrustCard, Title, INK, MUTED } from "../ui";

export default function Result({ data, go }: { data: { r: PredictResult; p: Patient } | null; go: (p: Page) => void }) {
  if (!data) return <div className="card text-center"><p className="text-lg">No insight yet. Complete a health check to see your result.</p><button className="btn-primary mt-4" onClick={() => go("check")}>Start a Health Check</button></div>;
  const { r, p } = data, high = r.prediction === 1;
  const chart = r.explanation.map(e => ({ name: LABELS[e.feature], shap: +e.shap.toFixed(4), v: e.value }));
  const up = r.explanation.filter(e => e.direction === "increase"), down = r.explanation.filter(e => e.direction === "decrease");
  const Group = ({ title, items, color }: { title: string; items: typeof up; color: string }) => (
    <div><h3 className="font-bold" style={{ color }}>{title}</h3>
      {items.length === 0 ? <p className="mt-1 text-sm text-muted">None for this input.</p> :
        <ul className="mt-2 space-y-1">{items.map(e => <li key={e.feature} className="flex justify-between gap-3 text-sm"><span>{LABELS[e.feature]} <span className="text-muted">({p[e.feature]})</span></span><span className="font-semibold">{e.shap > 0 ? "+" : ""}{e.shap.toFixed(3)}</span></li>)}</ul>}</div>);
  return (
    <div className="space-y-6">
      <Title>Your AI Health Insight</Title>
      <section className="card flex flex-col items-start gap-6 sm:flex-row sm:items-center" style={{ background: high ? "var(--coral-soft)" : "#E3F1E8" }}>
        <div className="grid h-36 w-36 shrink-0 place-items-center rounded-full border-[10px] bg-white" style={{ borderColor: high ? CORAL : "#5FA37A" }} aria-label={`Model-estimated probability ${r.risk_percentage} percent`}>
          <div className="text-center"><div className="h-display text-4xl">{Math.round(r.risk_percentage)}%</div></div></div>
        <div><p className="text-sm font-semibold text-muted">Model-estimated probability</p>
          <h2 className="h-display text-3xl" style={{ color: high ? "#B24A3A" : "#2F7650" }}>{high ? "Higher predicted risk" : "Lower predicted risk"}</h2>
          <p className="mt-2 max-w-xl text-ink/90">This is an estimate from a machine-learning model trained on a research dataset. It is not a medical diagnosis.</p></div>
      </section>
      <section className="card" id="why">
        <h2 className="h-display text-2xl">🔍 Why did the AI say this?</h2>
        <p className="mt-1 text-muted">Real SHAP values from the model for your entered measurements. The prediction was most influenced by {r.top_features.slice(0, 4).map(f => LABELS[f]).join(", ")}.</p>
        <div className="mt-4 h-[340px]" role="img" aria-label="Horizontal bar chart of SHAP feature contributions">
          <ResponsiveContainer><BarChart data={chart} layout="vertical" margin={{ left: 4, right: 16 }}>
            <XAxis type="number" tick={{ fill: MUTED, fontSize: 13 }} /><YAxis type="category" dataKey="name" width={120} tick={{ fill: INK, fontSize: 13 }} />
            <ReferenceLine x={0} stroke={MUTED} /><Tooltip />
            <Bar isAnimationActive={false} dataKey="shap" name="SHAP value" radius={6}>{chart.map((c, i) => <Cell key={i} fill={c.shap > 0 ? CORAL : MINT} />)}</Bar></BarChart></ResponsiveContainer></div>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <Group title="Factors contributing toward the prediction" items={up} color="#B24A3A" />
          <Group title="Factors contributing away from the prediction" items={down} color="#2C7A6B" /></div>
        <p className="mt-4 text-sm text-muted">"Toward" means the value nudged the model toward a higher predicted risk; "away" means toward a lower one.</p>
      </section>
      <section className="card"><h2 className="h-display text-2xl">A few things worth knowing 🌱</h2>
        <ul className="mt-3 space-y-2">{r.insights.map((t, i) => <li key={i} className="flex gap-2"><span aria-hidden>🌱</span><span>{t}</span></li>)}</ul></section>
      <TrustCard />
      <div className="flex flex-col gap-3 sm:flex-row"><button className="btn-primary" onClick={() => go("check")}>New Assessment</button>
        <button className="btn-ghost" onClick={() => go("insights")}>See how the model works overall</button></div>
    </div>);
}
