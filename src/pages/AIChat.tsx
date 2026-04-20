import { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { STAGES } from '../types';
import { Send, Trash2, MessageSquare, Building2, Users, BarChart3, CheckSquare } from 'lucide-react';

export default function AIChat() {
  const { chatMessages, addChatMessage, clearChat, companies, team, tasks, kpis } = useStore();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const processQuery = (query: string): string => {
    const q = query.toLowerCase();
    const active = companies.filter(c => c.status === 'active');
    const fmt = (n: number) => n >= 1e6 ? `\u00A3${(n/1e6).toFixed(1)}m` : n >= 1e3 ? `\u00A3${(n/1e3).toFixed(0)}k` : `\u00A3${n}`;

    // Pipeline summary
    if (q.includes('pipeline') && (q.includes('summary') || q.includes('overview') || q.includes('status'))) {
      const byStage = STAGES.map(s => ({ label: s.label, count: active.filter(c => c.stage === s.key).length })).filter(s => s.count > 0);
      const totalValue = active.reduce((s, c) => s + c.estimatedDealSize, 0);
      return `**Pipeline Summary**\n\nTotal active companies: ${active.length}\nTotal pipeline value: ${fmt(totalValue)}\n\n${byStage.map(s => `- **${s.label}**: ${s.count} companies`).join('\n')}\n\n**Critical deals:**\n${active.filter(c => c.priority === 'critical').map(c => `- ${c.name} (${STAGES.find(s => s.key === c.stage)?.label}) - ${fmt(c.estimatedDealSize)}`).join('\n') || 'None'}`;
    }

    // Companies by sector
    if (q.includes('companies') && (q.includes('sector') || q.includes('industrial') || q.includes('healthcare') || q.includes('technology'))) {
      const sectorMatch = ['Industrial Services', 'Healthcare Services', 'Technology', 'Business Services', 'Environmental Services', 'Financial Services', 'Education', 'Logistics', 'Food & Beverage', 'Construction Services', 'Professional Services', 'Manufacturing'].find(s => q.includes(s.toLowerCase()));
      if (sectorMatch) {
        const matches = active.filter(c => c.sector === sectorMatch);
        return `**${sectorMatch} Companies (${matches.length})**\n\n${matches.map(c => `- **${c.name}** - ${c.geography} - ${STAGES.find(s => s.key === c.stage)?.label} - Fit: ${c.thesisFitScore}/10 - ${fmt(c.revenue)} rev`).join('\n') || 'None found.'}`;
      }
      const sectors = [...new Set(active.map(c => c.sector))];
      return `**Companies by Sector**\n\n${sectors.map(s => `- **${s}**: ${active.filter(c => c.sector === s).length} companies`).join('\n')}`;
    }

    // Thesis fit
    if (q.includes('thesis') || q.includes('high fit') || q.includes('best fit')) {
      const highFit = active.filter(c => c.thesisFitScore >= 8).sort((a, b) => b.thesisFitScore - a.thesisFitScore);
      return `**High Thesis Fit Companies (8+)**\n\n${highFit.map(c => `- **${c.name}** - Score: ${c.thesisFitScore}/10 - ${c.sector} - ${STAGES.find(s => s.key === c.stage)?.label}\n  ${c.whyInteresting?.slice(0, 100) || ''}`).join('\n\n') || 'No companies scored 8+ yet.'}`;
    }

    // Overdue tasks
    if (q.includes('overdue')) {
      const overdue = tasks.filter(t => t.status !== 'done' && t.dueDate < today);
      const byOwner = team.map(e => ({ name: e.name, tasks: overdue.filter(t => t.assigneeId === e.id) })).filter(e => e.tasks.length > 0);
      return `**Overdue Tasks (${overdue.length})**\n\n${byOwner.map(o => `**${o.name}** (${o.tasks.length} overdue):\n${o.tasks.map(t => `- ${t.title} (due ${t.dueDate})${t.companyId ? ` - ${companies.find(c => c.id === t.companyId)?.name || ''}` : ''}`).join('\n')}`).join('\n\n') || 'No overdue tasks!'}`;
    }

    // Employee performance
    if (q.includes('employee') && (q.includes('performance') || q.includes('behind') || q.includes('kpi'))) {
      const results = team.filter(e => e.status === 'active').map(e => {
        const empKpis = kpis.filter(k => k.ownerId === e.id);
        const empTasks = tasks.filter(t => t.assigneeId === e.id);
        const completed = empTasks.filter(t => t.status === 'done').length;
        const overdue = empTasks.filter(t => t.status !== 'done' && t.dueDate < today).length;
        const kpiAvg = empKpis.length > 0 ? Math.round(empKpis.reduce((s, k) => s + (k.target > 0 ? (k.current / k.target) * 100 : 0), 0) / empKpis.length) : null;
        return { ...e, completed, overdue, kpiAvg };
      });
      return `**Employee Performance**\n\n${results.map(r => `**${r.name}** (${r.title})\n- Tasks completed: ${r.completed} | Overdue: ${r.overdue}\n- KPI achievement: ${r.kpiAvg ? `${r.kpiAvg}%` : 'No KPIs assigned'}\n- Companies: ${companies.filter(c => c.ownerId === r.id).length}`).join('\n\n')}`;
    }

    // No follow-up / stale
    if (q.includes('no follow') || q.includes('stale') || q.includes('neglect') || q.includes('no contact')) {
      const daysThreshold = 14;
      const stale = active.filter(c => {
        if (!c.lastContactDate) return true;
        return Math.floor((Date.now() - new Date(c.lastContactDate).getTime()) / 86400000) > daysThreshold;
      });
      return `**Stale Opportunities (no contact in ${daysThreshold}+ days)**\n\n${stale.map(c => {
        const days = c.lastContactDate ? Math.floor((Date.now() - new Date(c.lastContactDate).getTime()) / 86400000) : 'never';
        return `- **${c.name}** - Last contact: ${days === 'never' ? 'Never' : `${days} days ago`} - Stage: ${STAGES.find(s => s.key === c.stage)?.label} - Owner: ${team.find(e => e.id === c.ownerId)?.name || 'Unassigned'}`;
      }).join('\n') || 'All companies have recent contact.'}`;
    }

    // Compare companies
    if (q.includes('compare')) {
      const mentioned = active.filter(c => q.includes(c.name.toLowerCase().split(' ')[0].toLowerCase()));
      if (mentioned.length >= 2) {
        return `**Comparison**\n\n| Metric | ${mentioned.map(c => c.name).join(' | ')} |\n|--------|${mentioned.map(() => '--------').join('|')}|\n| Revenue | ${mentioned.map(c => fmt(c.revenue)).join(' | ')} |\n| EBITDA | ${mentioned.map(c => fmt(c.ebitda)).join(' | ')} |\n| Margin | ${mentioned.map(c => c.revenue > 0 ? `${((c.ebitda/c.revenue)*100).toFixed(0)}%` : '-').join(' | ')} |\n| Employees | ${mentioned.map(c => c.employeeCount).join(' | ')} |\n| Thesis Fit | ${mentioned.map(c => `${c.thesisFitScore}/10`).join(' | ')} |\n| Stage | ${mentioned.map(c => STAGES.find(s => s.key === c.stage)?.label).join(' | ')} |\n| Priority | ${mentioned.map(c => c.priority).join(' | ')} |`;
      }
    }

    // Conversion metrics
    if (q.includes('conversion') || q.includes('funnel')) {
      const total = active.length;
      const stages = STAGES.filter(s => s.key !== 'passed');
      return `**Pipeline Conversion Funnel**\n\n${stages.map(s => {
        const count = active.filter(c => c.stage === s.key).length;
        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
        return `${s.label}: ${count} (${pct}%)`;
      }).join('\n')}\n\nConversion from Identified to Meeting: ${total > 0 ? Math.round((active.filter(c => ['meeting','deep_dive','diligence','loi','closed'].includes(c.stage)).length / total) * 100) : 0}%\nConversion from Meeting to Diligence+: ${total > 0 ? Math.round((active.filter(c => ['diligence','loi','closed'].includes(c.stage)).length / total) * 100) : 0}%`;
    }

    // KPI summary
    if (q.includes('kpi') && (q.includes('summary') || q.includes('status') || q.includes('how'))) {
      const teamK = kpis.filter(k => k.ownerId === 'team');
      return `**Team KPI Summary**\n\n${teamK.map(k => {
        const pct = k.target > 0 ? Math.round((k.current / k.target) * 100) : 0;
        const status = pct >= 80 ? 'On Track' : pct >= 50 ? 'At Risk' : 'Behind';
        return `- **${k.name}**: ${k.current}/${k.target} ${k.unit} (${pct}%) - ${status}`;
      }).join('\n')}`;
    }

    // Default
    return `I can help you analyse your CRM data. Try asking:\n\n- "Give me a pipeline summary"\n- "Show companies in industrial services"\n- "Which companies have high thesis fit?"\n- "Show overdue tasks by owner"\n- "How are team performing?"\n- "Which companies have had no follow-up?"\n- "Show conversion funnel"\n- "KPI status summary"\n- "Compare Greenfield and Forge"`;
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const msg = input.trim();
    setInput('');
    addChatMessage({ role: 'user', content: msg });
    setLoading(true);

    // Try AI proxy first, fall back to local NLP
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: `You are Zenith AI, an internal analyst for a search fund CRM. You have access to the following data:\n\nCompanies (${companies.length}): ${companies.map(c => `${c.name} [${c.sector}, ${c.stage}, fit:${c.thesisFitScore}/10, rev:${c.revenue}, ebitda:${c.ebitda}]`).join('; ')}\n\nEmployees: ${team.map(e => `${e.name} (${e.role})`).join(', ')}\n\nAnswer concisely using markdown. Reference specific data.` },
            { role: 'user', content: msg }
          ]
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const content = data.content || data.choices?.[0]?.message?.content;
        if (content) { addChatMessage({ role: 'assistant', content }); setLoading(false); return; }
      }
    } catch {}

    // Fallback to local NLP
    const response = processQuery(msg);
    addChatMessage({ role: 'assistant', content: response });
    setLoading(false);
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 900, height: 'calc(100vh - 40px)', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexShrink: 0 }}>
        <div><h1>AI Chat</h1><p>Internal analyst assistant</p></div>
        {chatMessages.length > 0 && <button className="btn-secondary" onClick={clearChat}><Trash2 size={14} /> Clear</button>}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', marginBottom: 16 }}>
        {chatMessages.length === 0 && (
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <MessageSquare size={32} style={{ color: 'var(--text-3)', marginBottom: 12 }} />
            <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 20 }}>Ask me about your pipeline, companies, team performance, or KPIs.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxWidth: 500, margin: '0 auto' }}>
              {[
                { icon: Building2, text: 'Pipeline summary' },
                { icon: Users, text: 'Employee performance' },
                { icon: CheckSquare, text: 'Overdue tasks by owner' },
                { icon: BarChart3, text: 'KPI status summary' },
              ].map((s, i) => (
                <button key={i} onClick={() => { setInput(s.text); }} className="card" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', textAlign: 'left', border: '1px solid var(--border)' }}>
                  <s.icon size={14} style={{ color: 'var(--text-3)' }} />
                  <span style={{ fontSize: 12 }}>{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {chatMessages.map(msg => (
          <div key={msg.id} style={{ display: 'flex', gap: 12, marginBottom: 16, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            {msg.role === 'assistant' && <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--text)', color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>Z</div>}
            <div style={{
              maxWidth: '75%', padding: '12px 16px', borderRadius: 2,
              background: msg.role === 'user' ? 'var(--text)' : 'var(--surface)',
              color: msg.role === 'user' ? 'var(--bg)' : 'var(--text)',
              border: msg.role === 'assistant' ? '1px solid var(--border)' : undefined,
              fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap',
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--text)', color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>Z</div>
            <div style={{ padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 2, fontSize: 13, color: 'var(--text-3)' }}>Analysing...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask about pipeline, companies, team, KPIs..."
          style={{ flex: 1, padding: '12px 16px', fontSize: 13 }} />
        <button onClick={handleSend} disabled={loading || !input.trim()} className="btn-primary" style={{ background: 'var(--text)', color: 'var(--bg)', opacity: loading || !input.trim() ? 0.5 : 1 }}>
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
