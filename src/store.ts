import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Company, TeamMember, Broker, Task, KPI, ActivityLog, ChatMessage, PipelineStage, Interaction, DocFile, ResearchItem, CustomColumn, UserAccess, AccessLevel } from './types';
import { loadRemoteState, saveRemoteState, mergeState, markRemoteLoaded } from './lib/sync';

let _c = 0;
export const id = () => `z${Date.now().toString(36)}${(++_c).toString(36)}`;
const now = () => new Date().toISOString().split('T')[0];
const nowFull = () => new Date().toISOString();

// Storage wrapper that detects localStorage quota errors
const safeStorage = createJSONStorage(() => ({
  getItem: (key: string) => localStorage.getItem(key),
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e: any) {
      console.error('[Zenith] localStorage write failed:', e?.name, '| size:', (value.length / 1024).toFixed(0) + 'KB');
      // Show user-facing warning
      const banner = document.getElementById('zenith-storage-warn');
      if (banner) banner.style.display = 'flex';
    }
  },
  removeItem: (key: string) => localStorage.removeItem(key),
}));

interface ZenithStore {
  companies: Company[];
  team: TeamMember[];
  brokers: Broker[];
  tasks: Task[];
  kpis: KPI[];
  activities: ActivityLog[];
  chatMessages: ChatMessage[];
  research: ResearchItem[];
  customColumns: CustomColumn[];
  userAccess: UserAccess[];
  darkMode: boolean;
  currentUserId: string;
  adminPassword: string;

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

  // Research
  addResearch: (item: Partial<ResearchItem>) => string;
  updateResearch: (id: string, updates: Partial<ResearchItem>) => void;
  removeResearch: (id: string) => void;

  // Custom columns
  addCustomColumn: (col: Omit<CustomColumn, 'id'>) => string;
  updateCustomColumn: (id: string, updates: Partial<CustomColumn>) => void;
  removeCustomColumn: (id: string) => void;

  // RBAC
  setUserAccess: (userId: string, modules: Record<string, AccessLevel>) => void;
  getUserAccess: (userId: string) => UserAccess | undefined;
  canAccess: (userId: string, module: string) => AccessLevel;

  // Activity
  logActivity: (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  logExport: (exportType: string, count: number) => void;

  // Chat
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChat: () => void;

  // Settings
  toggleDark: () => void;
  setCurrentUser: (id: string) => void;
  setAdminPassword: (pw: string) => void;
}

export const useStore = create<ZenithStore>()(
  persist(
    (set, get) => {
      const getUser = () => get().team.find(t => t.id === get().currentUserId);
      const log = (type: string, description: string, entityId: string, entityType: string) => {
        const user = getUser();
        return { id: id(), type, description, entityId, entityType, userId: get().currentUserId, userName: user?.name || 'System', timestamp: nowFull() } as ActivityLog;
      };

      return {
        companies: [],
        team: [],
        brokers: [],
        tasks: [],
        kpis: [],
        activities: [],
        chatMessages: [],
        research: [],
        customColumns: [],
        userAccess: [],
        darkMode: false,
        currentUserId: '',
        adminPassword: 'zenith2026',

        // Companies
        addCompany: (company) => {
          const newId = id();
          set(s => ({
            companies: [...s.companies, {
              id: newId, name: '', sector: '', subSector: '', geography: '', website: '', description: '',
              source: '', status: 'active', stage: 'identified', revenue: 0, ebitda: 0, employeeCount: 0,
              estimatedDealSize: 0, thesisFitScore: 0, priority: 'medium', lastContactDate: '', nextStep: '',
              ownerId: '', brokerId: '', tags: [], notes: '', whyInteresting: '', risks: '', recommendation: '',
              contacts: [], interactions: [], documents: [], createdAt: now(), updatedAt: now(),
              createdBy: getUser()?.name || 'System', ...company,
            } as Company],
            activities: [log('company_added', `Added ${company.name || 'new company'}`, newId, 'company'), ...s.activities].slice(0, 500),
          }));
          return newId;
        },
        updateCompany: (cid, updates) => {
          set(s => ({
            companies: s.companies.map(c => c.id === cid ? { ...c, ...updates, updatedAt: now() } : c),
            ...(updates.stage ? { activities: [log('stage_change', `${s.companies.find(c => c.id === cid)?.name} moved to ${updates.stage}`, cid, 'company'), ...s.activities].slice(0, 500) } : {}),
          }));
        },
        deleteCompany: (cid) => set(s => ({ companies: s.companies.filter(c => c.id !== cid) })),
        addInteraction: (companyId, interaction) => {
          set(s => ({
            companies: s.companies.map(c => c.id === companyId ? { ...c, interactions: [{ ...interaction, id: id() }, ...c.interactions], updatedAt: now() } : c),
            activities: [log('interaction', `${interaction.type} logged on ${s.companies.find(c => c.id === companyId)?.name}`, companyId, 'company'), ...s.activities].slice(0, 500),
          }));
        },
        addCompanyDoc: (companyId, doc) => {
          set(s => ({
            companies: s.companies.map(c => c.id === companyId ? { ...c, documents: [{ ...doc, id: id() }, ...c.documents] } : c),
            activities: [log('file_uploaded', `${doc.name} uploaded to ${s.companies.find(c => c.id === companyId)?.name}`, companyId, 'company'), ...s.activities].slice(0, 500),
          }));
        },
        bulkAddCompanies: (comps) => {
          let count = 0;
          const newCompanies: Company[] = comps.map(c => { count++; return { id: id(), name: '', sector: '', subSector: '', geography: '', website: '', description: '', source: 'Import', status: 'active', stage: 'identified', revenue: 0, ebitda: 0, employeeCount: 0, estimatedDealSize: 0, thesisFitScore: 0, priority: 'medium', lastContactDate: '', nextStep: '', ownerId: '', brokerId: '', tags: [], notes: '', whyInteresting: '', risks: '', recommendation: '', contacts: [], interactions: [], documents: [], createdAt: now(), updatedAt: now(), createdBy: getUser()?.name || 'System', ...c } as Company; });
          set(s => ({ companies: [...s.companies, ...newCompanies], activities: [log('import', `Imported ${count} companies`, '', 'company'), ...s.activities].slice(0, 500) }));
          return count;
        },

        // Team
        addTeamMember: (member) => {
          const newId = id();
          set(s => ({
            team: [...s.team, { id: newId, name: '', title: '', role: 'analyst', email: '', phone: '', status: 'active', joinDate: now(), notes: '', createdAt: now(), ...member } as TeamMember],
            activities: [log('member_added', `${member.name || 'New member'} joined the team`, newId, 'team'), ...s.activities].slice(0, 500),
          }));
          return newId;
        },
        updateTeamMember: (tid, updates) => set(s => ({ team: s.team.map(t => t.id === tid ? { ...t, ...updates } : t) })),
        removeTeamMember: (tid) => set(s => ({ team: s.team.filter(t => t.id !== tid) })),

        // Brokers
        addBroker: (broker) => {
          const newId = id();
          set(s => ({
            brokers: [...s.brokers, { id: newId, name: '', firm: '', email: '', phone: '', website: '', specialty: '', geography: '', notes: '', status: 'active', dealsSent: 0, qualityRating: 3, lastContactDate: '', createdAt: now(), ...broker } as Broker],
            activities: [log('broker_added', `Added broker ${broker.name || broker.firm || ''}`, newId, 'broker'), ...s.activities].slice(0, 500),
          }));
          return newId;
        },
        updateBroker: (bid, updates) => set(s => ({ brokers: s.brokers.map(b => b.id === bid ? { ...b, ...updates } : b) })),
        removeBroker: (bid) => set(s => ({ brokers: s.brokers.filter(b => b.id !== bid) })),
        bulkAddBrokers: (brks) => {
          let count = 0;
          const newBrokers: Broker[] = brks.map(b => { count++; return { id: id(), name: '', firm: '', email: '', phone: '', website: '', specialty: '', geography: '', notes: '', status: 'active', dealsSent: 0, qualityRating: 3, lastContactDate: '', createdAt: now(), ...b } as Broker; });
          set(s => ({ brokers: [...s.brokers, ...newBrokers], activities: [log('import', `Imported ${count} brokers`, '', 'broker'), ...s.activities].slice(0, 500) }));
          return count;
        },

        // Tasks
        addTask: (task) => { const newId = id(); set(s => ({ tasks: [...s.tasks, { id: newId, title: '', description: '', status: 'todo', priority: 'medium', dueDate: '', assigneeId: '', companyId: '', createdBy: get().currentUserId, createdAt: now(), completedAt: '', tags: [], ...task } as Task] })); return newId; },
        updateTask: (tid, updates) => set(s => ({ tasks: s.tasks.map(t => t.id === tid ? { ...t, ...updates } : t) })),
        deleteTask: (tid) => set(s => ({ tasks: s.tasks.filter(t => t.id !== tid) })),

        // KPIs
        updateKPI: (kid, updates) => set(s => ({ kpis: s.kpis.map(k => k.id === kid ? { ...k, ...updates } : k) })),
        addKPI: (kpi) => { const newId = id(); set(s => ({ kpis: [...s.kpis, { id: newId, name: '', category: 'sourcing', target: 0, current: 0, unit: '', period: 'weekly', ownerId: 'team', trend: [], updatedAt: now(), ...kpi } as KPI] })); return newId; },

        // Research
        addResearch: (item) => {
          const newId = id();
          set(s => ({
            research: [...s.research, { id: newId, title: '', sector: '', type: 'other', url: '', description: '', tags: [], rating: 0, addedBy: getUser()?.name || 'System', createdAt: now(), updatedAt: now(), ...item } as ResearchItem],
            activities: [log('research_added', `Added research: ${item.title || 'untitled'}`, newId, 'research'), ...s.activities].slice(0, 500),
          }));
          return newId;
        },
        updateResearch: (rid, updates) => set(s => ({ research: s.research.map(r => r.id === rid ? { ...r, ...updates, updatedAt: now() } : r) })),
        removeResearch: (rid) => set(s => ({ research: s.research.filter(r => r.id !== rid) })),

        // Custom columns
        addCustomColumn: (col) => {
          const newId = id();
          set(s => ({ customColumns: [...s.customColumns, { ...col, id: newId }] }));
          return newId;
        },
        updateCustomColumn: (cid, updates) => set(s => ({ customColumns: s.customColumns.map(c => c.id === cid ? { ...c, ...updates } : c) })),
        removeCustomColumn: (cid) => set(s => ({ customColumns: s.customColumns.filter(c => c.id !== cid) })),

        // RBAC
        setUserAccess: (userId, modules) => set(s => {
          const existing = s.userAccess.findIndex(u => u.userId === userId);
          if (existing >= 0) { const next = [...s.userAccess]; next[existing] = { userId, modules }; return { userAccess: next }; }
          return { userAccess: [...s.userAccess, { userId, modules }] };
        }),
        getUserAccess: (userId) => get().userAccess.find(u => u.userId === userId),
        canAccess: (userId, module) => {
          const member = get().team.find(t => t.id === userId);
          if (member?.role === 'admin') return 'full';
          const access = get().userAccess.find(u => u.userId === userId);
          if (!access) return 'view'; // default view if no explicit access set
          return access.modules[module] || 'none';
        },

        // Activity
        logActivity: (activity) => set(s => ({ activities: [{ ...activity, id: id(), timestamp: nowFull() }, ...s.activities].slice(0, 500) })),
        logExport: (exportType, count) => {
          set(s => ({ activities: [log('export', `Exported ${count} ${exportType}`, '', exportType), ...s.activities].slice(0, 500) }));
        },

        // Chat
        addChatMessage: (msg) => set(s => ({ chatMessages: [...s.chatMessages, { ...msg, id: id(), timestamp: nowFull() }] })),
        clearChat: () => set({ chatMessages: [] }),

        // Settings
        toggleDark: () => set(s => { const next = !s.darkMode; document.documentElement.classList.toggle('dark', next); return { darkMode: next }; }),
        setCurrentUser: (uid) => set({ currentUserId: uid }),
        setAdminPassword: (pw) => set({ adminPassword: pw }),
      };
    },
    {
      name: 'zenith-store',
      storage: safeStorage,
      onRehydrate: () => {
        // After localStorage rehydration, fetch remote and merge
        setTimeout(async () => {
          try {
            const local = useStore.getState();
            // Backfill new fields
            if (!local.research) useStore.setState({ research: [] });
            if (!local.customColumns) useStore.setState({ customColumns: [] });
            if (!local.userAccess) useStore.setState({ userAccess: [] });
            if (!local.adminPassword) useStore.setState({ adminPassword: 'zenith2026' });
            if (local.darkMode) document.documentElement.classList.add('dark');
            // Backfill customSector/sicCodes on companies
            if (local.companies) {
              const patched = local.companies.map((c: any) => ({ ...c, customSector: c.customSector || '', sicCodes: c.sicCodes || '' }));
              useStore.setState({ companies: patched });
            }

            // Load remote state from Supabase
            const remote = await loadRemoteState();
            if (remote) {
              const updated = useStore.getState();
              const merged = mergeState(updated as any, remote);
              useStore.setState(merged);
            }
            markRemoteLoaded();
          } catch {
            markRemoteLoaded();
          }
        }, 500);
      },
    }
  )
);

// Subscribe to changes and sync to Supabase (debounced)
useStore.subscribe((state) => {
  const { companies, team, brokers, tasks, kpis, activities, research, customColumns, userAccess, darkMode, adminPassword, currentUserId } = state;
  saveRemoteState({ companies, team, brokers, tasks, kpis, activities, research, customColumns, userAccess, darkMode, adminPassword, currentUserId });
});
