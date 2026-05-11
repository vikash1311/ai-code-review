import { useState, useEffect } from "react";
import CodeEditor from "./components/CodeEditor";
import ReviewOutput from "./components/ReviewOutput";
import { reviewCode, reviewGitHub } from "./api/reviewApi";

const SNIPPETS_JS = `// Select a language above to load a sample snippet
// or paste your own code here

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}`;

export default function App() {
  const [dark, setDark]           = useState(true);
  const [mode, setMode]           = useState("code");
  const [code, setCode]           = useState(SNIPPETS_JS);
  const [githubUrl, setGithubUrl] = useState("");
  const [language, setLanguage]   = useState("javascript");
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState(null);

  useEffect(() => {
    document.documentElement.classList.toggle("light", !dark);
  }, [dark]);

  async function handleReview() {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const data = mode === "github"
        ? await reviewGitHub(githubUrl)
        : await reviewCode(code, language);
      setResult(data);
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setError(null);
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">

      {/* ── Header ── */}
      <header
        className="flex items-center justify-between px-6 py-3 flex-shrink-0"
        style={{
          borderBottom: "1px solid var(--border)",
          background: "linear-gradient(180deg, rgba(13,17,23,0.98) 0%, var(--surface) 100%)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center relative"
            style={{
              background: "linear-gradient(135deg, var(--accent), var(--accent2))",
              boxShadow: "0 0 16px rgba(0,212,255,0.4)",
            }}
          >
            <svg width="15" height="15" fill="none" stroke="#000" strokeWidth="2.2" viewBox="0 0 24 24">
              <path d="M16 18l6-6-6-6M8 6L2 12l6 6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="font-extrabold text-lg tracking-tight"
              style={{
                background: "linear-gradient(135deg, #fff 30%, var(--accent))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              CodeLens
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{
                background: "rgba(0,212,255,0.1)",
                border: "1px solid rgba(0,212,255,0.25)",
                color: "var(--accent)",
                fontFamily: "var(--font-mono)",
              }}
            >
              AI
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Status dot */}
          <div className="hidden md:flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "var(--green)", boxShadow: "0 0 5px var(--green)" }}
            />
            <span
              className="text-xs"
              style={{ color: "var(--muted2)", fontFamily: "var(--font-mono)" }}
            >
              Groq · llama-3.3-70b
            </span>
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => setDark((d) => !d)}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              color: "var(--muted2)",
              cursor: "pointer",
              flexShrink: 0,
            }}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.color = "var(--accent)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--muted2)"; }}
          >
            {dark ? (
              /* Sun icon */
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" strokeLinecap="round"/>
              </svg>
            ) : (
              /* Moon icon */
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg transition-all"
            style={{
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              color: "var(--muted2)",
              textDecoration: "none",
              fontFamily: "var(--font-mono)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--accent)";
              e.currentTarget.style.color = "var(--accent)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--muted2)";
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
            </svg>
            Star
          </a>
        </div>
      </header>

      {/* ── Split view ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left */}
        <div
          className="flex flex-col overflow-hidden"
          style={{ width: "50%", borderRight: "1px solid var(--border)" }}
        >
          <CodeEditor
            mode={mode} setMode={setMode}
            code={code} setCode={setCode}
            githubUrl={githubUrl} setGithubUrl={setGithubUrl}
            language={language} setLanguage={setLanguage}
            onReview={handleReview}
            loading={loading}
            dark={dark}
          />
        </div>

        {/* Right */}
        <div
          className="flex flex-col overflow-hidden"
          style={{
            width: "50%",
            background: "var(--surface)",
          }}
        >
          <ReviewOutput
            result={result}
            loading={loading}
            error={error}
            onCopy={() => {}}
            onReset={handleReset}
          />
        </div>
      </div>
    </div>
  );
}