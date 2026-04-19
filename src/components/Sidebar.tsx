import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, BarChart3, MessageSquare, CheckSquare, Upload, Settings, Moon, Sun } from 'lucide-react';
import { useStore } from '../store';

const nav = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/companies', icon: Building2, label: 'Companies' },
  { path: '/employees', icon: Users, label: 'Employees' },
  { path: '/kpis', icon: BarChart3, label: 'KPIs' },
  { path: '/chat', icon: MessageSquare, label: 'AI Chat' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/import-export', icon: Upload, label: 'Import / Export' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const location = useLocation();
  const { darkMode, toggleDark, companies, tasks } = useStore();

  const overdueTasks = tasks.filter(t => t.status !== 'done' && t.dueDate < new Date().toISOString().split('T')[0]).length;
  const activeDeals = companies.filter(c => ['deep_dive', 'diligence', 'loi'].includes(c.stage)).length;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="desktop-sidebar" style={{
        width: 240, flexShrink: 0, background: 'var(--surface)',
        borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column',
        height: '100vh', position: 'sticky', top: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em' }}>Zenith</h1>
          <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>Search Fund CRM</p>
        </div>

        {/* Quick stats */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{activeDeals}</div>
            <div style={{ fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Active Deals</div>
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: overdueTasks > 0 ? 'var(--red)' : undefined }}>{overdueTasks}</div>
            <div style={{ fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Overdue</div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '8px 0', overflow: 'auto' }}>
          {nav.map(item => {
            const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <NavLink key={item.path} to={item.path} className={`nav-item ${active ? 'nav-item-active' : ''}`} style={{ textDecoration: 'none' }}>
                <item.icon size={16} />
                <span>{item.label}</span>
                {item.path === '/tasks' && overdueTasks > 0 && (
                  <span style={{ marginLeft: 'auto', fontSize: 10, padding: '0 6px', borderRadius: 8, background: 'var(--red-light)', color: 'var(--red)', fontWeight: 700 }}>{overdueTasks}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, color: 'var(--text-3)' }}>v1.0</span>
          <button onClick={toggleDark} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-3)' }}>
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="mobile-nav" style={{
        display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'var(--surface)', borderTop: '1px solid var(--border)',
        zIndex: 100, justifyContent: 'space-around', padding: '6px 0',
      }}>
        {nav.slice(0, 5).map(item => {
          const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <NavLink key={item.path} to={item.path} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textDecoration: 'none', color: active ? 'var(--text)' : 'var(--text-3)', fontSize: 9, fontWeight: active ? 600 : 400 }}>
              <item.icon size={18} />
              {item.label.split(' ')[0]}
            </NavLink>
          );
        })}
      </div>
    </>
  );
}
