import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { STAGES } from '../types';
import type { PipelineStage, Interaction } from '../types';
import { ArrowLeft, Building2, Globe, MapPin, Users as UsersIcon, Banknote, Target, AlertTriangle, Phone, Mail, Calendar, FileText, CheckSquare, MessageSquare, Clock, Plus, Star, TrendingUp, Shield } from 'lucide-react';

export default function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { companies, employees, tasks, updateCompany, addInteraction } = useStore();
  const company = companies.find(c => c.id === id);
  const [tab, setTab] = useState<string>('overview');
  const [showAddInt, setShowAddInt] = useState(false);
  const [newInt, setNewInt] = useState({ type: 'call', summary: '', outcome: '', nextAction: '', attendees: '' });

  if (!company) return <div style={{ padding: 40 }}><p>Company not found.</p><Link to="/companies">Back</Link></div>;

  const owner = employees.find(e => e.id === company.ownerId);
  const companyTasks = tasks.filter(t => t.companyId === id);
  const si = STAGES.find(s => s.key === company.stage);
  const fmt = (n: number) => n >= 1e6 ? `\u00A3${(n/1e6).toFixed(1)}m` : n >= 1e3 ? `\u00A3${(n/1e3).toFixed(0)}k` : `\u00A3${n}`;
  const today = new Date().toISOString().split('T')[0];

  const saveInt = () => {
    if (!newInt.summary) return;
    addInteraction(company.id, { type: newInt.type as any, date: today, summary: newInt.summary, attendees: newInt.attendees, outcome: newInt.outcome, nextAction: newInt.nextAction, createdBy: 'emp1' });
    setNewInt({ type: 'call', summary: '', outcome: '', nextAction: '', attendees: '' });
    setShowAddInt(false);
  };

  const TABS = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'contacts', label: `Contacts (${company.contacts.length})`, icon: UsersIcon },
    { id: 'activity', label: `Activity (${company.interactions.length})`, icon: Clock },
    { id: 'tasks', label: `Tasks (${companyTasks.length})`, icon: CheckSquare },
    { id: 'docs', label: `Docs (${company.documents.length})`, icon: FileText },
    { id: 'analysis', label: 'Analysis', icon: Target },
  ];

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1200 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <button onClick={() => navigate('/companies')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)' }}><ArrowLeft size={18} /></button>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>Companies</span>
      </div>

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ marginBottom: 6 }}>{company.name}</h1>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} />{company.geography}</span>
            <span style={{ fontSize: 12, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 4 }}><Building2 size={12} />{company.sector}</span>
            {company.website && <a href={`https://${company.website}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}><Globe size={12} />{company.website}</a>}
          </div>
        </div>
        <select value={company.stage} onChange={e => updateCompany(company.id, { stage: e.target.value as PipelineStage })} style={{ fontSize: 12, padding: '6px 10px', fontWeight: 600, borderColor: si?.color, color: si?.color }}>
          {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </div>

      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { l: 'Revenue', v: fmt(company.revenue) }, { l: 'EBITDA', v: fmt(company.ebitda) },
          { l: 'Employees', v: String(company.employeeCount) }, { l: 'Deal Size', v: fmt(company.estimatedDealSize) },
          { l: 'Thesis Fit', v: `${company.thesisFitScore}/10`, c: company.thesisFitScore >= 8 ? 'var(--green)' : undefined },
          { l: 'Owner', v: owner?.name?.split(' ')[0] || 'Unassigned' },
        ].map((m, i) => (
          <div key={i} className="card" style={{ padding: 12 }}>
            <div style={{ fontSize: 9, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{m.l}</div>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--serif)', color: m.c, marginTop: 2 }}>{m.v}</div>
          </div>
        ))}
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {company.tags.map(t => <span key={t} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 2, background: 'var(--bg-2)', color: 'var(--text-2)', border: '1px solid var(--border)' }}>{t}</span>)}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', fontSize: 12, fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? 'var(--text)' : 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', borderBottom: tab === t.id ? '2px solid var(--text)' : '2px solid transparent', marginBottom: -1 }}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <Card title="Description"><P>{company.description}</P></Card>
            <Card title="Why Interesting"><P>{company.whyInteresting || 'No thesis notes yet.'}</P></Card>
            <Card title="Risks & Concerns"><P style={{ color: company.risks ? 'var(--red)' : undefined }}>{company.risks || 'No risks documented.'}</P></Card>
          </div>
          <div>
            <Card title="Recommendation" icon={Star}><P>{company.recommendation || 'No recommendation yet.'}</P></Card>
            <Card title="Next Step"><p style={{ fontSize: 14, fontWeight: 600 }}>{company.nextStep || 'None set'}</p><p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>Last contact: {company.lastContactDate || 'Never'}</p></Card>
            <Card title="Financial Summary">
              <table style={{ width: '100%', fontSize: 12 }}><tbody>
                {[['Revenue', fmt(company.revenue)], ['EBITDA', fmt(company.ebitda)],
                  ['EBITDA Margin', company.revenue > 0 ? `${((company.ebitda/company.revenue)*100).toFixed(1)}%` : '-'],
                  ['Employees', String(company.employeeCount)],
                  ['Rev/Employee', company.employeeCount > 0 ? fmt(Math.round(company.revenue/company.employeeCount)) : '-'],
                  ['Est. Deal Size', fmt(company.estimatedDealSize)],
                  ['EV/EBITDA', company.ebitda > 0 ? `${(company.estimatedDealSize/company.ebitda).toFixed(1)}x` : '-'],
                ].map(([k,v],i) => <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}><td style={{ padding: '6px 0', color: 'var(--text-3)' }}>{k}</td><td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 600, fontFamily: 'monospace' }}>{v}</td></tr>)}
              </tbody></table>
            </Card>
          </div>
        </div>
      )}

      {/* CONTACTS */}
      {tab === 'contacts' && (
        company.contacts.length === 0 ? <Empty text="No contacts added yet." /> :
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {company.contacts.map(c => (
            <div key={c.id} className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Av letter={c.name.charAt(0)} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{c.name} {c.isPrimary && <Badge bg="var(--gold-light)" color="var(--gold)">PRIMARY</Badge>}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{c.title}</div>
                </div>
              </div>
              {c.email && <Row icon={Mail}>{c.email}</Row>}
              {c.phone && <Row icon={Phone}>{c.phone}</Row>}
              {c.notes && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6, fontStyle: 'italic' }}>{c.notes}</div>}
            </div>
          ))}
        </div>
      )}

      {/* ACTIVITY */}
      {tab === 'activity' && (
        <div>
          <button className="btn-primary" onClick={() => setShowAddInt(!showAddInt)} style={{ marginBottom: 16 }}><Plus size={14} /> Log Interaction</button>
          {showAddInt && (
            <div className="card" style={{ padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Type"><select value={newInt.type} onChange={e => setNewInt(p => ({...p, type: e.target.value}))} style={{ width: '100%' }}>
                  {['call','email','meeting','research','diligence','management_meeting','note'].map(t => <option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
                </select></Field>
                <Field label="Attendees"><input value={newInt.attendees} onChange={e => setNewInt(p => ({...p, attendees: e.target.value}))} style={{ width: '100%' }} /></Field>
              </div>
              <Field label="Summary"><textarea value={newInt.summary} onChange={e => setNewInt(p => ({...p, summary: e.target.value}))} rows={2} style={{ width: '100%' }} /></Field>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Outcome"><textarea value={newInt.outcome} onChange={e => setNewInt(p => ({...p, outcome: e.target.value}))} rows={2} style={{ width: '100%' }} /></Field>
                <Field label="Next Action"><textarea value={newInt.nextAction} onChange={e => setNewInt(p => ({...p, nextAction: e.target.value}))} rows={2} style={{ width: '100%' }} /></Field>
              </div>
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                <button className="btn-primary" onClick={saveInt}>Save</button>
                <button className="btn-secondary" onClick={() => setShowAddInt(false)}>Cancel</button>
              </div>
            </div>
          )}
          {company.interactions.map(int => {
            const icons: Record<string, any> = { call: Phone, email: Mail, meeting: UsersIcon, management_meeting: UsersIcon, research: FileText, diligence: Shield, note: MessageSquare };
            const Ic = icons[int.type] || MessageSquare;
            return (
              <div key={int.id} style={{ display: 'flex', gap: 12, padding: '16px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <Av icon={Ic} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                    <Badge bg="var(--bg-2)" color="var(--text-2)">{int.type.replace(/_/g,' ')}</Badge>
                    <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{int.date}</span>
                    {int.attendees && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>- {int.attendees}</span>}
                  </div>
                  <p style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 4 }}>{int.summary}</p>
                  {int.outcome && <p style={{ fontSize: 12, color: 'var(--text-2)' }}><strong>Outcome:</strong> {int.outcome}</p>}
                  {int.nextAction && <p style={{ fontSize: 12, color: 'var(--blue)' }}><strong>Next:</strong> {int.nextAction}</p>}
                </div>
              </div>
            );
          })}
          {company.interactions.length === 0 && <Empty text="No interactions logged." />}
        </div>
      )}

      {/* TASKS */}
      {tab === 'tasks' && (
        <div>
          {companyTasks.map(t => {
            const a = employees.find(e => e.id === t.assigneeId);
            const overdue = t.dueDate < today && t.status !== 'done';
            return (
              <div key={t.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.status === 'done' ? 'var(--green)' : overdue ? 'var(--red)' : 'var(--yellow)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, textDecoration: t.status === 'done' ? 'line-through' : undefined }}>{t.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Due: {t.dueDate} - {a?.name || 'Unassigned'}</div>
                </div>
                <Badge bg={overdue ? 'var(--red-light)' : 'var(--bg-2)'} color={overdue ? 'var(--red)' : 'var(--text-3)'}>{t.status === 'done' ? 'Done' : overdue ? 'Overdue' : t.status.replace('_',' ')}</Badge>
              </div>
            );
          })}
          {companyTasks.length === 0 && <Empty text="No tasks linked." />}
        </div>
      )}

      {/* DOCS */}
      {tab === 'docs' && (
        <div>
          {company.documents.map(d => (
            <div key={d.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <FileText size={18} style={{ color: 'var(--text-3)' }} />
              <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 500 }}>{d.name}</div><div style={{ fontSize: 11, color: 'var(--text-3)' }}>{d.type} - {d.date}</div></div>
            </div>
          ))}
          {company.documents.length === 0 && <Empty text="No documents." />}
        </div>
      )}

      {/* ANALYSIS */}
      {tab === 'analysis' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <Card title="Thesis Fit" icon={TrendingUp}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 36, fontWeight: 800, fontFamily: 'var(--serif)', color: company.thesisFitScore >= 8 ? 'var(--green)' : company.thesisFitScore >= 6 ? 'var(--yellow)' : 'var(--red)' }}>{company.thesisFitScore}</span>
              <span style={{ fontSize: 14, color: 'var(--text-3)' }}>/ 10</span>
            </div>
            <div style={{ height: 8, background: 'var(--bg-3)', borderRadius: 4 }}><div style={{ height: '100%', width: `${company.thesisFitScore*10}%`, background: company.thesisFitScore >= 8 ? 'var(--green)' : company.thesisFitScore >= 6 ? 'var(--yellow)' : 'var(--red)', borderRadius: 4 }} /></div>
          </Card>
          <Card title="Risk Summary" icon={AlertTriangle}><P style={{ color: company.risks ? 'var(--red)' : undefined }}>{company.risks || 'No risks identified.'}</P></Card>
          <Card title="Valuation Context">
            <table style={{ width: '100%', fontSize: 12 }}><tbody>
              {[['EV/EBITDA', company.ebitda > 0 ? `${(company.estimatedDealSize/company.ebitda).toFixed(1)}x` : '-'],
                ['EV/Revenue', company.revenue > 0 ? `${(company.estimatedDealSize/company.revenue).toFixed(2)}x` : '-'],
                ['EBITDA Margin', company.revenue > 0 ? `${((company.ebitda/company.revenue)*100).toFixed(1)}%` : '-'],
                ['Rev/Head', company.employeeCount > 0 ? fmt(Math.round(company.revenue/company.employeeCount)) : '-'],
              ].map(([k,v],i) => <tr key={i} style={{ borderBottom: '1px solid var(--border-subtle)' }}><td style={{ padding: '8px 0', color: 'var(--text-3)' }}>{k}</td><td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 600, fontFamily: 'monospace' }}>{v}</td></tr>)}
            </tbody></table>
          </Card>
          <Card title="Source & Timeline">
            <div style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.8 }}>
              <p><strong>Source:</strong> {company.source}</p>
              <p><strong>Added:</strong> {company.createdAt}</p>
              <p><strong>Last Updated:</strong> {company.updatedAt}</p>
              <p><strong>Interactions:</strong> {company.interactions.length}</p>
              <p><strong>Days in Pipeline:</strong> {Math.floor((Date.now() - new Date(company.createdAt).getTime())/86400000)}</p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// Helpers
function Card({ title, icon: Ic, children }: { title: string; icon?: any; children: React.ReactNode }) {
  return <div className="card" style={{ padding: 20, marginBottom: 16 }}><h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>{Ic && <Ic size={14} />}{title}</h3>{children}</div>;
}
function P({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-2)', ...style }}>{children}</p>;
}
function Badge({ bg, color, children }: { bg: string; color: string; children: React.ReactNode }) {
  return <span className="badge" style={{ background: bg, color }}>{children}</span>;
}
function Av({ letter, icon: Ic }: { letter?: string; icon?: any }) {
  return <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{Ic ? <Ic size={14} /> : letter}</div>;
}
function Row({ icon: Ic, children }: { icon: any; children: React.ReactNode }) {
  return <div style={{ fontSize: 12, color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}><Ic size={12} />{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div style={{ marginTop: 12 }}><label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>{label}</label>{children}</div>;
}
function Empty({ text }: { text: string }) {
  return <p style={{ color: 'var(--text-3)', fontSize: 13, padding: '20px 0' }}>{text}</p>;
}
