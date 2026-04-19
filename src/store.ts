import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Company, Employee, Task, KPI, ActivityLog, ChatMessage, PipelineStage, Priority, TaskStatus, Contact, Interaction } from './types';

let _c = 0;
const id = () => `z${Date.now().toString(36)}${(++_c).toString(36)}`;

// Demo employees
const EMPLOYEES: Employee[] = [
  { id: 'emp1', name: 'James Whitfield', title: 'Principal', role: 'principal', team: 'Leadership', managerId: '', email: 'james@zenithsf.com', status: 'active', avatar: 'JW', assignedCompanyIds: ['c1','c3','c7'], joinDate: '2024-01-15', notes: 'Founder and lead searcher' },
  { id: 'emp2', name: 'Sarah Chen', title: 'Associate', role: 'associate', team: 'Deal Team', managerId: 'emp1', email: 'sarah@zenithsf.com', status: 'active', avatar: 'SC', assignedCompanyIds: ['c2','c4','c8','c12'], joinDate: '2024-06-01', notes: 'Ex-McKinsey, strong in industrial analysis' },
  { id: 'emp3', name: 'Oliver Patel', title: 'Analyst', role: 'analyst', team: 'Deal Team', managerId: 'emp2', email: 'oliver@zenithsf.com', status: 'active', avatar: 'OP', assignedCompanyIds: ['c5','c6','c9','c10','c11'], joinDate: '2025-01-10', notes: 'Cambridge MBA, focuses on sourcing' },
  { id: 'emp4', name: 'Emma Richardson', title: 'Intern', role: 'intern', team: 'Research', managerId: 'emp2', email: 'emma@zenithsf.com', status: 'active', avatar: 'ER', assignedCompanyIds: ['c13','c14','c15'], joinDate: '2025-09-01', notes: 'CJBS intern, market mapping' },
  { id: 'emp5', name: 'David Montgomery', title: 'Advisor', role: 'advisor', team: 'Advisory', managerId: '', email: 'david@zenithsf.com', status: 'active', avatar: 'DM', assignedCompanyIds: [], joinDate: '2024-03-01', notes: 'Operating partner, 20 years industrial experience' },
];

const mkDate = (daysAgo: number) => { const d = new Date(); d.setDate(d.getDate() - daysAgo); return d.toISOString().split('T')[0]; };

// Demo companies
const COMPANIES: Company[] = [
  { id: 'c1', name: 'Greenfield Environmental Ltd', sector: 'Environmental Services', subSector: 'Waste Management', geography: 'UK - South East', website: 'greenfield-env.co.uk', description: 'Commercial waste management and recycling services for SMEs across the South East. Strong recurring revenue model with 85% retention rate.', source: 'Broker - Corporate Finance Partners', status: 'active', stage: 'diligence', revenue: 4200000, ebitda: 840000, employeeCount: 45, estimatedDealSize: 3500000, thesisFitScore: 9, priority: 'critical', lastContactDate: mkDate(2), nextStep: 'Complete management interviews', ownerId: 'emp1', tags: ['recurring revenue', 'founder exit', 'fragmented market'], notes: 'Strong unit economics. Founder retiring. Good culture.', whyInteresting: 'Highly recurring B2B waste contracts. Fragmented market with bolt-on potential. Strong margins above sector average.', risks: 'Key man risk with founder relationships. Regulatory changes pending in waste sector.', recommendation: 'Proceed to LOI. Strong fit with thesis.', contacts: [{ id: 'ct1', name: 'Robert Greenfield', title: 'Founder & MD', email: 'robert@greenfield-env.co.uk', phone: '+44 7700 123456', isPrimary: true, notes: 'Ready to retire, wants smooth transition' }], interactions: [{ id: 'i1', type: 'meeting', date: mkDate(2), summary: 'Site visit and management meeting', attendees: 'James, Sarah, Robert', outcome: 'Positive impression. Clean operations. Good team.', nextAction: 'Request detailed financials for last 5 years', createdBy: 'emp1' }, { id: 'i2', type: 'call', date: mkDate(10), summary: 'Initial call with broker', attendees: 'James, CFP broker', outcome: 'Company fits our thesis perfectly', nextAction: 'Schedule site visit', createdBy: 'emp1' }], documents: [{ id: 'd1', name: 'CIM_Greenfield_2026.pdf', type: 'CIM', date: mkDate(15), notes: 'Full confidential information memorandum' }], createdAt: mkDate(30), updatedAt: mkDate(2) },
  { id: 'c2', name: 'Meridian Tech Services', sector: 'Technology', subSector: 'IT Managed Services', geography: 'UK - Midlands', website: 'meridian-tech.co.uk', description: 'Managed IT services provider for mid-market companies. MRR-based model with long-term contracts.', source: 'Direct approach', status: 'active', stage: 'deep_dive', revenue: 3100000, ebitda: 620000, employeeCount: 28, estimatedDealSize: 2800000, thesisFitScore: 8, priority: 'high', lastContactDate: mkDate(5), nextStep: 'Financial deep dive with FD', ownerId: 'emp2', tags: ['mrr', 'technology', 'sticky contracts'], notes: 'Very clean financials. Strong NPS scores.', whyInteresting: '90% recurring revenue. 3-year average contracts. Growing 15% YoY.', risks: 'Technology disruption risk. Key technical staff retention.', recommendation: 'Continue deep dive. Request customer references.', contacts: [{ id: 'ct2', name: 'Priya Sharma', title: 'CEO', email: 'priya@meridian-tech.co.uk', phone: '+44 7700 234567', isPrimary: true, notes: 'Second-gen owner, exploring options' }], interactions: [{ id: 'i3', type: 'meeting', date: mkDate(5), summary: 'Video call - deep dive on financials', attendees: 'Sarah, Priya, FD', outcome: 'Clean books, strong cash conversion', nextAction: 'Schedule on-site visit', createdBy: 'emp2' }], documents: [], createdAt: mkDate(25), updatedAt: mkDate(5) },
  { id: 'c3', name: 'Atlas Industrial Coatings', sector: 'Industrial Services', subSector: 'Surface Treatment', geography: 'UK - North', website: 'atlas-coatings.co.uk', description: 'Specialist industrial coating and surface treatment for aerospace, automotive and marine sectors.', source: 'Industry conference', status: 'active', stage: 'meeting', revenue: 5800000, ebitda: 1160000, employeeCount: 62, estimatedDealSize: 5000000, thesisFitScore: 7, priority: 'high', lastContactDate: mkDate(8), nextStep: 'Second meeting with management team', ownerId: 'emp1', tags: ['niche', 'aerospace', 'capex-light'], notes: 'Strong niche positioning but concentrated customer base.', whyInteresting: 'Specialist niche with high barriers to entry. Aerospace certification moat.', risks: 'Top 3 customers = 55% revenue. Capex cycle dependency.', recommendation: 'Proceed cautiously. Need to assess customer concentration risk.', contacts: [{ id: 'ct3', name: 'Mark Thompson', title: 'Managing Director', email: 'mark@atlas-coatings.co.uk', phone: '+44 7700 345678', isPrimary: true, notes: 'Open to acquisition but wants to stay on' }], interactions: [{ id: 'i4', type: 'meeting', date: mkDate(8), summary: 'First in-person meeting', attendees: 'James, Mark', outcome: 'Good cultural fit. Needs more financial diligence.', nextAction: 'Request customer breakdown', createdBy: 'emp1' }], documents: [], createdAt: mkDate(20), updatedAt: mkDate(8) },
  { id: 'c4', name: 'Brightpath Education Group', sector: 'Education', subSector: 'Vocational Training', geography: 'UK - London', website: 'brightpath.edu', description: 'Vocational training and apprenticeship provider. Government-funded contracts with strong pipeline.', source: 'Network referral', status: 'active', stage: 'outreach', revenue: 2800000, ebitda: 420000, employeeCount: 35, estimatedDealSize: 2000000, thesisFitScore: 6, priority: 'medium', lastContactDate: mkDate(12), nextStep: 'Follow up on intro email', ownerId: 'emp2', tags: ['education', 'government contracts', 'recession-resistant'], notes: 'Government funding dependent but stable.', whyInteresting: 'Counter-cyclical revenue. Growing demand for vocational training.', risks: 'Government funding policy changes. Ofsted rating dependency.', recommendation: 'Continue outreach. Worth exploring.', contacts: [], interactions: [{ id: 'i5', type: 'email', date: mkDate(12), summary: 'Initial outreach email sent', attendees: '', outcome: 'Awaiting response', nextAction: 'Follow up in 5 days', createdBy: 'emp2' }], documents: [], createdAt: mkDate(15), updatedAt: mkDate(12) },
  { id: 'c5', name: 'Sterling Facilities Management', sector: 'Business Services', subSector: 'Facilities Management', geography: 'UK - National', website: 'sterlingfm.co.uk', description: 'National facilities management company serving commercial properties. Mix of contracted and ad-hoc work.', source: 'Companies House research', status: 'active', stage: 'initial_review', revenue: 7500000, ebitda: 900000, employeeCount: 120, estimatedDealSize: 4500000, thesisFitScore: 7, priority: 'medium', lastContactDate: mkDate(3), nextStep: 'Complete initial financial review', ownerId: 'emp3', tags: ['facilities', 'national', 'labour-intensive'], notes: 'Large but lower margin. Good platform for bolt-ons.', whyInteresting: 'Platform acquisition potential. Fragmented market.', risks: 'Labour-intensive. Margin compression risk.', recommendation: 'Review financials before outreach.', contacts: [], interactions: [], documents: [], createdAt: mkDate(10), updatedAt: mkDate(3) },
  { id: 'c6', name: 'Pinnacle Healthcare Staffing', sector: 'Healthcare Services', subSector: 'Healthcare Staffing', geography: 'UK - South East', website: 'pinnaclestaffing.co.uk', description: 'Specialist healthcare staffing agency providing nurses, care workers and allied health professionals.', source: 'Broker - Clearwater', status: 'active', stage: 'outreach', revenue: 4800000, ebitda: 720000, employeeCount: 18, estimatedDealSize: 3200000, thesisFitScore: 8, priority: 'high', lastContactDate: mkDate(7), nextStep: 'Schedule introductory call', ownerId: 'emp3', tags: ['healthcare', 'staffing', 'resilient demand'], notes: 'Strong sector dynamics. NHS demand driver.', whyInteresting: 'Structural demand for healthcare staffing. Asset-light model.', risks: 'IR35 regulation. Agency margin squeeze from NHS.', recommendation: 'Good fit. Push to get meeting scheduled.', contacts: [{ id: 'ct6', name: 'Janet Willis', title: 'Owner', email: 'janet@pinnaclestaffing.co.uk', phone: '+44 7700 456789', isPrimary: true, notes: '' }], interactions: [], documents: [], createdAt: mkDate(14), updatedAt: mkDate(7) },
  { id: 'c7', name: 'Forge Engineering Solutions', sector: 'Manufacturing', subSector: 'Precision Engineering', geography: 'UK - Midlands', website: 'forge-eng.co.uk', description: 'Precision engineering and CNC machining for defence, medical devices and automotive.', source: 'Direct approach', status: 'active', stage: 'loi', revenue: 6200000, ebitda: 1550000, employeeCount: 48, estimatedDealSize: 7000000, thesisFitScore: 9, priority: 'critical', lastContactDate: mkDate(1), nextStep: 'Finalise LOI terms', ownerId: 'emp1', tags: ['precision engineering', 'defence', 'high margins', 'loi stage'], notes: 'Exceptional margins. Strong IP and certifications.', whyInteresting: 'Best-in-class margins (25% EBITDA). Defence/medical device certifications are 2+ year moat. Owner motivated.', risks: 'Capital-intensive. Key customer MoD contract renewal in 18 months.', recommendation: 'Strong buy. Finalise LOI this week.', contacts: [{ id: 'ct7', name: 'Alan Forge', title: 'Founder', email: 'alan@forge-eng.co.uk', phone: '+44 7700 567890', isPrimary: true, notes: 'Retiring, wants legacy protected' }], interactions: [{ id: 'i7', type: 'meeting', date: mkDate(1), summary: 'LOI negotiation meeting', attendees: 'James, David (advisor), Alan, solicitor', outcome: 'Agreed headline terms. Working on LOI draft.', nextAction: 'Send LOI draft by Friday', createdBy: 'emp1' }], documents: [{ id: 'd7', name: 'LOI_Draft_v2.docx', type: 'LOI', date: mkDate(1), notes: 'Latest draft with agreed terms' }], createdAt: mkDate(60), updatedAt: mkDate(1) },
  { id: 'c8', name: 'Northstar Logistics', sector: 'Logistics', subSector: 'Last-mile Delivery', geography: 'UK - North', website: 'northstarlogistics.co.uk', description: 'Last-mile delivery and fulfilment services for e-commerce brands.', source: 'ProspectIQ database', status: 'active', stage: 'identified', revenue: 3400000, ebitda: 340000, employeeCount: 55, estimatedDealSize: 1800000, thesisFitScore: 5, priority: 'low', lastContactDate: '', nextStep: 'Initial desk research', ownerId: 'emp2', tags: ['logistics', 'e-commerce', 'competitive'], notes: 'Interesting but competitive space.', whyInteresting: 'E-commerce tailwind. Good geography.', risks: 'Very competitive. Amazon flex threat.', recommendation: 'Low priority. Review if capacity allows.', contacts: [], interactions: [], documents: [], createdAt: mkDate(5), updatedAt: mkDate(5) },
  { id: 'c9', name: 'Cascade Water Treatment', sector: 'Environmental Services', subSector: 'Water Treatment', geography: 'UK - South East', website: 'cascadewater.co.uk', description: 'Water treatment and legionella compliance services for commercial buildings.', source: 'Broker - Translink', status: 'active', stage: 'meeting', revenue: 2200000, ebitda: 550000, employeeCount: 22, estimatedDealSize: 2500000, thesisFitScore: 8, priority: 'high', lastContactDate: mkDate(4), nextStep: 'Management presentation next Tuesday', ownerId: 'emp3', tags: ['compliance', 'recurring', 'niche'], notes: 'Compliance-driven recurring revenue. Excellent margins.', whyInteresting: 'Regulatory moat. 25% EBITDA margins. Very sticky customer base.', risks: 'Small. Key man risk with technical MD.', recommendation: 'Strong interest. Fast-track to deep dive after meeting.', contacts: [{ id: 'ct9', name: 'Steve Palmer', title: 'Technical MD', email: 'steve@cascadewater.co.uk', phone: '+44 7700 678901', isPrimary: true, notes: '' }], interactions: [], documents: [], createdAt: mkDate(18), updatedAt: mkDate(4) },
  { id: 'c10', name: 'Summit Financial Planning', sector: 'Financial Services', subSector: 'IFA / Wealth Management', geography: 'UK - London', website: 'summit-fp.co.uk', description: 'Independent financial advisory firm with AUM of £180m and growing.', source: 'Direct approach', status: 'active', stage: 'initial_review', revenue: 1800000, ebitda: 540000, employeeCount: 12, estimatedDealSize: 3000000, thesisFitScore: 7, priority: 'medium', lastContactDate: mkDate(6), nextStep: 'Analyse AUM growth trajectory', ownerId: 'emp3', tags: ['ifa', 'recurring aum', 'regulated'], notes: 'Good recurring fee model. FCA regulated.', whyInteresting: 'Growing AUM = compounding revenue. High client retention.', risks: 'FCA regulation. Key advisor dependency.', recommendation: 'Worth pursuing. IFA consolidation play.', contacts: [], interactions: [], documents: [], createdAt: mkDate(12), updatedAt: mkDate(6) },
  { id: 'c11', name: 'Vanguard Construction Services', sector: 'Construction Services', subSector: 'Specialist Subcontractor', geography: 'UK - Midlands', website: 'vanguardcs.co.uk', description: 'Specialist groundworks and drainage contractor for residential developers.', source: 'Industry contact', status: 'active', stage: 'outreach', revenue: 8200000, ebitda: 820000, employeeCount: 85, estimatedDealSize: 4000000, thesisFitScore: 5, priority: 'low', lastContactDate: mkDate(15), nextStep: 'Follow up with owner', ownerId: 'emp3', tags: ['construction', 'cyclical', 'subcontractor'], notes: 'Good revenue but cyclical exposure concerns.', whyInteresting: 'Large revenue base. Strong local reputation.', risks: 'Highly cyclical. Housebuilder dependency.', recommendation: 'Lower priority due to cyclicality.', contacts: [], interactions: [], documents: [], createdAt: mkDate(20), updatedAt: mkDate(15) },
  { id: 'c12', name: 'Phoenix Food Services', sector: 'Food & Beverage', subSector: 'Contract Catering', geography: 'UK - London', website: 'phoenixfood.co.uk', description: 'Contract catering for corporate offices and events in London.', source: 'Network referral', status: 'active', stage: 'deep_dive', revenue: 3600000, ebitda: 540000, employeeCount: 40, estimatedDealSize: 2500000, thesisFitScore: 7, priority: 'medium', lastContactDate: mkDate(3), nextStep: 'Review contract portfolio', ownerId: 'emp2', tags: ['catering', 'london', 'post-covid recovery'], notes: 'Recovered well from COVID. Good contract book.', whyInteresting: 'Post-COVID rebound. Long-term corporate contracts.', risks: 'Labour costs rising. Hybrid working impact.', recommendation: 'Continue analysis. Need to stress-test revenue resilience.', contacts: [], interactions: [], documents: [], createdAt: mkDate(22), updatedAt: mkDate(3) },
  { id: 'c13', name: 'Beacon Electrical Contractors', sector: 'Construction Services', subSector: 'Electrical Contracting', geography: 'UK - South East', website: 'beaconelectrical.co.uk', description: 'Commercial and industrial electrical contractor.', source: 'Market mapping', status: 'active', stage: 'identified', revenue: 2900000, ebitda: 435000, employeeCount: 30, estimatedDealSize: 2000000, thesisFitScore: 6, priority: 'medium', lastContactDate: '', nextStep: 'Desk research and qualify', ownerId: 'emp4', tags: ['electrical', 'trade', 'fragmented'], notes: '', whyInteresting: 'Fragmented sector. EV charging tailwind.', risks: 'Cyclical. Labour shortage.', recommendation: 'Qualify further.', contacts: [], interactions: [], documents: [], createdAt: mkDate(3), updatedAt: mkDate(3) },
  { id: 'c14', name: 'Orion Professional Services', sector: 'Professional Services', subSector: 'HR Consulting', geography: 'UK - London', website: 'orionps.co.uk', description: 'HR consulting and outsourced HR services for SMEs.', source: 'Market mapping', status: 'active', stage: 'identified', revenue: 1500000, ebitda: 375000, employeeCount: 10, estimatedDealSize: 1500000, thesisFitScore: 6, priority: 'low', lastContactDate: '', nextStep: 'Initial assessment', ownerId: 'emp4', tags: ['hr', 'outsourced', 'sme'], notes: '', whyInteresting: 'Asset-light. Growing demand for outsourced HR.', risks: 'Small. Competitive market.', recommendation: 'Review if aligned with thesis.', contacts: [], interactions: [], documents: [], createdAt: mkDate(2), updatedAt: mkDate(2) },
  { id: 'c15', name: 'Apex Cleaning Group', sector: 'Business Services', subSector: 'Commercial Cleaning', geography: 'UK - National', website: 'apexcleaning.co.uk', description: 'Commercial cleaning services for offices, retail and healthcare.', source: 'ProspectIQ database', status: 'active', stage: 'identified', revenue: 5100000, ebitda: 510000, employeeCount: 200, estimatedDealSize: 2500000, thesisFitScore: 5, priority: 'low', lastContactDate: '', nextStep: 'Sector research', ownerId: 'emp4', tags: ['cleaning', 'labour-intensive', 'platform'], notes: '', whyInteresting: 'Platform potential. Recurring contracts.', risks: 'Very labour-intensive. Thin margins.', recommendation: 'Low priority unless thesis expands.', contacts: [], interactions: [], documents: [], createdAt: mkDate(1), updatedAt: mkDate(1) },
];

// Demo tasks
const TASKS: Task[] = [
  { id: 't1', title: 'Finalise LOI terms for Forge Engineering', description: 'Complete LOI draft incorporating agreed terms from Monday meeting', status: 'in_progress', priority: 'critical', dueDate: mkDate(-2), assigneeId: 'emp1', companyId: 'c7', createdBy: 'emp1', createdAt: mkDate(3), completedAt: '', tags: ['loi'] },
  { id: 't2', title: 'Complete management interviews - Greenfield', description: 'Schedule and conduct remaining management team interviews', status: 'in_progress', priority: 'critical', dueDate: mkDate(-1), assigneeId: 'emp1', companyId: 'c1', createdBy: 'emp1', createdAt: mkDate(5), completedAt: '', tags: ['diligence'] },
  { id: 't3', title: 'Financial deep dive - Meridian Tech', description: 'Analyse 5 years of financials, cash conversion, working capital', status: 'todo', priority: 'high', dueDate: mkDate(-3), assigneeId: 'emp2', companyId: 'c2', createdBy: 'emp1', createdAt: mkDate(7), completedAt: '', tags: ['financial analysis'] },
  { id: 't4', title: 'Prepare management presentation - Cascade Water', description: 'Build presentation deck for next Tuesday management meeting', status: 'in_progress', priority: 'high', dueDate: mkDate(-1), assigneeId: 'emp3', companyId: 'c9', createdBy: 'emp2', createdAt: mkDate(5), completedAt: '', tags: ['meeting prep'] },
  { id: 't5', title: 'Market mapping - Environmental Services subsectors', description: 'Complete market map of UK environmental services subsectors for pipeline building', status: 'in_progress', priority: 'medium', dueDate: mkDate(-5), assigneeId: 'emp4', companyId: '', createdBy: 'emp2', createdAt: mkDate(14), completedAt: '', tags: ['research'] },
  { id: 't6', title: 'Follow up Brightpath Education intro email', description: 'Send follow-up email. Original sent 12 days ago with no response.', status: 'todo', priority: 'medium', dueDate: mkDate(-2), assigneeId: 'emp2', companyId: 'c4', createdBy: 'emp2', createdAt: mkDate(5), completedAt: '', tags: ['outreach'] },
  { id: 't7', title: 'Customer reference calls - Greenfield', description: 'Call 3 key customers to validate service quality and retention', status: 'todo', priority: 'high', dueDate: mkDate(-4), assigneeId: 'emp2', companyId: 'c1', createdBy: 'emp1', createdAt: mkDate(8), completedAt: '', tags: ['diligence'] },
  { id: 't8', title: 'Desk research - Beacon Electrical', description: 'Initial research on Beacon Electrical - financials, market position, competition', status: 'todo', priority: 'low', dueDate: mkDate(-7), assigneeId: 'emp4', companyId: 'c13', createdBy: 'emp3', createdAt: mkDate(3), completedAt: '', tags: ['research'] },
  { id: 't9', title: 'Update pipeline tracker for weekly review', description: 'Refresh all company statuses and next steps before Friday team meeting', status: 'done', priority: 'medium', dueDate: mkDate(2), assigneeId: 'emp3', companyId: '', createdBy: 'emp2', createdAt: mkDate(5), completedAt: mkDate(2), tags: ['admin'] },
  { id: 't10', title: 'Sector analysis - Healthcare Staffing', description: 'Deep dive into UK healthcare staffing market dynamics, regulation, M&A activity', status: 'done', priority: 'high', dueDate: mkDate(5), assigneeId: 'emp3', companyId: 'c6', createdBy: 'emp2', createdAt: mkDate(10), completedAt: mkDate(4), tags: ['research'] },
  { id: 't11', title: 'Review contract portfolio - Phoenix Food', description: 'Analyse top 20 contracts by revenue, expiry dates, renewal terms', status: 'in_progress', priority: 'medium', dueDate: mkDate(-2), assigneeId: 'emp2', companyId: 'c12', createdBy: 'emp2', createdAt: mkDate(5), completedAt: '', tags: ['analysis'] },
  { id: 't12', title: 'Send outreach email - Pinnacle Healthcare', description: 'Draft and send personalised outreach to Janet Willis', status: 'todo', priority: 'high', dueDate: mkDate(-1), assigneeId: 'emp3', companyId: 'c6', createdBy: 'emp2', createdAt: mkDate(3), completedAt: '', tags: ['outreach'] },
];

// Demo KPIs
const KPIS: KPI[] = [
  { id: 'k1', name: 'Companies Sourced', category: 'sourcing', target: 20, current: 15, unit: 'companies', period: 'monthly', ownerId: 'team', trend: [8,12,10,14,11,15,13,15], updatedAt: mkDate(0) },
  { id: 'k2', name: 'Qualified Targets', category: 'sourcing', target: 8, current: 6, unit: 'companies', period: 'monthly', ownerId: 'team', trend: [3,5,4,6,5,7,5,6], updatedAt: mkDate(0) },
  { id: 'k3', name: 'Outreach Emails Sent', category: 'outreach', target: 40, current: 28, unit: 'emails', period: 'monthly', ownerId: 'team', trend: [20,25,30,22,35,28,32,28], updatedAt: mkDate(0) },
  { id: 'k4', name: 'Reply Rate', category: 'outreach', target: 30, current: 22, unit: '%', period: 'monthly', ownerId: 'team', trend: [18,20,25,22,19,24,21,22], updatedAt: mkDate(0) },
  { id: 'k5', name: 'Meetings Booked', category: 'outreach', target: 10, current: 7, unit: 'meetings', period: 'monthly', ownerId: 'team', trend: [4,6,5,8,6,7,5,7], updatedAt: mkDate(0) },
  { id: 'k6', name: 'Active Opportunities', category: 'pipeline', target: 12, current: 10, unit: 'companies', period: 'monthly', ownerId: 'team', trend: [6,7,8,9,10,11,10,10], updatedAt: mkDate(0) },
  { id: 'k7', name: 'Stage Conversion Rate', category: 'pipeline', target: 40, current: 35, unit: '%', period: 'monthly', ownerId: 'team', trend: [30,28,32,35,33,38,34,35], updatedAt: mkDate(0) },
  { id: 'k8', name: 'Avg Days in Stage', category: 'pipeline', target: 14, current: 18, unit: 'days', period: 'monthly', ownerId: 'team', trend: [22,20,19,18,17,16,18,18], updatedAt: mkDate(0) },
  { id: 'k9', name: 'Tasks Completed', category: 'productivity', target: 25, current: 18, unit: 'tasks', period: 'weekly', ownerId: 'team', trend: [15,18,20,16,22,19,17,18], updatedAt: mkDate(0) },
  { id: 'k10', name: 'Overdue Tasks', category: 'productivity', target: 0, current: 5, unit: 'tasks', period: 'weekly', ownerId: 'team', trend: [3,2,4,3,5,4,6,5], updatedAt: mkDate(0) },
  // Per-employee KPIs
  { id: 'k11', name: 'Companies Sourced', category: 'sourcing', target: 5, current: 4, unit: 'companies', period: 'weekly', ownerId: 'emp3', trend: [3,4,5,3,4,5,3,4], updatedAt: mkDate(0) },
  { id: 'k12', name: 'Companies Sourced', category: 'sourcing', target: 3, current: 3, unit: 'companies', period: 'weekly', ownerId: 'emp4', trend: [2,3,2,3,3,2,3,3], updatedAt: mkDate(0) },
  { id: 'k13', name: 'Outreach Volume', category: 'outreach', target: 15, current: 12, unit: 'emails', period: 'weekly', ownerId: 'emp3', trend: [10,12,14,11,13,12,14,12], updatedAt: mkDate(0) },
  { id: 'k14', name: 'Diligence Items Completed', category: 'diligence', target: 4, current: 3, unit: 'items', period: 'weekly', ownerId: 'emp2', trend: [2,3,4,3,3,4,2,3], updatedAt: mkDate(0) },
];

// Demo activity
const ACTIVITIES: ActivityLog[] = [
  { id: 'a1', type: 'interaction', description: 'LOI negotiation meeting with Forge Engineering', entityId: 'c7', entityType: 'company', userId: 'emp1', timestamp: mkDate(1) + 'T14:30:00Z' },
  { id: 'a2', type: 'stage_change', description: 'Greenfield Environmental moved to Diligence', entityId: 'c1', entityType: 'company', userId: 'emp1', timestamp: mkDate(2) + 'T10:00:00Z' },
  { id: 'a3', type: 'task_completed', description: 'Completed healthcare staffing sector analysis', entityId: 't10', entityType: 'task', userId: 'emp3', timestamp: mkDate(4) + 'T16:00:00Z' },
  { id: 'a4', type: 'company_added', description: 'Added Apex Cleaning Group to pipeline', entityId: 'c15', entityType: 'company', userId: 'emp4', timestamp: mkDate(1) + 'T09:00:00Z' },
  { id: 'a5', type: 'interaction', description: 'Deep dive call with Meridian Tech FD', entityId: 'c2', entityType: 'company', userId: 'emp2', timestamp: mkDate(5) + 'T11:00:00Z' },
  { id: 'a6', type: 'company_added', description: 'Added Orion Professional Services', entityId: 'c14', entityType: 'company', userId: 'emp4', timestamp: mkDate(2) + 'T14:00:00Z' },
  { id: 'a7', type: 'stage_change', description: 'Forge Engineering moved to LOI stage', entityId: 'c7', entityType: 'company', userId: 'emp1', timestamp: mkDate(3) + 'T09:30:00Z' },
  { id: 'a8', type: 'task_completed', description: 'Pipeline tracker updated for weekly review', entityId: 't9', entityType: 'task', userId: 'emp3', timestamp: mkDate(2) + 'T17:00:00Z' },
];

interface ZenithStore {
  companies: Company[];
  employees: Employee[];
  tasks: Task[];
  kpis: KPI[];
  activities: ActivityLog[];
  chatMessages: ChatMessage[];
  darkMode: boolean;
  
  // Company actions
  addCompany: (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateCompany: (id: string, updates: Partial<Company>) => void;
  deleteCompany: (id: string) => void;
  addInteraction: (companyId: string, interaction: Omit<Interaction, 'id'>) => void;
  
  // Employee actions
  addEmployee: (employee: Omit<Employee, 'id'>) => string;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completedAt'>) => string;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  
  // KPI actions
  updateKPI: (id: string, updates: Partial<KPI>) => void;
  addKPI: (kpi: Omit<KPI, 'id'>) => string;
  
  // Activity
  logActivity: (activity: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  
  // Chat
  addChatMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearChat: () => void;
  
  // Theme
  toggleDark: () => void;
}

export const useStore = create<ZenithStore>()(
  persist(
    (set, get) => ({
      companies: COMPANIES,
      employees: EMPLOYEES,
      tasks: TASKS,
      kpis: KPIS,
      activities: ACTIVITIES,
      chatMessages: [],
      darkMode: false,

      addCompany: (company) => {
        const newId = id();
        const now = new Date().toISOString().split('T')[0];
        set(s => ({ companies: [...s.companies, { ...company, id: newId, createdAt: now, updatedAt: now }] }));
        return newId;
      },
      updateCompany: (cid, updates) => set(s => ({
        companies: s.companies.map(c => c.id === cid ? { ...c, ...updates, updatedAt: new Date().toISOString().split('T')[0] } : c)
      })),
      deleteCompany: (cid) => set(s => ({ companies: s.companies.filter(c => c.id !== cid) })),
      addInteraction: (companyId, interaction) => set(s => ({
        companies: s.companies.map(c => c.id === companyId ? { ...c, interactions: [{ ...interaction, id: id() }, ...c.interactions] } : c)
      })),

      addEmployee: (employee) => {
        const newId = id();
        set(s => ({ employees: [...s.employees, { ...employee, id: newId }] }));
        return newId;
      },
      updateEmployee: (eid, updates) => set(s => ({
        employees: s.employees.map(e => e.id === eid ? { ...e, ...updates } : e)
      })),

      addTask: (task) => {
        const newId = id();
        set(s => ({ tasks: [...s.tasks, { ...task, id: newId, createdAt: new Date().toISOString().split('T')[0], completedAt: '' }] }));
        return newId;
      },
      updateTask: (tid, updates) => set(s => ({
        tasks: s.tasks.map(t => t.id === tid ? { ...t, ...updates } : t)
      })),
      deleteTask: (tid) => set(s => ({ tasks: s.tasks.filter(t => t.id !== tid) })),

      updateKPI: (kid, updates) => set(s => ({
        kpis: s.kpis.map(k => k.id === kid ? { ...k, ...updates } : k)
      })),
      addKPI: (kpi) => {
        const newId = id();
        set(s => ({ kpis: [...s.kpis, { ...kpi, id: newId }] }));
        return newId;
      },

      logActivity: (activity) => set(s => ({
        activities: [{ ...activity, id: id(), timestamp: new Date().toISOString() }, ...s.activities].slice(0, 200)
      })),

      addChatMessage: (msg) => set(s => ({
        chatMessages: [...s.chatMessages, { ...msg, id: id(), timestamp: new Date().toISOString() }]
      })),
      clearChat: () => set({ chatMessages: [] }),

      toggleDark: () => set(s => {
        const next = !s.darkMode;
        document.documentElement.classList.toggle('dark', next);
        return { darkMode: next };
      }),
    }),
    {
      name: 'zenith-store',
      onRehydrate: () => (state) => {
        if (state?.darkMode) document.documentElement.classList.add('dark');
      },
    }
  )
);
