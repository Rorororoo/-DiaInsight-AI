export default function Logo({ size = 36, text = true }: { size?: number; text?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="DiaInsight AI logo">
        <rect width="64" height="64" rx="16" fill="#E4F3EE" />
        <path d="M30 10C30 10 14 28 14 38a16 16 0 0 0 32 0C46 28 30 10 30 10z" fill="#3E9C8A" />
        <circle cx="30" cy="38" r="8" fill="#FBF6EC" stroke="#223049" strokeWidth="3" />
        <path d="M36 44l7 7" stroke="#223049" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M48 8l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#F2B79C" />
      </svg>
      {text && <span className="font-display text-xl font-semibold text-ink">DiaInsight <span className="text-mintdeep">AI</span></span>}
    </span>
  );
}
