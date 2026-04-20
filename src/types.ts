export type PipelineStage = 'identified' | 'initial_review' | 'outreach' | 'meeting' | 'deep_dive' | 'diligence' | 'loi' | 'closed' | 'passed';
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked';
export type TeamRole = 'principal' | 'partner' | 'associate' | 'analyst' | 'intern' | 'advisor' | 'custom';

export interface Company {
  id: string;
  name: string;
  sector: string;
  subSector: string;
  geography: string;
  website: string;
  description: string;
  source: string;
  status: 'active' | 'inactive' | 'acquired' | 'passed';
  stage: PipelineStage;
  revenue: number;
  ebitda: number;
  employeeCount: number;
  estimatedDealSize: number;
  thesisFitScore: number;
  priority: Priority;
  lastContactDate: string;
  nextStep: string;
  ownerId: string;
  brokerId: string;
  tags: string[];
  notes: string;
  whyInteresting: string;
  risks: string;
  recommendation: string;
  contacts: Contact[];
  interactions: Interaction[];
  documents: DocFile[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  [key: string]: any; // allow dynamic columns
}

export interface Contact {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  isPrimary: boolean;
  notes: string;
}

export interface Interaction {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'research' | 'diligence' | 'management_meeting' | 'note';
  date: string;
  summary: string;
  attendees: string;
  outcome: string;
  nextAction: string;
  createdBy: string;
}

export interface DocFile {
  id: string;
  name: string;
  type: string;
  date: string;
  notes: string;
  uploadedBy: string;
}

export interface TeamMember {
  id: string;
  name: string;
  title: string;
  role: TeamRole;
  email: string;
  phone: string;
  status: 'active' | 'on_leave' | 'departed';
  joinDate: string;
  notes: string;
  createdAt: string;
}

export interface Broker {
  id: string;
  name: string;
  firm: string;
  email: string;
  phone: string;
  website: string;
  specialty: string;
  geography: string;
  notes: string;
  status: 'active' | 'inactive';
  dealsSent: number;
  qualityRating: number; // 1-5
  lastContactDate: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
  assigneeId: string;
  companyId: string;
  createdBy: string;
  createdAt: string;
  completedAt: string;
  tags: string[];
}

export interface KPI {
  id: string;
  name: string;
  category: 'sourcing' | 'outreach' | 'diligence' | 'pipeline' | 'productivity' | 'quality';
  target: number;
  current: number;
  unit: string;
  period: 'weekly' | 'monthly' | 'quarterly';
  ownerId: string;
  trend: number[];
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  type: 'company_added' | 'company_updated' | 'stage_change' | 'interaction' | 'task_completed' | 'kpi_update' | 'note' | 'import' | 'broker_added' | 'member_added' | 'file_uploaded';
  description: string;
  entityId: string;
  entityType: 'company' | 'team' | 'task' | 'kpi' | 'broker';
  userId: string;
  userName: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

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

// Column definitions for Excel-like table
export const COMPANY_COLUMNS = [
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
  { key: 'website', label: 'Website', width: 150, editable: true, type: 'text' as const },
  { key: 'lastContactDate', label: 'Last Contact', width: 110, editable: true, type: 'date' as const },
  { key: 'nextStep', label: 'Next Step', width: 180, editable: true, type: 'text' as const },
  { key: 'tags', label: 'Tags', width: 150, editable: false, type: 'text' as const },
  { key: 'notes', label: 'Notes', width: 200, editable: true, type: 'text' as const },
];
