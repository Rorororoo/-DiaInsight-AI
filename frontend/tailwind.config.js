export default { content: ["./index.html","./src/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { mint:"var(--mint)", mintdeep:"var(--mint-deep)", cream:"var(--cream)", lav:"var(--lavender)", peach:"var(--peach)",
      ink:"var(--ink)", muted:"var(--muted)", coral:"var(--coral)", sage:"var(--sage)", card:"var(--card)" },
    fontFamily: { display:["Fraunces","Georgia","serif"], sans:["Nunito Sans","system-ui","sans-serif"] },
    borderRadius: { xl2:"1.25rem" } } }, plugins: [] };
