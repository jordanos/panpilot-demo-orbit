// All Orbit demo data lives here — fake, deterministic, and shared by pages + PanPilot tools.

export type ProjectStatus = 'on-track' | 'at-risk' | 'in-review' | 'completed';

export interface Member {
  id: string;
  name: string;
  role: string;
  team: 'Engineering' | 'Design' | 'Marketing' | 'Product' | 'Sales';
  email: string;
  status: 'online' | 'away' | 'offline';
  location: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  assignee: string; // member id
  done: boolean;
  due: string;
  priority: 'high' | 'medium' | 'low';
}

export interface Project {
  slug: string;
  name: string;
  description: string;
  status: ProjectStatus;
  progress: number;
  owner: string; // member id
  members: string[];
  due: string;
  budget: number;
  spent: number;
  tasks: Task[];
  milestones: { label: string; date: string; done: boolean }[];
}

export interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: string;
  action: string;
  active: boolean;
  lastRun: string;
  runs: number;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  kind: 'project' | 'team' | 'automation' | 'billing' | 'release';
  read: boolean;
}

export const WORKSPACE = {
  name: 'Orbit',
  company: 'Northwind Labs',
  plan: 'Enterprise',
  version: '2.3.1',
  user: { name: 'Jordan Tesfaye', email: 'jordan@northwind.io', role: 'Workspace admin' },
};

export const TEAM: Member[] = [
  { id: 'amara', name: 'Amara Okafor', role: 'Engineering Lead', team: 'Engineering', email: 'amara@northwind.io', status: 'online', location: 'Lagos', color: '#4f8cff' },
  { id: 'liam', name: 'Liam Chen', role: 'Senior Frontend Engineer', team: 'Engineering', email: 'liam@northwind.io', status: 'online', location: 'Toronto', color: '#22c55e' },
  { id: 'sofia', name: 'Sofia Martins', role: 'Product Designer', team: 'Design', email: 'sofia@northwind.io', status: 'away', location: 'Lisbon', color: '#f472b6' },
  { id: 'noah', name: 'Noah Williams', role: 'Product Manager', team: 'Product', email: 'noah@northwind.io', status: 'online', location: 'Austin', color: '#f59e0b' },
  { id: 'hana', name: 'Hana Kobayashi', role: 'Mobile Engineer', team: 'Engineering', email: 'hana@northwind.io', status: 'offline', location: 'Tokyo', color: '#a78bfa' },
  { id: 'daniel', name: 'Daniel Mekonnen', role: 'Data Engineer', team: 'Engineering', email: 'daniel@northwind.io', status: 'online', location: 'Addis Ababa', color: '#14b8a6' },
  { id: 'priya', name: 'Priya Raman', role: 'Marketing Director', team: 'Marketing', email: 'priya@northwind.io', status: 'away', location: 'Bangalore', color: '#ef4444' },
  { id: 'marcus', name: 'Marcus Reed', role: 'Account Executive', team: 'Sales', email: 'marcus@northwind.io', status: 'offline', location: 'London', color: '#06b6d4' },
];

export const TEAM_SIZE = 18;

export const memberById = (id: string) => TEAM.find((m) => m.id === id);

export const PROJECTS: Project[] = [
  {
    slug: 'website-redesign',
    name: 'Website Redesign',
    description: 'New marketing site with a refreshed brand, faster pages and a CMS-driven blog.',
    status: 'on-track',
    progress: 82,
    owner: 'sofia',
    members: ['sofia', 'liam', 'noah', 'priya'],
    due: 'Oct 18, 2026',
    budget: 48000,
    spent: 36500,
    tasks: [
      { id: 't1', title: 'Finalize homepage hero design', assignee: 'sofia', done: true, due: 'Sep 12', priority: 'high' },
      { id: 't2', title: 'Build responsive navigation', assignee: 'liam', done: true, due: 'Sep 16', priority: 'high' },
      { id: 't3', title: 'Migrate blog posts to CMS', assignee: 'liam', done: true, due: 'Sep 22', priority: 'medium' },
      { id: 't4', title: 'Write launch announcement copy', assignee: 'priya', done: false, due: 'Oct 3', priority: 'medium' },
      { id: 't5', title: 'Lighthouse performance pass', assignee: 'liam', done: false, due: 'Oct 8', priority: 'high' },
      { id: 't6', title: 'Stakeholder sign-off', assignee: 'noah', done: false, due: 'Oct 14', priority: 'low' },
    ],
    milestones: [
      { label: 'Discovery', date: 'Aug 4', done: true },
      { label: 'Design approved', date: 'Sep 1', done: true },
      { label: 'Build complete', date: 'Oct 8', done: false },
      { label: 'Launch', date: 'Oct 18', done: false },
    ],
  },
  {
    slug: 'mobile-app',
    name: 'Mobile App',
    description: 'Native iOS and Android app with offline mode and push notifications.',
    status: 'at-risk',
    progress: 61,
    owner: 'hana',
    members: ['hana', 'amara', 'sofia'],
    due: 'Nov 30, 2026',
    budget: 120000,
    spent: 81200,
    tasks: [
      { id: 't1', title: 'Offline sync engine', assignee: 'hana', done: true, due: 'Sep 5', priority: 'high' },
      { id: 't2', title: 'Push notification service', assignee: 'amara', done: false, due: 'Oct 2', priority: 'high' },
      { id: 't3', title: 'Onboarding flow screens', assignee: 'sofia', done: true, due: 'Sep 19', priority: 'medium' },
      { id: 't4', title: 'App Store submission checklist', assignee: 'hana', done: false, due: 'Nov 10', priority: 'medium' },
      { id: 't5', title: 'Crash reporting integration', assignee: 'amara', done: false, due: 'Oct 20', priority: 'low' },
    ],
    milestones: [
      { label: 'Prototype', date: 'Jul 10', done: true },
      { label: 'Beta', date: 'Oct 15', done: false },
      { label: 'Store release', date: 'Nov 30', done: false },
    ],
  },
  {
    slug: 'marketing-campaign',
    name: 'Marketing Campaign',
    description: 'Q4 multi-channel campaign for the Enterprise plan launch.',
    status: 'in-review',
    progress: 91,
    owner: 'priya',
    members: ['priya', 'marcus', 'sofia'],
    due: 'Oct 5, 2026',
    budget: 35000,
    spent: 31800,
    tasks: [
      { id: 't1', title: 'Campaign landing page', assignee: 'sofia', done: true, due: 'Sep 8', priority: 'high' },
      { id: 't2', title: 'Paid social creatives', assignee: 'priya', done: true, due: 'Sep 15', priority: 'medium' },
      { id: 't3', title: 'Sales enablement deck', assignee: 'marcus', done: true, due: 'Sep 20', priority: 'medium' },
      { id: 't4', title: 'Final budget review', assignee: 'priya', done: false, due: 'Oct 1', priority: 'high' },
    ],
    milestones: [
      { label: 'Brief', date: 'Aug 1', done: true },
      { label: 'Creative review', date: 'Sep 18', done: true },
      { label: 'Go live', date: 'Oct 5', done: false },
    ],
  },
  {
    slug: 'customer-portal',
    name: 'Customer Portal',
    description: 'Self-serve portal for invoices, usage reports and support tickets.',
    status: 'on-track',
    progress: 47,
    owner: 'noah',
    members: ['noah', 'liam', 'daniel'],
    due: 'Dec 12, 2026',
    budget: 64000,
    spent: 22100,
    tasks: [
      { id: 't1', title: 'Invoice history API', assignee: 'daniel', done: true, due: 'Sep 18', priority: 'medium' },
      { id: 't2', title: 'Support ticket inbox UI', assignee: 'liam', done: false, due: 'Oct 24', priority: 'medium' },
      { id: 't3', title: 'SSO login', assignee: 'liam', done: false, due: 'Nov 7', priority: 'high' },
    ],
    milestones: [
      { label: 'Spec', date: 'Aug 20', done: true },
      { label: 'Alpha', date: 'Nov 1', done: false },
      { label: 'GA', date: 'Dec 12', done: false },
    ],
  },
  {
    slug: 'data-platform',
    name: 'Data Platform Migration',
    description: 'Move analytics pipelines to the new warehouse with zero downtime.',
    status: 'at-risk',
    progress: 34,
    owner: 'daniel',
    members: ['daniel', 'amara'],
    due: 'Nov 15, 2026',
    budget: 90000,
    spent: 51000,
    tasks: [
      { id: 't1', title: 'Warehouse provisioning', assignee: 'daniel', done: true, due: 'Aug 30', priority: 'high' },
      { id: 't2', title: 'Backfill historical events', assignee: 'daniel', done: false, due: 'Oct 10', priority: 'high' },
      { id: 't3', title: 'Dashboard query rewrite', assignee: 'amara', done: false, due: 'Oct 30', priority: 'medium' },
    ],
    milestones: [
      { label: 'Plan', date: 'Aug 1', done: true },
      { label: 'Dual-write', date: 'Oct 10', done: false },
      { label: 'Cutover', date: 'Nov 15', done: false },
    ],
  },
  {
    slug: 'sales-enablement',
    name: 'Sales Enablement Hub',
    description: 'Central library of playbooks, battlecards and demo recordings.',
    status: 'completed',
    progress: 100,
    owner: 'marcus',
    members: ['marcus', 'priya'],
    due: 'Sep 20, 2026',
    budget: 18000,
    spent: 17400,
    tasks: [
      { id: 't1', title: 'Competitor battlecards', assignee: 'marcus', done: true, due: 'Sep 2', priority: 'medium' },
      { id: 't2', title: 'Demo video library', assignee: 'priya', done: true, due: 'Sep 15', priority: 'low' },
    ],
    milestones: [
      { label: 'Kickoff', date: 'Jul 15', done: true },
      { label: 'Launch', date: 'Sep 20', done: true },
    ],
  },
];

export const projectBySlug = (slug: string) => PROJECTS.find((p) => p.slug === slug);

/** Adds a user-created project to the live catalog (read by pages, search and navigation). */
export function addProjectToCatalog(project: Project) {
  PROJECTS.unshift(project);
}

export function uniqueProjectSlug(name: string) {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'project';
  let slug = base;
  for (let i = 2; PROJECTS.some((p) => p.slug === slug); i++) slug = `${base}-${i}`;
  return slug;
}

export interface ProjectTemplate {
  id: string;
  label: string;
  description: string;
  tasks: string[];
  milestones: string[];
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  { id: 'blank', label: 'Blank project', description: 'Start from scratch.', tasks: [], milestones: ['Kickoff', 'Launch'] },
  { id: 'product-launch', label: 'Product launch', description: 'Plan, build and ship a new feature.', tasks: ['Write product brief', 'Design review', 'Build MVP', 'Beta with 10 customers', 'Launch announcement'], milestones: ['Brief approved', 'Beta', 'Launch'] },
  { id: 'marketing-campaign', label: 'Marketing campaign', description: 'Multi-channel campaign with creative and budget tracking.', tasks: ['Campaign brief', 'Creative assets', 'Landing page', 'Paid media setup', 'Performance report'], milestones: ['Brief', 'Creative review', 'Go live'] },
  { id: 'website', label: 'Website project', description: 'Design and build a site or landing page.', tasks: ['Sitemap and wireframes', 'Visual design', 'Build pages', 'Content migration', 'QA and launch'], milestones: ['Design approved', 'Build complete', 'Launch'] },
  { id: 'customer-onboarding', label: 'Customer onboarding', description: 'Onboard an enterprise customer end to end.', tasks: ['Kickoff call', 'Workspace setup', 'Data import', 'Admin training', '30-day check-in'], milestones: ['Kickoff', 'Go live', 'Health check'] },
];

export const STATUS_META: Record<ProjectStatus, { label: string; tone: 'success' | 'warning' | 'info' | 'neutral' }> = {
  'on-track': { label: 'On track', tone: 'success' },
  'at-risk': { label: 'At risk', tone: 'warning' },
  'in-review': { label: 'In review', tone: 'info' },
  completed: { label: 'Completed', tone: 'neutral' },
};

export const KPIS = {
  revenue: 128430,
  revenueDelta: 12.4,
  activeProjects: 24,
  projectsDelta: 3,
  teamMembers: TEAM_SIZE,
  membersDelta: 2,
  tasksCompleted: 87,
  tasksDelta: 4.1,
};

export const MONTHS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
export const REVENUE_SERIES = [72, 78, 81, 79, 88, 94, 99, 104, 109, 114, 121, 128.4]; // $k
export const USER_GROWTH_SERIES = [3.1, 3.4, 3.6, 3.9, 4.3, 4.6, 5.0, 5.5, 5.9, 6.4, 6.8, 7.3]; // k active users
export const WEEKLY_REVENUE = [26.1, 29.4, 31.2, 30.8, 34.5]; // last 5 weeks, $k

export const ACTIVITY = [
  { who: 'liam', what: 'completed', target: 'Migrate blog posts to CMS', project: 'website-redesign', time: '12 min ago' },
  { who: 'priya', what: 'commented on', target: 'Paid social creatives', project: 'marketing-campaign', time: '48 min ago' },
  { who: 'hana', what: 'flagged a risk on', target: 'Push notification service', project: 'mobile-app', time: '2h ago' },
  { who: 'daniel', what: 'shipped', target: 'Invoice history API', project: 'customer-portal', time: '5h ago' },
  { who: 'noah', what: 'created automation', target: 'Weekly Report', project: null, time: 'Yesterday' },
  { who: 'marcus', what: 'closed', target: 'Sales Enablement Hub', project: 'sales-enablement', time: '2 days ago' },
];

export const INITIAL_AUTOMATIONS: Automation[] = [
  { id: 'weekly-report', name: 'Weekly Report', description: 'Emails a workspace summary to leadership every Monday.', trigger: 'Every Monday at 9:00', action: 'Email report to leadership@', active: true, lastRun: 'Mon, 9:00', runs: 38 },
  { id: 'customer-follow-up', name: 'Customer Follow-up', description: 'Sends a check-in email 7 days after a deal closes.', trigger: 'Deal marked as won', action: 'Send follow-up email', active: true, lastRun: '3h ago', runs: 214 },
  { id: 'deadline-reminder', name: 'Project Deadline Reminder', description: 'Pings owners in Slack 3 days before a milestone is due.', trigger: '3 days before milestone', action: 'Post to Slack #projects', active: false, lastRun: 'Sep 12', runs: 57 },
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: 'Mobile App is at risk', body: 'Push notification service is 5 days behind schedule.', time: '2h ago', kind: 'project', read: false },
  { id: 'n2', title: 'Weekly Report delivered', body: 'Sent to 6 recipients in leadership@northwind.io.', time: 'Mon 9:00', kind: 'automation', read: false },
  { id: 'n3', title: 'Priya invited 2 new members', body: 'Welcome Tomás and Aisha to the Marketing team.', time: 'Yesterday', kind: 'team', read: false },
  { id: 'n4', title: 'Invoice #INV-2026-09 paid', body: 'Enterprise plan · $4,800 · Visa ending 4242', time: 'Sep 24', kind: 'billing', read: true },
  { id: 'n5', title: 'Marketing Campaign moved to review', body: 'Priya requested a final budget review.', time: 'Sep 22', kind: 'project', read: true },
];

export const RELEASE_NOTIFICATION: Notification = {
  id: 'release-2-4-0',
  title: 'New in Orbit 2.4.0: Smart Reports',
  body: 'Automatically generate weekly business reports from your workspace data.',
  time: 'Just now',
  kind: 'release',
  read: false,
};

// ── Global search ────────────────────────────────────────────────────────────

export interface SearchResult {
  kind: 'project' | 'member' | 'page' | 'automation';
  label: string;
  sublabel: string;
  path: string;
}

export const PAGES: { label: string; path: string; keywords: string }[] = [
  { label: 'Dashboard', path: '/dashboard', keywords: 'home overview kpi revenue activity' },
  { label: 'Projects', path: '/projects', keywords: 'projects progress tasks' },
  { label: 'Team', path: '/team', keywords: 'team members people directory' },
  { label: 'Analytics', path: '/analytics', keywords: 'analytics revenue user growth performance charts' },
  { label: 'Automations', path: '/automations', keywords: 'automations workflows weekly report reminders' },
  { label: 'Notifications', path: '/notifications', keywords: 'notifications alerts inbox' },
  { label: 'Settings', path: '/settings', keywords: 'settings preferences security billing' },
];

export function searchWorkspace(query: string, includeSmartReports = false): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const hit = (...fields: string[]) => fields.some((f) => f.toLowerCase().includes(q));

  const pages = includeSmartReports
    ? [...PAGES, { label: 'Smart Reports', path: '/analytics/smart-reports', keywords: 'smart reports weekly business report generate new' }]
    : PAGES;

  return [
    ...PROJECTS.filter((p) => hit(p.name, p.description, p.slug)).map<SearchResult>((p) => ({
      kind: 'project', label: p.name, sublabel: `${p.progress}% · ${STATUS_META[p.status].label}`, path: `/projects/${p.slug}`,
    })),
    ...TEAM.filter((m) => hit(m.name, m.role, m.team)).map<SearchResult>((m) => ({
      kind: 'member', label: m.name, sublabel: m.role, path: `/team?member=${m.id}`,
    })),
    ...INITIAL_AUTOMATIONS.filter((a) => hit(a.name, a.description)).map<SearchResult>((a) => ({
      kind: 'automation', label: a.name, sublabel: a.trigger, path: '/automations',
    })),
    ...pages.filter((p) => hit(p.label, p.keywords)).map<SearchResult>((p) => ({
      kind: 'page', label: p.label, sublabel: 'Page', path: p.path,
    })),
  ].slice(0, 8);
}

export const formatCurrency = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
