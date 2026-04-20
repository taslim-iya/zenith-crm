import { useState } from 'react';
import { useStore } from '../store';
import type { TeamRole } from '../types';
import { Plus, X, Edit2, Check, Building2, CheckSquare, Clock } from 'lucide-react';

const ROLES: TeamRole[] = ['principal', 'partner', 'associate', 'analyst', 'intern', 'advisor', 'custom'];
const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  principal: { bg: 'var(--gold-light)', text: 'var(--gold)' },
  partner: { bg: 'var(--blue-light)', text: 'var(--blue)' },
  associate: { bg: 'var(--green-light)', text: 'var(--green)' },
  analyst: { bg: 'var(--orange-light)', text: 'var(--orange)' },
  intern: { bg: 'var(--bg-3)', text: 'var(--text-3)' },
  advisor: { bg: '#8b5cf612', text: '#8b5cf6' },
  custom: { bg: 'var(--bg-3)', text: 'var(--text-2)' },
};

export default function Team() {
  const { team, addTeamMember, updateTeamMember, removeTeamMember, companies, tasks, activities, currentUserId, setCurrentUser } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', title: '', role: 'analyst' as TeamRole, email: '', phone: '', notes: '' });
  const today = new Date().toISOString().split('T')[0];

  const handleAdd = () => {
    if (!form.name) return;
    addTeamMember(form);
    setForm({ name: '', title: '', role: 'analyst', email: '', phone: '', notes: '' });
    setShowAdd(false);
  };

  const handleEdit = (id: string) => {
    updateTeamMember(id, form);
    setEditId(null);
  };

  const startEdit = (m: typeof team[0]) => {
    setForm({ name: m.name, title: m.title, role: m.role, email: m.email, phone: m.phone, notes: m.notes });
    setEditId(m.id);
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100 }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div><h1>Team</h1><p>{team.length} members</p></div>
        <button className="btn-primary" onClick={() => { setShowAdd(!showAdd); setEditId(null); }}><Plus size={14} /> Add Member</button>
      </div>

      {/* Active user selector */}
      {team.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: '10px 14px', background: 'var(--bg-2)', borderRadius: 2, border: '1px solid var(--border)' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Working as:</span>
          <select value={currentUserId} onChange={e => setCurrentUser(e.target.value)} style={{ fontSize: 12, padding: '4px 10px', fontWeight: 600 }}>
            <option value="">Select yourself...</option>
            {team.map(m => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
          </select>
          <span style={{ fontSize: 10, color: 'var(--text-3)' }}>Actions will be tracked under this name</span>
        </div>
      )}

      {/* Add/Edit form */}
      {(showAdd || editId) && (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>{editId ? 'Edit Member' : 'New Team Member'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Fl label="Name"><input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} style={{ width: '100%' }} placeholder="Full name" /></Fl>
            <Fl label="Title"><input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} style={{ width: '100%' }} placeholder="e.g. Associate" /></Fl>
            <Fl label="Role"><select value={form.role} onChange={e => setForm(p => ({...p, role: e.target.value as TeamRole}))} style={{ width: '100%' }}>{ROLES.map(r => <option key={r} value={r}>{r}</option>)}</select></Fl>
            <Fl label="Email"><input value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} style={{ width: '100%' }} placeholder="email@example.com" /></Fl>
            <Fl label="Phone"><input value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} style={{ width: '100%' }} /></Fl>
            <Fl label="Notes"><input value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} style={{ width: '100%' }} /></Fl>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button className="btn-primary" onClick={() => editId ? handleEdit(editId) : handleAdd()}>{editId ? 'Save' : 'Add'}</button>
            <button className="btn-secondary" onClick={() => { setShowAdd(false); setEditId(null); }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Team cards */}
      {team.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 8 }}>No team members yet</p>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Add your first team member to start tracking who does what.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {team.map(m => {
            const assigned = companies.filter(c => c.ownerId === m.id);
            const empTasks = tasks.filter(t => t.assigneeId === m.id);
            const overdue = empTasks.filter(t => t.status !== 'done' && t.dueDate && t.dueDate < today).length;
            const completed = empTasks.filter(t => t.status === 'done').length;
            const recentActivity = activities.filter(a => a.userId === m.id).slice(0, 3);
            const rc = ROLE_COLORS[m.role] || ROLE_COLORS.custom;

            return (
              <div key={m.id} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, flexShrink: 0 }}>{m.name.split(' ').map(n => n[0]).join('').slice(0,2)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{m.title || m.role}</div>
                  </div>
                  <span className="badge" style={{ background: rc.bg, color: rc.text }}>{m.role}</span>
                </div>

                {m.email && <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4 }}>{m.email}</div>}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
                  <div style={{ textAlign: 'center' }}><Building2 size={12} style={{ color: 'var(--text-3)' }} /><div style={{ fontSize: 16, fontWeight: 700 }}>{assigned.length}</div><div style={{ fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase' }}>Companies</div></div>
                  <div style={{ textAlign: 'center' }}><CheckSquare size={12} style={{ color: 'var(--text-3)' }} /><div style={{ fontSize: 16, fontWeight: 700 }}>{completed}</div><div style={{ fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase' }}>Done</div></div>
                  <div style={{ textAlign: 'center' }}><Clock size={12} style={{ color: overdue > 0 ? 'var(--red)' : 'var(--text-3)' }} /><div style={{ fontSize: 16, fontWeight: 700, color: overdue > 0 ? 'var(--red)' : undefined }}>{overdue}</div><div style={{ fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase' }}>Overdue</div></div>
                </div>

                {/* Recent activity */}
                {recentActivity.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 8 }}>
                    <div style={{ fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4, fontWeight: 600 }}>Recent Activity</div>
                    {recentActivity.map(a => (
                      <div key={a.id} style={{ fontSize: 11, color: 'var(--text-2)', padding: '2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.description}</div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button className="btn-secondary" onClick={() => startEdit(m)} style={{ flex: 1 }}><Edit2 size={12} /> Edit</button>
                  <button className="btn-secondary" onClick={() => removeTeamMember(m.id)} style={{ color: 'var(--red)', borderColor: 'var(--red)' }}><X size={12} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Fl({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', display: 'block', marginBottom: 4, letterSpacing: '0.06em' }}>{label}</label>{children}</div>;
}
