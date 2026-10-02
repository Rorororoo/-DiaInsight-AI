import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";
import { getGlobal, getRecords, type GlobalExplain, type Row } from "../api";
import { ErrorBox, Loading, Title, MINT, CORAL, LAV, INK, MUTED, LABELS } from "../ui";

const AGE_GROUPS: [string, number, number][] = [["21–30", 21, 30], ["31–40", 31, 40], ["41–50", 41, 50], ["51+", 51, 200]];
const ageGroup = (a: number) => AGE_GROUPS.find(g => a >= g[1] && a <= g[2])![0];
const hist = (v: number[], size: number, start: number) => { const m: Record<number, number> = {};
  v.forEach(x => { const b = Math.floor((x - start) / size) * size + start; m[b] = (m[b] || 0) + 1; });
  return Object.keys(m).map(Number).sort((a, b) => a - b).map(b => ({ bin: `${b}–${b + size - 1}`, count: m[b] })); };
const avg = (a: number[]) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : 0);

function Chart({ title, note, children, h = 280 }: { title: string; note?: string; children: React.ReactElement; h?: number }) {
  return <section className="card"><h2 className="h-display text-xl">{title}</h2>{note && <p className="text-sm text-muted">{note}</p>}<div className="mt-3" style={{ height: h }}><ResponsiveContainer>{children}</ResponsiveContainer></div></section>;
}
function Select({ label, value, onChange, opts }: { label: string; value: string; onChange: (v: string) => void; opts: string[] }) {
  return <label className="flex flex-col text-sm font-semibold">{label}<select value={value} onChange={e => onChange(e.target.value)} className="mt-1 min-h-[48px] rounded-2xl border-2 bg-white px-3 text-base font-normal" style={{ borderColor: "var(--line)" }}>{opts.map(o => <option key={o}>{o}</option>)}</select></label>;
}

export default function Analytics() {
  const [rows, setRows] = useState<Row[] | null>(null); const [g, setG] = useState<GlobalExplain | null>(null); const [err, setErr] = useState(""); const [n, setN] = useState(0);
  const [fo, setFo] = useState("All"), [fa, setFa] = useState("All"), [fb, setFb] = useState("All");
  useEffect(() => { setErr(""); Promise.all([getRecords(), getGlobal()]).then(([r, x]) => { setRows(r); setG(x); }).catch(e => setErr(e.message)); }, [n]);
  const data = useMemo(() => (rows ?? []).filter(r => (fo === "All" || (fo === "Diabetes" ? r.Outcome === 1 : r.Outcome === 0)) && (fa === "All" || ageGroup(r.Age) === fa) && (fb === "All" || r.BMI_Category === fb)), [rows, fo, fa, fb]);
  if (err) return <ErrorBox msg={err} onRetry={() => setN(n + 1)} />;
  if (!rows || !g) return <Loading text="Loading the data explorer…" />;
  const d = data.filter(r => r.Outcome === 1).length, nd = data.length - d;
  const kpis: [string, string][] = [[String(data.length), "Patients"], [String(d), "Diabetes cases"], [String(nd), "Non-diabetes cases"],
    [data.length ? `${((d / data.length) * 100).toFixed(1)}%` : "–", "Diabetes percentage"], [avg(data.map(r => r.Glucose)).toFixed(1), "Average glucose (mg/dL)"], [avg(data.map(r => r.BMI)).toFixed(1), "Average BMI"]];
  const byAge = AGE_GROUPS.map(([k]) => ({ group: k, Diabetes: data.filter(r => ageGroup(r.Age) === k && r.Outcome === 1).length, "No diabetes": data.filter(r => ageGroup(r.Age) === k && r.Outcome === 0).length }));
  const imp = g.importance.map(i => ({ name: LABELS[i.feature], v: +i.mean_abs_shap.toFixed(4) }));
  return (
    <div className="space-y-6">
      <Title sub="Explore patterns across the dataset.">Diabetes Data Explorer</Title>
      <div className="card grid gap-4 sm:grid-cols-3" role="group" aria-label="Filters">
        <Select label="Outcome" value={fo} onChange={setFo} opts={["All", "Diabetes", "No diabetes"]} />
        <Select label="Age group" value={fa} onChange={setFa} opts={["All", ...AGE_GROUPS.map(a => a[0])]} />
        <Select label="BMI category" value={fb} onChange={setFb} opts={["All", "Underweight", "Normal", "Overweight", "Obese"]} /></div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">{kpis.map(([v, l], i) => <div key={l} className="rounded-xl2 p-4" style={{ background: ["#E4F3EE", "#FBE4DF", "#E3F1E8", "#E9E4F5", "#F6D9C8", "#E4F3EE"][i] }}>
        <div className="h-display text-3xl">{v}</div><div className="text-sm text-muted">{l}</div></div>)}</div>
      {data.length === 0 ? <div className="card text-center">No patients match these filters. Try widening them.</div> : <div className="grid gap-5 lg:grid-cols-2">
        <Chart title="Diabetes vs non-diabetes"><PieChart><Pie isAnimationActive={false} data={[{ name: "Diabetes", value: d }, { name: "No diabetes", value: nd }]} dataKey="value" innerRadius={60} outerRadius={100} label>
          <Cell fill={CORAL} /><Cell fill={MINT} /></Pie><Tooltip /><Legend /></PieChart></Chart>
        <Chart title="Diabetes by age group"><BarChart data={byAge}><CartesianGrid strokeDasharray="3 3" stroke="#EADFCB" /><XAxis dataKey="group" tick={{ fill: INK }} /><YAxis tick={{ fill: MUTED }} /><Tooltip /><Legend />
          <Bar isAnimationActive={false} dataKey="Diabetes" stackId="a" fill={CORAL} /><Bar isAnimationActive={false} dataKey="No diabetes" stackId="a" fill={MINT} radius={[6, 6, 0, 0]} /></BarChart></Chart>
        <Chart title="Glucose distribution" note="Patients per 20 mg/dL range"><BarChart data={hist(data.map(r => r.Glucose), 20, 40)}><CartesianGrid strokeDasharray="3 3" stroke="#EADFCB" /><XAxis dataKey="bin" tick={{ fill: MUTED, fontSize: 11 }} interval={0} angle={-35} textAnchor="end" height={50} /><YAxis tick={{ fill: MUTED }} /><Tooltip /><Bar isAnimationActive={false} dataKey="count" name="Patients" fill={MINT} radius={[6, 6, 0, 0]} /></BarChart></Chart>
        <Chart title="BMI distribution" note="Patients per 5-point BMI range"><BarChart data={hist(data.map(r => r.BMI), 5, 15)}><CartesianGrid strokeDasharray="3 3" stroke="#EADFCB" /><XAxis dataKey="bin" tick={{ fill: MUTED, fontSize: 11 }} interval={0} angle={-35} textAnchor="end" height={50} /><YAxis tick={{ fill: MUTED }} /><Tooltip /><Bar isAnimationActive={false} dataKey="count" name="Patients" fill={LAV} radius={[6, 6, 0, 0]} /></BarChart></Chart>
        <Chart title="Age distribution" note="Patients per 5-year range"><BarChart data={hist(data.map(r => r.Age), 5, 20)}><CartesianGrid strokeDasharray="3 3" stroke="#EADFCB" /><XAxis dataKey="bin" tick={{ fill: MUTED, fontSize: 11 }} interval={0} angle={-35} textAnchor="end" height={50} /><YAxis tick={{ fill: MUTED }} /><Tooltip /><Bar isAnimationActive={false} dataKey="count" name="Patients" fill="#F0B596" radius={[6, 6, 0, 0]} /></BarChart></Chart>
        <Chart title="Glucose vs BMI"><ScatterChart margin={{ left: 0, right: 8 }}><CartesianGrid strokeDasharray="3 3" stroke="#EADFCB" /><XAxis type="number" dataKey="BMI" name="BMI" domain={["auto", "auto"]} tick={{ fill: MUTED }} /><YAxis type="number" dataKey="Glucose" name="Glucose" domain={["auto", "auto"]} tick={{ fill: MUTED }} /><ZAxis range={[30, 30]} /><Tooltip /><Legend />
          <Scatter isAnimationActive={false} name="No diabetes" data={data.filter(r => r.Outcome === 0)} fill={MINT} fillOpacity={0.6} /><Scatter isAnimationActive={false} name="Diabetes" data={data.filter(r => r.Outcome === 1)} fill={CORAL} fillOpacity={0.6} /></ScatterChart></Chart>
        <div className="lg:col-span-2"><Chart title="SHAP feature importance" note="Mean absolute SHAP value on the test set (not affected by filters)" h={320}><BarChart data={imp} layout="vertical"><XAxis type="number" tick={{ fill: MUTED }} /><YAxis type="category" dataKey="name" width={130} tick={{ fill: INK, fontSize: 13 }} /><Tooltip /><Bar isAnimationActive={false} dataKey="v" name="Mean |SHAP|" fill={MINT} radius={6} /></BarChart></Chart></div>
      </div>}
      <section className="card"><h2 className="h-display text-xl">About this dataset</h2>
        <p className="mt-2">768 records. Features: Pregnancies, Glucose, Blood Pressure, Skin Thickness, Insulin, BMI, Diabetes Pedigree Function, Age. Target: Outcome (0 = No Diabetes, 1 = Diabetes).</p>
        <p className="mt-2 text-muted">BMI_Category is used only for the filter above. It is excluded from the model because it is derived from BMI. The dataset file is never modified.</p></section>
    </div>);
}
