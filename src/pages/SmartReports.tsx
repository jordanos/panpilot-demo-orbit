import { useState } from 'react';
import { CalendarClock, Check, Download, FileText, Loader2, Send, Sparkles, TrendingUp } from 'lucide-react';
import { KPIS, PROJECTS, WEEKLY_REVENUE, formatCurrency } from '../data/orbit';
import { AreaChart } from '../components/charts';
import { Badge, Card, PageHeader } from '../components/ui';
import { useOrbitPageContext } from '../panpilot/context';
import { pp } from '../panpilot/pp';
import { actions } from '../store';

type Phase = 'idle' | 'generating' | 'ready';

const STEPS = ['Collecting revenue data', 'Analyzing project health', 'Summarizing team activity', 'Writing highlights'];

const HIGHLIGHTS = [
  'Revenue grew 12% week over week to $34.5k, the strongest week this quarter.',
  'Website Redesign is on track at 82% and ahead of its Oct 18 launch.',
  'Mobile App is at risk: the push notification service is 5 days behind.',
  'Weekly active users are up 8%, driven by the Customer Portal alpha.',
];

export function SmartReports() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [step, setStep] = useState(0);
  const [scheduled, setScheduled] = useState(false);

  useOrbitPageContext('smart-reports', 'Smart Reports', () => ({
    description: 'NEW in Orbit 2.4.0. Generates a weekly business report from workspace data. Click "generate-report" to create one; it can then be downloaded, sent to the team, or scheduled weekly.',
    preview: { revenue: '↑ 12%', activeUsers: '↑ 8%', projects: KPIS.activeProjects },
    reportState: phase,
    report: phase === 'ready' ? { period: 'Sep 23 – Sep 29, 2026', highlights: HIGHLIGHTS } : null,
    scheduledWeekly: scheduled,
  }));

  const generate = async () => {
    setPhase('generating');
    for (let i = 0; i < STEPS.length; i++) {
      setStep(i);
      await new Promise((r) => setTimeout(r, 650));
    }
    setPhase('ready');
    actions.toast('Weekly Business Report ready', 'Generated from 24 projects and 18 team members.');
  };

  return (
    <>
      <PageHeader
        title="Smart Reports"
        description="Generate intelligent reports from your workspace data."
        actions={<Badge tone="violet"><Sparkles size={12} />New in 2.4.0</Badge>}
      />

      <div className="grid grid-main">
        <Card className="hero-report" pp="weekly-business-report">
          <div className="card-body stack" style={{ gap: 20, padding: 28 }}>
            <div className="row" style={{ gap: 12 }}>
              <div className="banner-icon"><FileText size={20} /></div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700 }}>Weekly Business Report</h2>
                <div className="subtle">Sep 23 – Sep 29, 2026 · Northwind Labs</div>
              </div>
            </div>

            <div className="grid grid-3">
              {[
                { label: 'Revenue', value: '↑ 12%', sub: formatCurrency(34500) + ' this week' },
                { label: 'Active users', value: '↑ 8%', sub: '7.3k weekly actives' },
                { label: 'Projects', value: String(KPIS.activeProjects), sub: `${PROJECTS.filter((p) => p.status === 'at-risk').length} at risk` },
              ].map((m) => (
                <div key={m.label} className="card" style={{ padding: 16, background: 'var(--surface-2)' }}>
                  <div className="subtle">{m.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: m.value.startsWith('↑') ? 'var(--success)' : undefined }}>{m.value}</div>
                  <div className="subtle">{m.sub}</div>
                </div>
              ))}
            </div>

            {phase === 'idle' && (
              <button type="button" className="btn btn-gradient" style={{ height: 44, fontSize: 14 }} onClick={generate} {...pp('generate-report', 'Generate Report')}>
                <Sparkles size={16} />Generate Report
              </button>
            )}

            {phase === 'generating' && (
              <div className="stack fade-in" style={{ gap: 10 }}>
                {STEPS.map((s, i) => (
                  <div key={s} className="row" style={{ gap: 10, color: i <= step ? 'var(--text)' : 'var(--text-3)' }}>
                    {i < step ? <Check size={16} color="var(--success)" /> : i === step ? <Loader2 size={16} className="spin" /> : <span style={{ width: 16 }} />}
                    {s}…
                  </div>
                ))}
              </div>
            )}

            {phase === 'ready' && (
              <div className="stack fade-in" style={{ gap: 16 }}>
                <div>
                  <div className="row" style={{ gap: 8, marginBottom: 10 }}>
                    <TrendingUp size={16} color="var(--success)" /><strong>Highlights</strong>
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }} className="muted">
                    {HIGHLIGHTS.map((h) => <li key={h}>{h}</li>)}
                  </ul>
                </div>
                <div>
                  <div className="subtle" style={{ marginBottom: 8 }}>Weekly revenue ($k)</div>
                  <AreaChart data={WEEKLY_REVENUE} labels={['W35', 'W36', 'W37', 'W38', 'W39']} height={120} format={(v) => `$${v}k`} />
                </div>
                <div className="row" style={{ flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-primary" {...pp('download-report', 'Download PDF')} onClick={() => actions.toast('Downloading report', 'weekly-business-report.pdf')}>
                    <Download size={15} />Download PDF
                  </button>
                  <button type="button" className="btn" {...pp('send-report', 'Send to team')} onClick={() => actions.toast('Report sent', 'Delivered to leadership@northwind.io')}>
                    <Send size={15} />Send to team
                  </button>
                  <button type="button" className="btn btn-ghost" {...pp('regenerate-report', 'Regenerate')} onClick={generate}>Regenerate</button>
                </div>
              </div>
            )}
          </div>
        </Card>

        <div className="stack" style={{ gap: 16 }}>
          <Card title="Schedule" subtitle="Deliver this report automatically" pp="report-schedule">
            <div className="card-body stack">
              <div className="row" style={{ gap: 10 }}>
                <CalendarClock size={18} color="var(--accent)" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Every Monday, 9:00 AM</div>
                  <div className="subtle">to leadership@northwind.io</div>
                </div>
              </div>
              <button
                type="button"
                className={`btn ${scheduled ? '' : 'btn-primary'}`}
                {...pp('schedule-weekly', scheduled ? 'Scheduled weekly' : 'Schedule weekly')}
                onClick={() => {
                  setScheduled((v) => !v);
                  if (!scheduled) actions.toast('Report scheduled', 'Smart Reports will run every Monday at 9:00.');
                }}
              >
                {scheduled ? <><Check size={15} />Scheduled weekly</> : 'Schedule weekly'}
              </button>
            </div>
          </Card>
          <Card title="What's included">
            <div className="card-body stack" style={{ gap: 10 }}>
              {['Revenue and MRR trends', 'Active user growth', 'Project health and risks', 'Team activity summary'].map((x) => (
                <div key={x} className="row" style={{ gap: 8 }}><Check size={15} color="var(--success)" /><span className="muted">{x}</span></div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
