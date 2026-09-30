import { useState } from 'react';
import { FolderPlus, ListChecks, X } from 'lucide-react';
import { PROJECT_TEMPLATES, TEAM, WORKSPACE } from '../data/orbit';
import { pp } from '../panpilot/pp';
import { actions, type NewProjectInput } from '../store';

const inDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

/** Field ids + options, shared with the page context so PanPilot knows how to fill the form. */
export const NEW_PROJECT_FORM = {
  fields: {
    'project-name': 'Project title (required)',
    'project-description': 'One or two sentences on the goal and scope',
    'project-template': `Template: ${PROJECT_TEMPLATES.map((t) => t.label).join(' | ')}`,
    'project-owner': `Owner: ${TEAM.map((m) => `${m.name} (${m.role})`).join(' | ')}`,
    'project-due': 'Due date, format YYYY-MM-DD',
    'project-budget': 'Budget in USD, number only',
  },
  submit: 'create-project-submit',
  cancel: 'cancel-new-project',
};

export function NewProjectModal({ onClose, onCreated }: { onClose: () => void; onCreated: (slug: string) => void }) {
  const [form, setForm] = useState<NewProjectInput>({
    name: '',
    description: '',
    templateId: 'blank',
    owner: 'noah',
    due: inDays(30),
    budget: 25000,
  });
  const template = PROJECT_TEMPLATES.find((t) => t.id === form.templateId) ?? PROJECT_TEMPLATES[0];
  const set = <K extends keyof NewProjectInput>(k: K) => (v: NewProjectInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form
        className="modal fade-in"
        role="dialog"
        aria-label="New project"
        style={{ width: 'min(580px, 100%)' }}
        {...pp('new-project-form', 'New project form')}
        onSubmit={(e) => {
          e.preventDefault();
          if (!form.name.trim()) return;
          const project = actions.createProject({ ...form, name: form.name.trim(), description: form.description.trim() });
          onCreated(project.slug);
        }}
      >
        <div className="card-header">
          <div className="row" style={{ gap: 12 }}>
            <span className="banner-icon" style={{ width: 36, height: 36 }}><FolderPlus size={18} /></span>
            <div>
              <h2 className="card-title">New project</h2>
              <p className="card-sub">Set up a project in {WORKSPACE.company}. Ask PanPilot for suggestions.</p>
            </div>
          </div>
          <button type="button" className="btn btn-ghost btn-icon" aria-label="Close" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="card-body stack" style={{ gap: 16 }}>
          <div className="field">
            <label className="label" htmlFor="project-name">Project title</label>
            <input id="project-name" data-pp="project-name" className="input" placeholder="e.g. Customer Portal v2" value={form.name} onChange={(e) => set('name')(e.target.value)} autoFocus />
          </div>
          <div className="field">
            <label className="label" htmlFor="project-description">Description</label>
            <textarea id="project-description" data-pp="project-description" className="textarea" placeholder="What is this project about, and what does success look like?" value={form.description} onChange={(e) => set('description')(e.target.value)} />
          </div>
          <div className="grid grid-2">
            <div className="field">
              <label className="label" htmlFor="project-template">Template</label>
              <select id="project-template" data-pp="project-template" className="select" value={form.templateId} onChange={(e) => set('templateId')(e.target.value)}>
                {PROJECT_TEMPLATES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="label" htmlFor="project-owner">Owner</label>
              <select id="project-owner" data-pp="project-owner" className="select" value={form.owner} onChange={(e) => set('owner')(e.target.value)}>
                {TEAM.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="field">
              <label className="label" htmlFor="project-due">Due date</label>
              <input id="project-due" data-pp="project-due" type="date" className="input" value={form.due} onChange={(e) => set('due')(e.target.value)} />
            </div>
            <div className="field">
              <label className="label" htmlFor="project-budget">Budget (USD)</label>
              <input id="project-budget" data-pp="project-budget" type="number" min={0} step={1000} className="input" value={form.budget} onChange={(e) => set('budget')(Number(e.target.value) || 0)} />
            </div>
          </div>

          <div className="card" style={{ padding: 14, background: 'var(--surface-2)', boxShadow: 'none' }}>
            <div className="row" style={{ gap: 8, marginBottom: 6 }}>
              <ListChecks size={15} color="var(--accent)" />
              <strong style={{ fontSize: 13 }}>{template.label}</strong>
              <span className="subtle">· {template.tasks.length} tasks · {template.milestones.length} milestones</span>
            </div>
            <div className="subtle">{template.tasks.length ? template.tasks.join(' · ') : template.description}</div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn" onClick={onClose} {...pp('cancel-new-project', 'Cancel')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={!form.name.trim()} {...pp('create-project-submit', 'Create project')}>Create project</button>
        </div>
      </form>
    </div>
  );
}
