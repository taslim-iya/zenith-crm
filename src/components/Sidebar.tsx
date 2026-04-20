import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, Briefcase, BarChart3, MessageSquare, CheckSquare, Upload, Settings, Moon, Sun, BookOpen, Shield } from 'lucide-react';
import { useStore } from '../store';

const nav = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', module: 'dashboard' },
  { path: '/companies', icon: Building2, label: 'Companies', module: 'companies' },
  { path: '/team', icon: Users, label: 'Team', module: 'team' },
  { path: '/brokers', icon: Briefcase, label: 'Brokers', module: 'brokers' },
  { path: '/research', icon: BookOpen, label: 'Research', module: 'research' },
  { path: '/kpis', icon: BarChart3, label: 'KPIs', module: 'kpis' },
  { path: '/chat', icon: MessageSquare, label: 'AI Chat', module: 'chat' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks', module: 'tasks' },
  { path: '/import-export', icon: Upload, label: 'Import / Export', module: 'importExport' },
  { path: '/team-portal', icon: Shield, label: 'Team Portal', module: 'teamPortal' },
  { path: '/settings', icon: Settings, label: 'Settings', module: 'settings' },
];

export default function Sidebar() {
  const location = useLocation();
  const { darkMode, toggleDark, companies, tasks, team, currentUserId, canAccess } = useStore();
  const today = new Date().toISOString().split('T')[0];
  const overdue = tasks.filter(t => t.status !== 'done' && t.dueDate && t.dueDate < today).length;
  const active = companies.filter(c => c.status === 'active').length;
  const currentMember = team.find(t => t.id === currentUserId);
  const isAdmin = currentMember?.role === 'admin';

  const visibleNav = nav.filter(item => {
    // Settings and Team Portal: admin only
    if (item.module === 'settings' || item.module === 'teamPortal') return isAdmin;
    // If no user selected yet, show everything
    if (!currentUserId) return true;
    // Check RBAC
    const access = canAccess(currentUserId, item.module);
    return access !== 'none';
  });

  return (
    <>
      <aside className="desktop-sidebar" style={{ width: 240, flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }}>
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' }}>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em' }}>Zenith</h1>
          <p style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>Search Fund CRM</p>
        </div>

        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 16 }}>
          <div><div style={{ fontSize: 18, fontWeight: 700 }}>{active}</div><div style={{ fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Companies</div></div>
          <div><div style={{ fontSize: 18, fontWeight: 700 }}>{team.length}</div><div style={{ fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Team</div></div>
          {overdue > 0 && <div><div style={{ fontSize: 18, fontWeight: 700, color: 'var(--red)' }}>{overdue}</div><div style={{ fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Overdue</div></div>}
        </div>

        {currentMember && (
          <div style={{ padding: '8px 20px', borderBottom: '1px solid var(--border)', fontSize: 11, color: 'var(--text-2)' }}>
            Working as <strong>{currentMember.name}</strong>
            {isAdmin && <span style={{ marginLeft: 6, fontSize: 9, padding: '1px 5px', borderRadius: 2, background: 'var(--gold-light)', color: 'var(--gold)', fontWeight: 700 }}>ADMIN</span>}
          </div>
        )}

        <nav style={{ flex: 1, padding: '8px 0', overflow: 'auto' }}>
          {visibleNav.map(item => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <NavLink key={item.path} to={item.path} className={`nav-item ${isActive ? 'nav-item-active' : ''}`} style={{ textDecoration: 'none' }}>
                <item.icon size={16} /><span>{item.label}</span>
                {item.path === '/tasks' && overdue > 0 && <span style={{ marginLeft: 'auto', fontSize: 10, padding: '0 6px', borderRadius: 8, background: 'var(--red-light)', color: 'var(--red)', fontWeight: 700 }}>{overdue}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, color: 'var(--text-3)' }}>v1.1</span>
          <button onClick={toggleDark} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-3)' }}>{darkMode ? <Sun size={14} /> : <Moon size={14} />}</button>
        </div>
      </aside>

      <div className="mobile-nav" style={{ display: 'none', position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--surface)', borderTop: '1px solid var(--border)', zIndex: 100, justifyContent: 'space-around', padding: '6px 0' }}>
        {visibleNav.slice(0, 5).map(item => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <NavLink key={item.path} to={item.path} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textDecoration: 'none', color: isActive ? 'var(--text)' : 'var(--text-3)', fontSize: 9, fontWeight: isActive ? 600 : 400 }}>
              <item.icon size={18} />{item.label.split(' ')[0]}
            </NavLink>
          );
        })}
      </div>
    </>
  );
}
