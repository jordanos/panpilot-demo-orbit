import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mail, MapPin, MessageSquare, UserPlus } from 'lucide-react';
import { TEAM, TEAM_SIZE, type Member } from '../data/orbit';
import { Avatar, Badge, PageHeader, Tabs } from '../components/ui';
import { useOrbitPageContext } from '../panpilot/context';
import { pp } from '../panpilot/pp';
import { actions } from '../store';

type TeamFilter = 'all' | Member['team'];
const FILTERS: { value: TeamFilter; label: string }[] = [
  { value: 'all', label: 'Everyone' },
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Design', label: 'Design' },
  { value: 'Product', label: 'Product' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Sales', label: 'Sales' },
];
const STATUS_TONE = { online: 'success', away: 'warning', offline: 'neutral' } as const;

export function Team() {
  const [params] = useSearchParams();
  const focused = params.get('member');
  const [filter, setFilter] = useState<TeamFilter>('all');
  const members = filter === 'all' ? TEAM : TEAM.filter((m) => m.team === filter);

  useOrbitPageContext('team', 'Team', () => ({
    description: `Team directory. ${TEAM_SIZE} members in the workspace; ${TEAM.length} shown as the core team.`,
    activeFilter: filter,
    members: members.map((m) => ({ id: m.id, name: m.name, role: m.role, team: m.team, status: m.status, location: m.location })),
  }));

  return (
    <>
      <PageHeader
        title="Team"
        description={`${TEAM_SIZE} people across 5 teams · ${TEAM.filter((m) => m.status === 'online').length} online now`}
        actions={
          <button type="button" className="btn btn-primary" {...pp('invite-member', 'Invite member')} onClick={() => actions.toast('Invitation sent', 'A workspace invite link was emailed.')}>
            <UserPlus size={15} />Invite member
          </button>
        }
      />
      <Tabs value={filter} options={FILTERS} onChange={setFilter} ppPrefix="team" />

      <div className="grid grid-4">
        {members.map((m) => (
          <div
            key={m.id}
            className={`card ${focused === m.id ? 'orbit-flash' : ''}`}
            style={focused === m.id ? { borderColor: 'var(--violet)' } : undefined}
            {...pp(`member-${m.id}`, m.name)}
          >
            <div className="card-body stack" style={{ alignItems: 'center', textAlign: 'center', gap: 10 }}>
              <Avatar memberId={m.id} size={56} showStatus />
              <div>
                <div style={{ fontWeight: 600 }}>{m.name}</div>
                <div className="subtle">{m.role}</div>
              </div>
              <div className="row" style={{ gap: 6 }}>
                <Badge tone="accent">{m.team}</Badge>
                <Badge tone={STATUS_TONE[m.status]} dot>{m.status}</Badge>
              </div>
              <div className="subtle row" style={{ gap: 4 }}><MapPin size={12} />{m.location}</div>
              <div className="row" style={{ width: '100%', gap: 8, marginTop: 4 }}>
                <button type="button" className="btn btn-sm" style={{ flex: 1 }} {...pp(`message-${m.id}`, `Message ${m.name}`)} onClick={() => actions.toast(`Message sent to ${m.name.split(' ')[0]}`)}>
                  <MessageSquare size={13} />Message
                </button>
                <a className="btn btn-sm btn-icon" href={`mailto:${m.email}`} aria-label={`Email ${m.name}`}><Mail size={13} /></a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
