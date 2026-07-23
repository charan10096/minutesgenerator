export type MeetingStatus = 'uploaded' | 'processing' | 'completed' | 'failed';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type ActionStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';
export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';
export type RiskCategory = 'project' | 'technical' | 'budget' | 'timeline' | 'communication';
export type ExportFormat = 'markdown' | 'json' | 'csv' | 'pdf' | 'docx';

export interface Meeting {
  id: string;
  user_id: string;
  title: string;
  file_name: string | null;
  file_type: string | null;
  file_size: number | null;
  raw_transcript: string | null;
  clean_transcript: string | null;
  language: string | null;
  participants: string[];
  status: MeetingStatus;
  processing_error: string | null;
  confidence_score: number | null;
  sentiment: string | null;
  meeting_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface MeetingSummary {
  id: string;
  meeting_id: string;
  executive_summary: string | null;
  detailed_summary: string | null;
  bullet_summary: string | null;
  timeline_summary: string | null;
  highlights: string[];
  agenda: string[];
  discussion_points: string[];
  created_at: string;
}

export interface ActionItem {
  id: string;
  meeting_id: string;
  task: string;
  owner: string | null;
  department: string | null;
  priority: Priority;
  status: ActionStatus;
  deadline: string | null;
  estimated_effort: string | null;
  dependencies: string | null;
  confidence_score: number | null;
  created_at: string;
  updated_at: string;
}

export interface Risk {
  id: string;
  meeting_id: string;
  risk: string;
  category: RiskCategory;
  severity: RiskSeverity;
  mitigation: string | null;
  confidence_score: number | null;
  created_at: string;
}

export interface Decision {
  id: string;
  meeting_id: string;
  decision: string;
  decision_maker: string | null;
  reason: string | null;
  impact: string | null;
  confidence_score: number | null;
  created_at: string;
}

export interface Deadline {
  id: string;
  meeting_id: string;
  task: string;
  owner: string | null;
  due_date: string;
  priority: Priority;
  status: ActionStatus;
  created_at: string;
}

export interface ExportRecord {
  id: string;
  meeting_id: string;
  format: ExportFormat;
  content: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string | null;
  read: boolean;
  meeting_id: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  company: string | null;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalMeetings: number;
  actionItems: number;
  pendingActions: number;
  completedActions: number;
  risksDetected: number;
  decisionsTaken: number;
}

export interface LLMMeetingResult {
  title: string;
  participants: string[];
  agenda: string[];
  executive_summary: string;
  detailed_summary: string;
  bullet_summary: string[];
  timeline_summary: string;
  highlights: string[];
  discussion_points: string[];
  decisions: Array<{
    decision: string;
    decision_maker: string;
    reason: string;
    impact: string;
    confidence_score: number;
  }>;
  risks: Array<{
    risk: string;
    category: RiskCategory;
    severity: RiskSeverity;
    mitigation: string;
    confidence_score: number;
  }>;
  action_items: Array<{
    task: string;
    owner: string;
    department: string;
    priority: Priority;
    deadline: string | null;
    estimated_effort: string;
    dependencies: string;
    confidence_score: number;
  }>;
  confidence_score: number;
  sentiment: 'positive' | 'neutral' | 'negative' | 'mixed';
  language: string;
}
