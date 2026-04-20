import { useState, useMemo } from 'react';
import { useStore } from '../store';
import type { TaskStatus, Priority } from '../types';
import { CheckSquare, Clock, AlertTriangle, Plus, X } from 'lucide-react';

const STATUS_COLORS: Record<TaskStatus, { bg: string; text: string }> = {
  todo: { bg: 'var(--bg-3)', text: 'var(--text-3)' },
  in_progress: { bg: 'var(--blue-light)', text: 'var(--blue)' },
  done: { bg: 'var(--green-light)', text: 'var(--green)' },
  blocked: { bg: 'var(--red-light)', text: 'var(--red)' },
};
const PRIORITY_COLORS: Record<Priority, { bg: string; text: string }> = {
  critical: { bg: 'var(--red-light)', text: 'var(--red)' },
  high: { bg: 'var(--orange-light)', text: 'var(--orange)' },
  medium: { bg: 'var(--yellow-light)', text: 'var(--yellow)' },
  low: { bg: 'var(--bg-3)', text: 'var(--text-3)' },
};

export default function Tasks() {
  const { tasks, team, companies, addTask, updateTask, deleteTask } = useStore();
  const [filter, setFilter] = useState<string>('all');
  const [ownerFilter, setOwnerFilter] = useState<string>('all');
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium' as Priority, dueDate: '', assigneeId: '', companyId: '' });
  const today = new Date().toISOString().split('T')[0];

  const filtered = useMemo(() => {
    let list = [...tasks];
    if (filter === 'overdue') list = list.filter(t => t.status !== 'done' && t.dueDate < today);
    else if (filter === 'today') list = list.filter(t => t.dueDate === today && t.status !== 'done');
    else if (filter !== 'all') list = list.filter(t => t.status === filter);
    if (ownerFilter !== 'all') list = list.filter(t => t.assigneeId === ownerFilter);
    list.sort((a, b) => {
      if (a.status === 'done' && b.status !== 'done') return 1;
      if (a.status !== 'done' && b.status === 'done') return -1;
      const po: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      return (po[a.priority] || 2) - (po[b.priority] || 2);
    });
    return list;
  }, [tasks, filter, ownerFilter, today]);

  const overdue = tasks.filter(t => t.status !== 'done' && t.dueDate < today).length;
  const dueToday = tasks.filter(t => t.dueDate === today && t.status !== 'done').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const done = tasks.filter(t => t.status === 'done').length;

  const handleAdd = () => {
    if (!newTask.title) return;
    addTask({ ...newTask, status: 'todo', createdBy: 'emp1', tags: [] });
    setNewTask({ title: '', description: '', priority: 'medium', dueDate: '', assigneeId: '', companyId: '' });
    setShowAdd(false);
  };

  const cycleStatus = (id: string, current: TaskStatus) => {
    const next: Record<TaskStatus, TaskStatus> = { todo: 'in_progress', in_progress: 'done', done: 'todo', blocked: 'todo' };
    updateTask(id, { status: next[current], completedAt: next[current] === 'done' ? today : '' });
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100 }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div><h1>Tasks</h1><p>{filtered.length} tasks</p></div>
        <button className="btn-primary" onClick={() => setShowAdd(!showAdd)}><Plus size={14} /> New Task</button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { l: 'Overdue', v: overdue, icon: AlertTriangle, alert: overdue > 0, f: 'overdue' },
          { l: 'Due Today', v: dueToday, icon: Clock, f: 'today' },
          { l: 'In Progress', v: inProgress, icon: CheckSquare, f: 'in_progress' },
          { l: 'Completed', v: done, icon: CheckSquare, f: 'done' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: 14, cursor: 'pointer', borderColor: filter === s.f ? 'var(--text)' : undefined }} onClick={() => setFilter(filter === s.f ? 'all' : s.f)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              <s.icon size={12} style={{ color: (s as any).alert ? 'var(--red)' : 'var(--text-3)' }} />
              <span style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{s.l}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--serif)', color: (s as any).alert ? 'var(--red)' : undefined }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ minWidth: 120 }}>
          <option value="all">All Tasks</option>
          <option value="overdue">Overdue</option>
          <option value="today">Due Today</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
          <option value="blocked">Blocked</option>
        </select>
        <select value={ownerFilter} onChange={e => setOwnerFilter(e.target.value)} style={{ minWidth: 120 }}>
          <option value="all">All Members</option>
          {team.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </div>

      {/* Add task form */}
      {showAdd && (
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <div><label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Title</label><input value={newTask.title} onChange={e => setNewTask(p => ({...p, title: e.target.value}))} style={{ width: '100%' }} /></div>
            <div><label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Due Date</label><input type="date" value={newTask.dueDate} onChange={e => setNewTask(p => ({...p, dueDate: e.target.value}))} style={{ width: '100%' }} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 12 }}>
            <div><label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Assignee</label><select value={newTask.assigneeId} onChange={e => setNewTask(p => ({...p, assigneeId: e.target.value}))} style={{ width: '100%' }}><option value="">Unassigned</option>{team.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}</select></div>
            <div><label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Company</label><select value={newTask.companyId} onChange={e => setNewTask(p => ({...p, companyId: e.target.value}))} style={{ width: '100%' }}><option value="">None</option>{companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Priority</label><select value={newTask.priority} onChange={e => setNewTask(p => ({...p, priority: e.target.value as Priority}))} style={{ width: '100%' }}>{(['critical','high','medium','low'] as Priority[]).map(p => <option key={p} value={p}>{p}</option>)}</select></div>
          </div>
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button className="btn-primary" onClick={handleAdd}>Create Task</button>
            <button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Task list */}
      <div>
        {filtered.map(t => {
          const assignee = team.find(e => e.id === t.assigneeId);
          const company = companies.find(c => c.id === t.companyId);
          const isOverdue = t.status !== 'done' && t.dueDate < today;
          const sc = STATUS_COLORS[t.status];
          const pc = PRIORITY_COLORS[t.priority];

          return (
            <div key={t.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <button onClick={() => cycleStatus(t.id, t.status)} style={{ width: 20, height: 20, borderRadius: 3, border: `2px solid ${t.status === 'done' ? 'var(--green)' : 'var(--border)'}`, background: t.status === 'done' ? 'var(--green)' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {t.status === 'done' && <CheckSquare size={12} color="white" />}
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, textDecoration: t.status === 'done' ? 'line-through' : undefined, color: t.status === 'done' ? 'var(--text-3)' : undefined }}>{t.title}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
                  {assignee && <span>{assignee.name.split(' ')[0]}</span>}
                  {company && <span>- {company.name}</span>}
                  <span style={{ color: isOverdue ? 'var(--red)' : undefined }}>Due: {t.dueDate} {isOverdue && '(overdue)'}</span>
                </div>
              </div>
              <span className="badge" style={{ background: pc.bg, color: pc.text }}>{t.priority}</span>
              <span className="badge" style={{ background: sc.bg, color: sc.text }}>{t.status.replace('_', ' ')}</span>
              <button onClick={() => deleteTask(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4 }}><X size={14} /></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
