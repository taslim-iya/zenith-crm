import { useMemo } from 'react';
import { useStore } from '../store';
import { STAGES } from '../types';
import { Link } from 'react-router-dom';
import { Building2, Users, CheckSquare, AlertTriangle, TrendingUp, ArrowRight, Briefcase, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#1a1a1a', '#555555', '#888888', '#B8860B', '#2563eb', '#16a34a', '#ea580c', '#dc2626', '#8b5cf6'];

export default function Dashboard() {
  const { companies, team, brokers, tasks, activities } = useStore();
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

  const stats = useMemo(() => {
    const active = companies.filter(c => c.status === 'active');
    const overdue = tasks.filter(t => t.status !== 'done' && t.dueDate && t.dueDate < today);
    const addedThisWeek = companies.filter(c => c.createdAt >= weekAgo);
    const qualified = active.filter(c => ['deep_dive', 'diligence', 'loi', 'closed'].includes(c.stage));
    const byStage = STAGES.filter(s => s.key !== 'passed').map(s => ({ name: s.label, count: active.filter(c => c.stage === s.key).length })).filter(s => s.count > 0);
    const sectors = [...new Set(active.map(c => c.sector).filter(Boolean))];
    const bySector = sectors.map(s => ({ name: s, count: active.filter(c => c.sector === s).length })).sort((a, b) => b.count - a.count);
    const totalValue = active.reduce((s, c) => s + c.estimatedDealSize, 0);
    return { active, overdue, addedThisWeek, qualified, byStage, bySector, totalValue };
  }, [companies, tasks, today, weekAgo]);

  const fmt = (n: number) => n >= 1e6 ? `\u00A3${(n/1e6).toFixed(1)}m` : n >= 1e3 ? `\u00A3${(n/1e3).toFixed(0)}k` : `\u00A3${n}`;

  if (companies.length === 0 && team.length === 0) {
    return (
      <div style={{ padding: '32px 40px', maxWidth: 700 }}>
        <div className="page-header"><h1>Welcome to Zenith</h1><p>Your search fund operating system</p></div>
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 20, marginBottom: 16 }}>Get Started</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 500, margin: '0 auto' }}>
            <Link to="/team" className="card" style={{ padding: 24, textDecoration: 'none', color: 'inherit', textAlign: 'center' }}>
              <Users size={24} style={{ color: 'var(--text-3)', marginBottom: 8 }} />
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Add Your Team</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Add team members to track who does what</div>
            </Link>
            <Link to="/companies" className="card" style={{ padding: 24, textDecoration: 'none', color: 'inherit', textAlign: 'center' }}>
              <Building2 size={24} style={{ color: 'var(--text-3)', marginBottom: 8 }} />
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Add Companies</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Start building your acquisition pipeline</div>
            </Link>
            <Link to="/brokers" className="card" style={{ padding: 24, textDecoration: 'none', color: 'inherit', textAlign: 'center' }}>
              <Briefcase size={24} style={{ color: 'var(--text-3)', marginBottom: 8 }} />
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Add Brokers</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Track your broker relationships</div>
            </Link>
            <Link to="/import-export" className="card" style={{ padding: 24, textDecoration: 'none', color: 'inherit', textAlign: 'center' }}>
              <Plus size={24} style={{ color: 'var(--text-3)', marginBottom: 8 }} />
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Import Data</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>AI-powered file import</div>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1400 }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div><h1>Dashboard</h1><p>Acquisition pipeline overview</p></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/companies" className="btn-secondary" style={{ textDecoration: 'none' }}>Pipeline</Link>
          <Link to="/import-export" className="btn-primary" style={{ textDecoration: 'none' }}><Plus size={14} /> Import</Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { l: 'Companies', v: stats.active.length, icon: Building2 },
          { l: 'Added This Week', v: stats.addedThisWeek.length, icon: TrendingUp },
          { l: 'Qualified', v: stats.qualified.length, icon: CheckSquare },
          { l: 'Pipeline Value', v: stats.totalValue > 0 ? fmt(stats.totalValue) : '-', icon: Building2 },
          { l: 'Team', v: team.length, icon: Users },
          { l: 'Brokers', v: brokers.length, icon: Briefcase },
          { l: 'Overdue Tasks', v: stats.overdue.length, icon: AlertTriangle, alert: stats.overdue.length > 0 },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
              <s.icon size={12} style={{ color: (s as any).alert ? 'var(--red)' : 'var(--text-3)' }} />
              <span style={{ fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{s.l}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--serif)', color: (s as any).alert ? 'var(--red)' : undefined }}>{s.v}</div>
          </div>
        ))}
      </div>

      {stats.byStage.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Pipeline by Stage</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.byStage} margin={{ left: -20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-30} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 2, border: '1px solid var(--border)' }} />
                <Bar dataKey="count" fill="var(--text)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {stats.bySector.length > 0 && (
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>By Sector</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart><Pie data={stats.bySector} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} strokeWidth={1}>
                  {stats.bySector.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie><Tooltip contentStyle={{ fontSize: 11 }} /></PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                {stats.bySector.slice(0, 6).map((s, i) => (
                  <span key={i} style={{ fontSize: 9, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 1, background: COLORS[i % COLORS.length] }} />{s.name} ({s.count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent activity */}
      {activities.length > 0 && (
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Recent Activity</h3>
          {activities.slice(0, 10).map(a => (
            <div key={a.id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, flexShrink: 0 }}>{a.userName?.charAt(0) || '?'}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, lineHeight: 1.4 }}>{a.description}</p>
                <p style={{ fontSize: 10, color: 'var(--text-3)' }}>{a.userName} - {new Date(a.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
