import { useMemo } from 'react';
import { useStore } from '../store';
import { STAGES, SECTORS } from '../types';
import { Link } from 'react-router-dom';
import { Building2, Users, CheckSquare, AlertTriangle, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#1a1a1a', '#555555', '#888888', '#B8860B', '#2563eb', '#16a34a', '#ea580c', '#dc2626', '#8b5cf6'];

export default function Dashboard() {
  const { companies, employees, tasks, kpis, activities } = useStore();
  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

  const stats = useMemo(() => {
    const active = companies.filter(c => c.status === 'active');
    const overdue = tasks.filter(t => t.status !== 'done' && t.dueDate < today);
    const dueToday = tasks.filter(t => t.status !== 'done' && t.dueDate === today);
    const addedThisWeek = companies.filter(c => c.createdAt >= weekAgo);
    const qualified = active.filter(c => ['deep_dive', 'diligence', 'loi', 'closed'].includes(c.stage));
    const byStage = STAGES.filter(s => s.key !== 'passed').map(s => ({
      name: s.label, count: active.filter(c => c.stage === s.key).length, color: s.color
    }));
    const bySector = SECTORS.map(s => ({
      name: s, count: active.filter(c => c.sector === s).length
    })).filter(s => s.count > 0).sort((a, b) => b.count - a.count);
    const byOwner = employees.filter(e => e.status === 'active').map(e => ({
      name: e.name.split(' ')[0], count: active.filter(c => c.ownerId === e.id).length
    }));
    const totalPipelineValue = active.reduce((s, c) => s + c.estimatedDealSize, 0);
    const avgThesisFit = active.length ? (active.reduce((s, c) => s + c.thesisFitScore, 0) / active.length).toFixed(1) : '0';
    return { active, overdue, dueToday, addedThisWeek, qualified, byStage, bySector, byOwner, totalPipelineValue, avgThesisFit };
  }, [companies, tasks, today, weekAgo, employees]);

  const kpiSummary = kpis.filter(k => k.ownerId === 'team').slice(0, 6);

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1400 }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1>Dashboard</h1>
          <p>Acquisition pipeline overview</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/companies" className="btn-secondary" style={{ textDecoration: 'none' }}>View Pipeline</Link>
          <Link to="/tasks" className="btn-primary" style={{ textDecoration: 'none' }}>
            {stats.overdue.length > 0 ? `${stats.overdue.length} Overdue Tasks` : 'View Tasks'}
          </Link>
        </div>
      </div>

      {/* Top stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Companies', value: stats.active.length, icon: Building2 },
          { label: 'Added This Week', value: stats.addedThisWeek.length, icon: TrendingUp },
          { label: 'Qualified Targets', value: stats.qualified.length, icon: CheckSquare },
          { label: 'Pipeline Value', value: `£${(stats.totalPipelineValue / 1e6).toFixed(1)}m`, icon: Building2 },
          { label: 'Avg Thesis Fit', value: `${stats.avgThesisFit}/10`, icon: TrendingUp },
          { label: 'Overdue Tasks', value: stats.overdue.length, icon: AlertTriangle, alert: stats.overdue.length > 0 },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <s.icon size={14} style={{ color: s.alert ? 'var(--red)' : 'var(--text-3)' }} />
              <span style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{s.label}</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--serif)', color: s.alert ? 'var(--red)' : undefined }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Pipeline by stage */}
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

        {/* By sector */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>By Sector</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={stats.bySector} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} strokeWidth={1}>
                {stats.bySector.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 2 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {stats.bySector.slice(0, 6).map((s, i) => (
              <span key={i} style={{ fontSize: 9, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: 1, background: COLORS[i % COLORS.length] }} />
                {s.name} ({s.count})
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* KPI cards */}
        {kpiSummary.map(k => {
          const pct = k.target > 0 ? Math.round((k.current / k.target) * 100) : 0;
          const isGood = k.name === 'Overdue Tasks' || k.name === 'Avg Days in Stage' ? k.current <= k.target : k.current >= k.target;
          return (
            <div key={k.id} className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)' }}>{k.name}</span>
                <span className="badge" style={{ background: isGood ? 'var(--green-light)' : 'var(--red-light)', color: isGood ? 'var(--green)' : 'var(--red)' }}>
                  {pct}%
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--serif)' }}>{k.current}</span>
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>/ {k.target} {k.unit}</span>
              </div>
              <div style={{ marginTop: 8, height: 4, background: 'var(--bg-3)', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: isGood ? 'var(--green)' : 'var(--red)', borderRadius: 2, transition: 'width 0.3s' }} />
              </div>
              <ResponsiveContainer width="100%" height={40}>
                <LineChart data={k.trend.map((v, i) => ({ v, i }))}>
                  <Line type="monotone" dataKey="v" stroke={isGood ? 'var(--green)' : 'var(--red)'} strokeWidth={1.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* By owner */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Companies by Owner</h3>
          {stats.byOwner.map((o, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{o.name[0]}</div>
              <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{o.name}</span>
              <span style={{ fontSize: 13, fontWeight: 700 }}>{o.count}</span>
              <div style={{ width: 80, height: 6, background: 'var(--bg-3)', borderRadius: 3 }}>
                <div style={{ height: '100%', width: `${(o.count / Math.max(...stats.byOwner.map(x => x.count), 1)) * 100}%`, background: 'var(--text)', borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Recent activity */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Recent Activity</h3>
          {activities.slice(0, 8).map(a => {
            const emp = employees.find(e => e.id === a.userId);
            return (
              <div key={a.id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{emp?.avatar?.charAt(0) || '?'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, lineHeight: 1.4 }}>{a.description}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{emp?.name} · {new Date(a.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                </div>
              </div>
            );
          })}
          <Link to="/tasks" style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 12, fontSize: 11, fontWeight: 600, color: 'var(--text-2)', textDecoration: 'none' }}>
            View all activity <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
