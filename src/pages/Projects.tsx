import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CalendarDays, CheckSquare, Plus } from 'lucide-react';
import { PROJECTS, STATUS_META, memberById, type ProjectStatus } from '../data/orbit';
import { AvatarStack, Badge, PageHeader, ProgressBar, Tabs } from '../components/ui';
import { useOrbitPageContext } from '../panpilot/context';
import { pp } from '../panpilot/pp';
import { useOrbit } from '../store';
import { NEW_PROJECT_FORM, NewProjectModal } from '../components/NewProjectModal';

type Filter = 'all' | ProjectStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'on-track', label: 'On track' },
  { value: 'at-risk', label: 'At risk' },
  { value: 'in-review', label: 'In review' },
  { value: 'completed', label: 'Completed' },
];

export function Projects() {
  const [filter, setFilter] = useState<Filter>('all');
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const modalOpen = params.get('new') === '1';
  const setModalOpen = (open: boolean) => setParams(open ? { new: '1' } : {}, { replace: true });
  useOrbit((s) => s.projectsVersion); // re-render when a project is created
  const visible = filter === 'all' ? PROJECTS : PROJECTS.filter((p) => p.status === filter);

  useOrbitPageContext('projects', 'Projects', () => ({
    description: 'All workspace projects with progress, status and owners. Click a project card to open its detail page. Click "create-project" to open the New project form.',
    activeFilter: filter,
    newProjectForm: modalOpen ? {
      open: true,
      ...NEW_PROJECT_FORM,
      currentValues: Object.fromEntries(
        Object.keys(NEW_PROJECT_FORM.fields).map((id) => {
          const el = document.getElementById(id) as HTMLInputElement | HTMLSelectElement | null;
          const value = el instanceof HTMLSelectElement ? el.selectedOptions[0]?.text : el?.value;
          return [id, value ?? ''];
        }),
      ),
      guidance: 'If the user shares an idea or asks for suggestions, propose a concise title, a 1–2 sentence description, the best-fitting template, a suitable owner, a due date and a budget. Say them briefly, then fill each field with fill_input. Only click create-project-submit once the user confirms.',
    } : { open: false },
    projects: visible.map((p) => ({
      name: p.name,
      slug: p.slug,
      route: `/projects/${p.slug}`,
      status: STATUS_META[p.status].label,
      progress: `${p.progress}%`,
      owner: memberById(p.owner)?.name,
      due: p.due,
      tasksDone: `${p.tasks.filter((t) => t.done).length}/${p.tasks.length}`,
    })),
  }));

  return (
    <>
      <PageHeader
        title="Projects"
        description="Track progress, owners and deadlines across every initiative."
        actions={
          <button type="button" className="btn btn-primary" {...pp('create-project', 'New project')} onClick={() => setModalOpen(true)}>
            <Plus size={15} />New project
          </button>
        }
      />

      <div className="row-between" style={{ flexWrap: 'wrap' }}>
        <Tabs value={filter} options={FILTERS} onChange={setFilter} ppPrefix="filter" />
        <span className="subtle">Showing {visible.length} of {PROJECTS.length} tracked projects</span>
      </div>

      <div className="grid grid-3">
        {visible.map((p) => {
          const done = p.tasks.filter((t) => t.done).length;
          return (
            <Link key={p.slug} to={`/projects/${p.slug}`} className="card card-link" {...pp(`project-${p.slug}`, `Open ${p.name}`)}>
              <div className="card-body stack" style={{ gap: 14 }}>
                <div className="row-between" style={{ alignItems: 'flex-start' }}>
                  <div style={{ minWidth: 0 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600 }}>{p.name}</h3>
                    <p className="subtle" style={{ marginTop: 4, fontSize: 13, lineHeight: 1.45 }}>{p.description}</p>
                  </div>
                  <Badge tone={STATUS_META[p.status].tone} dot>{STATUS_META[p.status].label}</Badge>
                </div>

                <div className="stack" style={{ gap: 6 }}>
                  <div className="row-between">
                    <span className="subtle">Progress</span>
                    <strong style={{ fontSize: 13 }}>{p.progress}%</strong>
                  </div>
                  <ProgressBar value={p.progress} tone={p.status === 'completed' ? 'success' : p.status === 'at-risk' ? 'warning' : undefined} />
                </div>

                <hr className="divider" />
                <div className="row-between">
                  <AvatarStack ids={p.members} size={26} />
                  <div className="row subtle" style={{ gap: 12 }}>
                    <span className="row" style={{ gap: 4 }}><CheckSquare size={13} />{done}/{p.tasks.length}</span>
                    <span className="row" style={{ gap: 4 }}><CalendarDays size={13} />{p.due.replace(', 2026', '')}</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      {modalOpen && (
        <NewProjectModal
          onClose={() => setModalOpen(false)}
          onCreated={(slug) => navigate(`/projects/${slug}`)}
        />
      )}
    </>
  );
}
