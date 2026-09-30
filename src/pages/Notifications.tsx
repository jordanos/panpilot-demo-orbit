import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, CreditCard, FolderKanban, Sparkles, Users, Zap } from 'lucide-react';
import type { Notification } from '../data/orbit';
import { Card, PageHeader, Tabs } from '../components/ui';
import { useOrbitPageContext } from '../panpilot/context';
import { pp } from '../panpilot/pp';
import { actions, useOrbit } from '../store';

const KIND: Record<Notification['kind'], { icon: typeof Bell; tone: string }> = {
  project: { icon: FolderKanban, tone: 'tone-warning' },
  team: { icon: Users, tone: 'tone-info' },
  automation: { icon: Zap, tone: 'tone-accent' },
  billing: { icon: CreditCard, tone: 'tone-success' },
  release: { icon: Sparkles, tone: 'tone-violet' },
};

export function Notifications() {
  const notifications = useOrbit((s) => s.notifications);
  const [view, setView] = useState<'all' | 'unread'>('all');
  const shown = view === 'unread' ? notifications.filter((n) => !n.read) : notifications;
  const unread = notifications.filter((n) => !n.read).length;

  useOrbitPageContext('notifications', 'Notifications', () => ({
    unreadCount: unread,
    notifications: shown.map((n) => ({ id: `notification-${n.id}`, title: n.title, body: n.body, time: n.time, read: n.read })),
  }));

  return (
    <>
      <PageHeader
        title="Notifications"
        description={unread ? `You have ${unread} unread notification${unread > 1 ? 's' : ''}.` : "You're all caught up."}
        actions={
          <button type="button" className="btn" disabled={!unread} onClick={actions.markAllNotificationsRead} {...pp('mark-all-read', 'Mark all as read')}>
            <CheckCheck size={15} />Mark all as read
          </button>
        }
      />
      <Tabs value={view} onChange={setView} ppPrefix="notifications" options={[{ value: 'all', label: 'All' }, { value: 'unread', label: `Unread (${unread})` }]} />

      <Card>
        <div>
          {shown.length === 0 && <div className="empty">Nothing here.</div>}
          {shown.map((n) => {
            const { icon: Icon, tone } = KIND[n.kind];
            return (
              <div
                key={n.id}
                className="list-item"
                style={{ background: n.read ? undefined : 'var(--accent-soft)', cursor: 'pointer' }}
                onClick={() => actions.markNotificationRead(n.id)}
                {...pp(`notification-${n.id}`, n.title)}
              >
                <span className={`stat-icon ${tone}`} style={{ width: 36, height: 36 }}><Icon size={17} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: n.read ? 500 : 600 }}>{n.title}</div>
                  <div className="muted" style={{ fontSize: 13 }}>{n.body}</div>
                  {n.kind === 'release' && (
                    <Link to="/analytics/smart-reports" className="btn btn-sm btn-gradient" style={{ marginTop: 8 }} {...pp('open-smart-reports', 'Open Smart Reports')}>
                      Open Smart Reports
                    </Link>
                  )}
                </div>
                <span className="subtle" style={{ whiteSpace: 'nowrap' }}>{n.time}</span>
                {!n.read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />}
              </div>
            );
          })}
        </div>
      </Card>
    </>
  );
}
