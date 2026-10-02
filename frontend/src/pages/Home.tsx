import { Sparkles, Search, BarChart3 } from "lucide-react"; import type { Page } from "../App";
export default function Home({ go }: { go: (p: Page) => void }) {
  const feats = [[Sparkles, "AI Prediction", "A Random Forest model trained on 768 records estimates risk from eight basic measurements."],
    [Search, "Explainable AI", "SHAP shows which of your inputs pushed the estimate up or down, using real values from the model."],
    [BarChart3, "Health Analytics", "Explore glucose, BMI and age patterns across the dataset with interactive charts."]] as const;
  return (<>
    <section className="grid items-center gap-10 md:grid-cols-2">
      <div>
        <h1 className="h-display text-4xl leading-tight sm:text-5xl">Understand your health, one insight at a time.</h1>
        <p className="mt-5 max-w-lg text-lg text-muted">DiaInsight AI uses machine learning and explainable AI to provide diabetes risk insights from basic health measurements.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button className="btn-primary" onClick={() => go("check")}> Start a Health Check</button>
          <button className="btn-ghost" onClick={() => go("analytics")}>Explore Analytics</button></div>
        <p className="mt-6 text-sm text-muted">Educational AI tool · No diagnosis · Built for learning and research</p>
      </div>
      <svg viewBox="0 0 400 340" className="mx-auto w-full max-w-md" role="img" aria-label="Illustration of a glucose drop seen through a lens with a heart, chart and shield">
        <circle cx="200" cy="170" r="150" fill="#E4F3EE" /><circle cx="310" cy="80" r="46" fill="#E9E4F5" /><circle cx="80" cy="270" r="34" fill="#F6D9C8" />
        <path d="M190 52C190 52 120 140 120 190a70 70 0 0 0 140 0C260 140 190 52 190 52z" fill="#3E9C8A" />
        <circle cx="190" cy="190" r="38" fill="#FBF6EC" stroke="#223049" strokeWidth="9" /><path d="M218 218l34 34" stroke="#223049" strokeWidth="11" strokeLinecap="round" />
        <polyline points="172,194 184,194 190,176 198,208 205,194 210,194" fill="none" stroke="#D9705F" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M300 70l6 15 15 6-15 6-6 15-6-15-15-6 15-6z" fill="#F0B596" />
        <path d="M70 120c0-14 20-16 20 0 0-16 20-14 20 0 0 18-20 30-20 38-0-8-20-20-20-38z" fill="#D9705F" opacity=".85" />
        <path d="M320 220l34 12v28c0 20-17 32-34 38-17-6-34-18-34-38v-28z" fill="#FFFDF8" stroke="#3E9C8A" strokeWidth="5" transform="translate(-10 -20) scale(.9)" />
        <path d="M306 246l10 10 18-20" fill="none" stroke="#5FA37A" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </section>
    <section className="mt-16 grid gap-4 md:grid-cols-3">
      {feats.map(([I, t, d]) => <article key={t} className="card"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--lavender)]"><I className="text-mintdeep" aria-hidden /></span>
        <h2 className="h-display mt-4 text-xl">{t}</h2><p className="mt-2 text-muted">{d}</p></article>)}
    </section>
  </>);
}
