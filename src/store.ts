import { useSyncExternalStore } from 'react';
import {
  PROJECT_TEMPLATES,
  addProjectToCatalog,
  uniqueProjectSlug,
  INITIAL_AUTOMATIONS,
  INITIAL_NOTIFICATIONS,
  RELEASE_NOTIFICATION,
  type Automation,
  type Notification,
  type Project,
} from './data/orbit';

// Tiny global store — just enough shared state for the demo (release flag, theme,
// automations, notifications, toasts). Release + theme persist across reloads.

export interface Toast {
  id: number;
  title: string;
  body?: string;
  tone: 'success' | 'info';
}

interface OrbitState {
  smartReportsReleased: boolean;
  theme: 'dark' | 'light';
  automations: Automation[];
  notifications: Notification[];
  toasts: Toast[];
  /** Bumped when a project is created so project lists re-render. */
  projectsVersion: number;
}

export interface NewProjectInput {
  name: string;
  description: string;
  templateId: string;
  owner: string;
  due: string; // YYYY-MM-DD
  budget: number;
}

const STORAGE_KEY = 'orbit-demo-state';

function loadPersisted(): Partial<Pick<OrbitState, 'smartReportsReleased' | 'theme'>> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

const persisted = loadPersisted();

let state: OrbitState = {
  smartReportsReleased: persisted.smartReportsReleased ?? false,
  theme: persisted.theme ?? 'dark',
  automations: INITIAL_AUTOMATIONS,
  notifications: persisted.smartReportsReleased
    ? [RELEASE_NOTIFICATION, ...INITIAL_NOTIFICATIONS]
    : INITIAL_NOTIFICATIONS,
  toasts: [],
  projectsVersion: 0,
};

const listeners = new Set<() => void>();

function setState(patch: Partial<OrbitState>) {
  state = { ...state, ...patch };
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ smartReportsReleased: state.smartReportsReleased, theme: state.theme }),
    );
  } catch { /* storage unavailable — state still works in memory */ }
  listeners.forEach((l) => l());
}

export function getState() {
  return state;
}

export function useOrbit<T>(select: (s: OrbitState) => T): T {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => select(state),
  );
}

let toastId = 0;

export const actions = {
  toast(title: string, body?: string, tone: Toast['tone'] = 'success') {
    const id = ++toastId;
    setState({ toasts: [...state.toasts, { id, title, body, tone }] });
    setTimeout(() => setState({ toasts: state.toasts.filter((t) => t.id !== id) }), 4200);
  },

  setTheme(theme: OrbitState['theme']) {
    setState({ theme });
  },

  setSmartReportsReleased(released: boolean) {
    const others = state.notifications.filter((n) => n.id !== RELEASE_NOTIFICATION.id);
    setState({
      smartReportsReleased: released,
      notifications: released ? [RELEASE_NOTIFICATION, ...others] : others,
    });
    if (released) actions.toast('Orbit 2.4.0 released', 'Smart Reports is now available in Analytics.', 'info');
  },

  toggleAutomation(id: string, active?: boolean) {
    setState({
      automations: state.automations.map((a) =>
        a.id === id ? { ...a, active: active ?? !a.active } : a,
      ),
    });
  },

  addAutomation(a: Omit<Automation, 'id' | 'lastRun' | 'runs'>) {
    const id = a.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `automation-${Date.now()}`;
    setState({ automations: [...state.automations, { ...a, id, lastRun: 'Never', runs: 0 }] });
    actions.toast('Automation created', `"${a.name}" is ${a.active ? 'active' : 'paused'}.`);
  },

  createProject(input: NewProjectInput): Project {
    const template = PROJECT_TEMPLATES.find((t) => t.id === input.templateId) ?? PROJECT_TEMPLATES[0];
    const due = input.due
      ? new Date(`${input.due}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : 'No due date';
    const project: Project = {
      slug: uniqueProjectSlug(input.name),
      name: input.name,
      description: input.description || template.description,
      status: 'on-track',
      progress: 0,
      owner: input.owner,
      members: [input.owner],
      due,
      budget: input.budget,
      spent: 0,
      tasks: template.tasks.map((title, i) => ({ id: `t${i + 1}`, title, assignee: input.owner, done: false, due: 'Unscheduled', priority: i === 0 ? 'high' : 'medium' })),
      milestones: template.milestones.map((label, i) => ({ label, date: i === template.milestones.length - 1 ? due.replace(/, \d{4}$/, '') : 'TBD', done: false })),
    };
    addProjectToCatalog(project);
    setState({ projectsVersion: state.projectsVersion + 1 });
    actions.toast('Project created', `${project.name} is ready — ${project.tasks.length} tasks from the ${template.label} template.`);
    return project;
  },

  markNotificationRead(id: string) {
    setState({ notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) });
  },

  markAllNotificationsRead() {
    setState({ notifications: state.notifications.map((n) => ({ ...n, read: true })) });
  },
};
