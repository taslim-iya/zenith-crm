import { useState, useMemo, useRef } from 'react';
import { useStore } from '../store';
import { DEFAULT_BROKER_COLUMNS } from '../types';
import ColumnManager from '../components/ColumnManager';
import { Plus, X, Edit2, Star, Search, ArrowUpDown, Eye } from 'lucide-react';

export default function Brokers() {
  const { brokers, addBroker, updateBroker, removeBroker, companies, customColumns } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', firm: '', email: '', phone: '', website: '', specialty: '', geography: '', notes: '', qualityRating: 3 });
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [visibleCols, setVisibleCols] = useState<string[]>(DEFAULT_BROKER_COLUMNS.map(c => c.key));
  const [editCell, setEditCell] = useState<{ id: string; key: string } | null>(null);
  const [editVal, setEditVal] = useState('');
  const [colWidths, setColWidths] = useState<Record<string, number>>({});
  const resizeRef = useRef<{ key: string; startX: number; startW: number } | null>(null);

  const extraCols = customColumns.filter(c => c.table === 'brokers');
  const allColumns = [...DEFAULT_BROKER_COLUMNS, ...extraCols.map(c => ({ key: c.key, label: c.label, width: c.width, editable: c.editable, type: c.type, options: c.options }))];

  const filtered = useMemo(() => {
    let list = [...brokers];
    if (search) { const q = search.toLowerCase(); list = list.filter(b => b.name.toLowerCase().includes(q) || b.firm.toLowerCase().includes(q) || b.specialty.toLowerCase().includes(q) || b.geography.toLowerCase().includes(q)); }
    list.sort((a, b) => {
      const av = (a as any)[sortBy]; const bv = (b as any)[sortBy];
      if (typeof av === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc' ? String(av || '').localeCompare(String(bv || '')) : String(bv || '').localeCompare(String(av || ''));
    });
    return list;
  }, [brokers, search, sortBy, sortDir]);

  const toggleSort = (col: string) => { if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortBy(col); setSortDir('asc'); } };

  const handleSave = () => {
    if (!form.name && !form.firm) return;
    if (editId) { updateBroker(editId, form); setEditId(null); }
    else { addBroker(form); }
    setForm({ name: '', firm: '', email: '', phone: '', website: '', specialty: '', geography: '', notes: '', qualityRating: 3 });
    setShowAdd(false);
  };

  const startEdit = (b: typeof brokers[0]) => {
    setForm({ name: b.name, firm: b.firm, email: b.email, phone: b.phone, website: b.website, specialty: b.specialty, geography: b.geography, notes: b.notes, qualityRating: b.qualityRating });
    setEditId(b.id); setShowAdd(true);
  };

  const startCellEdit = (brokerId: string, key: string, value: any) => { setEditCell({ id: brokerId, key }); setEditVal(String(value ?? '')); };
  const saveCellEdit = () => { if (!editCell) return; const col = allColumns.find(c => c.key === editCell.key); let val: any = editVal; if (col?.type === 'number') val = Number(editVal) || 0; updateBroker(editCell.id, { [editCell.key]: val }); setEditCell(null); };
  const handleCellKey = (e: React.KeyboardEvent) => { if (e.key === 'Enter') saveCellEdit(); if (e.key === 'Escape') setEditCell(null); };

  const onMouseDown = (key: string, e: React.MouseEvent) => {
    e.preventDefault();
    const col = allColumns.find(c => c.key === key);
    resizeRef.current = { key, startX: e.clientX, startW: colWidths[key] || col?.width || 120 };
    const onMove = (ev: MouseEvent) => { if (!resizeRef.current) return; setColWidths(prev => ({ ...prev, [resizeRef.current!.key]: Math.max(50, resizeRef.current!.startW + (ev.clientX - resizeRef.current!.startX)) })); };
    const onUp = () => { resizeRef.current = null; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp);
  };

  const renderCell = (broker: typeof brokers[0], colKey: string) => {
    const col = allColumns.find(c => c.key === colKey);
    const val = (broker as any)[colKey];
    const isEditing = editCell?.id === broker.id && editCell?.key === colKey;

    if (isEditing && col?.editable) {
      if (col.type === 'select') return <select value={editVal} onChange={e => setEditVal(e.target.value)} onBlur={saveCellEdit} autoFocus style={{ width: '100%', fontSize: 12, padding: '2px 4px', border: '2px solid var(--blue)', borderRadius: 2 }}>{(col.options || []).map((o: string) => <option key={o} value={o}>{o}</option>)}</select>;
      return <input value={editVal} onChange={e => setEditVal(e.target.value)} onBlur={saveCellEdit} onKeyDown={handleCellKey} autoFocus type={col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text'} style={{ width: '100%', fontSize: 12, padding: '2px 4px', border: '2px solid var(--blue)', borderRadius: 2 }} />;
    }

    if (colKey === 'qualityRating') return <span>{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} fill={i < val ? 'var(--gold)' : 'none'} stroke={i < val ? 'var(--gold)' : 'var(--border)'} style={{ marginRight: 1 }} />)}</span>;
    if ((colKey === 'website' || col?.type === 'url') && val) return <a href={val.startsWith('http') ? val : `https://${val}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'var(--blue)', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>{String(val).replace(/^https?:\/\//, '').slice(0, 30)}</a>;
    if (colKey === 'name') return <div><span style={{ fontWeight: 600 }}>{val || '-'}</span></div>;
    if (colKey === 'firm') return <span style={{ fontSize: 12 }}>{val || '-'}</span>;
    return <span style={{ fontSize: 12, color: val ? 'var(--text)' : 'var(--text-3)' }}>{val || '-'}</span>;
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1200 }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div><h1>Brokers</h1><p>{brokers.length} broker relationships</p></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <ColumnManager table="brokers" defaultColumns={DEFAULT_BROKER_COLUMNS} visibleCols={visibleCols} onVisibleColsChange={setVisibleCols} />
          <button className="btn-primary" onClick={() => { setShowAdd(!showAdd); setEditId(null); setForm({ name: '', firm: '', email: '', phone: '', website: '', specialty: '', geography: '', notes: '', qualityRating: 3 }); }}><Plus size={14} /> Add Broker</button>
        </div>
      </div>

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

      {brokers.length > 0 && (
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-3)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search brokers..." style={{ paddingLeft: 30, width: '100%' }} />
        </div>
      )}

      {filtered.length === 0 && brokers.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 8 }}>No brokers yet</p>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Add brokers and corporate finance advisors who send you deals.</p>
        </div>
      ) : (
        <div className="data-table-wrap" style={{ maxHeight: 'calc(100vh - 280px)', overflow: 'auto' }}>
          <table className="data-table" style={{ tableLayout: 'fixed' }}>
            <thead><tr>
              {visibleCols.map(key => {
                const col = allColumns.find(c => c.key === key);
                if (!col) return null;
                const w = colWidths[key] || col.width;
                return (
                  <th key={key} style={{ width: w, position: 'relative', cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort(key)}>
                    <span>{col.label}</span>
                    {sortBy === key && <ArrowUpDown size={10} style={{ marginLeft: 4 }} />}
                    <div onMouseDown={e => { e.stopPropagation(); onMouseDown(key, e); }} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 4, cursor: 'col-resize' }} />
                  </th>
                );
              })}
              <th style={{ width: 50 }}>Deals</th>
              <th style={{ width: 60 }}>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(b => {
                const dealCount = companies.filter(c => c.brokerId === b.id).length;
                return (
                  <tr key={b.id}>
                    {visibleCols.map(key => {
                      const col = allColumns.find(cl => cl.key === key);
                      return (
                        <td key={key} onDoubleClick={() => col?.editable && startCellEdit(b.id, key, (b as any)[key])} style={{ cursor: col?.editable ? 'cell' : 'default', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {renderCell(b, key)}
                        </td>
                      );
                    })}
                    <td><span style={{ fontWeight: 600 }}>{dealCount}</span></td>
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
