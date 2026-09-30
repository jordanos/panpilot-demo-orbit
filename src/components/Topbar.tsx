import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, ChevronRight, FileText, FolderKanban, HelpCircle, Menu, Search, User, Zap } from 'lucide-react';
import { projectBySlug, searchWorkspace, type SearchResult } from '../data/orbit';
import { useOrbit } from '../store';

const TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  projects: 'Projects',
  team: 'Team',
  analytics: 'Analytics',
  'smart-reports': 'Smart Reports',
  automations: 'Automations',
  notifications: 'Notifications',
  settings: 'Settings',
};

function Breadcrumbs() {
  const { pathname } = useLocation();
  const parts = pathname.split('/').filter(Boolean);
  return (
    <div className="crumbs">
      <span>Northwind Labs</span>
      {parts.map((p, i) => {
        const label = TITLES[p] ?? projectBySlug(p)?.name ?? p;
        const last = i === parts.length - 1;
        return (
          <span key={p} className="row" style={{ gap: 6 }}>
            <ChevronRight size={13} />
            {last ? <strong>{label}</strong> : <Link to={'/' + parts.slice(0, i + 1).join('/')}>{label}</Link>}
          </span>
        );
      })}
    </div>
  );
}

const KIND_ICON = { project: FolderKanban, member: User, page: FileText, automation: Zap };

function GlobalSearch() {
  const navigate = useNavigate();
  const released = useOrbit((s) => s.smartReportsReleased);
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = searchWorkspace(query, released);

  // ⌘K / Ctrl+K focuses search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const go = (r: SearchResult) => {
    navigate(r.path);
    setOpen(false);
    setQuery('');
    inputRef.current?.blur();
  };

  return (
    <div className="search" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false); }}>
      <Search size={15} className="search-icon" />
      <input
        ref={inputRef}
        id="global-search"
        data-pp="global-search"
        data-pp-label="Search projects, people and pages"
        className="search-input"
        placeholder="Search projects, people, pages…"
        autoComplete="off"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setActive(0); }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
          if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
          if (e.key === 'Enter' && results[active]) go(results[active]);
          if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); }
        }}
      />
      <span className="search-kbd"><kbd>Ctrl K</kbd></span>
      {open && query.trim() && (
        <div className="search-results fade-in" role="listbox">
          {results.length === 0 && <div className="search-empty">No results for “{query}”</div>}
          {results.map((r, i) => {
            const Icon = KIND_ICON[r.kind];
            return (
              <button
                key={r.path + r.label}
                type="button"
                role="option"
                aria-selected={i === active}
                data-pp={`search-result-${i}`}
                data-pp-label={`Open ${r.label}`}
                className={`search-result ${i === active ? 'active' : ''}`}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(r)}
              >
                <span className="search-result-icon"><Icon size={15} /></span>
                <span style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 500 }}>{r.label}</div>
                  <div className="subtle">{r.sublabel}</div>
                </span>
                <span className="subtle" style={{ marginLeft: 'auto', textTransform: 'capitalize' }}>{r.kind}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const unread = useOrbit((s) => s.notifications.reduce((n, x) => n + (x.read ? 0 : 1), 0));
  return (
    <header className="topbar">
      <button type="button" className="btn btn-ghost btn-icon menu-btn" aria-label="Open menu" onClick={onMenu}>
        <Menu size={18} />
      </button>
      <Breadcrumbs />
      <GlobalSearch />
      <div className="topbar-right">
        <button type="button" className="btn btn-ghost btn-icon" aria-label="Help" id="topbar-help" data-pp="topbar-help">
          <HelpCircle size={18} />
        </button>
        <Link to="/notifications" className="btn btn-ghost btn-icon" aria-label="Notifications" id="topbar-notifications" data-pp="topbar-notifications" style={{ position: 'relative' }}>
          <Bell size={18} />
          {unread > 0 && (
            <span style={{ position: 'absolute', top: 7, right: 8, width: 8, height: 8, borderRadius: '50%', background: 'var(--danger)', boxShadow: '0 0 0 2px var(--bg)' }} />
          )}
        </Link>
      </div>
    </header>
  );
}
