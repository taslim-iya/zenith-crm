export type PipelineStage = 'identified' | 'initial_review' | 'outreach' | 'meeting' | 'deep_dive' | 'diligence' | 'loi' | 'closed' | 'passed';
export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked';
export type EmployeeRole = 'principal' | 'partner' | 'associate' | 'analyst' | 'intern' | 'advisor';

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
  thesisFitScore: number; // 1-10
  priority: Priority;
  lastContactDate: string;
  nextStep: string;
  ownerId: string;
  tags: string[];
  notes: string;
  whyInteresting: string;
  risks: string;
  recommendation: string;
  contacts: Contact[];
  interactions: Interaction[];
  documents: Document[];
  createdAt: string;
  updatedAt: string;
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

export interface Document {
  id: string;
  name: string;
  type: string;
  date: string;
  notes: string;
}

export interface Employee {
  id: string;
  name: string;
  title: string;
  role: EmployeeRole;
  team: string;
  managerId: string;
  email: string;
  status: 'active' | 'on_leave' | 'departed';
  avatar: string;
  assignedCompanyIds: string[];
  joinDate: string;
  notes: string;
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
  ownerId: string; // employee or 'team'
  trend: number[]; // last 8 periods
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  type: 'company_added' | 'stage_change' | 'interaction' | 'task_completed' | 'kpi_update' | 'note' | 'import';
  description: string;
  entityId: string;
  entityType: 'company' | 'employee' | 'task' | 'kpi';
  userId: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const STAGES: { key: PipelineStage; label: string; color: string }[] = [
  { key: 'identified', label: 'Identified', color: 'var(--text-3)' },
  { key: 'initial_review', label: 'Initial Review', color: 'var(--blue)' },
  { key: 'outreach', label: 'Outreach', color: 'var(--orange)' },
  { key: 'meeting', label: 'Meeting', color: 'var(--yellow)' },
  { key: 'deep_dive', label: 'Deep Dive', color: '#8b5cf6' },
  { key: 'diligence', label: 'Diligence', color: 'var(--green)' },
  { key: 'loi', label: 'LOI', color: 'var(--gold)' },
  { key: 'closed', label: 'Closed', color: '#10b981' },
  { key: 'passed', label: 'Passed', color: 'var(--red)' },
];

export const SECTORS = [
  'Industrial Services', 'Healthcare Services', 'Business Services', 'Technology',
  'Financial Services', 'Education', 'Environmental Services', 'Logistics',
  'Food & Beverage', 'Construction Services', 'Professional Services', 'Manufacturing',
];

export const GEOGRAPHIES = ['UK - London', 'UK - South East', 'UK - Midlands', 'UK - North', 'UK - Scotland', 'UK - Wales', 'UK - National', 'Europe', 'US'];
