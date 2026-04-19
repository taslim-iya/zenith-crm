import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { ArrowLeft, Building2, CheckSquare, BarChart3, Mail, Calendar, AlertTriangle, Clock } from 'lucide-react';
import { STAGES } from '../types';

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { employees, companies, tasks, kpis } = useStore();
  const emp = employees.find(e => e.id === id);
  const today = new Date().toISOString().split('T')[0];

  if (!emp) return <div style={{ padding: 40 }}><p>Employee not found.</p><Link to="/employees">Back</Link></div>;

  const assigned = companies.filter(c => c.ownerId === emp.id && c.status === 'active');
  const empTasks = tasks.filter(t => t.assigneeId === emp.id);
  const overdue = empTasks.filter(t => t.status !== 'done' && t.dueDate < today);
  const completed = empTasks.filter(t => t.status === 'done');
  const pending = empTasks.filter(t => t.status !== 'done');
  const empKpis = kpis.filter(k => k.ownerId === emp.id);
  const manager = employees.find(e => e.id === emp.managerId);

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <button onClick={() => navigate('/employees')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}><ArrowLeft size={18} /></button>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Employees</span>
      </div>

      {/* Header */}
      <div className="page-header" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700 }}>{emp.avatar}</div>
        <div>
          <h1>{emp.name}</h1>
          <p style={{ textTransform: 'none', letterSpacing: 0, fontSize: 13, marginTop: 4 }}>{emp.title} - {emp.team}{manager ? ` - Reports to ${manager.name}` : ''}</p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { l: 'Assigned Companies', v: assigned.length, icon: Building2 },
          { l: 'Tasks Completed', v: completed.length, icon: CheckSquare },
          { l: 'Tasks Pending', v: pending.length, icon: Clock },
          { l: 'Overdue Tasks', v: overdue.length, icon: AlertTriangle, alert: overdue.length > 0 },
          { l: 'Joined', v: emp.joinDate, icon: Calendar },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              <s.icon size={12} style={{ color: (s as any).alert ? 'var(--red)' : 'var(--text-3)' }} />
              <span style={{ fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{s.l}</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--serif)', color: (s as any).alert ? 'var(--red)' : undefined }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Assigned companies */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}><Building2 size={14} /> Assigned Companies ({assigned.length})</h3>
          {assigned.map(c => {
            const si = STAGES.find(s => s.key === c.stage);
            return (
              <Link key={c.id} to={`/companies/${c.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border-subtle)', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{c.sector}</div>
                </div>
                <span className="badge" style={{ background: `${si?.color}18`, color: si?.color, fontSize: 9 }}>{si?.label}</span>
              </Link>
            );
          })}
          {assigned.length === 0 && <p style={{ fontSize: 12, color: 'var(--text-3)' }}>No companies assigned.</p>}
        </div>

        {/* KPIs */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}><BarChart3 size={14} /> KPI Scorecard</h3>
          {empKpis.length > 0 ? empKpis.map(k => {
            const pct = k.target > 0 ? Math.round((k.current / k.target) * 100) : 0;
            const good = pct >= 80;
            return (
              <div key={k.id} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{k.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: good ? 'var(--green)' : 'var(--red)' }}>{k.current} / {k.target} {k.unit}</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-3)', borderRadius: 3 }}>
                  <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: good ? 'var(--green)' : pct >= 50 ? 'var(--yellow)' : 'var(--red)', borderRadius: 3, transition: 'width 0.3s' }} />
                </div>
              </div>
            );
          }) : <p style={{ fontSize: 12, color: 'var(--text-3)' }}>No KPIs assigned.</p>}
        </div>

        {/* Overdue tasks */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, color: overdue.length > 0 ? 'var(--red)' : undefined }}><AlertTriangle size={14} /> Overdue Tasks ({overdue.length})</h3>
          {overdue.map(t => {
            const comp = companies.find(c => c.id === t.companyId);
            return (
              <div key={t.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{t.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Due: {t.dueDate} {comp ? `- ${comp.name}` : ''}</div>
              </div>
            );
          })}
          {overdue.length === 0 && <p style={{ fontSize: 12, color: 'var(--green)' }}>No overdue tasks.</p>}
        </div>

        {/* Info */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Details</h3>
          <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 2 }}>
            <p><strong>Email:</strong> {emp.email}</p>
            <p><strong>Role:</strong> {emp.role}</p>
            <p><strong>Team:</strong> {emp.team}</p>
            <p><strong>Status:</strong> {emp.status}</p>
            <p><strong>Joined:</strong> {emp.joinDate}</p>
            {manager && <p><strong>Manager:</strong> {manager.name}</p>}
          </div>
          {emp.notes && <div style={{ marginTop: 12, padding: 12, background: 'var(--bg-2)', borderRadius: 2, fontSize: 12, color: 'var(--text-2)', fontStyle: 'italic' }}>{emp.notes}</div>}
        </div>
      </div>
    </div>
  );
}
