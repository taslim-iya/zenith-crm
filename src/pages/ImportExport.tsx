import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import * as XLSX from 'xlsx';
import { Upload, Download, FileText, Check, AlertTriangle, Loader2, Brain, HardDrive } from 'lucide-react';

function StorageDiag() {
  const { companies, brokers, team } = useStore();
  const [storeSize, setStoreSize] = useState('');
  useEffect(() => {
    const raw = localStorage.getItem('zenith-store');
    setStoreSize(raw ? `${(raw.length / 1024).toFixed(0)} KB` : '0 KB');
  }, [companies.length, brokers.length]);
  const maxKB = 5120; // ~5MB
  const usedKB = Number(storeSize.replace(/[^0-9]/g, '')) || 0;
  const pct = Math.min(100, (usedKB / maxKB) * 100);
  return (
    <div style={{ padding: '10px 14px', background: pct > 80 ? '#fef2f2' : 'var(--bg-2)', border: `1px solid ${pct > 80 ? '#fecaca' : 'var(--border)'}`, borderRadius: 6, marginBottom: 16, fontSize: 11 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <HardDrive size={12} />
        <span style={{ fontWeight: 600 }}>Storage: {storeSize} / ~5 MB</span>
        <span style={{ color: 'var(--text-3)' }}>({companies.length} companies, {brokers.length} brokers, {team.length} team)</span>
      </div>
      <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: pct > 80 ? '#dc2626' : pct > 60 ? '#ca8a04' : 'var(--accent)', transition: 'width 0.3s' }} />
      </div>
      {pct > 80 && <div style={{ color: '#dc2626', marginTop: 4, fontWeight: 600 }}>⚠️ Storage nearly full — large imports may fail. Export data as backup.</div>}
    </div>
  );
}

export default function ImportExport() {
  const store = useStore();
  const [tab, setTab] = useState<'import' | 'export'>('import');
  const [importResult, setImportResult] = useState<string>('');
  const [exportType, setExportType] = useState<string>('companies');
  const [importing, setImporting] = useState(false);
  const [importTarget, setImportTarget] = useState<'companies' | 'brokers'>('companies');
  const [preview, setPreview] = useState<any[]>([]);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  // AI-powered parsing
  const aiParse = async (text: string, filename: string): Promise<any[]> => {
    try {
      const targetSchema = importTarget === 'companies'
        ? 'Array of objects with fields: name (string, required), sector, geography, website, description, source, revenue (number), ebitda (number), employeeCount (number), estimatedDealSize (number), thesisFitScore (1-10), priority (critical/high/medium/low), notes, tags (comma-separated string). Infer sector from description if not explicit. Convert currency strings to numbers (remove symbols). Convert percentages for margins.'
        : 'Array of objects with fields: name (string, contact person name), firm (string, company name), email, phone, website, specialty, geography, notes, qualityRating (1-5). If a row has both a person name and company name, split them.';

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: `You are a data parser. Parse the following file content into structured JSON. Return ONLY a JSON array, no markdown fences, no explanation.\n\nTarget schema: ${targetSchema}\n\nRules:\n- Every row with identifiable data should become an object\n- Skip empty rows and header-only rows\n- Normalize field names to the schema\n- If data is ambiguous, make your best guess\n- Currency: strip symbols, convert to numbers (e.g. "£4.2m" = 4200000)\n- If the file looks like it contains ${importTarget}, parse accordingly\n- Handle CSV, TSV, plain text lists, JSON, and semi-structured text` },
            { role: 'user', content: `File: ${filename}\n\nContent (first 8000 chars):\n${text.slice(0, 8000)}` }
          ]
        }),
      });
      if (!res.ok) throw new Error('AI parsing failed');
      const data = await res.json();
      let content = data.content || '';
      // Strip markdown fences
      content = content.replace(/```json?\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(content);
    } catch (err) {
      console.error('AI parse error:', err);
      return [];
    }
  };

  // Manual CSV/JSON parsing fallback
  const manualParse = (text: string, filename: string): any[] => {
    if (filename.endsWith('.json')) {
      try { const d = JSON.parse(text); return Array.isArray(d) ? d : [d]; } catch { return []; }
    }
    // CSV
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return [];
    const sep = lines[0].includes('\t') ? '\t' : ',';
    const headers = lines[0].split(sep).map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
    return lines.slice(1).map(line => {
      const vals = line.split(sep).map(v => v.trim().replace(/^"|"$/g, ''));
      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = vals[i] || ''; });
      return row;
    }).filter(r => Object.values(r).some(v => v));
  };

  // Shared import logic
  const importParsed = (parsed: any[], filename: string) => {
    setPreview(parsed.slice(0, 10));
    setPreviewHeaders(Object.keys(parsed[0] || {}));

    if (importTarget === 'companies') {
      const count = store.bulkAddCompanies(parsed.map(r => ({
        name: r.name || r.Name || r['Company Name'] || r['company name'] || r.company || r.Company || '',
        sector: r.sector || r.Sector || r.industry || r.Industry || '',
        geography: r.geography || r.Geography || r.location || r.Location || r.region || r.Region || '',
        website: r.website || r.Website || r.url || r.URL || '',
        description: r.description || r.Description || r.notes || r.Notes || '',
        source: r.source || r.Source || 'Import',
        revenue: Number(String(r.revenue || r.Revenue || r.turnover || r.Turnover || 0).replace(/[^0-9.-]/g, '')) || 0,
        ebitda: Number(String(r.ebitda || r.EBITDA || r.Ebitda || 0).replace(/[^0-9.-]/g, '')) || 0,
        employeeCount: Number(r.employeeCount || r.employees || r.Employees || r['Employee Count'] || r.staff || r.Staff || 0) || 0,
        estimatedDealSize: Number(String(r.estimatedDealSize || r.dealSize || r['Deal Size'] || r.deal_size || r['Estimated Value'] || 0).replace(/[^0-9.-]/g, '')) || 0,
        thesisFitScore: Number(r.thesisFitScore || r.fit || r['Thesis Fit'] || r.thesis_fit || 0) || 0,
        priority: (['critical', 'high', 'medium', 'low'].includes(String(r.priority || r.Priority || '').toLowerCase()) ? String(r.priority || r.Priority).toLowerCase() : 'medium') as any,
        notes: r.notes || r.Notes || '',
        tags: typeof r.tags === 'string' ? r.tags.split(/[,;]/).map((t: string) => t.trim()).filter(Boolean) : Array.isArray(r.tags) ? r.tags : [],
      })));
      setImportResult(`Successfully imported ${count} companies from ${filename}.`);
    } else {
      const count = store.bulkAddBrokers(parsed.map(r => ({
        name: r.name || r.Name || r.contact || r.Contact || r['Contact Name'] || '',
        firm: r.firm || r.Firm || r.company || r.Company || r['Company Name'] || '',
        email: r.email || r.Email || r['Email Address'] || '',
        phone: r.phone || r.Phone || r.telephone || r.Telephone || '',
        website: r.website || r.Website || r.url || '',
        specialty: r.specialty || r.Specialty || r.sector || r.Sector || '',
        geography: r.geography || r.Geography || r.location || r.Location || '',
        notes: r.notes || r.Notes || '',
        qualityRating: Number(r.qualityRating || r.rating || r.Rating || r.Quality || 3) || 3,
      })));
      setImportResult(`Successfully imported ${count} brokers from ${filename}.`);
    }
    setImporting(false);
  };

  // Parse Excel/XLSX/XLS files
  const parseExcel = (buffer: ArrayBuffer): any[] => {
    try {
      const wb = XLSX.read(buffer, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      return rows as any[];
    } catch { return []; }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult('');
    setPreview([]);

    const isExcel = /\.(xlsx?|xls)$/i.test(file.name);

    if (isExcel) {
      // Read as binary for Excel
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const buffer = ev.target?.result as ArrayBuffer;
        let parsed = parseExcel(buffer);
        if (parsed.length === 0) {
          setImportResult('Could not parse Excel file. Check the format.');
          setImporting(false);
          return;
        }
        importParsed(parsed, file.name);
      };
      reader.readAsArrayBuffer(file);
      if (fileRef.current) fileRef.current.value = '';
      return;
    }

    // Text-based files (CSV, JSON, TSV, TXT)
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result as string;

      // Try AI parsing first
      let parsed = await aiParse(text, file.name);
      // Fallback to manual
      if (parsed.length === 0) parsed = manualParse(text, file.name);

      if (parsed.length === 0) {
        setImportResult('Could not parse any records from this file. Try CSV, JSON, or Excel format.');
        setImporting(false);
        return;
      }
      importParsed(parsed, file.name);
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = '';
  };

  const exportData = () => {
    let data: any[] = [];
    let filename = 'zenith_export.csv';
    switch (exportType) {
      case 'companies':
        data = store.companies.map(c => ({ name: c.name, sector: c.sector, geography: c.geography, website: c.website, stage: c.stage, revenue: c.revenue, ebitda: c.ebitda, employees: c.employeeCount, dealSize: c.estimatedDealSize, thesisFit: c.thesisFitScore, priority: c.priority, owner: store.team.find(t => t.id === c.ownerId)?.name || '', source: c.source, lastContact: c.lastContactDate, nextStep: c.nextStep, tags: c.tags.join('; '), notes: c.notes, description: c.description }));
        filename = 'zenith_companies.csv'; break;
      case 'brokers':
        data = store.brokers.map(b => ({ name: b.name, firm: b.firm, email: b.email, phone: b.phone, website: b.website, specialty: b.specialty, geography: b.geography, quality: b.qualityRating, deals: store.companies.filter(c => c.brokerId === b.id).length, notes: b.notes }));
        filename = 'zenith_brokers.csv'; break;
      case 'tasks':
        data = store.tasks.map(t => ({ title: t.title, status: t.status, priority: t.priority, due: t.dueDate, assignee: store.team.find(m => m.id === t.assigneeId)?.name || '', company: store.companies.find(c => c.id === t.companyId)?.name || '' }));
        filename = 'zenith_tasks.csv'; break;
      case 'team':
        data = store.team.map(m => ({ name: m.name, title: m.title, role: m.role, email: m.email, phone: m.phone, status: m.status, joined: m.joinDate }));
        filename = 'zenith_team.csv'; break;
    }
    if (data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csv = [headers.join(','), ...data.map(row => headers.map(h => { const v = String((row as any)[h] ?? ''); return v.includes(',') || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v; }).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
    // Track who exported what
    store.logExport(exportType, data.length);
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 900 }}>
      <div className="page-header"><h1>Import / Export</h1><p>AI-powered data import and CSV export</p></div>

      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        {(['import', 'export'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 24px', fontSize: 13, fontWeight: tab === t ? 700 : 500, color: tab === t ? 'var(--text)' : 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', borderBottom: tab === t ? '2px solid var(--text)' : '2px solid transparent', marginBottom: -1, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {t === 'import' ? <Upload size={14} style={{ marginRight: 6 }} /> : <Download size={14} style={{ marginRight: 6 }} />}{t}
          </button>
        ))}
      </div>

      {tab === 'import' && (
        <div>
          <StorageDiag />
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer', padding: '6px 12px', border: `1px solid ${importTarget === 'companies' ? 'var(--text)' : 'var(--border)'}`, borderRadius: 2, fontWeight: importTarget === 'companies' ? 700 : 400 }}>
              <input type="radio" name="target" checked={importTarget === 'companies'} onChange={() => setImportTarget('companies')} /> Companies
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer', padding: '6px 12px', border: `1px solid ${importTarget === 'brokers' ? 'var(--text)' : 'var(--border)'}`, borderRadius: 2, fontWeight: importTarget === 'brokers' ? 700 : 400 }}>
              <input type="radio" name="target" checked={importTarget === 'brokers'} onChange={() => setImportTarget('brokers')} /> Brokers
            </label>
          </div>

          <div className="card" style={{ padding: 24, textAlign: 'center', marginBottom: 16 }}>
            <Brain size={28} style={{ color: 'var(--text-3)', marginBottom: 8 }} />
            <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>AI-Powered Import</p>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginBottom: 12 }}>Drop any file - CSV, JSON, Excel exports, text lists, even messy data. AI will parse and map it automatically.</p>
            <input ref={fileRef} type="file" accept=".json,.csv,.tsv,.txt,.xlsx" onChange={handleImport} style={{ display: 'none' }} />
            <button className="btn-primary" onClick={() => fileRef.current?.click()} disabled={importing}>
              {importing ? <><Loader2 size={14} className="animate-spin" /> Parsing...</> : <><Upload size={14} /> Choose File</>}
            </button>
          </div>

          {importResult && (
            <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, background: importResult.includes('error') || importResult.includes('Could not') ? 'var(--red-light)' : 'var(--green-light)' }}>
              {importResult.includes('error') || importResult.includes('Could not') ? <AlertTriangle size={16} style={{ color: 'var(--red)' }} /> : <Check size={16} style={{ color: 'var(--green)' }} />}
              <span style={{ fontSize: 13, color: importResult.includes('error') || importResult.includes('Could not') ? 'var(--red)' : 'var(--green)' }}>{importResult}</span>
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <h3 style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)' }}>Import Preview (first {preview.length} rows)</h3>
              <div className="data-table-wrap">
                <table className="data-table" style={{ fontSize: 11 }}>
                  <thead><tr>{previewHeaders.slice(0, 8).map(h => <th key={h}>{h}</th>)}</tr></thead>
                  <tbody>{preview.map((row, i) => <tr key={i}>{previewHeaders.slice(0, 8).map(h => <td key={h}>{String((row as any)[h] ?? '').slice(0, 40)}</td>)}</tr>)}</tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'export' && (
        <div>
          <StorageDiag />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
            {[
              { key: 'companies', label: 'Companies', desc: `${store.companies.length} records` },
              { key: 'brokers', label: 'Brokers', desc: `${store.brokers.length} brokers` },
              { key: 'team', label: 'Team', desc: `${store.team.length} members` },
              { key: 'tasks', label: 'Tasks', desc: `${store.tasks.length} tasks` },
            ].map(item => (
              <div key={item.key} className="card" onClick={() => setExportType(item.key)} style={{ padding: 16, cursor: 'pointer', borderColor: exportType === item.key ? 'var(--text)' : undefined }}>
                <FileText size={16} style={{ color: 'var(--text-3)', marginBottom: 8 }} />
                <div style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{item.desc}</div>
              </div>
            ))}
          </div>
          <button className="btn-primary" onClick={exportData}><Download size={14} /> Export as CSV</button>
        </div>
      )}
    </div>
  );
}
