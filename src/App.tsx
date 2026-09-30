import { useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { PanPilotPanel, PanPilotProvider } from '@panpilot/react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Toasts } from './components/ui';
import { orbitTools, resolveRoute } from './panpilot/tools';
import { actions, getState, useOrbit } from './store';
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { ProjectDetail } from './pages/ProjectDetail';
import { Team } from './pages/Team';
import { Analytics } from './pages/Analytics';
import { SmartReports } from './pages/SmartReports';
import { Automations } from './pages/Automations';
import { Notifications } from './pages/Notifications';
import { Settings } from './pages/Settings';

const PANPILOT_URL = import.meta.env.VITE_PANPILOT_URL ?? 'ws://localhost:3001/ws';
const PANPILOT_API_KEY = import.meta.env.VITE_PANPILOT_API_KEY;

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0 }); }, [pathname]);
  return null;
}

export function App() {
  const navigate = useNavigate();
  const theme = useOrbit((s) => s.theme);
  const released = useOrbit((s) => s.smartReportsReleased);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Presenter shortcut: Alt+Shift+R publishes (or rolls back) the 2.4.0 release
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey && e.code === 'KeyR') {
        e.preventDefault();
        actions.setSmartReportsReleased(!getState().smartReportsReleased);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const tools = useMemo(() => orbitTools, []);

  return (
    <PanPilotProvider
      serverUrl={PANPILOT_URL}
      apiKey={PANPILOT_API_KEY}
      // navigate_to → React Router. Accepts page ids ("analytics"), project slugs and paths.
      navigate={(pageId) => navigate(resolveRoute(pageId))}
      tools={tools}
    >
      <ScrollToTop />
      <div className="app">
        <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        <div className="main">
          <Topbar onMenu={() => setMenuOpen(true)} />
          <main className="content">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:slug" element={<ProjectDetail />} />
              <Route path="/team" element={<Team />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route
                path="/analytics/smart-reports"
                element={released ? <SmartReports /> : <Navigate to="/analytics" replace />}
              />
              <Route path="/automations" element={<Automations />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </main>
        </div>
      </div>
      <Toasts />

      {/* Rendered into document.body via portal — survives route changes */}
      <PanPilotPanel title="Orbit Copilot" placeholder="Ask Orbit anything, or say “take me to analytics”…" />
    </PanPilotProvider>
  );
}
