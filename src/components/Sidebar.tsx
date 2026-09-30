import { NavLink } from 'react-router-dom';
import {
  BarChart3, Bell, FolderKanban, LayoutDashboard, Orbit, Settings, Sparkles, Users, Zap, ChevronsUpDown,
} from 'lucide-react';
import { WORKSPACE } from '../data/orbit';
import { useOrbit } from '../store';
import { Avatar } from './ui';
import { pp as ppAttrs } from '../panpilot/pp';

const MAIN = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, pp: 'nav-dashboard' },
  { to: '/projects', label: 'Projects', icon: FolderKanban, pp: 'nav-projects', count: 24 },
  { to: '/team', label: 'Team', icon: Users, pp: 'nav-team' },
  { to: '/analytics', label: 'Analytics', icon: BarChart3, pp: 'nav-analytics' },
  { to: '/automations', label: 'Automations', icon: Zap, pp: 'nav-automations' },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const released = useOrbit((s) => s.smartReportsReleased);
  const unread = useOrbit((s) => s.notifications.reduce((n, x) => n + (x.read ? 0 : 1), 0));

  const link = ({ isActive }: { isActive: boolean }) => `nav-link ${isActive ? 'active' : ''}`;

  return (
    <>
      <div className={`sidebar-backdrop ${open ? 'open' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'open' : ''}`} onClick={(e) => { if ((e.target as HTMLElement).closest('a')) onClose(); }}>
        <div className="brand">
          <div className="brand-mark"><Orbit size={18} /></div>
          <div>
            <div className="brand-name">{WORKSPACE.name}</div>
            <div className="brand-org">{WORKSPACE.company}</div>
          </div>
        </div>

        <nav className="nav" aria-label="Main">
          <div className="nav-section">Workspace</div>
          {MAIN.map(({ to, label, icon: Icon, pp, count }) => (
            <NavLink key={to} to={to} end={to !== '/projects'} className={link} {...ppAttrs(pp)}>
              <Icon size={17} />
              {label}
              {count !== undefined && <span className="nav-count">{count}</span>}
            </NavLink>
          ))}
          {released && (
            <NavLink to="/analytics/smart-reports" className={({ isActive }) => `${link({ isActive })} sub`} {...ppAttrs('nav-smart-reports')}>
              <Sparkles size={15} />
              Smart Reports
              <span className="nav-new">NEW</span>
            </NavLink>
          )}

          <div className="nav-section">General</div>
          <NavLink to="/notifications" className={link} {...ppAttrs('nav-notifications')}>
            <Bell size={17} />
            Notifications
            {unread > 0 && <span className="nav-count" style={{ background: 'var(--accent)', color: '#fff' }}>{unread}</span>}
          </NavLink>
          <NavLink to="/settings" className={link} {...ppAttrs('nav-settings')}>
            <Settings size={17} />
            Settings
          </NavLink>
        </nav>

        <div className="profile">
          <Avatar name={WORKSPACE.user.name} color="linear-gradient(135deg, #4f8cff, #a78bfa)" size={34} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="profile-name">{WORKSPACE.user.name}</div>
            <div className="profile-role">{WORKSPACE.user.role} · {WORKSPACE.plan}</div>
          </div>
          <ChevronsUpDown size={15} color="var(--text-3)" />
        </div>
      </aside>
    </>
  );
}
