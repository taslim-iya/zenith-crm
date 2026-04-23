import { useState, useMemo } from 'react';
import { useStore } from '../store';
import { SECTORS, RESEARCH_TYPES, DEFAULT_RESEARCH_COLUMNS } from '../types';
import type { ResearchItem } from '../types';
import { Plus, X, Edit2, Search, ExternalLink, FileText, Folder, Link2, Star } from 'lucide-react';

const TYPE_ICONS: Record<string, string> = { industry_report: '\uD83D\uDCCA', market_map: '\uD83D\uDDFA\uFE0F', thesis_note: '\uD83D\uDCDD', competitor_analysis: '\u2694\uFE0F', financial_model: '\uD83D\uDCC8', other: '\uD83D\uDCC1' };

function StarRating({ value, onChange, readonly }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          onClick={() => !readonly && onChange?.(value === i ? 0 : i)}
          style={{ background: 'none', border: 'none', cursor: readonly ? 'default' : 'pointer', padding: 0, lineHeight: 1 }}
          title={readonly ? `${value}/5` : value === i ? 'Clear rating' : `Rate ${i}/5`}
        >
          <Star size={14} fill={i <= value ? '#B8860B' : 'none'} color={i <= value ? '#B8860B' : 'var(--text-3)'} strokeWidth={1.5} />
        </button>
      ))}
    </div>
  );
}

export default function Research() {
  const { research, addResearch, updateResearch, removeResearch, customColumns } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sectorFilter, setSectorFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [form, setForm] = useState({ title: '', sector: '', type: 'industry_report', url: '', description: '', tags: '', rating: 0 });

  const extraCols = customColumns.filter(c => c.table === 'research');

  const filtered = useMemo(() => {
    let list = [...research];
    if (search) { const q = search.toLowerCase(); list = list.filter(r => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.tags.some((t: string) => t.toLowerCase().includes(q))); }
    if (sectorFilter !== 'all') list = list.filter(r => r.sector === sectorFilter);
    if (typeFilter !== 'all') list = list.filter(r => r.type === typeFilter);
    return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [research, search, sectorFilter, typeFilter]);

  const handleSave = () => {
    if (!form.title && !form.url) return;
    const data = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
    if (editId) { updateResearch(editId, data); setEditId(null); }
    else { addResearch(data); }
    setForm({ title: '', sector: '', type: 'industry_report', url: '', description: '', tags: '', rating: 0 });
    setShowAdd(false);
  };

  const startEdit = (r: ResearchItem) => {
    setForm({ title: r.title, sector: r.sector, type: r.type, url: r.url, description: r.description, tags: r.tags.join(', '), rating: r.rating || 0 });
    setEditId(r.id); setShowAdd(true);
  };

  const usedSectors = [...new Set(research.map(r => r.sector).filter(Boolean))];
  const usedTypes = [...new Set(research.map(r => r.type).filter(Boolean))];

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1200 }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div><h1>Industry Research</h1><p>{research.length} reports and documents</p></div>
        <button className="btn-primary" onClick={() => { setShowAdd(!showAdd); setEditId(null); setForm({ title: '', sector: '', type: 'industry_report', url: '', description: '', tags: '', rating: 0 }); }}><Plus size={14} /> Add Research</button>
      </div>

      {showAdd && (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>{editId ? 'Edit Research' : 'New Research'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Fl label="Title"><input value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} placeholder="e.g. UK Industrial Services Market Map 2026" style={{ width: '100%' }} /></Fl>
            <Fl label="Link (Google Drive, URL, etc.)"><input value={form.url} onChange={e => setForm(p => ({...p, url: e.target.value}))} placeholder="https://drive.google.com/..." style={{ width: '100%' }} /></Fl>
            <Fl label="Sector"><select value={form.sector} onChange={e => setForm(p => ({...p, sector: e.target.value}))} style={{ width: '100%' }}><option value="">Select sector...</option>{SECTORS.map(s => <option key={s} value={s}>{s}</option>)}</select></Fl>
            <Fl label="Type"><select value={form.type} onChange={e => setForm(p => ({...p, type: e.target.value}))} style={{ width: '100%' }}>{RESEARCH_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}</select></Fl>
            <Fl label="Description"><textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} rows={2} style={{ width: '100%' }} placeholder="Brief summary..." /></Fl>
            <Fl label="Tags (comma-separated)"><input value={form.tags} onChange={e => setForm(p => ({...p, tags: e.target.value}))} placeholder="ETA, SME, PE" style={{ width: '100%' }} /></Fl>
            <Fl label="Industry Rating"><StarRating value={form.rating} onChange={v => setForm(p => ({...p, rating: v}))} /></Fl>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button className="btn-primary" onClick={handleSave}>{editId ? 'Save' : 'Add'}</button>
            <button className="btn-secondary" onClick={() => { setShowAdd(false); setEditId(null); }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Filters */}
      {research.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 200px' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-3)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search research..." style={{ paddingLeft: 30, width: '100%' }} />
          </div>
          {usedSectors.length > 1 && <select value={sectorFilter} onChange={e => setSectorFilter(e.target.value)}><option value="all">All Sectors</option>{usedSectors.map(s => <option key={s} value={s}>{s}</option>)}</select>}
          {usedTypes.length > 1 && <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}><option value="all">All Types</option>{RESEARCH_TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}</select>}
        </div>
      )}

      {filtered.length === 0 && research.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <FileText size={32} style={{ color: 'var(--text-3)', marginBottom: 8 }} />
          <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 4 }}>No research yet</p>
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Add links to your industry reports, market maps, thesis notes, and financial models.</p>
        </div>
      ) : (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead><tr>
              <th style={{ width: 30 }}></th>
              {DEFAULT_RESEARCH_COLUMNS.map(col => <th key={col.key} style={{ width: col.width }}>{col.label}</th>)}
              {extraCols.map(col => <th key={col.id} style={{ width: col.width }}>{col.label}</th>)}
              <th style={{ width: 80 }}>Rating</th>
              <th style={{ width: 60 }}>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(r => {
                const typeMeta = RESEARCH_TYPES.find(t => t.key === r.type);
                return (
                  <tr key={r.id}>
                    <td style={{ fontSize: 16 }}>{TYPE_ICONS[r.type] || '\uD83D\uDCC1'}</td>
                    <td style={{ fontWeight: 600 }}>{r.title || '-'}</td>
                    <td style={{ fontSize: 12 }}>{r.sector || '-'}</td>
                    <td><span className="badge" style={{ background: 'var(--bg-2)', color: 'var(--text-2)' }}>{typeMeta?.label || r.type}</span></td>
                    <td>{r.url ? <a href={r.url.startsWith('http') ? r.url : `https://${r.url}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'var(--blue)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}><ExternalLink size={11} />{r.url.includes('drive.google') ? 'Google Drive' : r.url.includes('notion') ? 'Notion' : 'Link'}</a> : '-'}</td>
                    <td style={{ fontSize: 12, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description || '-'}</td>
                    <td style={{ fontSize: 11, color: 'var(--text-3)' }}>{r.addedBy || '-'}</td>
                    <td style={{ fontSize: 11, color: 'var(--text-3)' }}>{r.createdAt}</td>
                    <td><StarRating value={r.rating || 0} onChange={v => updateResearch(r.id, { rating: v })} /></td>
                    {extraCols.map(col => <td key={col.id} style={{ fontSize: 12 }}>{(r as any)[col.key] || '-'}</td>)}
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => startEdit(r)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4 }}><Edit2 size={14} /></button>
                        <button onClick={() => removeResearch(r.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: 4 }}><X size={14} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tags summary */}
      {research.length > 0 && (() => {
        const allTags = research.flatMap(r => r.tags || []);
        const tagCounts = allTags.reduce((acc, t) => { acc[t] = (acc[t] || 0) + 1; return acc; }, {} as Record<string, number>);
        const sorted = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);
        if (sorted.length === 0) return null;
        return (
          <div style={{ marginTop: 20 }}>
            <h3 style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', marginBottom: 8 }}>Tags</h3>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {sorted.map(([tag, count]) => (
                <span key={tag} onClick={() => setSearch(tag)} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 2, background: 'var(--bg-2)', color: 'var(--text-2)', border: '1px solid var(--border)', cursor: 'pointer' }}>{tag} ({count})</span>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function Fl({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', display: 'block', marginBottom: 4, letterSpacing: '0.06em' }}>{label}</label>{children}</div>;
}
