import { useState } from 'react';
import { Clock, FileBarChart, Mail, Plus, Timer, X, Zap } from 'lucide-react';
import { Badge, Card, PageHeader, Switch } from '../components/ui';
import { useOrbitPageContext } from '../panpilot/context';
import { pp } from '../panpilot/pp';
import { actions, useOrbit } from '../store';

const TRIGGERS = ['Every Monday at 9:00', 'Every day at 8:00', 'Deal marked as won', '3 days before milestone', 'Task marked as done'];
const ACTIONS = ['Email report to leadership@', 'Send follow-up email', 'Post to Slack #projects', 'Create a task'];
const ICONS: Record<string, typeof Zap> = { 'weekly-report': FileBarChart, 'customer-follow-up': Mail, 'deadline-reminder': Timer };

function AutomationBuilder({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState(TRIGGERS[0]);
  const [action, setAction] = useState(ACTIONS[0]);
  const [active, setActive] = useState(true);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form
        className="modal fade-in"
        role="dialog"
        aria-label="New automation"
        {...pp('automation-builder', 'New automation form')}
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          actions.addAutomation({ name: name.trim(), description: `${trigger} → ${action}`, trigger, action, active });
          onClose();
        }}
      >
        <div className="card-header">
          <div>
            <h2 className="card-title">New automation</h2>
            <p className="card-sub">When something happens, Orbit does the work.</p>
          </div>
          <button type="button" className="btn btn-ghost btn-icon" aria-label="Close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="card-body stack" style={{ gap: 16 }}>
          <div className="field">
            <label className="label" htmlFor="automation-name">Name</label>
            <input id="automation-name" data-pp="automation-name" className="input" placeholder="e.g. Weekly Report" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div className="field">
            <label className="label" htmlFor="automation-trigger">When (trigger)</label>
            <select id="automation-trigger" data-pp="automation-trigger" className="select" value={trigger} onChange={(e) => setTrigger(e.target.value)}>
              {TRIGGERS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="label" htmlFor="automation-action">Then (action)</label>
            <select id="automation-action" data-pp="automation-action" className="select" value={action} onChange={(e) => setAction(e.target.value)}>
              {ACTIONS.map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div className="row-between">
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>Activate immediately</div>
              <div className="subtle">You can pause it any time.</div>
            </div>
            <Switch checked={active} onChange={setActive} label="Activate immediately" pp="automation-active" />
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn" onClick={onClose} {...pp('cancel-automation', 'Cancel')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={!name.trim()} {...pp('save-automation', 'Create automation')}>Create automation</button>
        </div>
      </form>
    </div>
  );
}

export function Automations() {
  const automations = useOrbit((s) => s.automations);
  const [builderOpen, setBuilderOpen] = useState(false);

  useOrbitPageContext('automations', 'Automations', () => ({
    description: 'Automations schedule recurring actions such as reports and customer follow-ups. Use "new-automation" to open the builder (fields: automation-name, automation-trigger, automation-action, automation-active; submit with save-automation).',
    builderOpen,
    builderOptions: builderOpen ? { triggers: TRIGGERS, actions: ACTIONS } : undefined,
    automations: automations.map((a) => ({
      name: a.name,
      status: a.active ? 'Active' : 'Paused',
      toggleTarget: `toggle-${a.id}`,
      trigger: a.trigger,
      action: a.action,
      lastRun: a.lastRun,
      totalRuns: a.runs,
    })),
  }));

  const activeCount = automations.filter((a) => a.active).length;

  return (
    <>
      <PageHeader
        title="Automations"
        description="Schedule recurring work (reports, follow-ups, reminders) and let Orbit handle it."
        actions={
          <button type="button" className="btn btn-primary" onClick={() => setBuilderOpen(true)} {...pp('new-automation', 'New automation')}>
            <Plus size={15} />New automation
          </button>
        }
      />

      <div className="grid grid-3">
        <div className="card stat"><span className="stat-label">Active automations</span><div className="stat-value">{activeCount}</div><span className="subtle">of {automations.length} total</span></div>
        <div className="card stat"><span className="stat-label">Runs this month</span><div className="stat-value">{automations.reduce((s, a) => s + a.runs, 0)}</div><span className="subtle">across all automations</span></div>
        <div className="card stat"><span className="stat-label">Time saved</span><div className="stat-value">42h</div><span className="subtle">estimated this month</span></div>
      </div>

      <Card title="Your automations" subtitle="Toggle to pause or resume">
        <div>
          {automations.map((a) => {
            const Icon = ICONS[a.id] ?? Zap;
            return (
              <div key={a.id} className="list-item" style={{ padding: '16px 20px' }} {...pp(`automation-${a.id}`, a.name)}>
                <span className={`stat-icon ${a.active ? 'tone-accent' : 'tone-neutral'}`} style={{ width: 38, height: 38 }}><Icon size={18} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="row" style={{ gap: 8 }}>
                    <strong>{a.name}</strong>
                    <Badge tone={a.active ? 'success' : 'neutral'} dot>{a.active ? 'Active' : 'Paused'}</Badge>
                  </div>
                  <div className="muted" style={{ fontSize: 13 }}>{a.description}</div>
                  <div className="row subtle" style={{ gap: 14, marginTop: 4, flexWrap: 'wrap' }}>
                    <span className="row" style={{ gap: 4 }}><Clock size={12} />{a.trigger}</span>
                    <span className="row" style={{ gap: 4 }}><Zap size={12} />{a.action}</span>
                    <span>Last run {a.lastRun} · {a.runs} runs</span>
                  </div>
                </div>
                <Switch checked={a.active} onChange={(v) => actions.toggleAutomation(a.id, v)} label={`${a.name} automation`} pp={`toggle-${a.id}`} />
              </div>
            );
          })}
        </div>
      </Card>

      {builderOpen && <AutomationBuilder onClose={() => setBuilderOpen(false)} />}
    </>
  );
}
