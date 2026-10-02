import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ScatterChart, Scatter, ZAxis, CartesianGrid, Cell } from "recharts";
import { getGlobal, type GlobalExplain } from "../api"; import type { Page } from "../App";
import { ErrorBox, Loading, Title, MINT, INK, MUTED, LABELS } from "../ui";

const shade = (t: number) => `rgb(${Math.round(185 - t * 0 + (217 - 185) * t)},${Math.round(174 + (112 - 174) * t)},${Math.round(221 + (95 - 221) * t)})`;
export default function Insights({ go }: { go: (p: Page) => void }) {
  const [d, setD] = useState<GlobalExplain | null>(null); const [err, setErr] = useState(""); const [n, setN] = useState(0);
  useEffect(() => { setErr(""); getGlobal().then(setD).catch(e => setErr(e.message)); }, [n]);
  if (err) return <ErrorBox msg={err} onRetry={() => setN(n + 1)} />;
  if (!d) return <Loading text="Loading model explanations…" />;
  const imp = d.importance.map(i => ({ name: LABELS[i.feature], v: +i.mean_abs_shap.toFixed(4) }));
  const order = d.importance.map(i => i.feature);
  const pts = order.flatMap((f, idx) => d.summary[f].map((p, j) => ({ x: p.shap, y: order.length - 1 - idx + ((j * 37) % 11) / 30 - 0.17, t: p.norm })));
  const m = d.metrics;
  return (
    <div className="space-y-6">
      <Title sub="How the Random Forest weighs each measurement across the held-out test set (154 patients).">AI Insights</Title>
      <section className="card"><h2 className="h-display text-2xl">Which features matter most?</h2>
        <p className="mt-1 text-muted">Mean absolute SHAP value: the average size of each feature's push on the prediction. Calculated from the model, not hardcoded.</p>
        <div className="mt-4 h-[340px]"><ResponsiveContainer><BarChart data={imp} layout="vertical" margin={{ right: 16 }}>
          <XAxis type="number" tick={{ fill: MUTED, fontSize: 13 }} /><YAxis type="category" dataKey="name" width={130} tick={{ fill: INK, fontSize: 13 }} /><Tooltip />
          <Bar isAnimationActive={false} dataKey="v" name="Mean |SHAP|" fill={MINT} radius={6} /></BarChart></ResponsiveContainer></div></section>
      <section className="card"><h2 className="h-display text-2xl">SHAP summary</h2>
        <p className="mt-1 text-muted">Each dot is one test patient. Right of zero pushes toward higher predicted risk. Coral dots are high feature values, lavender dots are low.</p>
        <div className="mt-4 h-[400px]"><ResponsiveContainer><ScatterChart margin={{ left: 8, right: 16 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EADFCB" />
          <XAxis type="number" dataKey="x" name="SHAP" tick={{ fill: MUTED, fontSize: 12 }} /><YAxis type="number" dataKey="y" domain={[-0.5, order.length - 0.5]} ticks={order.map((_, i) => i)} width={130}
            tickFormatter={(v: number) => LABELS[order[order.length - 1 - v]] ?? ""} tick={{ fill: INK, fontSize: 12 }} /><ZAxis range={[28, 28]} />
          <Scatter isAnimationActive={false} data={pts}>{pts.map((p, i) => <Cell key={i} fill={shade(p.t)} fillOpacity={0.8} />)}</Scatter></ScatterChart></ResponsiveContainer></div></section>
      <section className="card"><h2 className="h-display text-2xl">Model performance (test set)</h2>
        <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">{[["Accuracy", m.accuracy], ["Precision", m.precision], ["Recall", m.recall], ["F1 score", m.f1], ["ROC-AUC", m.roc_auc]].map(([k, v]) =>
          <div key={k as string} className="rounded-2xl bg-[var(--lavender)] p-3 text-center"><dt className="text-sm text-muted">{k}</dt><dd className="h-display text-2xl">{((v as number) * 100).toFixed(1)}%</dd></div>)}</dl>
        <p className="mt-3 text-sm text-muted">Recall for the diabetes class is moderate, so the model can miss some higher-risk cases. That is one reason it is not a diagnostic tool.</p></section>
      <button className="btn-primary" onClick={() => go("check")}>✨ Start a Health Check</button>
    </div>);
}
