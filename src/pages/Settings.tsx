import { useState } from 'react';
import { useStore } from '../store';
import { Lock, Trash2, Moon, Sun, Shield, Key } from 'lucide-react';

export default function Settings() {
  const store = useStore();
  const { companies, team, brokers, tasks, kpis, research, activities, darkMode, toggleDark, adminPassword, setAdminPassword, currentUserId, customColumns } = store;
  const currentMember = team.find(t => t.id === currentUserId);
  const isAdmin = currentMember?.role === 'admin';

  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [pwErr, setPwErr] = useState(false);
  const [newPw, setNewPw] = useState('');
  const [pwSaved, setPwSaved] = useState(false);

  // Admin gate
  if (!authed) {
    return (
      <div style={{ padding: '32px 40px', maxWidth: 400 }}>
        <div className="page-header"><h1>Settings</h1><p>Admin access required</p></div>
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <Lock size={28} style={{ color: 'var(--text-3)', marginBottom: 12 }} />
          <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 16 }}>Enter admin password to access settings.</p>
          <input type="password" value={pw} onChange={e => { setPw(e.target.value); setPwErr(false); }} onKeyDown={e => e.key === 'Enter' && (pw === adminPassword ? setAuthed(true) : setPwErr(true))} placeholder="Admin password..." style={{ width: '100%', marginBottom: 8 }} />
          {pwErr && <p style={{ fontSize: 11, color: 'var(--red)', marginBottom: 8 }}>Incorrect password.</p>}
          <button className="btn-primary" onClick={() => pw === adminPassword ? setAuthed(true) : setPwErr(true)} style={{ width: '100%' }}>Unlock</button>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Companies', value: companies.length },
    { label: 'Team Members', value: team.length },
    { label: 'Brokers', value: brokers.length },
    { label: 'Research Items', value: research.length },
    { label: 'Tasks', value: tasks.length },
    { label: 'KPIs', value: kpis.length },
    { label: 'Activities', value: activities.length },
    { label: 'Custom Columns', value: customColumns.length },
  ];

  const handleReset = () => {
    if (!confirm('This will delete ALL data. Are you sure?')) return;
    if (!confirm('Really? This cannot be undone.')) return;
    localStorage.removeItem('zenith-store');
    window.location.reload();
  };

  const savePw = () => {
    if (!newPw || newPw.length < 4) return;
    setAdminPassword(newPw);
    setNewPw('');
    setPwSaved(true);
    setTimeout(() => setPwSaved(false), 2000);
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 700 }}>
      <div className="page-header"><h1>Settings</h1><p>Admin panel</p></div>

      {/* Theme */}
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Appearance</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13 }}>Dark Mode</span>
          <button onClick={toggleDark} className="btn-secondary">{darkMode ? <><Sun size={14} /> Light Mode</> : <><Moon size={14} /> Dark Mode</>}</button>
        </div>
      </div>

      {/* Admin Password */}
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}><Key size={14} />Admin Password</h3>
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12 }}>Current: <code style={{ background: 'var(--bg-2)', padding: '2px 6px', borderRadius: 2 }}>{adminPassword}</code></p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="text" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="New password (min 4 chars)" style={{ flex: 1 }} />
          <button className="btn-primary" onClick={savePw}>Change</button>
        </div>
        {pwSaved && <p style={{ fontSize: 11, color: 'var(--green)', marginTop: 4 }}>Password updated.</p>}
      </div>

      {/* Data Stats */}
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Data</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
          {stats.map(s => (
            <div key={s.label} style={{ padding: '10px 12px', background: 'var(--bg-2)', borderRadius: 2 }}>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Export logs */}
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}><Shield size={14} />Export Log</h3>
        {activities.filter(a => a.type === 'export').length === 0 ? (
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>No exports yet.</p>
        ) : (
          <div style={{ maxHeight: 200, overflow: 'auto' }}>
            {activities.filter(a => a.type === 'export').map(a => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: 12 }}>
                <span>{a.description}</span>
                <span style={{ color: 'var(--text-3)', fontSize: 11 }}>{a.userName} - {new Date(a.timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger */}
      <div className="card" style={{ padding: 20, borderColor: 'var(--red)' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--red)' }}>Danger Zone</h3>
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12 }}>Permanently delete all data. This cannot be undone.</p>
        <button onClick={handleReset} style={{ padding: '8px 16px', background: 'var(--red)', color: 'white', border: 'none', borderRadius: 2, cursor: 'pointer', fontWeight: 600, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}><Trash2 size={14} /> Reset All Data</button>
      </div>
    </div>
  );
}
