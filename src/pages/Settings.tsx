import { useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CreditCard, Moon, Rocket, ShieldCheck, Sun } from 'lucide-react';
import { WORKSPACE } from '../data/orbit';
import { Badge, Card, PageHeader, Switch, Tabs } from '../components/ui';
import { useOrbitPageContext } from '../panpilot/context';
import { pp } from '../panpilot/pp';
import { actions, useOrbit } from '../store';

type Tab = 'general' | 'notifications' | 'security' | 'billing';
const TABS: { value: Tab; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'notifications', label: 'Notifications' },
  { value: 'security', label: 'Security' },
  { value: 'billing', label: 'Billing' },
];

function SettingRow({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="list-item" style={{ padding: '16px 20px', justifyContent: 'space-between' }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{title}</div>
        <div className="subtle">{description}</div>
      </div>
      {children}
    </div>
  );
}

export function Settings() {
  const [params, setParams] = useSearchParams();
  const tab = (TABS.some((t) => t.value === params.get('tab')) ? params.get('tab') : 'general') as Tab;
  const setTab = (t: Tab) => setParams(t === 'general' ? {} : { tab: t }, { replace: true });

  const theme = useOrbit((s) => s.theme);
  const released = useOrbit((s) => s.smartReportsReleased);
  const [workspaceName, setWorkspaceName] = useState(WORKSPACE.company);
  const [timezone, setTimezone] = useState('Africa/Addis_Ababa');
  const [prefs, setPrefs] = useState({
    emailDigest: true, mentions: true, projectUpdates: true, weeklyReport: false, productNews: true,
    twoFactor: true, sso: false, sessionTimeout: true, auditLog: true,
  });
  const set = (k: keyof typeof prefs) => (v: boolean) => {
    setPrefs((p) => ({ ...p, [k]: v }));
    actions.toast('Setting saved');
  };

  useOrbitPageContext('settings', 'Settings', () => ({
    activeTab: tab,
    tabs: TABS.map((t) => `settings-tab-${t.value}`),
    general: { workspaceName, timezone, theme, version: released ? '2.4.0' : WORKSPACE.version },
    notificationPreferences: tab === 'notifications' ? prefs : undefined,
    security: tab === 'security' ? { twoFactor: prefs.twoFactor, sso: prefs.sso, sessionTimeout: prefs.sessionTimeout, auditLog: prefs.auditLog } : undefined,
    billing: tab === 'billing' ? { plan: 'Enterprise', seats: '18 of 25', nextInvoice: 'Oct 24, 2026 · $4,800' } : undefined,
  }));

  return (
    <>
      <PageHeader title="Settings" description="Manage your workspace, preferences and security." />
      <Tabs value={tab} options={TABS} onChange={setTab} ppPrefix="settings-tab" />

      {tab === 'general' && (
        <>
          <Card title="Workspace" subtitle="Basic information about your organization">
            <div className="card-body grid grid-2">
              <div className="field">
                <label className="label" htmlFor="workspace-name">Workspace name</label>
                <input id="workspace-name" data-pp="workspace-name" className="input" value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} />
              </div>
              <div className="field">
                <label className="label" htmlFor="workspace-timezone">Timezone</label>
                <select id="workspace-timezone" data-pp="workspace-timezone" className="select" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                  {['Africa/Addis_Ababa', 'Europe/London', 'America/New_York', 'America/Los_Angeles', 'Asia/Tokyo'].map((z) => <option key={z}>{z}</option>)}
                </select>
              </div>
            </div>
          </Card>

          <Card title="Appearance">
            <SettingRow title="Theme" description="Choose how Orbit looks for you.">
              <div className="tabs">
                <button type="button" className={`tab ${theme === 'dark' ? 'active' : ''}`} onClick={() => actions.setTheme('dark')} {...pp('theme-dark', 'Dark theme')}><Moon size={13} /> Dark</button>
                <button type="button" className={`tab ${theme === 'light' ? 'active' : ''}`} onClick={() => actions.setTheme('light')} {...pp('theme-light', 'Light theme')}><Sun size={13} /> Light</button>
              </div>
            </SettingRow>
          </Card>

          <Card title="Releases" subtitle="Roll out new Orbit versions to this workspace" pp="releases">
            <SettingRow
              title={released ? 'Orbit 2.4.0 — Smart Reports' : 'Orbit 2.4.0 is ready to publish'}
              description={released ? 'Live for all members. Smart Reports is available in Analytics.' : 'Adds Smart Reports: automatic weekly business reports.'}
            >
              <div className="row">
                <Badge tone={released ? 'success' : 'neutral'} dot>{released ? 'Live' : `Current: ${WORKSPACE.version}`}</Badge>
                <button
                  type="button"
                  className={`btn ${released ? '' : 'btn-gradient'}`}
                  onClick={() => actions.setSmartReportsReleased(!released)}
                  {...pp('publish-release', released ? 'Roll back release' : 'Publish release 2.4.0')}
                >
                  <Rocket size={15} />{released ? 'Roll back' : 'Publish 2.4.0'}
                </button>
              </div>
            </SettingRow>
          </Card>
        </>
      )}

      {tab === 'notifications' && (
        <Card title="Email & in-app notifications">
          <SettingRow title="Daily email digest" description="A summary of activity every morning."><Switch checked={prefs.emailDigest} onChange={set('emailDigest')} label="Daily email digest" pp="pref-email-digest" /></SettingRow>
          <SettingRow title="Mentions" description="When someone @mentions you."><Switch checked={prefs.mentions} onChange={set('mentions')} label="Mentions" pp="pref-mentions" /></SettingRow>
          <SettingRow title="Project updates" description="Status changes on projects you follow."><Switch checked={prefs.projectUpdates} onChange={set('projectUpdates')} label="Project updates" pp="pref-project-updates" /></SettingRow>
          <SettingRow title="Weekly report email" description="Receive the weekly workspace report."><Switch checked={prefs.weeklyReport} onChange={set('weeklyReport')} label="Weekly report email" pp="pref-weekly-report" /></SettingRow>
          <SettingRow title="Product news" description="New features and release notes."><Switch checked={prefs.productNews} onChange={set('productNews')} label="Product news" pp="pref-product-news" /></SettingRow>
        </Card>
      )}

      {tab === 'security' && (
        <Card title="Security" subtitle="Protect your workspace" actions={<Badge tone="success"><ShieldCheck size={12} />SOC 2 Type II</Badge>}>
          <SettingRow title="Two-factor authentication" description="Require 2FA for all members."><Switch checked={prefs.twoFactor} onChange={set('twoFactor')} label="Two-factor authentication" pp="security-2fa" /></SettingRow>
          <SettingRow title="Single sign-on (SAML)" description="Sign in with Okta, Azure AD or Google."><Switch checked={prefs.sso} onChange={set('sso')} label="Single sign-on" pp="security-sso" /></SettingRow>
          <SettingRow title="Session timeout" description="Sign out inactive users after 12 hours."><Switch checked={prefs.sessionTimeout} onChange={set('sessionTimeout')} label="Session timeout" pp="security-session-timeout" /></SettingRow>
          <SettingRow title="Audit log" description="Record every admin action."><Switch checked={prefs.auditLog} onChange={set('auditLog')} label="Audit log" pp="security-audit-log" /></SettingRow>
        </Card>
      )}

      {tab === 'billing' && (
        <div className="grid grid-2">
          <Card title="Plan">
            <div className="card-body stack">
              <div className="row-between">
                <div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>Enterprise</div>
                  <div className="subtle">$4,800 / month · billed monthly</div>
                </div>
                <Badge tone="violet">Current plan</Badge>
              </div>
              <div className="subtle">18 of 25 seats used · Next invoice Oct 24, 2026</div>
              <button type="button" className="btn" {...pp('manage-plan', 'Manage plan')} onClick={() => actions.toast('Opening billing portal…', undefined, 'info')}>Manage plan</button>
            </div>
          </Card>
          <Card title="Payment method">
            <div className="card-body row">
              <span className="stat-icon tone-accent"><CreditCard size={17} /></span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>Visa ending 4242</div>
                <div className="subtle">Expires 08/28</div>
              </div>
              <button type="button" className="btn btn-sm" {...pp('update-card', 'Update card')} onClick={() => actions.toast('Card update form opened', undefined, 'info')}>Update</button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
