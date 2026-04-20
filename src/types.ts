export type PipelineStage = 'identified' | 'initial_review' | 'outreach' | 'meeting' | 'deep_dive' | 'diligence' | 'loi' | 'closed' | 'passed';
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked';
export type TeamRole = 'admin' | 'principal' | 'partner' | 'associate' | 'analyst' | 'intern' | 'advisor' | 'custom';
export type AccessLevel = 'full' | 'edit' | 'view' | 'none';

export interface UserAccess {
  userId: string;
  modules: Record<string, AccessLevel>;
}

export interface CustomColumn {
  id: string;
  key: string;
  label: string;
  width: number;
  type: 'text' | 'number' | 'select' | 'date' | 'url';
  options?: string[];
  table: string;
  editable: boolean;
}

export interface ResearchItem {
  id: string;
  title: string;
  sector: string;
  type: string;
  url: string;
  description: string;
  tags: string[];
  addedBy: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface Company {
  id: string; name: string; sector: string; subSector: string; geography: string;
  website: string; description: string; source: string;
  status: 'active' | 'inactive' | 'acquired' | 'passed'; stage: PipelineStage;
  revenue: number; ebitda: number; employeeCount: number; estimatedDealSize: number;
  thesisFitScore: number; priority: Priority; lastContactDate: string; nextStep: string;
  ownerId: string; brokerId: string; tags: string[]; notes: string;
  whyInteresting: string; risks: string; recommendation: string;
  contacts: Contact[]; interactions: Interaction[]; documents: DocFile[];
  createdAt: string; updatedAt: string; createdBy: string;
  [key: string]: any;
}

export interface Contact { id: string; name: string; title: string; email: string; phone: string; isPrimary: boolean; notes: string; }
export interface Interaction { id: string; type: 'call' | 'email' | 'meeting' | 'research' | 'diligence' | 'management_meeting' | 'note'; date: string; summary: string; attendees: string; outcome: string; nextAction: string; createdBy: string; }
export interface DocFile { id: string; name: string; type: string; date: string; notes: string; uploadedBy: string; }

export interface TeamMember {
  id: string; name: string; title: string; role: TeamRole; email: string; phone: string;
  status: 'active' | 'on_leave' | 'departed'; joinDate: string; notes: string; createdAt: string;
  [key: string]: any;
}

export interface Broker {
  id: string; name: string; firm: string; email: string; phone: string; website: string;
  specialty: string; geography: string; notes: string; status: 'active' | 'inactive';
  dealsSent: number; qualityRating: number; lastContactDate: string; createdAt: string;
  [key: string]: any;
}

export interface Task { id: string; title: string; description: string; status: TaskStatus; priority: Priority; dueDate: string; assigneeId: string; companyId: string; createdBy: string; createdAt: string; completedAt: string; tags: string[]; }
export interface KPI { id: string; name: string; category: 'sourcing' | 'outreach' | 'diligence' | 'pipeline' | 'productivity' | 'quality'; target: number; current: number; unit: string; period: 'weekly' | 'monthly' | 'quarterly'; ownerId: string; trend: number[]; updatedAt: string; }
export interface ActivityLog { id: string; type: string; description: string; entityId: string; entityType: string; userId: string; userName: string; timestamp: string; }
export interface ChatMessage { id: string; role: 'user' | 'assistant'; content: string; timestamp: string; }

export const STAGES: { key: PipelineStage; label: string; color: string }[] = [
  { key: 'identified', label: 'Identified', color: '#888888' },
  { key: 'initial_review', label: 'Initial Review', color: '#2563eb' },
  { key: 'outreach', label: 'Outreach', color: '#ea580c' },
  { key: 'meeting', label: 'Meeting', color: '#ca8a04' },
  { key: 'deep_dive', label: 'Deep Dive', color: '#8b5cf6' },
  { key: 'diligence', label: 'Diligence', color: '#16a34a' },
  { key: 'loi', label: 'LOI', color: '#B8860B' },
  { key: 'closed', label: 'Closed', color: '#10b981' },
  { key: 'passed', label: 'Passed', color: '#dc2626' },
];

export const SECTORS = [
  'Industrial Services', 'Healthcare Services', 'Business Services', 'Technology',
  'Financial Services', 'Education', 'Environmental Services', 'Logistics',
  'Food & Beverage', 'Construction Services', 'Professional Services', 'Manufacturing',
  'Media & Marketing', 'Real Estate Services', 'Energy', 'Agriculture', 'Other',
];
export const GEOGRAPHIES = ['UK - London', 'UK - South East', 'UK - Midlands', 'UK - North', 'UK - Scotland', 'UK - Wales', 'UK - National', 'Europe', 'US', 'Other'];

export const RESEARCH_TYPES = [
  { key: 'industry_report', label: 'Industry Report' },
  { key: 'market_map', label: 'Market Map' },
  { key: 'thesis_note', label: 'Thesis Note' },
  { key: 'competitor_analysis', label: 'Competitor Analysis' },
  { key: 'financial_model', label: 'Financial Model' },
  { key: 'other', label: 'Other' },
];

export const MODULES = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'companies', label: 'Companies' },
  { key: 'team', label: 'Team' },
  { key: 'brokers', label: 'Brokers' },
  { key: 'kpis', label: 'KPIs' },
  { key: 'chat', label: 'AI Chat' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'research', label: 'Research' },
  { key: 'importExport', label: 'Import / Export' },
  { key: 'teamPortal', label: 'Team Portal' },
  { key: 'settings', label: 'Settings' },
];

export const DEFAULT_COMPANY_COLUMNS = [
  { key: 'name', label: 'Company', width: 200, editable: true, type: 'text' as const },
  { key: 'sector', label: 'Sector', width: 140, editable: true, type: 'select' as const, options: SECTORS },
  { key: 'geography', label: 'Geography', width: 130, editable: true, type: 'select' as const, options: GEOGRAPHIES },
  { key: 'stage', label: 'Stage', width: 120, editable: true, type: 'select' as const, options: STAGES.map(s => s.key) },
  { key: 'revenue', label: 'Revenue', width: 100, editable: true, type: 'number' as const },
  { key: 'ebitda', label: 'EBITDA', width: 100, editable: true, type: 'number' as const },
  { key: 'employeeCount', label: 'Employees', width: 85, editable: true, type: 'number' as const },
  { key: 'estimatedDealSize', label: 'Deal Size', width: 100, editable: true, type: 'number' as const },
  { key: 'thesisFitScore', label: 'Fit', width: 60, editable: true, type: 'number' as const },
  { key: 'priority', label: 'Priority', width: 90, editable: true, type: 'select' as const, options: ['critical', 'high', 'medium', 'low'] },
  { key: 'source', label: 'Source', width: 140, editable: true, type: 'text' as const },
  { key: 'website', label: 'Website', width: 150, editable: true, type: 'url' as const },
  { key: 'lastContactDate', label: 'Last Contact', width: 110, editable: true, type: 'date' as const },
  { key: 'nextStep', label: 'Next Step', width: 180, editable: true, type: 'text' as const },
  { key: 'tags', label: 'Tags', width: 150, editable: false, type: 'text' as const },
  { key: 'notes', label: 'Notes', width: 200, editable: true, type: 'text' as const },
];

export const DEFAULT_BROKER_COLUMNS = [
  { key: 'name', label: 'Contact', width: 160, editable: true, type: 'text' as const },
  { key: 'firm', label: 'Firm', width: 160, editable: true, type: 'text' as const },
  { key: 'specialty', label: 'Specialty', width: 140, editable: true, type: 'text' as const },
  { key: 'geography', label: 'Geography', width: 120, editable: true, type: 'text' as const },
  { key: 'email', label: 'Email', width: 180, editable: true, type: 'text' as const },
  { key: 'phone', label: 'Phone', width: 120, editable: true, type: 'text' as const },
  { key: 'website', label: 'Website', width: 150, editable: true, type: 'url' as const },
  { key: 'qualityRating', label: 'Quality', width: 80, editable: true, type: 'number' as const },
  { key: 'notes', label: 'Notes', width: 200, editable: true, type: 'text' as const },
];

export const DEFAULT_RESEARCH_COLUMNS = [
  { key: 'title', label: 'Title', width: 250, editable: true, type: 'text' as const },
  { key: 'sector', label: 'Sector', width: 140, editable: true, type: 'select' as const, options: SECTORS },
  { key: 'type', label: 'Type', width: 140, editable: true, type: 'select' as const, options: RESEARCH_TYPES.map(r => r.key) },
  { key: 'url', label: 'Link', width: 200, editable: true, type: 'url' as const },
  { key: 'description', label: 'Description', width: 250, editable: true, type: 'text' as const },
  { key: 'addedBy', label: 'Added By', width: 120, editable: false, type: 'text' as const },
  { key: 'createdAt', label: 'Date', width: 100, editable: false, type: 'date' as const },
];

// Backward compat alias
export const COMPANY_COLUMNS = DEFAULT_COMPANY_COLUMNS;
