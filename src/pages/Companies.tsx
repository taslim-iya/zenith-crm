import { useState, useMemo, useCallback, useRef } from 'react';
import { useStore } from '../store';
import { STAGES, SECTORS, GEOGRAPHIES, DEFAULT_COMPANY_COLUMNS } from '../types';
import type { PipelineStage, Priority, Company } from '../types';
import { useNavigate } from 'react-router-dom';
import ColumnManager from '../components/ColumnManager';
import { Search, Plus, ArrowUpDown, LayoutGrid, List, X, ChevronDown, Filter, Trash2, Eye, Columns } from 'lucide-react';

const PRIORITY_COLORS: Record<Priority, { bg: string; text: string }> = {
  critical: { bg: 'var(--red-light)', text: 'var(--red)' },
  high: { bg: 'var(--orange-light)', text: 'var(--orange)' },
  medium: { bg: 'var(--yellow-light)', text: 'var(--yellow)' },
  low: { bg: 'var(--bg-3)', text: 'var(--text-3)' },
};

export default function Companies() {
  const { companies, team, brokers, updateCompany, deleteCompany, addCompany, customColumns } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [sectorModal, setSectorModal] = useState<{ companyId: string; sector: string; subSector: string; customSector: string; sicCodes: string } | null>(null);
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('updatedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [view, setView] = useState<'list' | 'board'>('list');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editCell, setEditCell] = useState<{ id: string; key: string } | null>(null);
  const [editVal, setEditVal] = useState<string>('');
  const [visibleCols, setVisibleCols] = useState<string[]>(DEFAULT_COMPANY_COLUMNS.slice(0, 12).map(c => c.key));
  const [showColPicker, setShowColPicker] = useState(false);
  const [colWidths, setColWidths] = useState<Record<string, number>>({});
  const resizeRef = useRef<{ key: string; startX: number; startW: number } | null>(null);

  const filtered = useMemo(() => {
    let list = companies.filter(c => c.status !== 'passed' || stageFilter === 'passed');
    if (search) { const q = search.toLowerCase(); list = list.filter(c => c.name.toLowerCase().includes(q) || c.sector.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.tags.some(t => t.toLowerCase().includes(q)) || c.source.toLowerCase().includes(q)); }
    if (stageFilter !== 'all') list = list.filter(c => c.stage === stageFilter);
    if (sectorFilter !== 'all') list = list.filter(c => c.sector === sectorFilter);
    if (priorityFilter !== 'all') list = list.filter(c => c.priority === priorityFilter);
    if (ownerFilter !== 'all') list = list.filter(c => c.ownerId === ownerFilter);
    list.sort((a, b) => {
      const av = (a as any)[sortBy]; const bv = (b as any)[sortBy];
      if (typeof av === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc' ? String(av || '').localeCompare(String(bv || '')) : String(bv || '').localeCompare(String(av || ''));
    });
    return list;
  }, [companies, search, stageFilter, sectorFilter, priorityFilter, ownerFilter, sortBy, sortDir]);

  const toggleSort = (col: string) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const fmt = (n: number) => n >= 1e6 ? `\u00A3${(n/1e6).toFixed(1)}m` : n >= 1e3 ? `\u00A3${(n/1e3).toFixed(0)}k` : n > 0 ? `\u00A3${n}` : '-';

  const startEdit = (companyId: string, key: string, value: any) => {
    setEditCell({ id: companyId, key });
    setEditVal(String(value ?? ''));
  };

  const saveEdit = () => {
    if (!editCell) return;
    const col = DEFAULT_COMPANY_COLUMNS.find(c => c.key === editCell.key);
    let val: any = editVal;
    if (col?.type === 'number') val = Number(editVal) || 0;
    // When sector changes, open the industry details modal
    if (editCell.key === 'sector') {
      const comp = companies.find(c => c.id === editCell.id);
      updateCompany(editCell.id, { sector: val });
      setSectorModal({ companyId: editCell.id, sector: val, subSector: comp?.subSector || '', customSector: val === 'Other' ? (comp?.customSector || '') : '', sicCodes: comp?.sicCodes || '' });
      setEditCell(null);
      return;
    }
    updateCompany(editCell.id, { [editCell.key]: val });
    setEditCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') setEditCell(null);
    if (e.key === 'Tab') { e.preventDefault(); saveEdit(); }
  };

  // Column resize
  const onMouseDown = (key: string, e: React.MouseEvent) => {
    e.preventDefault();
    const col = DEFAULT_COMPANY_COLUMNS.find(c => c.key === key);
    resizeRef.current = { key, startX: e.clientX, startW: colWidths[key] || col?.width || 120 };
    const onMove = (ev: MouseEvent) => {
      if (!resizeRef.current) return;
      const diff = ev.clientX - resizeRef.current.startX;
      setColWidths(prev => ({ ...prev, [resizeRef.current!.key]: Math.max(50, resizeRef.current!.startW + diff) }));
    };
    const onUp = () => { resizeRef.current = null; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const addNew = () => {
    const newId = addCompany({ name: 'New Company' });
    navigate(`/companies/${newId}`);
  };

  const extraCols = customColumns.filter(c => c.table === 'companies');
  const allColumns = [...DEFAULT_COMPANY_COLUMNS, ...extraCols.map(c => ({ key: c.key, label: c.label, width: c.width, editable: c.editable, type: c.type, options: c.options }))];

  const renderCell = (company: Company, colKey: string) => {
    const col = allColumns.find(c => c.key === colKey);
    const val = (company as any)[colKey];
    const isEditing = editCell?.id === company.id && editCell?.key === colKey;

    if (isEditing && col?.editable) {
      if (col.type === 'select') {
        return <select value={editVal} onChange={e => { setEditVal(e.target.value); }} onBlur={saveEdit} autoFocus style={{ width: '100%', fontSize: 12, padding: '2px 4px', border: '2px solid var(--blue)', borderRadius: 2, background: 'var(--surface)' }}>
          {(col.options || []).map((o: string) => <option key={o} value={o}>{colKey === 'stage' ? STAGES.find(s => s.key === o)?.label || o : o}</option>)}
        </select>;
      }
      return <input value={editVal} onChange={e => setEditVal(e.target.value)} onBlur={saveEdit} onKeyDown={handleKeyDown} autoFocus
        type={col.type === 'number' ? 'number' : col.type === 'date' ? 'date' : 'text'}
        style={{ width: '100%', fontSize: 12, padding: '2px 4px', border: '2px solid var(--blue)', borderRadius: 2, background: 'var(--surface)' }} />;
    }

    // Display
    if (colKey === 'name') return <div style={{ fontWeight: 600, cursor: 'pointer' }} onClick={() => navigate(`/companies/${company.id}`)}>{val || '-'}</div>;
    if (colKey === 'stage') { const si = STAGES.find(s => s.key === val); return <span className="badge" style={{ background: `${si?.color}18`, color: si?.color, cursor: col?.editable ? 'pointer' : undefined }} onClick={() => col?.editable && startEdit(company.id, colKey, val)}>{si?.label || val}</span>; }
    if (colKey === 'priority') { const pc = PRIORITY_COLORS[val as Priority]; return pc ? <span className="badge" style={{ background: pc.bg, color: pc.text, cursor: 'pointer' }} onClick={() => startEdit(company.id, colKey, val)}>{val}</span> : <span>{val}</span>; }
    if (colKey === 'sector') {
      const label = val === 'Other' && company.customSector ? `Other: ${company.customSector}` : val || '-';
      const sub = company.subSector ? ` / ${company.subSector}` : '';
      const sic = company.sicCodes ? ` [${company.sicCodes}]` : '';
      return <span style={{ fontSize: 12, cursor: 'pointer' }} onClick={() => setSectorModal({ companyId: company.id, sector: val || '', subSector: company.subSector || '', customSector: company.customSector || '', sicCodes: company.sicCodes || '' })} title={`Click to edit industry details${sic}`}><span>{label}</span>{sub && <span style={{ color: 'var(--text-3)', fontSize: 10 }}>{sub}</span>}{sic && <span style={{ color: 'var(--blue)', fontSize: 9, fontFamily: 'monospace' }}> {sic}</span>}</span>;
    }
    if (colKey === 'thesisFitScore') return <span style={{ fontWeight: 700, color: val >= 8 ? 'var(--green)' : val >= 6 ? 'var(--yellow)' : val > 0 ? 'var(--text-3)' : undefined }}>{val > 0 ? `${val}/10` : '-'}</span>;
    if (['revenue', 'ebitda', 'estimatedDealSize'].includes(colKey)) return <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{fmt(val)}</span>;
    if (colKey === 'tags') return <span style={{ fontSize: 10 }}>{Array.isArray(val) ? val.join(', ') : val}</span>;
    if (colKey === 'website' && val) return <a href={val.startsWith('http') ? val : `https://${val}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'var(--blue)', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>{val}</a>;
    return <span style={{ fontSize: 12, color: val ? 'var(--text)' : 'var(--text-3)' }}>{val || '-'}</span>;
  };

  // Board view
  if (view === 'board') {
    return (
      <div style={{ padding: '32px 40px' }}>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div><h1>Pipeline Board</h1><p>{filtered.length} companies</p></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setView('list')} className="btn-secondary"><List size={14} /> Table</button>
            <button className="btn-primary" style={{ background: 'var(--text)', color: 'var(--bg)' }}><LayoutGrid size={14} /> Board</button>
            <button className="btn-primary" onClick={addNew}><Plus size={14} /> Add</button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 20 }}>
          {STAGES.filter(s => s.key !== 'passed').map(stage => {
            const sc = filtered.filter(c => c.stage === stage.key);
            return (
              <div key={stage.key} style={{ minWidth: 260, flex: '0 0 260px' }}>
                <div style={{ padding: '8px 12px', borderBottom: `2px solid ${stage.color}`, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stage.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)' }}>{sc.length}</span>
                </div>
                {sc.map(c => (
                  <div key={c.id} className="card" style={{ padding: 12, marginBottom: 6, cursor: 'pointer' }} onClick={() => navigate(`/companies/${c.id}`)}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{c.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{c.sector === 'Other' && c.customSector ? `Other: ${c.customSector}` : c.sector} - {c.geography}</div>
                    {c.revenue > 0 && <div style={{ fontSize: 10, color: 'var(--text-2)', marginTop: 4 }}>{fmt(c.revenue)} rev - Fit: {c.thesisFitScore}/10</div>}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 40px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div><h1>Companies</h1><p>{filtered.length} of {companies.length} companies</p></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setView('board')} className="btn-secondary"><LayoutGrid size={14} /> Board</button>
          <ColumnManager table="companies" defaultColumns={DEFAULT_COMPANY_COLUMNS} visibleCols={visibleCols} onVisibleColsChange={setVisibleCols} />
          <button className="btn-primary" onClick={addNew}><Plus size={14} /> Add Company</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-3)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies..." style={{ paddingLeft: 30, width: '100%' }} />
        </div>
        <select value={stageFilter} onChange={e => setStageFilter(e.target.value)}><option value="all">All Stages</option>{STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}</select>
        <select value={sectorFilter} onChange={e => setSectorFilter(e.target.value)}><option value="all">All Sectors</option>{SECTORS.map(s => <option key={s} value={s}>{s}</option>)}</select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}><option value="all">All Priorities</option>{['critical','high','medium','low'].map(p => <option key={p} value={p}>{p}</option>)}</select>
        {team.length > 0 && <select value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)}><option value="all">All Owners</option>{team.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select>}
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div style={{ display: 'flex', gap: 8, padding: '8px 12px', marginBottom: 12, background: 'var(--bg-2)', borderRadius: 2, alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{selected.size} selected</span>
          <button className="btn-secondary" onClick={() => setSelected(new Set())}>Clear</button>
          <select onChange={e => { if (!e.target.value) return; selected.forEach(id => updateCompany(id, { stage: e.target.value as PipelineStage })); e.target.value = ''; }} style={{ fontSize: 11, padding: '4px 8px' }}><option value="">Change Stage...</option>{STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}</select>
          {team.length > 0 && <select onChange={e => { if (!e.target.value) return; selected.forEach(id => updateCompany(id, { ownerId: e.target.value })); e.target.value = ''; }} style={{ fontSize: 11, padding: '4px 8px' }}><option value="">Assign Owner...</option>{team.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select>}
          <button className="btn-secondary" style={{ color: 'var(--red)', borderColor: 'var(--red)' }} onClick={() => { selected.forEach(id => deleteCompany(id)); setSelected(new Set()); }}><Trash2 size={12} /> Delete</button>
        </div>
      )}

      {/* Table */}
      {companies.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 8 }}>No companies yet</p>
          <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 16 }}>Add companies manually or import from a file.</p>
          <button className="btn-primary" onClick={addNew}><Plus size={14} /> Add First Company</button>
        </div>
      ) : (
        <div className="data-table-wrap" style={{ maxHeight: 'calc(100vh - 280px)', overflow: 'auto' }}>
          <table className="data-table" style={{ tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th style={{ width: 30 }}><input type="checkbox" onChange={e => setSelected(e.target.checked ? new Set(filtered.map(c => c.id)) : new Set())} checked={selected.size === filtered.length && filtered.length > 0} /></th>
                {visibleCols.map(key => {
                  const col = allColumns.find(c => c.key === key);
                  if (!col) return null;
                  const w = colWidths[key] || col.width;
                  return (
                    <th key={key} style={{ width: w, position: 'relative', cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort(key)}>
                      <span>{col.label}</span>
                      {sortBy === key && <ArrowUpDown size={10} style={{ marginLeft: 4 }} />}
                      <div onMouseDown={e => { e.stopPropagation(); onMouseDown(key, e); }} style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 4, cursor: 'col-resize', background: 'transparent' }} />
                    </th>
                  );
                })}
                <th style={{ width: 40 }}><Eye size={12} /></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td onClick={e => { e.stopPropagation(); setSelected(prev => { const n = new Set(prev); n.has(c.id) ? n.delete(c.id) : n.add(c.id); return n; }); }}>
                    <input type="checkbox" checked={selected.has(c.id)} readOnly />
                  </td>
                  {visibleCols.map(key => {
                    const col = allColumns.find(cl => cl.key === key);
                    return (
                      <td key={key} onDoubleClick={() => {
                        if (key === 'sector') { setSectorModal({ companyId: c.id, sector: c.sector || '', subSector: c.subSector || '', customSector: c.customSector || '', sicCodes: c.sicCodes || '' }); return; }
                        col?.editable && startEdit(c.id, key, (c as any)[key]);
                      }} style={{ cursor: col?.editable ? 'cell' : 'default', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {renderCell(c, key)}
                      </td>
                    );
                  })}
                  <td><button onClick={() => navigate(`/companies/${c.id}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4 }}><Eye size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Industry Details Modal */}
      {sectorModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={e => { if (e.target === e.currentTarget) setSectorModal(null); }}>
          <div className="card" style={{ width: 520, maxWidth: '95vw', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 16, fontFamily: 'var(--font-serif, Georgia, serif)' }}>Industry Details</h3>
              <button onClick={() => setSectorModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4 }}><X size={16} /></button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text-2)' }}>Sector</label>
                <select value={sectorModal.sector} onChange={e => setSectorModal(p => p ? { ...p, sector: e.target.value, customSector: e.target.value === 'Other' ? p.customSector : '' } : p)} style={{ width: '100%', padding: '8px 10px', fontSize: 13 }}>
                  {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text-2)' }}>Sub-Sector</label>
                <input
                  value={sectorModal.subSector}
                  onChange={e => setSectorModal(p => p ? { ...p, subSector: e.target.value } : p)}
                  placeholder="e.g. Waste Management, Dental Practices, HVAC"
                  style={{ width: '100%', padding: '8px 10px', fontSize: 13 }}
                />
              </div>
              {sectorModal.sector === 'Other' && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text-2)' }}>Custom Industry Name</label>
                  <input
                    value={sectorModal.customSector}
                    onChange={e => setSectorModal(p => p ? { ...p, customSector: e.target.value } : p)}
                    placeholder="e.g. Vertical SaaS for Veterinary Clinics"
                    style={{ width: '100%', padding: '8px 10px', fontSize: 13 }}
                  />
                </div>
              )}
              <div style={{ marginBottom: 4 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text-2)' }}>SIC Codes</label>
                <input
                  value={sectorModal.sicCodes}
                  onChange={e => setSectorModal(p => p ? { ...p, sicCodes: e.target.value } : p)}
                  placeholder="e.g. 6201, 6202, 7490"
                  style={{ width: '100%', padding: '8px 10px', fontSize: 13, fontFamily: 'monospace' }}
                />
                <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 4 }}>Comma-separated UK SIC codes. <a href="https://resources.companieshouse.gov.uk/sic/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--blue)' }}>Companies House SIC lookup</a></p>
              </div>
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn-secondary" onClick={() => setSectorModal(null)}>Cancel</button>
              <button className="btn-primary" onClick={() => {
                if (sectorModal) {
                  updateCompany(sectorModal.companyId, {
                    sector: sectorModal.sector,
                    subSector: sectorModal.subSector,
                    customSector: sectorModal.sector === 'Other' ? sectorModal.customSector : '',
                    sicCodes: sectorModal.sicCodes,
                  });
                  setSectorModal(null);
                }
              }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
