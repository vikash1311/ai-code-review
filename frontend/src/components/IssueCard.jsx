const SEV = {
  Critical:   { bg: "rgba(255,77,106,0.08)",  border: "var(--red)",    text: "var(--red)",    glow: "rgba(255,77,106,0.15)",   dot: "#ff4d6a" },
  Warning:    { bg: "rgba(255,181,71,0.08)",  border: "var(--yellow)", text: "var(--yellow)", glow: "rgba(255,181,71,0.15)",   dot: "#ffb547" },
  Suggestion: { bg: "rgba(0,229,160,0.06)",   border: "var(--green)",  text: "var(--green)",  glow: "rgba(0,229,160,0.12)",    dot: "#00e5a0" },
};

export default function IssueCard({ issue, index }) {
  const s = SEV[issue.severity] || SEV.Suggestion;

  return (
    <div
      className="rounded-xl p-4 mb-3 anim-fade-up"
      style={{
        background: s.bg,
        border: `1px solid ${s.border}30`,
        borderLeft: `3px solid ${s.border}`,
        boxShadow: `inset 0 0 30px ${s.glow}`,
        animationDelay: `${index * 70}ms`,
        animationFillMode: "both",
        opacity: 0,
      }}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <span
          className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
          style={{
            background: `${s.dot}18`,
            color: s.text,
            border: `1px solid ${s.dot}40`,
            fontFamily: "var(--font-mono)",
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
          {issue.severity}
        </span>
        {issue.line && issue.line !== "N/A" && (
          <span
            className="text-xs px-2 py-0.5 rounded font-mono"
            style={{
              background: "var(--surface3)",
              color: "var(--muted2)",
              border: "1px solid var(--border)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {issue.line}
          </span>
        )}
      </div>

      <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text)" }}>
        {issue.description}
      </p>

      {issue.fix && (
        <div
          className="rounded-lg overflow-hidden"
          style={{ border: "1px solid var(--border2)" }}
        >
          <div
            className="px-3 py-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest"
            style={{
              background: "var(--surface3)",
              borderBottom: "1px solid var(--border2)",
              color: "var(--green)",
              fontFamily: "var(--font-mono)",
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M2 5l2.5 2.5L8 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Fix
          </div>
          <pre
            className="text-xs leading-relaxed overflow-x-auto p-3 whitespace-pre-wrap"
            style={{
              fontFamily: "var(--font-mono)",
              color: "#a8c0d8",
              background: "var(--surface)",
              margin: 0,
            }}
          >
            {issue.fix}
          </pre>
        </div>
      )}
    </div>
  );
}