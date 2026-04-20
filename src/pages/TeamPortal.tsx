import { useState } from 'react';
import { useStore } from '../store';
import { MODULES } from '../types';
import type { AccessLevel } from '../types';
import { Shield, Lock, Users, Wand2, Eye, Edit2, Crown } from 'lucide-react';

const ACCESS_LEVELS: { key: AccessLevel; label: string; color: string }[] = [
  { key: 'full', label: 'Full', color: 'var(--green)' },
  { key: 'edit', label: 'Edit', color: 'var(--blue)' },
  { key: 'view', label: 'View', color: 'var(--text-3)' },
  { key: 'none', label: 'None', color: 'var(--red)' },
];

const ROLE_DEFAULTS: Record<string, Record<string, AccessLevel>> = {
  admin: Object.fromEntries(MODULES.map(m => [m.key, 'full'])),
  principal: Object.fromEntries(MODULES.map(m => [m.key, m.key === 'settings' || m.key === 'teamPortal' ? 'view' : 'full'])),
  partner: Object.fromEntries(MODULES.map(m => [m.key, m.key === 'settings' || m.key === 'teamPortal' ? 'none' : 'full'])),
  associate: Object.fromEntries(MODULES.map(m => [m.key, ['settings', 'teamPortal'].includes(m.key) ? 'none' : ['importExport'].includes(m.key) ? 'view' : 'edit'])),
  analyst: Object.fromEntries(MODULES.map(m => [m.key, ['settings', 'teamPortal', 'importExport'].includes(m.key) ? 'none' : ['companies', 'brokers', 'tasks', 'research'].includes(m.key) ? 'edit' : 'view'])),
  intern: Object.fromEntries(MODULES.map(m => [m.key, ['settings', 'teamPortal', 'importExport', 'chat'].includes(m.key) ? 'none' : 'view'])),
  advisor: Object.fromEntries(MODULES.map(m => [m.key, ['dashboard', 'companies', 'research', 'kpis'].includes(m.key) ? 'view' : 'none'])),
};

export default function TeamPortal() {
  const { team, userAccess, setUserAccess, adminPassword } = useStore();
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [pwErr, setPwErr] = useState(false);

  const tryAuth = () => {
    if (pw === adminPassword) { setAuthed(true); setPwErr(false); }
    else setPwErr(true);
  };

  if (!authed) {
    return (
      <div style={{ padding: '32px 40px', maxWidth: 400 }}>
        <div className="page-header"><h1>Team Portal</h1><p>Admin access required</p></div>
        <div className="card" style={{ padding: 24, textAlign: 'center' }}>
          <Lock size={28} style={{ color: 'var(--text-3)', marginBottom: 12 }} />
          <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 16 }}>Enter admin password to manage team access.</p>
          <input type="password" value={pw} onChange={e => { setPw(e.target.value); setPwErr(false); }} onKeyDown={e => e.key === 'Enter' && tryAuth()} placeholder="Admin password..." style={{ width: '100%', marginBottom: 8 }} />
          {pwErr && <p style={{ fontSize: 11, color: 'var(--red)', marginBottom: 8 }}>Incorrect password.</p>}
          <button className="btn-primary" onClick={tryAuth} style={{ width: '100%' }}>Unlock</button>
        </div>
      </div>
    );
  }

  const activeTeam = team.filter(m => m.status === 'active');

  const getModules = (userId: string) => {
    const ua = userAccess.find(u => u.userId === userId);
    return ua?.modules || {};
  };

  const setLevel = (userId: string, module: string, level: AccessLevel) => {
    const current = { ...getModules(userId) };
    current[module] = level;
    setUserAccess(userId, current);
  };

  const autoAssign = (userId: string) => {
    const member = team.find(t => t.id === userId);
    if (!member) return;
    const defaults = ROLE_DEFAULTS[member.role] || ROLE_DEFAULTS['analyst'];
    setUserAccess(userId, { ...defaults });
  };

  const autoAssignAll = () => { activeTeam.forEach(m => autoAssign(m.id)); };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1200 }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div><h1>Team Portal</h1><p>Manage access levels for {activeTeam.length} team members</p></div>
        <button className="btn-primary" onClick={autoAssignAll}><Wand2 size={14} /> Auto-assign All</button>
      </div>

      {activeTeam.length === 0 ? (
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <Users size={28} style={{ color: 'var(--text-3)', marginBottom: 8 }} />
          <p style={{ fontSize: 13, color: 'var(--text-2)' }}>Add team members first to manage their access.</p>
        </div>
      ) : (
        <div className="data-table-wrap" style={{ overflow: 'auto' }}>
          <table className="data-table" style={{ minWidth: 900 }}>
            <thead>
              <tr>
                <th style={{ width: 180, position: 'sticky', left: 0, background: 'var(--surface)', zIndex: 2 }}>Member</th>
                <th style={{ width: 100 }}>Role</th>
                {MODULES.map(m => <th key={m.key} style={{ width: 80, textAlign: 'center', fontSize: 10 }}>{m.label}</th>)}
                <th style={{ width: 50 }}>Auto</th>
              </tr>
            </thead>
            <tbody>
              {activeTeam.map(member => {
                const mods = getModules(member.id);
                const isAdmin = member.role === 'admin';
                return (
                  <tr key={member.id}>
                    <td style={{ position: 'sticky', left: 0, background: 'var(--surface)', zIndex: 1, fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {isAdmin && <Crown size={12} style={{ color: 'var(--gold)' }} />}
                        {member.name}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 400 }}>{member.email}</div>
                    </td>
                    <td><span className="badge" style={{ background: isAdmin ? 'var(--gold-light)' : 'var(--bg-2)', color: isAdmin ? 'var(--gold)' : 'var(--text-2)' }}>{member.role}</span></td>
                    {MODULES.map(m => {
                      const level = isAdmin ? 'full' : (mods[m.key] || 'none');
                      const meta = ACCESS_LEVELS.find(a => a.key === level)!;
                      return (
                        <td key={m.key} style={{ textAlign: 'center' }}>
                          {isAdmin ? (
                            <span style={{ fontSize: 10, color: 'var(--green)', fontWeight: 700 }}>FULL</span>
                          ) : (
                            <select value={level} onChange={e => setLevel(member.id, m.key, e.target.value as AccessLevel)} style={{ fontSize: 10, padding: '2px 4px', width: 60, textAlign: 'center', color: meta.color, fontWeight: 600, border: `1px solid ${meta.color}30`, borderRadius: 2, background: 'transparent' }}>
                              {ACCESS_LEVELS.map(a => <option key={a.key} value={a.key}>{a.label}</option>)}
                            </select>
                          )}
                        </td>
                      );
                    })}
                    <td style={{ textAlign: 'center' }}>
                      {!isAdmin && <button onClick={() => autoAssign(member.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4 }} title="Auto-assign based on role"><Wand2 size={14} /></button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      <div style={{ marginTop: 20, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {ACCESS_LEVELS.map(a => (
          <div key={a.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: a.color }} />
            <strong>{a.label}</strong> - {a.key === 'full' ? 'All permissions' : a.key === 'edit' ? 'View + modify data' : a.key === 'view' ? 'Read-only' : 'No access'}
          </div>
        ))}
      </div>

      {/* Credentials */}
      <div className="card" style={{ padding: 16, marginTop: 20 }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Access Credentials</h3>
        <div style={{ fontSize: 11, color: 'var(--text-2)' }}>
          <p>Admin password: <code style={{ background: 'var(--bg-2)', padding: '2px 6px', borderRadius: 2 }}>{adminPassword}</code></p>
          <p style={{ marginTop: 4, color: 'var(--text-3)' }}>Change in Settings (admin only).</p>
        </div>
      </div>
    </div>
  );
}
