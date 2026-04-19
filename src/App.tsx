import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import CompanyDetail from './pages/CompanyDetail';
import Employees from './pages/Employees';
import EmployeeDetail from './pages/EmployeeDetail';
import KPIs from './pages/KPIs';
import AIChat from './pages/AIChat';
import Tasks from './pages/Tasks';
import ImportExport from './pages/ImportExport';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <Sidebar />
        <main style={{ flex: 1, overflow: 'auto', minHeight: '100vh' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/companies/:id" element={<CompanyDetail />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/employees/:id" element={<EmployeeDetail />} />
            <Route path="/kpis" element={<KPIs />} />
            <Route path="/chat" element={<AIChat />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/import-export" element={<ImportExport />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
