// ─────────────────────────────────────────────────────────────────────────
// ICAP — Core Domain Types
// Iraq Conflict Analysis Platform | منصة تحليل النزاعات العراقية
// ─────────────────────────────────────────────────────────────────────────

export type ConflictType =
  | "land_dispute"
  | "water_resources"
  | "tribal"
  | "sectarian"
  | "political"
  | "economic"
  | "security"
  | "administrative_boundary"
  | "returnee_idp"
  | "resource_sharing"
  | "governance"
  | "other";

export type CauseCategory =
  | "political"
  | "economic"
  | "security"
  | "legal"
  | "environmental"
  | "historical"
  | "social"
  | "religious"
  | "administrative";

export type CauseLayer = "direct" | "indirect" | "root";

export type EffectHorizon = "immediate" | "medium_term" | "long_term";

export type EffectDomain =
  | "humanitarian"
  | "political"
  | "economic"
  | "security"
  | "social"
  | "environmental";

export type StakeholderCategory =
  | "government"
  | "tribal"
  | "religious"
  | "civil_society"
  | "security_force"
  | "political_party"
  | "private_sector"
  | "international_org"
  | "community_group"
  | "media"
  | "other";

export type StakeholderPosition = "supportive" | "neutral" | "opposed" | "mixed";

export interface GeoLocation {
  governorate: string;
  district?: string;
  subdistrict?: string;
  village?: string;
  lat?: number;
  lng?: number;
}

export interface Attachment {
  id: string;
  name: string;
  type: "photo" | "document" | "other";
  mimeType: string;
  /** Stored as a base64 data URL in IndexedDB — no external file storage. */
  dataUrl: string;
  uploadedAt: string;
}

export interface Stakeholder {
  id: string;
  conflictId: string;
  name: string;
  type: string;
  category: StakeholderCategory;
  influence: number; // 0-100
  power: number; // 0-100
  interest: number; // 0-100
  support: number; // -100 (fully opposed) to 100 (fully supportive)
  position: StakeholderPosition;
  needs: string[];
  fears: string[];
  expectations: string[];
  resources: string[];
  relationships: StakeholderRelationship[];
  notes?: string;
}

export interface StakeholderRelationship {
  targetStakeholderId: string;
  type: "alliance" | "rivalry" | "dependency" | "neutral" | "family_tribal";
  strength: number; // 0-100
  description?: string;
}

export interface TimelineEvent {
  id: string;
  conflictId: string;
  date: string; // ISO date
  title: string;
  description: string;
  escalationLevel: number; // 0-10
  location?: string;
  actors: string[];
}

export interface Cause {
  id: string;
  conflictId: string;
  layer: CauseLayer;
  category: CauseCategory;
  description: string;
  aiClassified?: boolean;
}

export interface Effect {
  id: string;
  conflictId: string;
  horizon: EffectHorizon;
  domain: EffectDomain;
  description: string;
}

export interface OnionModelEntry {
  stakeholderId: string;
  position: string; // what they say they want
  interest: string; // what they actually want
  needs: string; // what they fundamentally require
}

export interface ABCTriangle {
  attitudes: string[]; // perceptions, emotions, beliefs
  behaviors: string[]; // actions, statements, observable conduct
  contradictions: string[]; // the underlying incompatibility of goals
}

export interface ProblemTreeNode {
  id: string;
  label: string;
  type: "root_cause" | "core_problem" | "consequence";
  parentIds: string[];
}

export interface Scenario {
  type: "best_case" | "most_likely" | "worst_case";
  title: string;
  narrative: string;
  probability: number; // 0-100
}

export interface RiskAssessment {
  conflictSeverity: RiskScore;
  violenceRisk: RiskScore;
  escalationRisk: RiskScore;
  peaceOpportunity: RiskScore;
  institutionalCapacity: RiskScore;
  communityReadiness: RiskScore;
}

export interface RiskScore {
  value: number; // 0-100
  explanation: string;
}

export interface PeaceOpportunity {
  title: string;
  description: string;
  actors: string[];
  feasibility: number; // 0-100
}

export interface Recommendation {
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  targetActors: string[];
  timeframe: string;
}

export interface EarlyWarningIndicator {
  indicator: string;
  currentStatus: "stable" | "watch" | "alert";
  description: string;
}

export interface AIAnalysisResult {
  summary: {
    executiveSummary: string;
    overview: string;
    dynamics: string;
    drivers: string[];
    triggers: string[];
  };
  stakeholders: Stakeholder[];
  problemTree: {
    nodes: ProblemTreeNode[];
  };
  timeline: TimelineEvent[];
  abcTriangle: ABCTriangle;
  onionModels: OnionModelEntry[];
  riskAssessment: RiskAssessment;
  peaceOpportunities: PeaceOpportunity[];
  recommendations: Recommendation[];
  scenarios: Scenario[];
  earlyWarningIndicators: EarlyWarningIndicator[];
  conflictScore: {
    overall: number;
    trend: "escalating" | "stable" | "de-escalating";
  };
  charts: Record<string, unknown>;
}

export interface Conflict {
  id: string;
  name: string;
  location: GeoLocation;
  conflictType: ConflictType;
  researcher: string;
  organization: string;
  date: string; // ISO date
  description: string;
  tags: string[];
  keywords: string[];
  attachments: Attachment[];

  stakeholders: Stakeholder[];
  timeline: TimelineEvent[];
  causes: Cause[];
  effects: Effect[];
  onionModels: OnionModelEntry[];
  abcTriangle?: ABCTriangle;
  problemTree?: { nodes: ProblemTreeNode[] };
  actionPlan: ActionItem[];

  aiAnalysis?: AIAnalysisResult;
  aiAnalyzedAt?: string;

  status: "draft" | "in_review" | "analyzed" | "published" | "archived";
  createdAt: string;
  updatedAt: string;

  /** Who created this record — filled in server-side from the signed-in Google account. */
  createdByName?: string;
  createdByEmail?: string;
}

export type ActionItemStatus = "planned" | "in_progress" | "completed" | "delayed";

export interface ActionItem {
  id: string;
  conflictId: string;
  goal: string;
  activity: string;
  startDate: string;
  endDate: string;
  responsible?: string;
  status: ActionItemStatus;
}

export const IRAQ_GOVERNORATES = [
  "بغداد", "نينوى", "البصرة", "الأنبار", "أربيل", "دهوك", "السليمانية",
  "كركوك", "ديالى", "صلاح الدين", "بابل", "كربلاء", "النجف", "واسط",
  "القادسية", "المثنى", "ذي قار", "ميسان",
] as const;

export type IraqGovernorate = (typeof IRAQ_GOVERNORATES)[number];
