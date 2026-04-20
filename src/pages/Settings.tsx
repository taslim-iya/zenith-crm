import { useStore } from '../store';
import { Moon, Sun, Trash2, RotateCcw, Database } from 'lucide-react';
import { useState } from 'react';

export default function Settings() {
  const { darkMode, toggleDark, companies, employees, tasks, kpis } = useStore();
  const [confirmReset, setConfirmReset] = useState(false);

  const handleReset = () => {
    localStorage.removeItem('zenith-store');
    window.location.reload();
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 700 }}>
      <div className="page-header"><h1>Settings</h1><p>Configuration and data management</p></div>

      {/* Theme */}
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Appearance</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Dark Mode</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Switch between light and dark themes</div>
          </div>
          <button onClick={toggleDark} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid var(--border)', borderRadius: 2, background: 'var(--surface)', cursor: 'pointer', fontSize: 12, fontWeight: 500, color: 'var(--text-2)' }}>
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>

      {/* Data summary */}
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}><Database size={14} /> Data Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { label: 'Companies', value: companies.length },
            { label: 'Employees', value: employees.length },
            { label: 'Tasks', value: tasks.length },
            { label: 'Brokers', value: brokers.length },
            { label: 'KPIs', value: kpis.length },
            { label: 'Active Pipeline', value: companies.filter(c => c.status === 'active').length },
            { label: 'Completed Tasks', value: tasks.filter(t => t.status === 'done').length },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{s.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700 }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Danger zone */}
      <div className="card" style={{ padding: 20, borderColor: 'var(--red)' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: 'var(--red)' }}>Danger Zone</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>Reset All Data</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Restore demo data and clear all changes</div>
          </div>
          {confirmReset ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleReset} style={{ padding: '6px 12px', background: 'var(--red)', color: 'white', border: 'none', borderRadius: 2, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Confirm Reset</button>
              <button onClick={() => setConfirmReset(false)} className="btn-secondary">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setConfirmReset(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid var(--red)', borderRadius: 2, background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--red)' }}>
              <RotateCcw size={14} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* About */}
      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Zenith CRM</h2>
        <p style={{ fontSize: 11, color: 'var(--text-3)' }}>Internal acquisition operating system for search funds</p>
        <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 4 }}>v1.0 - Data stored locally in browser</p>
      </div>
    </div>
  );
}
