import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Company, TeamMember, Broker, Task, KPI, ActivityLog, ChatMessage, PipelineStage, Priority, TaskStatus, Interaction, DocFile } from './types';

let _c = 0;
export const id = () => `z${Date.now().toString(36)}${(++_c).toString(36)}`;
const now = () => new Date().toISOString().split('T')[0];
const nowFull = () => new Date().toISOString();

interface ZenithStore {
  companies: Company[];
  team: TeamMember[];
  brokers: Broker[];
  tasks: Task[];
  kpis: KPI[];
  activities: ActivityLog[];
  chatMessages: ChatMessage[];
  darkMode: boolean;
  currentUserId: string; // who is currently using the app

  // Company
  addCompany: (company: Partial<Company>) => string;
  updateCompany: (id: string, updates: Partial<Company>) => void;
  deleteCompany: (id: string) => void;
  addInteraction: (companyId: string, interaction: Omit<Interaction, 'id'>) => void;
  addCompanyDoc: (companyId: string, doc: Omit<DocFile, 'id'>) => void;
  bulkAddCompanies: (companies: Partial<Company>[]) => number;

  // Team
  addTeamMember: (member: Partial<TeamMember>) => string;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  removeTeamMember: (id: string) => void;

  // Brokers
  addBroker: (broker: Partial<Broker>) => string;
  updateBroker: (id: string, updates: Partial<Broker>) => void;
  removeBroker: (id: string) => void;
  bulkAddBrokers: (brokers: Partial<Broker>[]) => number;

  // Task
  addTask: (task: Partial<Task>) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  // KPI
  updateKPI: (id: string, updates: Partial<KPI>) => void;
  addKPI: (kpi: Partial<KPI>) => string;

  // Activity
  logActivity: (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => void;

  // Chat
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChat: () => void;

  // Settings
  toggleDark: () => void;
  setCurrentUser: (id: string) => void;
}

export const useStore = create<ZenithStore>()(
  persist(
    (set, get) => ({
      companies: [],
      team: [],
      brokers: [],
      tasks: [],
      kpis: [],
      activities: [],
      chatMessages: [],
      darkMode: false,
      currentUserId: '',

      // Companies
      addCompany: (company) => {
        const newId = id();
        const user = get().team.find(t => t.id === get().currentUserId);
        set(s => ({
          companies: [...s.companies, {
            id: newId, name: '', sector: '', subSector: '', geography: '', website: '', description: '',
            source: '', status: 'active', stage: 'identified', revenue: 0, ebitda: 0, employeeCount: 0,
            estimatedDealSize: 0, thesisFitScore: 0, priority: 'medium', lastContactDate: '', nextStep: '',
            ownerId: '', brokerId: '', tags: [], notes: '', whyInteresting: '', risks: '', recommendation: '',
            contacts: [], interactions: [], documents: [], createdAt: now(), updatedAt: now(),
            createdBy: user?.name || 'System',
            ...company,
          } as Company],
          activities: [{ id: id(), type: 'company_added', description: `Added ${company.name || 'new company'}`, entityId: newId, entityType: 'company', userId: get().currentUserId, userName: user?.name || 'System', timestamp: nowFull() }, ...s.activities].slice(0, 500),
        }));
        return newId;
      },
      updateCompany: (cid, updates) => {
        const user = get().team.find(t => t.id === get().currentUserId);
        set(s => ({
          companies: s.companies.map(c => c.id === cid ? { ...c, ...updates, updatedAt: now() } : c),
          ...(updates.stage ? {
            activities: [{ id: id(), type: 'stage_change' as const, description: `${s.companies.find(c => c.id === cid)?.name} moved to ${updates.stage}`, entityId: cid, entityType: 'company' as const, userId: get().currentUserId, userName: user?.name || 'System', timestamp: nowFull() }, ...s.activities].slice(0, 500)
          } : {}),
        }));
      },
      deleteCompany: (cid) => set(s => ({ companies: s.companies.filter(c => c.id !== cid) })),
      addInteraction: (companyId, interaction) => {
        const user = get().team.find(t => t.id === get().currentUserId);
        set(s => ({
          companies: s.companies.map(c => c.id === companyId ? { ...c, interactions: [{ ...interaction, id: id() }, ...c.interactions], updatedAt: now() } : c),
          activities: [{ id: id(), type: 'interaction', description: `${interaction.type} logged on ${s.companies.find(c => c.id === companyId)?.name}`, entityId: companyId, entityType: 'company', userId: get().currentUserId, userName: user?.name || 'System', timestamp: nowFull() }, ...s.activities].slice(0, 500),
        }));
      },
      addCompanyDoc: (companyId, doc) => {
        const user = get().team.find(t => t.id === get().currentUserId);
        set(s => ({
          companies: s.companies.map(c => c.id === companyId ? { ...c, documents: [{ ...doc, id: id() }, ...c.documents] } : c),
          activities: [{ id: id(), type: 'file_uploaded', description: `${doc.name} uploaded to ${s.companies.find(c => c.id === companyId)?.name}`, entityId: companyId, entityType: 'company', userId: get().currentUserId, userName: user?.name || 'System', timestamp: nowFull() }, ...s.activities].slice(0, 500),
        }));
      },
      bulkAddCompanies: (comps) => {
        const user = get().team.find(t => t.id === get().currentUserId);
        let count = 0;
        const newCompanies: Company[] = comps.map(c => {
          count++;
          return {
            id: id(), name: '', sector: '', subSector: '', geography: '', website: '', description: '',
            source: 'Import', status: 'active', stage: 'identified', revenue: 0, ebitda: 0, employeeCount: 0,
            estimatedDealSize: 0, thesisFitScore: 0, priority: 'medium', lastContactDate: '', nextStep: '',
            ownerId: '', brokerId: '', tags: [], notes: '', whyInteresting: '', risks: '', recommendation: '',
            contacts: [], interactions: [], documents: [], createdAt: now(), updatedAt: now(),
            createdBy: user?.name || 'System', ...c,
          } as Company;
        });
        set(s => ({
          companies: [...s.companies, ...newCompanies],
          activities: [{ id: id(), type: 'import', description: `Imported ${count} companies`, entityId: '', entityType: 'company', userId: get().currentUserId, userName: user?.name || 'System', timestamp: nowFull() }, ...s.activities].slice(0, 500),
        }));
        return count;
      },

      // Team
      addTeamMember: (member) => {
        const newId = id();
        set(s => ({
          team: [...s.team, { id: newId, name: '', title: '', role: 'analyst', email: '', phone: '', status: 'active', joinDate: now(), notes: '', createdAt: now(), ...member } as TeamMember],
          activities: [{ id: id(), type: 'member_added', description: `${member.name || 'New member'} joined the team`, entityId: newId, entityType: 'team', userId: get().currentUserId, userName: 'System', timestamp: nowFull() }, ...s.activities].slice(0, 500),
        }));
        return newId;
      },
      updateTeamMember: (tid, updates) => set(s => ({ team: s.team.map(t => t.id === tid ? { ...t, ...updates } : t) })),
      removeTeamMember: (tid) => set(s => ({ team: s.team.filter(t => t.id !== tid) })),

      // Brokers
      addBroker: (broker) => {
        const newId = id();
        const user = get().team.find(t => t.id === get().currentUserId);
        set(s => ({
          brokers: [...s.brokers, { id: newId, name: '', firm: '', email: '', phone: '', website: '', specialty: '', geography: '', notes: '', status: 'active', dealsSent: 0, qualityRating: 3, lastContactDate: '', createdAt: now(), ...broker } as Broker],
          activities: [{ id: id(), type: 'broker_added', description: `Added broker ${broker.name || broker.firm || ''}`, entityId: newId, entityType: 'broker', userId: get().currentUserId, userName: user?.name || 'System', timestamp: nowFull() }, ...s.activities].slice(0, 500),
        }));
        return newId;
      },
      updateBroker: (bid, updates) => set(s => ({ brokers: s.brokers.map(b => b.id === bid ? { ...b, ...updates } : b) })),
      removeBroker: (bid) => set(s => ({ brokers: s.brokers.filter(b => b.id !== bid) })),
      bulkAddBrokers: (brks) => {
        let count = 0;
        const user = get().team.find(t => t.id === get().currentUserId);
        const newBrokers: Broker[] = brks.map(b => {
          count++;
          return { id: id(), name: '', firm: '', email: '', phone: '', website: '', specialty: '', geography: '', notes: '', status: 'active', dealsSent: 0, qualityRating: 3, lastContactDate: '', createdAt: now(), ...b } as Broker;
        });
        set(s => ({
          brokers: [...s.brokers, ...newBrokers],
          activities: [{ id: id(), type: 'import', description: `Imported ${count} brokers`, entityId: '', entityType: 'broker', userId: get().currentUserId, userName: user?.name || 'System', timestamp: nowFull() }, ...s.activities].slice(0, 500),
        }));
        return count;
      },

      // Tasks
      addTask: (task) => {
        const newId = id();
        set(s => ({ tasks: [...s.tasks, { id: newId, title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', assigneeId: '', companyId: '', createdBy: get().currentUserId, createdAt: now(), completedAt: '', tags: [], ...task } as Task] }));
        return newId;
      },
      updateTask: (tid, updates) => set(s => ({ tasks: s.tasks.map(t => t.id === tid ? { ...t, ...updates } : t) })),
      deleteTask: (tid) => set(s => ({ tasks: s.tasks.filter(t => t.id !== tid) })),

      // KPIs
      updateKPI: (kid, updates) => set(s => ({ kpis: s.kpis.map(k => k.id === kid ? { ...k, ...updates } : k) })),
      addKPI: (kpi) => { const newId = id(); set(s => ({ kpis: [...s.kpis, { id: newId, name: '', category: 'sourcing', target: 0, current: 0, unit: '', period: 'weekly', ownerId: 'team', trend: [], updatedAt: now(), ...kpi } as KPI] })); return newId; },

      // Activity
      logActivity: (activity) => set(s => ({ activities: [{ ...activity, id: id(), timestamp: nowFull() }, ...s.activities].slice(0, 500) })),

      // Chat
      addChatMessage: (msg) => set(s => ({ chatMessages: [...s.chatMessages, { ...msg, id: id(), timestamp: nowFull() }] })),
      clearChat: () => set({ chatMessages: [] }),

      // Settings
      toggleDark: () => set(s => { const next = !s.darkMode; document.documentElement.classList.toggle('dark', next); return { darkMode: next }; }),
      setCurrentUser: (uid) => set({ currentUserId: uid }),
    }),
    {
      name: 'zenith-store',
      onRehydrate: () => (state) => {
        if (state?.darkMode) document.documentElement.classList.add('dark');
      },
    }
  )
);
