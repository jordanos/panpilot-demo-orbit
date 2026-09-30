import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight, CheckCircle2, Info } from 'lucide-react';
import { memberById } from '../data/orbit';
import { useOrbit } from '../store';
import { pp as ppAttrs } from '../panpilot/pp';

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-desc">{description}</p>}
      </div>
      {actions && <div className="row">{actions}</div>}
    </div>
  );
}

export function Card({ title, subtitle, actions, children, className = '', pp }: {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  pp?: string;
}) {
  return (
    <section className={`card ${className}`} {...(pp ? ppAttrs(pp) : {})}>
      {title && (
        <header className="card-header">
          <div>
            <h2 className="card-title">{title}</h2>
            {subtitle && <p className="card-sub">{subtitle}</p>}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}

export function StatCard({ label, value, delta, suffix = 'vs last month', icon, tone }: {
  label: string;
  value: string;
  delta: number;
  suffix?: string;
  icon: ReactNode;
  tone: 'accent' | 'violet' | 'success' | 'info';
}) {
  const up = delta >= 0;
  return (
    <div className="card stat">
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        <span className={`stat-icon tone-${tone}`}>{icon}</span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="row" style={{ gap: 6 }}>
        <span className={`stat-delta ${up ? 'up' : 'down'}`}>
          {up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(delta)}{Number.isInteger(delta) ? '' : '%'}
        </span>
        <span className="subtle">{suffix}</span>
      </div>
    </div>
  );
}

export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'violet' | 'accent' | 'neutral';

export function Badge({ tone = 'neutral', dot, children }: { tone?: Tone; dot?: boolean; children: ReactNode }) {
  return <span className={`badge tone-${tone} ${dot ? 'badge-dot' : ''}`}>{children}</span>;
}

export function ProgressBar({ value, tone }: { value: number; tone?: 'success' | 'warning' }) {
  return (
    <div className={`progress ${tone ?? ''}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <span style={{ width: `${value}%` }} />
    </div>
  );
}

const STATUS_COLOR = { online: 'var(--success)', away: 'var(--warning)', offline: 'var(--text-3)' };

export function Avatar({ memberId, name, color, size = 32, showStatus }: {
  memberId?: string;
  name?: string;
  color?: string;
  size?: number;
  showStatus?: boolean;
}) {
  const m = memberId ? memberById(memberId) : undefined;
  const label = m?.name ?? name ?? '?';
  const initials = label.split(' ').map((p) => p[0]).slice(0, 2).join('');
  return (
    <span
      className="avatar"
      title={label}
      style={{ width: size, height: size, fontSize: size * 0.38, background: m?.color ?? color ?? 'var(--accent)' }}
    >
      {initials}
      {showStatus && m && <span className="avatar-status" style={{ background: STATUS_COLOR[m.status] }} />}
    </span>
  );
}

export function AvatarStack({ ids, size = 28 }: { ids: string[]; size?: number }) {
  return (
    <div className="avatar-stack">
      {ids.map((id) => <Avatar key={id} memberId={id} size={size} />)}
    </div>
  );
}

/** Accessible toggle switch; `pp` makes it targetable by the PanPilot toggle tool. */
export function Switch({ checked, onChange, label, pp }: { checked: boolean; onChange: (v: boolean) => void; label: string; pp?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      {...(pp ? ppAttrs(pp) : {})}
      className="switch"
      onClick={() => onChange(!checked)}
    >
      <span />
    </button>
  );
}

export function Tabs<T extends string>({ value, options, onChange, ppPrefix }: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  ppPrefix?: string;
}) {
  return (
    <div className="tabs" role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          {...(ppPrefix ? ppAttrs(`${ppPrefix}-${o.value}`) : {})}
          className={`tab ${value === o.value ? 'active' : ''}`}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Toasts() {
  const toasts = useOrbit((s) => s.toasts);
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          {t.tone === 'success'
            ? <CheckCircle2 size={18} color="var(--success)" />
            : <Info size={18} color="var(--violet)" />}
          <div>
            <div style={{ fontWeight: 600 }}>{t.title}</div>
            {t.body && <div className="muted" style={{ fontSize: 13 }}>{t.body}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}
