import { useState } from 'react';
import { useStore } from '../store';
import { Plus, X, Edit2, Star, Building2, Mail, Phone, Globe } from 'lucide-react';

export default function Brokers() {
  const { brokers, addBroker, updateBroker, removeBroker, companies } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', firm: '', email: '', phone: '', website: '', specialty: '', geography: '', notes: '', qualityRating: 3 });
  const [search, setSearch] = useState('');

  const filtered = brokers.filter(b => {
    if (!search) return true;
    const q = search.toLowerCase();
    return b.name.toLowerCase().includes(q) || b.firm.toLowerCase().includes(q) || b.specialty.toLowerCase().includes(q);
  });

  const handleSave = () => {
    if (!form.name && !form.firm) return;
    if (editId) { updateBroker(editId, form); setEditId(null); }
    else { addBroker(form); }
    setForm({ name: '', firm: '', email: '', phone: '', website: '', specialty: '', geography: '', notes: '', qualityRating: 3 });
    setShowAdd(false);
  };

  const startEdit = (b: typeof brokers[0]) => {
    setForm({ name: b.name, firm: b.firm, email: b.email, phone: b.phone, website: b.website, specialty: b.specialty, geography: b.geography, notes: b.notes, qualityRating: b.qualityRating });
    setEditId(b.id);
    setShowAdd(true);
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100 }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div><h1>Brokers</h1><p>{brokers.length} broker relationships</p></div>
        <button className="btn-primary" onClick={() => { setShowAdd(!showAdd); setEditId(null); setForm({ name: '', firm: '', email: '', phone: '', website: '', specialty: '', geography: '', notes: '', qualityRating: 3 }); }}><Plus size={14} /> Add Broker</button>
      </div>

      {/* Add/Edit form */}
      {showAdd && (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>{editId ? 'Edit Broker' : 'New Broker'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <Fl label="Contact Name"><input value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} style={{ width: '100%' }} /></Fl>
            <Fl label="Firm"><input value={form.firm} onChange={e => setForm(p => ({...p, firm: e.target.value}))} style={{ width: '100%' }} /></Fl>
            <Fl label="Specialty"><input value={form.specialty} onChange={e => setForm(p => ({...p, specialty: e.target.value}))} style={{ width: '100%' }} placeholder="e.g. Industrial Services" /></Fl>
            <Fl label="Email"><input value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} style={{ width: '100%' }} /></Fl>
            <Fl label="Phone"><input value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} style={{ width: '100%' }} /></Fl>
            <Fl label="Website"><input value={form.website} onChange={e => setForm(p => ({...p, website: e.target.value}))} style={{ width: '100%' }} /></Fl>
            <Fl label="Geography"><input value={form.geography} onChange={e => setForm(p => ({...p, geography: e.target.value}))} style={{ width: '100%' }} /></Fl>
            <Fl label="Quality (1-5)"><input type="number" min={1} max={5} value={form.qualityRating} onChange={e => setForm(p => ({...p, qualityRating: Number(e.target.value)}))} style={{ width: '100%' }} /></Fl>
            <Fl label="Notes"><input value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} style={{ width: '100%' }} /></Fl>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button className="btn-primary" onClick={handleSave}>{editId ? 'Save' : 'Add Broker'}</button>
            <button className="btn-secondary" onClick={() => { setShowAdd(false); setEditId(null); }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Search */}
      {brokers.length > 0 && (
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search brokers..." style={{ width: '100%', marginBottom: 16 }} />
      )}

      {filtered.length === 0 && brokers.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 8 }}>No brokers yet</p>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Add brokers and corporate finance advisors who send you deals.</p>
        </div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr>
              <th>Contact / Firm</th><th>Specialty</th><th>Geography</th><th>Quality</th><th>Deals</th><th>Contact</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(b => {
                const dealCount = companies.filter(c => c.brokerId === b.id).length;
                return (
                  <tr key={b.id}>
                    <td><div style={{ fontWeight: 600 }}>{b.name || '-'}</div><div style={{ fontSize: 11, color: 'var(--text-3)' }}>{b.firm}</div></td>
                    <td style={{ fontSize: 12 }}>{b.specialty || '-'}</td>
                    <td style={{ fontSize: 12 }}>{b.geography || '-'}</td>
                    <td>{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} fill={i < b.qualityRating ? 'var(--gold)' : 'none'} stroke={i < b.qualityRating ? 'var(--gold)' : 'var(--border)'} style={{ marginRight: 1 }} />)}</td>
                    <td><span style={{ fontWeight: 600 }}>{dealCount}</span></td>
                    <td style={{ fontSize: 11 }}>
                      {b.email && <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={10} />{b.email}</div>}
                      {b.phone && <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={10} />{b.phone}</div>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => startEdit(b)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4 }}><Edit2 size={14} /></button>
                        <button onClick={() => removeBroker(b.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: 4 }}><X size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Fl({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', display: 'block', marginBottom: 4, letterSpacing: '0.06em' }}>{label}</label>{children}</div>;
}
