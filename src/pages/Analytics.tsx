import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Download, Sparkles } from 'lucide-react';
import { MONTHS, PROJECTS, REVENUE_SERIES, USER_GROWTH_SERIES } from '../data/orbit';
import { AreaChart, BarChart, Sparkline } from '../components/charts';
import { Badge, Card, PageHeader, Tabs } from '../components/ui';
import { useOrbitPageContext } from '../panpilot/context';
import { pp } from '../panpilot/pp';
import { actions, useOrbit } from '../store';

type Range = '3m' | '6m' | '12m';
const RANGES: { value: Range; label: string }[] = [
  { value: '3m', label: 'Last 3 months' },
  { value: '6m', label: 'Last 6 months' },
  { value: '12m', label: 'Last 12 months' },
];
const SLICE: Record<Range, number> = { '3m': 3, '6m': 6, '12m': 12 };

const pctChange = (s: number[]) => Math.round(((s[s.length - 1] - s[0]) / s[0]) * 1000) / 10;

// Share of milestones hit on time, per active project
const PERFORMANCE = PROJECTS.filter((p) => p.status !== 'completed').map((p) => ({
  label: p.name.split(' ')[0],
  name: p.name,
  value: { 'website-redesign': 92, 'mobile-app': 64, 'marketing-campaign': 88, 'customer-portal': 81, 'data-platform': 57 }[p.slug] ?? 75,
  target: 80,
}));

export function Analytics() {
  const released = useOrbit((s) => s.smartReportsReleased);
  const [range, setRange] = useState<Range>('12m');
  const n = SLICE[range];
  const months = MONTHS.slice(-n);
  const revenue = REVENUE_SERIES.slice(-n);
  const users = USER_GROWTH_SERIES.slice(-n);

  useOrbitPageContext('analytics', 'Analytics', () => ({
    description: 'Workspace analytics: revenue, user growth and project performance.',
    range: RANGES.find((r) => r.value === range)?.label,
    revenue: { current: `$${revenue[revenue.length - 1]}k MRR`, change: `+${pctChange(revenue)}% over range`, series: months.map((m, i) => `${m}: $${revenue[i]}k`) },
    userGrowth: { current: `${users[users.length - 1]}k active users`, change: `+${pctChange(users)}% over range` },
    projectPerformance: PERFORMANCE.map((p) => `${p.name}: ${p.value}% milestones on time (target ${p.target}%)`),
    smartReports: released ? 'Available — open /analytics/smart-reports to generate a weekly business report.' : 'Not available yet.',
  }));

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Revenue, growth and delivery performance across the workspace."
        actions={
          <>
            <Tabs value={range} options={RANGES} onChange={setRange} ppPrefix="range" />
            <button type="button" className="btn" {...pp('export-csv', 'Export CSV')} onClick={() => actions.toast('Export started', `analytics-${range}.csv will download shortly.`)}>
              <Download size={15} />Export
            </button>
          </>
        }
      />

      {released && (
        <Link to="/analytics/smart-reports" className="banner card-link fade-in" {...pp('smart-reports-teaser', 'Open Smart Reports')}>
          <div className="banner-icon"><Sparkles size={20} /></div>
          <div style={{ flex: 1 }}>
            <div className="row" style={{ gap: 8 }}><strong>Smart Reports</strong><Badge tone="violet">New in 2.4.0</Badge></div>
            <div className="muted" style={{ fontSize: 13 }}>Turn these metrics into a weekly business report in one click.</div>
          </div>
          <ArrowRight size={18} />
        </Link>
      )}

      <div className="grid grid-3">
        {[
          { label: 'Monthly revenue', value: `$${revenue[revenue.length - 1]}k`, change: pctChange(revenue), data: revenue, color: 'var(--accent)' },
          { label: 'Active users', value: `${users[users.length - 1]}k`, change: pctChange(users), data: users, color: 'var(--violet)' },
          { label: 'Avg. on-time delivery', value: `${Math.round(PERFORMANCE.reduce((s, p) => s + p.value, 0) / PERFORMANCE.length)}%`, change: 4.2, data: [68, 71, 70, 74, 73, 76, 76], color: 'var(--success)' },
        ].map((k) => (
          <div key={k.label} className="card stat">
            <span className="stat-label">{k.label}</span>
            <div className="row-between" style={{ alignItems: 'flex-end' }}>
              <div>
                <div className="stat-value">{k.value}</div>
                <span className="stat-delta up">+{k.change}% <span className="subtle" style={{ fontWeight: 400 }}>&nbsp;over range</span></span>
              </div>
              <Sparkline data={k.data} color={k.color} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-2">
        <Card title="Revenue" subtitle="Monthly recurring revenue (USD)" pp="revenue-analytics">
          <div className="card-body">
            <AreaChart data={revenue} labels={months} format={(v) => `$${v}k`} />
          </div>
        </Card>
        <Card title="User growth" subtitle="Monthly active users" pp="user-growth">
          <div className="card-body">
            <AreaChart data={users} labels={months} color="var(--violet)" format={(v) => `${v}k users`} />
          </div>
        </Card>
      </div>

      <Card
        title="Project performance"
        subtitle="Milestones delivered on time · dashed line = 80% target"
        pp="project-performance"
        actions={<div className="legend"><span><span className="legend-dot" style={{ background: 'var(--accent)' }} />On-time %</span></div>}
      >
        <div className="card-body">
          <BarChart
            height={220}
            data={PERFORMANCE.map((p) => ({ ...p, color: p.value < p.target ? 'linear-gradient(180deg, var(--warning), #b45309)' : undefined }))}
          />
        </div>
      </Card>
    </>
  );
}
