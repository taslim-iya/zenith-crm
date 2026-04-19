import { useState, useMemo } from 'react';
import { useStore } from '../store';
import { STAGES, SECTORS, GEOGRAPHIES } from '../types';
import type { PipelineStage, Priority, Company } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Building2, ArrowUpDown, LayoutGrid, List, X } from 'lucide-react';

const PRIORITY_COLORS: Record<Priority, { bg: string; text: string }> = {
  critical: { bg: 'var(--red-light)', text: 'var(--red)' },
  high: { bg: 'var(--orange-light)', text: 'var(--orange)' },
  medium: { bg: 'var(--yellow-light)', text: 'var(--yellow)' },
  low: { bg: 'var(--bg-3)', text: 'var(--text-3)' },
};

export default function Companies() {
  const { companies, employees, updateCompany, deleteCompany } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('updatedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [view, setView] = useState<'list' | 'board'>('list');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showAdd, setShowAdd] = useState(false);

  const active = companies.filter(c => c.status !== 'passed' || stageFilter === 'passed');

  const filtered = useMemo(() => {
    let list = active;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.sector.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.tags.some(t => t.toLowerCase().includes(q)));
    }
    if (stageFilter !== 'all') list = list.filter(c => c.stage === stageFilter);
    if (sectorFilter !== 'all') list = list.filter(c => c.sector === sectorFilter);
    if (priorityFilter !== 'all') list = list.filter(c => c.priority === priorityFilter);
    if (ownerFilter !== 'all') list = list.filter(c => c.ownerId === ownerFilter);

    list.sort((a, b) => {
      const av = (a as any)[sortBy];
      const bv = (b as any)[sortBy];
      if (typeof av === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return list;
  }, [active, search, stageFilter, sectorFilter, priorityFilter, ownerFilter, sortBy, sortDir]);

  const toggleSort = (col: string) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const fmt = (n: number) => n >= 1e6 ? `£${(n / 1e6).toFixed(1)}m` : n >= 1e3 ? `£${(n / 1e3).toFixed(0)}k` : `£${n}`;

  const stageInfo = (stage: PipelineStage) => STAGES.find(s => s.key === stage);

  // Board view
  if (view === 'board') {
    return (
      <div style={{ padding: '32px 40px' }}>
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div><h1>Pipeline Board</h1><p>{filtered.length} companies</p></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setView('list')} className="btn-secondary"><List size={14} /> List</button>
            <button className="btn-primary" style={{ background: 'var(--text)', color: 'var(--bg)' }}><LayoutGrid size={14} /> Board</button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 20 }}>
          {STAGES.filter(s => s.key !== 'passed').map(stage => {
            const stageCompanies = filtered.filter(c => c.stage === stage.key);
            return (
              <div key={stage.key} style={{ minWidth: 260, flex: '0 0 260px' }}>
                <div style={{ padding: '8px 12px', borderBottom: `2px solid ${stage.color}`, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{stage.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)' }}>{stageCompanies.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {stageCompanies.map(c => (
                    <Link key={c.id} to={`/companies/${c.id}`} className="card" style={{ padding: 12, textDecoration: 'none', color: 'inherit' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{c.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 6 }}>{c.sector} · {c.geography}</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <span className="badge" style={{ background: PRIORITY_COLORS[c.priority].bg, color: PRIORITY_COLORS[c.priority].text }}>{c.priority}</span>
                        {c.revenue > 0 && <span style={{ fontSize: 10, color: 'var(--text-2)' }}>{fmt(c.revenue)} rev</span>}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 6 }}>Fit: {c.thesisFitScore}/10 · {employees.find(e => e.id === c.ownerId)?.name?.split(' ')[0] || 'Unassigned'}</div>
                    </Link>
                  ))}
                </div>
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
        <div><h1>Companies</h1><p>{filtered.length} of {active.length} companies</p></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setView('board')} className="btn-secondary"><LayoutGrid size={14} /> Board</button>
          <button className="btn-primary" style={{ background: 'var(--text)', color: 'var(--bg)' }}><List size={14} /> List</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-3)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search companies, sectors, tags..."
            style={{ paddingLeft: 30, width: '100%' }} />
        </div>
        <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} style={{ minWidth: 130 }}>
          <option value="all">All Stages</option>
          {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <select value={sectorFilter} onChange={e => setSectorFilter(e.target.value)} style={{ minWidth: 140 }}>
          <option value="all">All Sectors</option>
          {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} style={{ minWidth: 110 }}>
          <option value="all">All Priorities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)} style={{ minWidth: 120 }}>
          <option value="all">All Owners</option>
          {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div style={{ display: 'flex', gap: 8, padding: '8px 12px', marginBottom: 12, background: 'var(--bg-2)', borderRadius: 2, alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{selected.size} selected</span>
          <button className="btn-secondary" onClick={() => setSelected(new Set())}>Clear</button>
          <select onChange={e => { if (!e.target.value) return; selected.forEach(id => updateCompany(id, { stage: e.target.value as PipelineStage })); e.target.value = ''; }} style={{ fontSize: 11, padding: '4px 8px' }}>
            <option value="">Change Stage...</option>
            {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <select onChange={e => { if (!e.target.value) return; selected.forEach(id => updateCompany(id, { ownerId: e.target.value })); e.target.value = ''; }} style={{ fontSize: 11, padding: '4px 8px' }}>
            <option value="">Assign Owner...</option>
            {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
          </select>
        </div>
      )}

      {/* Table */}
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 30 }}><input type="checkbox" onChange={e => setSelected(e.target.checked ? new Set(filtered.map(c => c.id)) : new Set())} checked={selected.size === filtered.length && filtered.length > 0} /></th>
              <th onClick={() => toggleSort('name')} style={{ cursor: 'pointer' }}>Company <ArrowUpDown size={10} /></th>
              <th onClick={() => toggleSort('sector')} style={{ cursor: 'pointer' }}>Sector</th>
              <th onClick={() => toggleSort('stage')} style={{ cursor: 'pointer' }}>Stage</th>
              <th onClick={() => toggleSort('revenue')} style={{ cursor: 'pointer' }}>Revenue</th>
              <th onClick={() => toggleSort('ebitda')} style={{ cursor: 'pointer' }}>EBITDA</th>
              <th onClick={() => toggleSort('thesisFitScore')} style={{ cursor: 'pointer' }}>Fit</th>
              <th onClick={() => toggleSort('priority')} style={{ cursor: 'pointer' }}>Priority</th>
              <th>Owner</th>
              <th onClick={() => toggleSort('lastContactDate')} style={{ cursor: 'pointer' }}>Last Contact</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const si = stageInfo(c.stage);
              const owner = employees.find(e => e.id === c.ownerId);
              const daysSinceContact = c.lastContactDate ? Math.floor((Date.now() - new Date(c.lastContactDate).getTime()) / 86400000) : null;
              return (
                <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/companies/${c.id}`)}>
                  <td onClick={e => { e.stopPropagation(); toggleSelect(c.id); }}><input type="checkbox" checked={selected.has(c.id)} readOnly /></td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{c.geography}</div>
                  </td>
                  <td style={{ fontSize: 12 }}>{c.sector}</td>
                  <td><span className="badge" style={{ background: `${si?.color}18`, color: si?.color }}>{si?.label}</span></td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{c.revenue > 0 ? fmt(c.revenue) : '-'}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{c.ebitda > 0 ? fmt(c.ebitda) : '-'}</td>
                  <td><span style={{ fontWeight: 700, color: c.thesisFitScore >= 8 ? 'var(--green)' : c.thesisFitScore >= 6 ? 'var(--yellow)' : 'var(--text-3)' }}>{c.thesisFitScore}/10</span></td>
                  <td><span className="badge" style={{ background: PRIORITY_COLORS[c.priority].bg, color: PRIORITY_COLORS[c.priority].text }}>{c.priority}</span></td>
                  <td style={{ fontSize: 12 }}>{owner?.name?.split(' ')[0] || '-'}</td>
                  <td>
                    <span style={{ fontSize: 11, color: daysSinceContact && daysSinceContact > 14 ? 'var(--red)' : 'var(--text-3)' }}>
                      {c.lastContactDate || 'Never'} {daysSinceContact && daysSinceContact > 14 && '⚠️'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
