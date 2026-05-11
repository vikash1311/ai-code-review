import { useState, useEffect } from "react";
import ScoreBadge from "./ScoreBadge";
import IssueCard from "./IssueCard";

const TABS = [
  { key: "bugs",       label: "Bugs",       icon: "⚠" },
  { key: "security",   label: "Security",   icon: "⛨" },
  { key: "complexity", label: "Complexity", icon: "⌬" },
  { key: "style",      label: "Style",      icon: "✦" },
];

const DEMO = {
  overall_score: 54,
  bugs: [
    { severity: "Warning", description: "No input validation — passing non-numbers returns NaN silently.", line: "Line 3", fix: 'if (typeof a !== "number" || typeof b !== "number")\n  throw new TypeError("Expected numbers");' },
  ],
  security: [],
  complexity: [
    { severity: "Suggestion", description: "Recursive implementation has O(2ⁿ) time complexity — memoize or use iteration.", line: "Lines 1–4", fix: "const memo = {};\nfunction fib(n) {\n  if (n in memo) return memo[n];\n  return memo[n] = n <= 1 ? n : fib(n-1) + fib(n-2);\n}" },
  ],
  style: [
    { severity: "Suggestion", description: "Missing JSDoc comment — no type hints for callers.", line: "Line 1", fix: "/** @param {number} n @returns {number} */" },
  ],
};

function EmptyState() {
  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: "var(--accent)", boxShadow: "0 0 6px var(--accent)" }}
          />
          <span
            className="text-xs uppercase tracking-widest font-semibold"
            style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}
          >
            Preview
          </span>
        </div>
        <h2 className="text-xl font-bold mb-1">Review output</h2>
        <p className="text-sm" style={{ color: "var(--muted2)" }}>
          Paste code → click Run → get instant AI feedback
        </p>
      </div>

      {/* Demo output */}
      <div
        className="rounded-2xl overflow-hidden flex-1"
        style={{ border: "1px solid var(--border)", background: "var(--surface2)", opacity: 0.7 }}
      >
        <div
          className="px-5 pt-5 pb-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <ScoreBadge score={DEMO.overall_score} />
          <div className="flex gap-1 mt-4">
            {TABS.map((t, i) => (
              <div
                key={t.key}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs"
                style={
                  i === 0
                    ? { background: "var(--accent2)", color: "#fff", fontWeight: 600 }
                    : { background: "var(--surface3)", color: "var(--muted2)", border: "1px solid var(--border)" }
                }
              >
                {t.label}
              </div>
            ))}
          </div>
        </div>
        <div className="px-5 py-4">
          {DEMO.bugs.map((issue, i) => <IssueCard key={i} issue={issue} index={i} />)}
        </div>
      </div>
    </div>
  );
}

function LoadingState({ slow }) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-5 p-8">
      <div className="relative w-16 h-16">
        <div
          className="absolute inset-0 rounded-full"
          style={{ border: "1.5px solid var(--accent)", animation: "pulse-ring 1.4s ease-out infinite" }}
        />
        <div
          className="w-16 h-16 rounded-full anim-spin"
          style={{
            border: "2px solid var(--border2)",
            borderTopColor: "var(--accent)",
            boxShadow: "0 0 20px rgba(0,212,255,0.2)",
          }}
        />
        <div
          className="absolute inset-0 flex items-center justify-center text-lg"
          style={{ fontFamily: "var(--font-mono)", color: "var(--accent)" }}
        >
          ⌘
        </div>
      </div>
      <div className="text-center">
        <p className="font-semibold mb-1" style={{ color: "var(--text)" }}>
          {slow ? "Waking up AI service…" : "Reviewing your code…"}
        </p>
        <p className="text-sm" style={{ color: "var(--muted2)" }}>
          {slow
            ? "Cold start — about 30 seconds on first run"
            : "Running static analysis + AI review"
          }
        </p>
      </div>
      {/* animated dots */}
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: "var(--accent)",
              animation: `pulse-ring 1.2s ease-in-out ${i * 0.2}s infinite`,
              boxShadow: "0 0 4px var(--accent)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ReviewOutput({ result, loading, error, onCopy, onReset }) {
  const [tab, setTab] = useState("bugs");
  const [slow, setSlow] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!loading) { setSlow(false); return; }
    const t = setTimeout(() => setSlow(true), 5000);
    return () => clearTimeout(t);
  }, [loading]);

  useEffect(() => {
    if (result) setTab("bugs");
  }, [result]);

  function handleCopy() {
    if (!result) return;
    const text = TABS.map(({ key, label }) => {
      const issues = result[key];
      if (!issues?.length) return `## ${label}\nNo issues found.`;
      return `## ${label}\n` + issues.map((i) =>
        `[${i.severity}] ${i.description}\nLine: ${i.line}\nFix: ${i.fix}`
      ).join("\n\n");
    }).join("\n\n");
    navigator.clipboard.writeText(`# Code Review — Score: ${result.overall_score}/100\n\n${text}`);
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    if (!result) return;
    const md = [
      `# Code Review Report`,
      `**Language:** ${result.language}  |  **Score:** ${result.overall_score}/100\n`,
      ...TABS.map(({ key, label }) => {
        const issues = result[key];
        if (!issues?.length) return `## ${label}\n_No issues found._\n`;
        return `## ${label}\n\n` + issues.map((i) =>
          `### [${i.severity}] ${i.description}\n- **Line:** ${i.line}\n- **Fix:**\n\`\`\`\n${i.fix}\n\`\`\``
        ).join("\n\n");
      }),
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([md], { type: "text/markdown" }));
    a.download = "code-review.md";
    a.click();
  }

  if (loading) return <LoadingState slow={slow} />;

  if (error) return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center gap-4">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: "rgba(255,77,106,0.1)", border: "1px solid rgba(255,77,106,0.3)" }}
      >
        <svg width="22" height="22" fill="none" stroke="var(--red)" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4m0 4h.01" strokeLinecap="round"/>
        </svg>
      </div>
      <div>
        <p className="font-semibold mb-1" style={{ color: "var(--red)" }}>Review failed</p>
        <p className="text-sm max-w-xs" style={{ color: "var(--muted2)" }}>{error}</p>
      </div>
      <button
        onClick={onReset}
        className="text-sm px-4 py-2 rounded-lg transition-all"
        style={{ background: "var(--surface2)", color: "var(--text)", border: "1px solid var(--border)" }}
      >
        Try again
      </button>
    </div>
  );

  if (!result) return <EmptyState />;

  const counts = Object.fromEntries(TABS.map(({ key }) => [key, result[key]?.length || 0]));
  const issues = result[tab] || [];
  const totalIssues = TABS.reduce((sum, { key }) => sum + (result[key]?.length || 0), 0);

  return (
    <div className="flex flex-col h-full anim-fade-up">

      {/* Header */}
      <div
        className="px-5 pt-5 pb-4 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <ScoreBadge score={result.overall_score} />
            <div className="mt-2 flex items-center gap-2">
              <span
                className="text-xs px-2 py-0.5 rounded font-medium"
                style={{
                  background: "var(--surface3)",
                  color: "var(--muted2)",
                  border: "1px solid var(--border)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {result.language}
              </span>
              <span className="text-xs" style={{ color: "var(--muted2)" }}>
                {totalIssues} issue{totalIssues !== 1 ? "s" : ""} found
              </span>
            </div>
          </div>
          <div className="flex gap-1.5 mt-1">
            <button
              onClick={handleCopy}
              className="text-xs px-3 py-1.5 rounded-lg transition-all font-medium"
              style={{
                background: copied ? "rgba(0,229,160,0.1)" : "var(--surface3)",
                color: copied ? "var(--green)" : "var(--muted2)",
                border: `1px solid ${copied ? "rgba(0,229,160,0.3)" : "var(--border)"}`,
                fontFamily: "var(--font-mono)",
              }}
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
            <button
              onClick={handleDownload}
              className="text-xs px-3 py-1.5 rounded-lg transition-all font-medium"
              style={{ background: "var(--surface3)", color: "var(--muted2)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)" }}
            >
              .md
            </button>
            <button
              onClick={onReset}
              className="text-xs px-3 py-1.5 rounded-lg transition-all font-medium"
              style={{ background: "var(--surface3)", color: "var(--text)", border: "1px solid var(--border)", fontFamily: "var(--font-mono)" }}
            >
              New
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {TABS.map(({ key, label, icon }) => {
            const active = tab === key;
            const count = counts[key];
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                style={
                  active
                    ? {
                        background: "linear-gradient(135deg, var(--accent2), var(--accent))",
                        color: "#fff",
                        boxShadow: "0 0 14px rgba(124,106,247,0.4)",
                      }
                    : {
                        background: "var(--surface2)",
                        color: "var(--muted2)",
                        border: "1px solid var(--border)",
                      }
                }
              >
                <span style={{ opacity: 0.8 }}>{icon}</span>
                {label}
                {count > 0 && (
                  <span
                    className="px-1.5 py-0.5 rounded-full text-xs"
                    style={{
                      background: active ? "rgba(255,255,255,0.2)" : "var(--surface3)",
                      color: active ? "#fff" : "var(--muted2)",
                      fontFamily: "var(--font-mono)",
                      minWidth: 18,
                      textAlign: "center",
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Issues */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(0,229,160,0.08)", border: "1px solid rgba(0,229,160,0.2)" }}
            >
              <svg width="18" height="18" fill="none" stroke="var(--green)" strokeWidth="2.2" viewBox="0 0 24 24">
                <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--green)" }}>All clear</p>
            <p className="text-xs" style={{ color: "var(--muted2)" }}>No {tab} issues detected</p>
          </div>
        ) : (
          issues.map((issue, i) => <IssueCard key={i} issue={issue} index={i} />)
        )}
      </div>
    </div>
  );
}