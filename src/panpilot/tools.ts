import { PROJECTS, searchWorkspace } from '../data/orbit';
import { getState } from '../store';

// Custom client-side tools for PanPilot. Each handler is registered through the
// `tools` prop of <PanPilotProvider>; the matching definitions must also be added
// to the agent in the PanPilot admin (see panpilot/tools.json).

type ToolHandler = (args: Record<string, unknown>) => unknown | Promise<unknown>;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const norm = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim().toLowerCase();

// ── Element discovery ────────────────────────────────────────────────────────

const INTERACTIVE = '[data-pp], button, a[href], [role="button"], [role="switch"], [role="tab"], input, select, textarea';

function isVisible(el: HTMLElement) {
  return el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
}

/** Excludes the PanPilot overlay itself (its classes are all prefixed `pp-`). */
function isInsideOverlay(el: Element) {
  return !!el.closest('[class^="pp-"], [class*=" pp-"]');
}

function labelOf(el: HTMLElement): string {
  const explicit = el.getAttribute('data-pp-label') ?? el.getAttribute('aria-label');
  if (explicit) return explicit.trim();
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    const labelled = el.id ? document.querySelector(`label[for="${CSS.escape(el.id)}"]`) : null;
    return (labelled?.textContent ?? el.placeholder ?? el.name).trim();
  }
  return (el.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 80);
}

function candidates(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>(INTERACTIVE))
    .filter((el) => isVisible(el) && !isInsideOverlay(el));
}

/** Every PanPilot-addressable element on screen — included in read_current_page. */
export function collectActions(): { id: string; label: string; kind: string }[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-pp]'))
    .filter((el) => isVisible(el) && !isInsideOverlay(el))
    .map((el) => ({
      id: el.dataset.pp!,
      label: labelOf(el),
      kind: el.getAttribute('role') === 'switch'
        ? 'toggle'
        : el.matches('input, textarea, select') ? 'input' : el.tagName === 'SECTION' ? 'section' : 'button',
    }));
}

/**
 * Resolves a target by, in order: data-pp id, DOM id, exact accessible label /
 * visible text, then partial text match. Lets the model use either the ids from
 * read_current_page or the words the user said ("the Generate Report button").
 */
function resolve(target: string, filter: (el: HTMLElement) => boolean = () => true): HTMLElement | null {
  const t = target.trim();
  const escaped = CSS.escape(t);
  const direct = document.querySelector<HTMLElement>(`[data-pp="${escaped}"]`) ?? document.getElementById(t);
  if (direct && isVisible(direct) && filter(direct)) return direct;

  const wanted = norm(t).replace(/\b(the|button|link|tab|toggle|switch)\b/g, '').trim();
  const pool = candidates().filter(filter);
  return (
    pool.find((el) => norm(labelOf(el)) === wanted) ??
    pool.find((el) => norm(el.dataset.pp).replace(/-/g, ' ') === wanted) ??
    pool.find((el) => wanted.length > 2 && norm(labelOf(el)).includes(wanted)) ??
    null
  );
}

function notFound(target: string) {
  return {
    success: false,
    error: `No element matching "${target}" on this page.`,
    available: collectActions().map((a) => `${a.id} (${a.label})`).slice(0, 40),
  };
}

// ── Visual feedback: a pilot cursor glides to the element, then it flashes ──

let cursor: HTMLDivElement | null = null;

async function pointAt(el: HTMLElement) {
  el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  await sleep(350);
  const r = el.getBoundingClientRect();
  const x = r.left + Math.min(r.width / 2, 40);
  const y = r.top + r.height / 2;

  if (!cursor) {
    cursor = document.createElement('div');
    cursor.className = 'orbit-cursor';
    cursor.innerHTML =
      '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 2l16 9-7 2-3 7z" fill="#a78bfa" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>';
    cursor.style.left = `${window.innerWidth - 80}px`;
    cursor.style.top = `${window.innerHeight - 80}px`;
    document.body.appendChild(cursor);
    await sleep(20);
  }
  cursor.style.opacity = '1';
  cursor.style.left = `${x}px`;
  cursor.style.top = `${y}px`;
  await sleep(480);

  el.classList.remove('orbit-flash');
  void el.offsetWidth; // restart the animation
  el.classList.add('orbit-flash');
  setTimeout(() => el.classList.remove('orbit-flash'), 1500);
  return { x, y };
}

function ripple(x: number, y: number) {
  const dot = document.createElement('div');
  dot.className = 'orbit-ripple';
  dot.style.left = `${x}px`;
  dot.style.top = `${y}px`;
  document.body.appendChild(dot);
  setTimeout(() => dot.remove(), 650);
}

function hideCursorSoon() {
  const c = cursor;
  setTimeout(() => { if (c === cursor && c) c.style.opacity = '0'; }, 1600);
}

/** Sets a value the way a user would, so React's onChange fires. */
function setNativeValue(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string) {
  const proto = Object.getPrototypeOf(el) as object;
  Object.getOwnPropertyDescriptor(proto, 'value')?.set?.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

async function typeInto(el: HTMLInputElement | HTMLTextAreaElement, text: string) {
  el.focus();
  // Date/number inputs reject partial values — set them in one go
  if (el instanceof HTMLInputElement && !['text', 'search', 'email', ''].includes(el.type)) {
    setNativeValue(el, text);
    return;
  }
  setNativeValue(el, '');
  // Visible typing effect, capped at ~1.5 s so long descriptions don't stall the tool call
  const step = Math.max(1, Math.ceil(text.length / 40));
  for (let i = step; i < text.length + step; i += step) {
    setNativeValue(el, text.slice(0, i));
    await sleep(35);
  }
}

// ── Tools ────────────────────────────────────────────────────────────────────

const clickElement: ToolHandler = async ({ target }) => {
  const el = resolve(String(target ?? ''));
  if (!el) return notFound(String(target));
  const { x, y } = await pointAt(el);
  ripple(x, y);
  const label = labelOf(el);
  el.click();
  hideCursorSoon();
  await sleep(250); // let the UI react before the model reads the page again
  return { success: true, clicked: el.dataset.pp ?? label, label, path: window.location.pathname };
};

const searchWorkspaceTool: ToolHandler = async ({ query, openFirst }) => {
  const q = String(query ?? '').trim();
  const input = document.getElementById('global-search') as HTMLInputElement | null;
  if (!input) return { success: false, error: 'Search box not found' };
  await pointAt(input);
  await typeInto(input, q);
  hideCursorSoon();

  const results = searchWorkspace(q, getState().smartReportsReleased);
  if (openFirst === true && results[0]) {
    await sleep(500);
    const first = document.querySelector<HTMLElement>('[data-pp="search-result-0"]');
    first?.click();
  }
  return {
    success: true,
    query: q,
    count: results.length,
    results: results.map((r, i) => ({ target: `search-result-${i}`, type: r.kind, label: r.label, detail: r.sublabel, path: r.path })),
    hint: results.length ? 'Use click_element with a result target to open one.' : 'No matches — try a broader term.',
  };
};

const fillInput: ToolHandler = async ({ target, value }) => {
  const el = resolve(String(target ?? ''), (e) => e.matches('input, textarea, select'));
  if (!el) return notFound(String(target));
  await pointAt(el);
  const v = String(value ?? '');
  if (el instanceof HTMLSelectElement) {
    const opt = Array.from(el.options).find((o) => norm(o.value) === norm(v) || norm(o.text) === norm(v))
      ?? Array.from(el.options).find((o) => norm(o.text).includes(norm(v)));
    if (!opt) {
      hideCursorSoon();
      return { success: false, error: `"${v}" is not an option`, options: Array.from(el.options).map((o) => o.text) };
    }
    setNativeValue(el, opt.value);
  } else {
    await typeInto(el as HTMLInputElement, v);
  }
  hideCursorSoon();
  return { success: true, field: el.dataset.pp ?? labelOf(el), value: v };
};

const toggleSetting: ToolHandler = async ({ target, enabled }) => {
  const el = resolve(String(target ?? ''), (e) => e.getAttribute('role') === 'switch');
  if (!el) return notFound(String(target));
  const current = el.getAttribute('aria-checked') === 'true';
  const want = typeof enabled === 'boolean' ? enabled : !current;
  const { x, y } = await pointAt(el);
  if (current !== want) {
    ripple(x, y);
    el.click();
  }
  hideCursorSoon();
  return { success: true, setting: el.dataset.pp ?? labelOf(el), enabled: want, changed: current !== want };
};

// ── Navigation ───────────────────────────────────────────────────────────────

const ROUTES: Record<string, string> = {
  home: '/dashboard',
  dashboard: '/dashboard',
  overview: '/dashboard',
  projects: '/projects',
  team: '/team',
  people: '/team',
  members: '/team',
  analytics: '/analytics',
  'revenue-analytics': '/analytics',
  reports: '/analytics',
  'smart-reports': '/analytics/smart-reports',
  smart_reports: '/analytics/smart-reports',
  automations: '/automations',
  workflows: '/automations',
  notifications: '/notifications',
  inbox: '/notifications',
  settings: '/settings',
  billing: '/settings?tab=billing',
  security: '/settings?tab=security',
};

/** Maps the pageId the LLM sends to a route. Accepts ids, project slugs and raw paths. */
export function resolveRoute(pageId: string): string {
  const id = pageId.trim().replace(/^\/+/, '').toLowerCase();
  if (ROUTES[id]) return ROUTES[id];
  const slug = id.replace(/^projects\//, '').replace(/\s+/g, '-');
  if (PROJECTS.some((p) => p.slug === slug)) return `/projects/${slug}`;
  const byName = PROJECTS.find((p) => norm(p.name) === norm(pageId) || norm(p.name).includes(norm(pageId)));
  if (byName) return `/projects/${byName.slug}`;
  return `/${id}`;
}

export const orbitTools: Record<string, ToolHandler> = {
  click_element: clickElement,
  search_workspace: searchWorkspaceTool,
  fill_input: fillInput,
  toggle_setting: toggleSetting,
};
