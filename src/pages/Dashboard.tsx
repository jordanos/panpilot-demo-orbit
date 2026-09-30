import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, DollarSign, FolderKanban, Plus, Sparkles, Users, X } from 'lucide-react';
import { useState } from 'react';
import { ACTIVITY, KPIS, MONTHS, PROJECTS, REVENUE_SERIES, STATUS_META, WORKSPACE, formatCurrency, memberById, projectBySlug } from '../data/orbit';
import { AreaChart, Donut } from '../components/charts';
import { Avatar, Badge, Card, PageHeader, ProgressBar, StatCard } from '../components/ui';
import { useOrbitPageContext } from '../panpilot/context';
import { pp } from '../panpilot/pp';
import { useOrbit } from '../store';

const STATUS_COLORS = { 'on-track': 'var(--success)', 'at-risk': 'var(--warning)', 'in-review': 'var(--info)', completed: 'var(--text-3)' } as const;

export function Dashboard() {
  const released = useOrbit((s) => s.smartReportsReleased);
  const [bannerHidden, setBannerHidden] = useState(false);
  useOrbit((s) => s.projectsVersion); // re-render when a project is created

  const statusCounts = (Object.keys(STATUS_META) as (keyof typeof STATUS_META)[]).map((k) => ({
    label: STATUS_META[k].label,
    value: PROJECTS.filter((p) => p.status === k).length,
    color: STATUS_COLORS[k],
  }));

  useOrbitPageContext('dashboard', 'Dashboard', () => ({
    description: 'Workspace overview: revenue, projects, team and recent activity.',
    kpis: {
      revenue: formatCurrency(KPIS.revenue),
      revenueChange: `+${KPIS.revenueDelta}% vs last month`,
      activeProjects: KPIS.activeProjects,
      teamMembers: KPIS.teamMembers,
      tasksCompleted: `${KPIS.tasksCompleted}%`,
    },
    projectHealth: statusCounts.map((s) => `${s.label}: ${s.value}`),
    recentActivity: ACTIVITY.map((a) => `${memberById(a.who)?.name} ${a.what} ${a.target} (${a.time})`),
    whatsNew: released ? 'Orbit 2.4.0 — Smart Reports is available at /analytics/smart-reports' : null,
  }));

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <>
      <PageHeader
        title={`${greeting}, ${WORKSPACE.user.name.split(' ')[0]}`}
        description="Here's what's happening across Northwind Labs today."
        actions={
          <>
            <Link to="/analytics" className="btn" {...pp('view-analytics', 'View analytics')}>View analytics</Link>
            <Link to="/projects?new=1" className="btn btn-primary" {...pp('new-project', 'New project')}><Plus size={15} />New project</Link>
          </>
        }
      />

      {released && !bannerHidden && (
        <div className="banner fade-in" {...pp('whats-new-banner', "What's new in Orbit 2.4.0")}>
          <div className="banner-icon"><Sparkles size={20} /></div>
          <div style={{ flex: 1 }}>
            <div className="row" style={{ gap: 8 }}>
              <strong>New in Orbit 2.4.0 — Smart Reports</strong>
              <Badge tone="violet">New</Badge>
            </div>
            <div className="muted" style={{ fontSize: 13 }}>Automatically generate weekly business reports from your workspace data.</div>
          </div>
          <Link to="/analytics/smart-reports" className="btn btn-gradient" {...pp('try-smart-reports', 'Try Smart Reports')}>
            Try it now <ArrowRight size={15} />
          </Link>
          <button type="button" className="btn btn-ghost btn-icon" aria-label="Dismiss" onClick={() => setBannerHidden(true)}><X size={16} /></button>
        </div>
      )}

      <div className="grid grid-4">
        <StatCard label="Revenue" value={formatCurrency(KPIS.revenue)} delta={KPIS.revenueDelta} icon={<DollarSign size={17} />} tone="accent" />
        <StatCard label="Active projects" value={String(KPIS.activeProjects)} delta={KPIS.projectsDelta} suffix="new this month" icon={<FolderKanban size={17} />} tone="violet" />
        <StatCard label="Team members" value={String(KPIS.teamMembers)} delta={KPIS.membersDelta} suffix="joined this month" icon={<Users size={17} />} tone="info" />
        <StatCard label="Tasks completed" value={`${KPIS.tasksCompleted}%`} delta={KPIS.tasksDelta} icon={<CheckCircle2 size={17} />} tone="success" />
      </div>

      <div className="grid grid-main">
        <Card
          title="Revenue"
          subtitle="Monthly recurring revenue, last 12 months"
          pp="revenue-chart"
          actions={<Link to="/analytics" className="btn btn-sm btn-ghost">Details <ArrowRight size={13} /></Link>}
        >
          <div className="card-body">
            <div className="row" style={{ alignItems: 'baseline', marginBottom: 16 }}>
              <span style={{ fontSize: 28, fontWeight: 700 }}>{formatCurrency(KPIS.revenue)}</span>
              <Badge tone="success">+{KPIS.revenueDelta}%</Badge>
            </div>
            <AreaChart data={REVENUE_SERIES} labels={MONTHS} format={(v) => `$${v}k`} />
          </div>
        </Card>

        <Card title="Project health" subtitle={`${PROJECTS.length} tracked projects`} pp="project-health">
          <div className="card-body stack" style={{ alignItems: 'center', gap: 20 }}>
            <Donut segments={statusCounts} label={`${PROJECTS.filter((p) => p.status !== 'completed').length}`} sublabel="in flight" />
            <div className="stack" style={{ width: '100%', gap: 8 }}>
              {statusCounts.map((s) => (
                <div key={s.label} className="row-between">
                  <span className="row" style={{ gap: 8 }}><span className="legend-dot" style={{ background: s.color }} />{s.label}</span>
                  <strong>{s.value}</strong>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-main">
        <Card title="Active projects" subtitle="Sorted by due date" actions={<Link to="/projects" className="btn btn-sm btn-ghost" {...pp('view-all-projects', 'View all projects')}>View all <ArrowRight size={13} /></Link>}>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr><th>Project</th><th>Status</th><th style={{ width: '30%' }}>Progress</th><th>Due</th></tr>
              </thead>
              <tbody>
                {PROJECTS.filter((p) => p.status !== 'completed').map((p) => (
                  <tr key={p.slug}>
                    <td>
                      <Link to={`/projects/${p.slug}`} style={{ fontWeight: 600 }} {...pp(`dashboard-project-${p.slug}`, `Open ${p.name}`)}>{p.name}</Link>
                    </td>
                    <td><Badge tone={STATUS_META[p.status].tone} dot>{STATUS_META[p.status].label}</Badge></td>
                    <td>
                      <div className="row" style={{ gap: 10 }}>
                        <div style={{ flex: 1 }}><ProgressBar value={p.progress} /></div>
                        <span className="subtle" style={{ width: 32 }}>{p.progress}%</span>
                      </div>
                    </td>
                    <td className="muted">{p.due.replace(', 2026', '')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Recent activity" pp="recent-activity">
          <div>
            {ACTIVITY.map((a, i) => {
              const project = a.project ? projectBySlug(a.project) : null;
              return (
                <div key={i} className="list-item" style={{ alignItems: 'flex-start' }}>
                  <Avatar memberId={a.who} size={30} />
                  <div style={{ fontSize: 13, minWidth: 0 }}>
                    <div>
                      <strong>{memberById(a.who)?.name.split(' ')[0]}</strong> <span className="muted">{a.what}</span> {a.target}
                    </div>
                    <div className="subtle">{project ? `${project.name} · ` : ''}{a.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </>
  );
}
