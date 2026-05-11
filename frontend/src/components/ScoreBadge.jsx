export default function ScoreBadge({ score }) {
  const color = score >= 70 ? "var(--green)" : score >= 40 ? "var(--yellow)" : "var(--red)";
  const label = score >= 70 ? "Good" : score >= 40 ? "Fair" : "Poor";
  const r = 26;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-[72px] h-[72px] flex-shrink-0">
        <span
          className="absolute inset-0 rounded-full"
          style={{ border: `1.5px solid ${color}`, animation: "pulse-ring 2.5s ease-out infinite" }}
        />
        <svg className="w-[72px] h-[72px] -rotate-90" viewBox="0 0 68 68">
          <circle cx="34" cy="34" r={r} fill="none" stroke="var(--border2)" strokeWidth="4" />
          <circle
            cx="34" cy="34" r={r}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ transition: "stroke-dasharray 1s cubic-bezier(.4,0,.2,1)", filter: `drop-shadow(0 0 6px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className="font-bold text-xl"
            style={{ color, fontFamily: "var(--font-mono)", lineHeight: 1 }}
          >
            {score}
          </span>
        </div>
      </div>
      <div>
        <div
          className="text-xs uppercase tracking-widest mb-1"
          style={{ color: "var(--muted2)", fontFamily: "var(--font-mono)" }}
        >
          Quality Score
        </div>
        <div
          className="text-2xl font-bold"
          style={{ color, textShadow: `0 0 20px ${color}60` }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}