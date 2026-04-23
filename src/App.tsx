import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import CompanyDetail from './pages/CompanyDetail';
import Team from './pages/Team';
import Brokers from './pages/Brokers';
import Research from './pages/Research';
import KPIs from './pages/KPIs';
import AIChat from './pages/AIChat';
import Tasks from './pages/Tasks';
import ImportExport from './pages/ImportExport';
import TeamPortal from './pages/TeamPortal';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main style={{ flex: 1, overflow: 'auto', minHeight: '100vh' }}>
          <div id="zenith-storage-warn" style={{ display: 'none', padding: '10px 16px', background: '#fef2f2', borderBottom: '1px solid #fecaca', color: '#dc2626', fontSize: 12, fontWeight: 600, alignItems: 'center', gap: 8 }}>
            ⚠️ Storage limit reached — data may not persist after refresh. Export your data now from Import/Export page.
          </div>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/:id" element={<CompanyDetail />} />
            <Route path="/team" element={<Team />} />
            <Route path="/brokers" element={<Brokers />} />
            <Route path="/research" element={<Research />} />
            <Route path="/kpis" element={<KPIs />} />
            <Route path="/chat" element={<AIChat />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/import-export" element={<ImportExport />} />
            <Route path="/team-portal" element={<TeamPortal />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
