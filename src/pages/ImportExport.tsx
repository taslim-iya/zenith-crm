import { useState, useRef } from 'react';
import { useStore } from '../store';
import { Upload, Download, FileText, Check, AlertTriangle } from 'lucide-react';

export default function ImportExport() {
  const store = useStore();
  const [tab, setTab] = useState<'import' | 'export'>('export');
  const [importResult, setImportResult] = useState<string>('');
  const [exportType, setExportType] = useState<string>('companies');
  const fileRef = useRef<HTMLInputElement>(null);

  const exportData = () => {
    let data: any[] = [];
    let filename = '';

    switch (exportType) {
      case 'companies':
        data = store.companies.map(c => ({
          name: c.name, sector: c.sector, subSector: c.subSector, geography: c.geography,
          website: c.website, stage: c.stage, revenue: c.revenue, ebitda: c.ebitda,
          employeeCount: c.employeeCount, dealSize: c.estimatedDealSize, thesisFit: c.thesisFitScore,
          priority: c.priority, owner: store.employees.find(e => e.id === c.ownerId)?.name || '',
          lastContact: c.lastContactDate, nextStep: c.nextStep, tags: c.tags.join('; '),
          source: c.source, status: c.status, description: c.description,
        }));
        filename = 'zenith_companies.json';
        break;
      case 'employees':
        data = store.employees.map(e => ({
          name: e.name, title: e.title, role: e.role, team: e.team, email: e.email,
          status: e.status, joinDate: e.joinDate, companies: store.companies.filter(c => c.ownerId === e.id).length,
        }));
        filename = 'zenith_employees.json';
        break;
      case 'tasks':
        data = store.tasks.map(t => ({
          title: t.title, status: t.status, priority: t.priority, dueDate: t.dueDate,
          assignee: store.employees.find(e => e.id === t.assigneeId)?.name || '',
          company: store.companies.find(c => c.id === t.companyId)?.name || '',
          description: t.description,
        }));
        filename = 'zenith_tasks.json';
        break;
      case 'kpis':
        data = store.kpis.map(k => ({
          name: k.name, category: k.category, target: k.target, current: k.current,
          unit: k.unit, period: k.period, achievement: k.target > 0 ? `${Math.round((k.current/k.target)*100)}%` : '-',
          owner: k.ownerId === 'team' ? 'Team' : store.employees.find(e => e.id === k.ownerId)?.name || '',
        }));
        filename = 'zenith_kpis.json';
        break;
      case 'pipeline':
        data = store.companies.filter(c => c.status === 'active').map(c => ({
          name: c.name, stage: c.stage, sector: c.sector, geography: c.geography,
          revenue: c.revenue, ebitda: c.ebitda, thesisFit: c.thesisFitScore, priority: c.priority,
          owner: store.employees.find(e => e.id === c.ownerId)?.name || '',
          recommendation: c.recommendation, risks: c.risks,
        }));
        filename = 'zenith_pipeline.json';
        break;
    }

    // Also export as CSV
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      const csv = [headers.join(','), ...data.map(row => headers.map(h => {
        const val = String((row as any)[h] ?? '');
        return val.includes(',') || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
      }).join(','))].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename.replace('.json', '.csv');
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        if (file.name.endsWith('.json')) {
          const data = JSON.parse(text);
          if (Array.isArray(data)) {
            let imported = 0;
            data.forEach((row: any) => {
              if (row.name && row.sector) {
                store.addCompany({
                  name: row.name, sector: row.sector || '', subSector: row.subSector || '', geography: row.geography || '',
                  website: row.website || '', description: row.description || '', source: row.source || 'Import',
                  status: 'active', stage: row.stage || 'identified', revenue: Number(row.revenue) || 0,
                  ebitda: Number(row.ebitda) || 0, employeeCount: Number(row.employeeCount) || 0,
                  estimatedDealSize: Number(row.dealSize) || 0, thesisFitScore: Number(row.thesisFit) || 5,
                  priority: row.priority || 'medium', lastContactDate: '', nextStep: row.nextStep || '',
                  ownerId: '', tags: row.tags ? row.tags.split(';').map((t: string) => t.trim()) : [],
                  notes: '', whyInteresting: '', risks: '', recommendation: '',
                  contacts: [], interactions: [], documents: [],
                });
                imported++;
              }
            });
            setImportResult(`Successfully imported ${imported} companies.`);
          }
        } else if (file.name.endsWith('.csv')) {
          const lines = text.split('\n').filter(l => l.trim());
          if (lines.length < 2) { setImportResult('CSV must have headers and at least one data row.'); return; }
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          let imported = 0;
          for (let i = 1; i < lines.length; i++) {
            const vals = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            const row: Record<string, string> = {};
            headers.forEach((h, j) => { row[h] = vals[j] || ''; });
            if (row.name || row.Name || row['Company Name']) {
              store.addCompany({
                name: row.name || row.Name || row['Company Name'] || '',
                sector: row.sector || row.Sector || '', subSector: row.subSector || '', geography: row.geography || row.Geography || '',
                website: row.website || row.Website || '', description: row.description || '', source: 'CSV Import',
                status: 'active', stage: 'identified', revenue: Number(row.revenue || row.Revenue) || 0,
                ebitda: Number(row.ebitda || row.EBITDA) || 0, employeeCount: Number(row.employeeCount || row.Employees) || 0,
                estimatedDealSize: 0, thesisFitScore: 5, priority: 'medium', lastContactDate: '', nextStep: '',
                ownerId: '', tags: [], notes: '', whyInteresting: '', risks: '', recommendation: '',
                contacts: [], interactions: [], documents: [],
              });
              imported++;
            }
          }
          setImportResult(`Successfully imported ${imported} companies from CSV.`);
        }
      } catch (err) {
        setImportResult(`Import error: ${(err as Error).message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 800 }}>
      <div className="page-header"><h1>Import / Export</h1><p>Move data in and out of Zenith</p></div>

      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        {(['export', 'import'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 24px', fontSize: 13, fontWeight: tab === t ? 700 : 500, color: tab === t ? 'var(--text)' : 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', borderBottom: tab === t ? '2px solid var(--text)' : '2px solid transparent', marginBottom: -1, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {t === 'export' ? <Download size={14} style={{ marginRight: 6 }} /> : <Upload size={14} style={{ marginRight: 6 }} />}{t}
          </button>
        ))}
      </div>

      {tab === 'export' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
            {[
              { key: 'companies', label: 'All Companies', desc: `${store.companies.length} records`, icon: FileText },
              { key: 'pipeline', label: 'Active Pipeline', desc: `${store.companies.filter(c => c.status === 'active').length} active`, icon: FileText },
              { key: 'employees', label: 'Employees', desc: `${store.employees.length} team members`, icon: FileText },
              { key: 'tasks', label: 'Tasks', desc: `${store.tasks.length} tasks`, icon: FileText },
              { key: 'kpis', label: 'KPI Report', desc: `${store.kpis.length} metrics`, icon: FileText },
            ].map(item => (
              <div key={item.key} className="card" onClick={() => setExportType(item.key)}
                style={{ padding: 16, cursor: 'pointer', borderColor: exportType === item.key ? 'var(--text)' : undefined }}>
                <item.icon size={16} style={{ color: 'var(--text-3)', marginBottom: 8 }} />
                <div style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{item.desc}</div>
              </div>
            ))}
          </div>
          <button className="btn-primary" onClick={exportData}><Download size={14} /> Export as CSV</button>
        </div>
      )}

      {tab === 'import' && (
        <div>
          <div className="card" style={{ padding: 24, textAlign: 'center', marginBottom: 16 }}>
            <Upload size={24} style={{ color: 'var(--text-3)', marginBottom: 8 }} />
            <p style={{ fontSize: 13, color: 'var(--text-2)', marginBottom: 12 }}>Import companies from JSON or CSV files</p>
            <input ref={fileRef} type="file" accept=".json,.csv" onChange={handleImport} style={{ display: 'none' }} />
            <button className="btn-primary" onClick={() => fileRef.current?.click()}><Upload size={14} /> Choose File</button>
          </div>

          {importResult && (
            <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 10, background: importResult.includes('error') ? 'var(--red-light)' : 'var(--green-light)' }}>
              {importResult.includes('error') ? <AlertTriangle size={16} style={{ color: 'var(--red)' }} /> : <Check size={16} style={{ color: 'var(--green)' }} />}
              <span style={{ fontSize: 13, color: importResult.includes('error') ? 'var(--red)' : 'var(--green)' }}>{importResult}</span>
            </div>
          )}

          <div style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Expected Format</h3>
            <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.8 }}>
              <p><strong>CSV:</strong> Headers in first row. Supported columns: name, sector, geography, website, revenue, ebitda, employeeCount, description</p>
              <p><strong>JSON:</strong> Array of objects with same fields</p>
              <p>All imports create companies at the "Identified" stage.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
