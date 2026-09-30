import { useId, useState } from 'react';

// Lightweight SVG charts — no chart library, enough polish for a demo.

const W = 600;

export function AreaChart({ data, labels, height = 220, color = 'var(--accent)', format = (v: number) => String(v) }: {
  data: number[];
  labels: string[];
  height?: number;
  color?: string;
  format?: (v: number) => string;
}) {
  const gid = useId();
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data) * 1.1;
  const min = Math.min(...data) * 0.85;
  const x = (i: number) => (i / (data.length - 1)) * W;
  const y = (v: number) => height - ((v - min) / (max - min)) * height;
  const line = data.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join(' ');
  const area = `${line} L${W},${height} L0,${height} Z`;

  return (
    <div className="chart">
      <svg
        viewBox={`0 0 ${W} ${height}`}
        preserveAspectRatio="none"
        style={{ height }}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setHover(Math.round(((e.clientX - r.left) / r.width) * (data.length - 1)));
        }}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1="0" x2={W} y1={height * f} y2={height * f} stroke="var(--border)" strokeDasharray="4 6" vectorEffect="non-scaling-stroke" />
        ))}
        <path d={area} fill={`url(#${gid})`} />
        <path d={line} fill="none" stroke={color} strokeWidth="2.5" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        {hover !== null && (
          <line x1={x(hover)} x2={x(hover)} y1="0" y2={height} stroke="var(--border-strong)" vectorEffect="non-scaling-stroke" />
        )}
      </svg>
      {hover !== null && (
        <>
          <span
            style={{
              position: 'absolute', left: `${(hover / (data.length - 1)) * 100}%`, top: y(data[hover]),
              width: 10, height: 10, borderRadius: '50%', background: color, border: '2px solid var(--surface)',
              transform: 'translate(-50%, -50%)', pointerEvents: 'none',
            }}
          />
          <div className="chart-tip" style={{ left: `${(hover / (data.length - 1)) * 100}%`, top: y(data[hover]) - 8 }}>
            <span className="subtle">{labels[hover]}</span> <strong>{format(data[hover])}</strong>
          </div>
        </>
      )}
      <div className="chart-axis">
        {labels.map((l, i) => <span key={i}>{l}</span>)}
      </div>
    </div>
  );
}

export function BarChart({ data, height = 200 }: {
  data: { label: string; value: number; target?: number; color?: string }[];
  height?: number;
}) {
  const max = Math.max(...data.map((d) => Math.max(d.value, d.target ?? 0)), 1);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height }}>
        {data.map((d) => (
          <div key={d.label} title={`${d.label}: ${d.value}%`} style={{ flex: 1, height: '100%', display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
            {d.target !== undefined && (
              <div style={{ position: 'absolute', left: -3, right: -3, bottom: `${(d.target / max) * 100}%`, borderTop: '2px dashed var(--text-3)' }} />
            )}
            <div
              style={{
                width: '100%', height: `${(d.value / max) * 100}%`, borderRadius: '6px 6px 2px 2px',
                background: d.color ?? 'linear-gradient(180deg, var(--accent), var(--violet))',
                transition: 'height .6s ease',
              }}
            />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
        {data.map((d) => (
          <span key={d.label} className="subtle" style={{ flex: 1, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Donut({ segments, size = 160, label, sublabel }: {
  segments: { value: number; color: string; label: string }[];
  size?: number;
  label: string;
  sublabel: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = 42;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--surface-3)" strokeWidth="12" />
        {segments.map((s) => {
          const len = (s.value / total) * c;
          const el = (
            <circle
              key={s.label} cx="50" cy="50" r={r} fill="none" stroke={s.color} strokeWidth="12"
              strokeDasharray={`${Math.max(len - 1.5, 0)} ${c}`} strokeDashoffset={-offset}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{label}</div>
          <div className="subtle">{sublabel}</div>
        </div>
      </div>
    </div>
  );
}

export function Sparkline({ data, color = 'var(--accent)', width = 96, height = 30 }: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / (max - min || 1)) * height}`)
    .join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
