import { useState } from 'react';
import { useStore } from '../store';
import { BarChart3, TrendingUp, TrendingDown, Target, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const CATEGORIES = ['sourcing', 'outreach', 'diligence', 'pipeline', 'productivity', 'quality'] as const;
const CAT_LABELS: Record<string, string> = { sourcing: 'Sourcing', outreach: 'Outreach', diligence: 'Diligence', pipeline: 'Pipeline', productivity: 'Productivity', quality: 'Quality' };

export default function KPIs() {
  const { kpis, team, updateKPI } = useStore();
  const [view, setView] = useState<'team' | 'individual'>('team');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editVal, setEditVal] = useState<number>(0);

  const teamKpis = kpis.filter(k => k.ownerId === 'team');
  const individualKpis = kpis.filter(k => k.ownerId !== 'team');

  const saveEdit = (id: string) => {
    updateKPI(id, { current: editVal, updatedAt: new Date().toISOString().split('T')[0] });
    setEditingId(null);
  };

  const renderKPICard = (k: typeof kpis[0]) => {
    const pct = k.target > 0 ? Math.round((k.current / k.target) * 100) : 0;
    const inverse = k.name.includes('Overdue') || k.name.includes('Days in');
    const good = inverse ? k.current <= k.target : k.current >= k.target;
    const trend = k.trend.length >= 2 ? k.trend[k.trend.length - 1] - k.trend[k.trend.length - 2] : 0;
    const emp = k.ownerId !== 'team' ? team.find(e => e.id === k.ownerId) : null;

    return (
      <div key={k.id} className="card" style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-2)' }}>{k.name}</span>
          <span className="badge" style={{ background: good ? 'var(--green-light)' : 'var(--red-light)', color: good ? 'var(--green)' : 'var(--red)', fontSize: 10 }}>{pct}%</span>
        </div>

        {emp && <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 6 }}>{emp.name} - {emp.role}</div>}

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
          {editingId === k.id ? (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <input type="number" value={editVal} onChange={e => setEditVal(Number(e.target.value))} style={{ width: 60, padding: '4px 6px', fontSize: 14, fontWeight: 700 }} autoFocus />
              <button onClick={() => saveEdit(k.id)} style={{ fontSize: 10, padding: '3px 8px', background: 'var(--text)', color: 'var(--bg)', border: 'none', borderRadius: 2, cursor: 'pointer' }}>Save</button>
              <button onClick={() => setEditingId(null)} style={{ fontSize: 10, padding: '3px 8px', background: 'var(--bg-3)', border: 'none', borderRadius: 2, cursor: 'pointer' }}>Cancel</button>
            </div>
          ) : (
            <span onClick={() => { setEditingId(k.id); setEditVal(k.current); }} style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--serif)', cursor: 'pointer' }} title="Click to edit">{k.current}</span>
          )}
          <span style={{ fontSize: 12, color: 'var(--text-3)' }}>/ {k.target} {k.unit}</span>
          {trend !== 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 10, fontWeight: 600, color: (inverse ? trend < 0 : trend > 0) ? 'var(--green)' : 'var(--red)' }}>
              {trend > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}{Math.abs(trend)}
            </span>
          )}
        </div>

        <div style={{ height: 4, background: 'var(--bg-3)', borderRadius: 2, marginBottom: 8 }}>
          <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: good ? 'var(--green)' : 'var(--red)', borderRadius: 2 }} />
        </div>

        <ResponsiveContainer width="100%" height={40}>
          <LineChart data={k.trend.map((v, i) => ({ v, i }))}>
            <Line type="monotone" dataKey="v" stroke={good ? 'var(--green)' : 'var(--red)'} strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>

        <div style={{ fontSize: 9, color: 'var(--text-3)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k.period} - {CAT_LABELS[k.category]}</div>
      </div>
    );
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1400 }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div><h1>KPIs</h1><p>Performance tracking and targets</p></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setView('team')} className={view === 'team' ? 'btn-primary' : 'btn-secondary'} style={view === 'team' ? { background: 'var(--text)', color: 'var(--bg)' } : {}}><Target size={14} /> Team</button>
          <button onClick={() => setView('individual')} className={view === 'individual' ? 'btn-primary' : 'btn-secondary'} style={view === 'individual' ? { background: 'var(--text)', color: 'var(--bg)' } : {}}><Users size={14} /> Individual</button>
        </div>
      </div>

      {view === 'team' && (
        <>
          {/* Overview chart */}
          <div className="card" style={{ padding: 20, marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Team KPI Overview</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={teamKpis.map(k => ({ name: k.name.length > 15 ? k.name.slice(0,15) + '...' : k.name, current: k.current, target: k.target }))}>
                <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 2, border: '1px solid var(--border)' }} />
                <Bar dataKey="target" fill="var(--bg-3)" radius={[2,2,0,0]} />
                <Bar dataKey="current" fill="var(--text)" radius={[2,2,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* KPI cards by category */}
          {CATEGORIES.filter(cat => teamKpis.some(k => k.category === cat)).map(cat => (
            <div key={cat} style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-2)', marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>{CAT_LABELS[cat]}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {teamKpis.filter(k => k.category === cat).map(renderKPICard)}
              </div>
            </div>
          ))}
        </>
      )}

      {view === 'individual' && (
        <>
          {team.filter(e => e.status === 'active').map(emp => {
            const empK = individualKpis.filter(k => k.ownerId === emp.id);
            if (empK.length === 0) return null;
            return (
              <div key={emp.id} style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{emp.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{emp.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{emp.title}</div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                  {empK.map(renderKPICard)}
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
