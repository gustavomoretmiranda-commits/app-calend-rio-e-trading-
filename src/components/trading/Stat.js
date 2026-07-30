export default function Stat({ label, value, color, sub }) {
  return (
    <div className="bg-surface border border-border rounded-lg px-4 py-2.5">
      <div className="text-[10.5px] uppercase tracking-wide text-muted">{label}</div>
      <div className="font-mono text-base mt-0.5" style={{ color }}>
        {value}
        {sub && <span className="text-xs ml-1.5 opacity-70">({sub})</span>}
      </div>
    </div>
  );
}
