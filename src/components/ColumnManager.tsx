import { useState } from 'react';
import { useStore } from '../store';
import type { CustomColumn } from '../types';
import { Plus, X, Edit2, Columns, GripVertical } from 'lucide-react';

interface Props {
  table: string;
  defaultColumns: { key: string; label: string; width: number; editable: boolean; type: string; options?: string[] }[];
  visibleCols: string[];
  onVisibleColsChange: (cols: string[]) => void;
}

export default function ColumnManager({ table, defaultColumns, visibleCols, onVisibleColsChange }: Props) {
  const { customColumns, addCustomColumn, updateCustomColumn, removeCustomColumn } = useStore();
  const [open, setOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ key: '', label: '', width: 120, type: 'text' as string, options: '', editable: true });

  const extras = customColumns.filter(c => c.table === table);
  const allCols = [...defaultColumns.map(d => ({ ...d, isDefault: true, id: d.key })), ...extras.map(e => ({ ...e, isDefault: false }))];

  const saveColumn = () => {
    if (!form.label) return;
    const key = form.key || form.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const col: Omit<CustomColumn, 'id'> = { key, label: form.label, width: form.width, type: form.type as any, options: form.type === 'select' ? form.options.split(',').map(o => o.trim()).filter(Boolean) : undefined, table, editable: form.editable };
    if (editId) { updateCustomColumn(editId, col); setEditId(null); }
    else {
      const newId = addCustomColumn(col);
      onVisibleColsChange([...visibleCols, key]);
    }
    setForm({ key: '', label: '', width: 120, type: 'text', options: '', editable: true });
    setShowAdd(false);
  };

  const startEdit = (col: CustomColumn) => {
    setForm({ key: col.key, label: col.label, width: col.width, type: col.type, options: col.options?.join(', ') || '', editable: col.editable });
    setEditId(col.id); setShowAdd(true);
  };

  const deleteCol = (col: CustomColumn) => {
    removeCustomColumn(col.id);
    onVisibleColsChange(visibleCols.filter(k => k !== col.key));
  };

  return (
    <div style={{ position: 'relative' }}>
      <button className="btn-secondary" onClick={() => setOpen(!open)}><Columns size={14} /> Columns</button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 4, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 2, padding: 12, zIndex: 50, width: 320, maxHeight: 440, overflow: 'auto', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)' }}>Columns</span>
            <button onClick={() => { setShowAdd(!showAdd); setEditId(null); setForm({ key: '', label: '', width: 120, type: 'text', options: '', editable: true }); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--blue)', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}><Plus size={12} />New Column</button>
          </div>

          {showAdd && (
            <div style={{ padding: 10, border: '1px solid var(--border)', borderRadius: 2, marginBottom: 8, background: 'var(--bg-2)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <div><label style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-3)' }}>LABEL</label><input value={form.label} onChange={e => setForm(p => ({...p, label: e.target.value}))} style={{ width: '100%', fontSize: 11, padding: '4px 6px' }} /></div>
                <div><label style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-3)' }}>TYPE</label><select value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))} style={{ width: '100%', fontSize: 11, padding: '4px 6px' }}><option value="text">Text</option><option value="number">Number</option><option value="date">Date</option><option value="url">URL</option><option value="select">Dropdown</option></select></div>
              </div>
              {form.type === 'select' && <div style={{ marginTop: 6 }}><label style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-3)' }}>OPTIONS (comma-separated)</label><input value={form.options} onChange={e => setForm(p => ({...p, options: e.target.value}))} style={{ width: '100%', fontSize: 11, padding: '4px 6px' }} placeholder="Option 1, Option 2..." /></div>}
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <button onClick={saveColumn} style={{ fontSize: 10, padding: '4px 10px', background: 'var(--text)', color: 'var(--bg)', border: 'none', borderRadius: 2, cursor: 'pointer', fontWeight: 600 }}>{editId ? 'Save' : 'Add'}</button>
                <button onClick={() => { setShowAdd(false); setEditId(null); }} style={{ fontSize: 10, padding: '4px 10px', background: 'var(--bg-3)', border: 'none', borderRadius: 2, cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          )}

          {/* Default columns */}
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 4 }}>Default Columns</div>
          {defaultColumns.map(col => (
            <label key={col.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 12, cursor: 'pointer' }}>
              <input type="checkbox" checked={visibleCols.includes(col.key)} onChange={() => onVisibleColsChange(visibleCols.includes(col.key) ? visibleCols.filter(k => k !== col.key) : [...visibleCols, col.key])} />
              {col.label}
            </label>
          ))}

          {/* Custom columns */}
          {extras.length > 0 && (
            <>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', marginTop: 8, marginBottom: 4 }}>Custom Columns</div>
              {extras.map(col => (
                <div key={col.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>
                  <input type="checkbox" checked={visibleCols.includes(col.key)} onChange={() => onVisibleColsChange(visibleCols.includes(col.key) ? visibleCols.filter(k => k !== col.key) : [...visibleCols, col.key])} />
                  <span style={{ fontSize: 12, flex: 1 }}>{col.label}</span>
                  <span style={{ fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase' }}>{col.type}</span>
                  <button onClick={() => startEdit(col)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 2 }}><Edit2 size={10} /></button>
                  <button onClick={() => deleteCol(col)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: 2 }}><X size={10} /></button>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
