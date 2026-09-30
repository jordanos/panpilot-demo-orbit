import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Check, Plus, Share2, Wallet } from 'lucide-react';
import { STATUS_META, formatCurrency, memberById, projectBySlug, type Task } from '../data/orbit';
import { Avatar, Badge, Card, ProgressBar, Tabs } from '../components/ui';
import { useOrbitPageContext } from '../panpilot/context';
import { pp } from '../panpilot/pp';
import { actions } from '../store';

const PRIORITY_TONE = { high: 'danger', medium: 'warning', low: 'neutral' } as const;

export function ProjectDetail() {
  const { slug = '' } = useParams();
  // Keyed by slug so task state resets when PanPilot jumps between projects
  return <ProjectDetailView key={slug} slug={slug} />;
}

function ProjectDetailView({ slug }: { slug: string }) {
  const project = projectBySlug(slug);
  const [tasks, setTasks] = useState<Task[]>(project?.tasks ?? []);
  const [taskFilter, setTaskFilter] = useState<'all' | 'open' | 'done'>('all');
  const [newTask, setNewTask] = useState('');

  const done = tasks.filter((t) => t.done).length;
  // Seeded progress until the user (or PanPilot) changes tasks, then derived from them
  const tasksChanged = tasks !== project?.tasks;
  const pct = !project ? 0 : tasksChanged ? Math.round((done / Math.max(tasks.length, 1)) * 100) : project.progress;

  useOrbitPageContext(`project:${slug}`, project?.name ?? 'Project', () => (project ? {
    description: `Detail page for the ${project.name} project: progress, tasks, team and timeline.`,
    project: {
      name: project.name,
      status: STATUS_META[project.status].label,
      progress: `${pct}%`,
      owner: memberById(project.owner)?.name,
      due: project.due,
      budget: `${formatCurrency(project.spent)} of ${formatCurrency(project.budget)} spent`,
      team: project.members.map((id) => `${memberById(id)?.name} (${memberById(id)?.role})`),
      tasks: tasks.map((t) => ({ id: `task-${t.id}`, title: t.title, done: t.done, assignee: memberById(t.assignee)?.name, due: t.due, priority: t.priority })),
      milestones: project.milestones.map((m) => `${m.label} — ${m.date}${m.done ? ' (done)' : ''}`),
    },
  } : { error: 'Project not found' }));

  if (!project) return <Navigate to="/projects" replace />;

  const shown = tasks.filter((t) => taskFilter === 'all' || (taskFilter === 'done' ? t.done : !t.done));
  const spentPct = Math.round((project.spent / project.budget) * 100);

  const addTask = () => {
    const title = newTask.trim();
    if (!title) return;
    setTasks((ts) => [...ts, { id: `t${ts.length + 1}-${Date.now()}`, title, assignee: project.owner, done: false, due: 'Unscheduled', priority: 'medium' }]);
    setNewTask('');
    actions.toast('Task added', `"${title}" was added to ${project.name}.`);
  };

  return (
    <>
      <div className="stack" style={{ gap: 10 }}>
        <Link to="/projects" className="row subtle" style={{ gap: 6, width: 'fit-content' }} {...pp('back-to-projects', 'Back to projects')}>
          <ArrowLeft size={14} /> All projects
        </Link>
        <div className="page-header">
          <div>
            <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
              <h1 className="page-title">{project.name}</h1>
              <Badge tone={STATUS_META[project.status].tone} dot>{STATUS_META[project.status].label}</Badge>
            </div>
            <p className="page-desc">{project.description}</p>
          </div>
          <div className="row">
            <button type="button" className="btn" {...pp('share-project', 'Share project')} onClick={() => actions.toast('Link copied', `Anyone at Northwind Labs can open ${project.name}.`)}>
              <Share2 size={15} />Share
            </button>
            <button
              type="button"
              className="btn btn-primary"
              {...pp('mark-complete', 'Mark all tasks complete')}
              onClick={() => { setTasks((ts) => ts.map((t) => ({ ...t, done: true }))); actions.toast('All tasks completed', project.name); }}
            >
              <Check size={15} />Complete all
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-4">
        <div className="card stat">
          <span className="stat-label">Progress</span>
          <div className="stat-value">{pct}%</div>
          <ProgressBar value={pct} tone={project.status === 'at-risk' ? 'warning' : undefined} />
        </div>
        <div className="card stat">
          <span className="stat-label">Tasks</span>
          <div className="stat-value">{done}<span className="muted" style={{ fontSize: 16 }}> / {tasks.length}</span></div>
          <span className="subtle">{tasks.length - done} open</span>
        </div>
        <div className="card stat">
          <span className="stat-label row" style={{ gap: 6 }}><CalendarDays size={14} />Due date</span>
          <div className="stat-value" style={{ fontSize: 20 }}>{project.due}</div>
          <span className="subtle">Owner: {memberById(project.owner)?.name}</span>
        </div>
        <div className="card stat">
          <span className="stat-label row" style={{ gap: 6 }}><Wallet size={14} />Budget</span>
          <div className="stat-value" style={{ fontSize: 20 }}>{formatCurrency(project.spent)}</div>
          <span className="subtle">{spentPct}% of {formatCurrency(project.budget)}</span>
        </div>
      </div>

      <div className="grid grid-main">
        <Card
          title="Tasks"
          subtitle={`${done} of ${tasks.length} completed`}
          pp="task-list"
          actions={<Tabs value={taskFilter} onChange={setTaskFilter} ppPrefix="tasks" options={[{ value: 'all', label: 'All' }, { value: 'open', label: 'Open' }, { value: 'done', label: 'Done' }]} />}
        >
          <div>
            {shown.map((t) => (
              <div key={t.id} className={`task ${t.done ? 'done' : ''}`}>
                <button
                  type="button"
                  className={`check ${t.done ? 'on' : ''}`}
                  role="switch"
                  aria-checked={t.done}
                  {...pp(`task-${t.id}`, `Task: ${t.title}`)}
                  onClick={() => setTasks((ts) => ts.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))}
                >
                  {t.done && <Check size={12} strokeWidth={3} />}
                </button>
                <span className="task-title" style={{ flex: 1, minWidth: 0 }}>{t.title}</span>
                <Badge tone={PRIORITY_TONE[t.priority]}>{t.priority}</Badge>
                <span className="subtle" style={{ width: 64, textAlign: 'right' }}>{t.due}</span>
                <Avatar memberId={t.assignee} size={24} />
              </div>
            ))}
            {shown.length === 0 && <div className="empty">No tasks in this view.</div>}
            <form className="row" style={{ padding: '12px 20px', borderTop: '1px solid var(--border)' }} onSubmit={(e) => { e.preventDefault(); addTask(); }}>
              <input
                className="input"
                placeholder="Add a task…"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                {...pp('new-task-title', 'New task title')}
              />
              <button type="submit" className="btn" {...pp('add-task', 'Add task')}><Plus size={15} />Add</button>
            </form>
          </div>
        </Card>

        <div className="stack" style={{ gap: 16 }}>
          <Card title="Team" subtitle={`${project.members.length} members`} pp="project-team">
            <div>
              {project.members.map((id) => {
                const m = memberById(id)!;
                return (
                  <div key={id} className="list-item">
                    <Avatar memberId={id} size={32} showStatus />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{m.name}{id === project.owner && <span className="subtle"> · Owner</span>}</div>
                      <div className="subtle">{m.role}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title="Timeline" pp="project-timeline">
            <div className="card-body timeline">
              {project.milestones.map((m) => (
                <div key={m.label} className="timeline-item">
                  <span className={`timeline-dot ${m.done ? 'done' : ''}`} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{m.label}</div>
                    <div className="subtle">{m.date}{m.done ? ' · Done' : ''}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
