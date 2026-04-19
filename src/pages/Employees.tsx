import { useStore } from '../store';
import { Link } from 'react-router-dom';
import { Users, Building2, CheckSquare, AlertTriangle } from 'lucide-react';

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  principal: { bg: 'var(--gold-light)', text: 'var(--gold)' },
  partner: { bg: 'var(--blue-light)', text: 'var(--blue)' },
  associate: { bg: 'var(--green-light)', text: 'var(--green)' },
  analyst: { bg: 'var(--orange-light)', text: 'var(--orange)' },
  intern: { bg: 'var(--bg-3)', text: 'var(--text-3)' },
  advisor: { bg: '#8b5cf612', text: '#8b5cf6' },
};

export default function Employees() {
  const { employees, companies, tasks, kpis } = useStore();
  const today = new Date().toISOString().split('T')[0];

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1200 }}>
      <div className="page-header">
        <h1>Employees</h1>
        <p>{employees.filter(e => e.status === 'active').length} active team members</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {employees.map(emp => {
          const assigned = companies.filter(c => c.ownerId === emp.id && c.status === 'active');
          const empTasks = tasks.filter(t => t.assigneeId === emp.id);
          const overdue = empTasks.filter(t => t.status !== 'done' && t.dueDate < today).length;
          const completed = empTasks.filter(t => t.status === 'done').length;
          const empKpis = kpis.filter(k => k.ownerId === emp.id);
          const rc = ROLE_COLORS[emp.role] || ROLE_COLORS.analyst;

          return (
            <Link key={emp.id} to={`/employees/${emp.id}`} className="card" style={{ padding: 20, textDecoration: 'none', color: 'inherit' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, flexShrink: 0 }}>{emp.avatar}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{emp.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{emp.title}</div>
                </div>
                <span className="badge" style={{ background: rc.bg, color: rc.text }}>{emp.role}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                <Stat icon={Building2} label="Companies" value={assigned.length} />
                <Stat icon={CheckSquare} label="Tasks Done" value={completed} />
                <Stat icon={AlertTriangle} label="Overdue" value={overdue} alert={overdue > 0} />
              </div>

              {empKpis.length > 0 && (
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 10 }}>
                  {empKpis.slice(0, 2).map(k => {
                    const pct = k.target > 0 ? Math.round((k.current / k.target) * 100) : 0;
                    return (
                      <div key={k.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-3)', flex: 1 }}>{k.name}</span>
                        <span style={{ fontSize: 11, fontWeight: 600 }}>{k.current}/{k.target}</span>
                        <div style={{ width: 60, height: 4, background: 'var(--bg-3)', borderRadius: 2 }}>
                          <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--yellow)' : 'var(--red)', borderRadius: 2 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8 }}>
                {emp.team} - {emp.email}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ icon: Ic, label, value, alert }: { icon: any; label: string; value: number; alert?: boolean }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <Ic size={13} style={{ color: alert ? 'var(--red)' : 'var(--text-3)', marginBottom: 2 }} />
      <div style={{ fontSize: 16, fontWeight: 700, color: alert ? 'var(--red)' : undefined }}>{value}</div>
      <div style={{ fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
    </div>
  );
}
