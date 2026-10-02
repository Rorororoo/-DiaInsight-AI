import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Logo from "./Logo"; import type { PredictResult, Patient } from "./api";
import Home from "./pages/Home"; import Assess from "./pages/Assess"; import Result from "./pages/Result";
import Insights from "./pages/Insights"; import Analytics from "./pages/Analytics"; import About from "./pages/About";

export type Page = "home" | "check" | "result" | "insights" | "analytics" | "about";
const NAV: [Page, string][] = [["home", "Home"], ["check", "Health Check"], ["insights", "AI Insights"], ["analytics", "Analytics"], ["about", "About"]];

export default function App() {
  const [page, setPage] = useState<Page>((location.hash.slice(1) as Page) || "home");
  const [result, setResult] = useState<{ r: PredictResult; p: Patient } | null>(null);
  const [open, setOpen] = useState(false);
  const go = (p: Page) => { setPage(p); setOpen(false); location.hash = p; window.scrollTo({ top: 0 }); };
  useEffect(() => { const f = () => setPage((location.hash.slice(1) as Page) || "home"); addEventListener("hashchange", f); return () => removeEventListener("hashchange", f); }, []);
  const active = page === "result" ? "check" : page;
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b backdrop-blur" style={{ background: "rgba(251,246,236,.92)", borderColor: "var(--line)" }}>
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3" aria-label="Main">
          <button onClick={() => go("home")} aria-label="DiaLens AI home"><Logo /></button>
          <ul className="hidden items-center gap-1 md:flex">
            {NAV.map(([k, l]) => <li key={k}><button onClick={() => go(k)} aria-current={active === k ? "page" : undefined}
              className={`rounded-full px-4 py-2 font-semibold transition ${active === k ? "bg-[var(--mint-soft)] text-mintdeep" : "text-muted hover:text-ink"}`}>{l}</button></li>)}
          </ul>
          <button className="btn-primary hidden md:inline-flex" onClick={() => go("check")}>Start Assessment</button>
          <button className="grid h-12 w-12 place-items-center md:hidden" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        </nav>
        {open && <ul className="border-t px-4 pb-4 md:hidden" style={{ borderColor: "var(--line)" }}>
          {NAV.map(([k, l]) => <li key={k}><button onClick={() => go(k)} className="w-full py-3 text-left text-lg font-semibold">{l}</button></li>)}
          <li><button className="btn-primary mt-2 w-full" onClick={() => go("check")}>Start Assessment</button></li></ul>}
      </header>
      <main key={page} className="page mx-auto max-w-6xl px-4 py-8 sm:py-12">
        {page === "home" && <Home go={go} />}
        {page === "check" && <Assess go={go} onDone={(r, p) => { setResult({ r, p }); go("result"); }} />}
        {page === "result" && <Result data={result} go={go} />}
        {page === "insights" && <Insights go={go} />}
        {page === "analytics" && <Analytics />}
        {page === "about" && <About />}
      </main>
      <footer className="border-t px-4 py-8 text-center text-sm text-muted" style={{ borderColor: "var(--line)" }}>
        <Logo size={26} /><p className="mt-2">Understand your health, one insight at a time.</p>
        <p className="mx-auto mt-1 max-w-xl">Educational use only. This application does not provide a medical diagnosis. Please consult a qualified healthcare professional for medical advice.</p>
      </footer>
    </div>
  );
}
