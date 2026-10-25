export type UserRole = 'student' | 'faculty';

export interface UserSession {
  role: UserRole;
  name: string;
  id: string;
  email: string;
  department: string;
  title?: string;
  cohort?: string;
}

export interface StudentRecord {
  id: string;
  name: string;
  avatarText: string;
  email: string;
  department: string;
  targetRole: string;
  gpa: number;
  readinessPct: number;
  tier: 'Tier 1 Ready' | 'In Remediation' | 'Needs Assessment';
  skills: {
    python: number;
    postgres: number;
    git: number;
    docker: number | null; // null represents unassessed, distinct from 0
    redis: number | null;
    kafka: number | null;
  };
  reviewStatus: 'Approved' | 'Pending Review' | 'Changes Requested' | 'Not Submitted';
  reviewVersion?: string;
  reviewDate?: string;
  driveEligible: string[];
  remediationBlocker?: string;
  notes?: string;
}

export interface PlacementDrive {
  id: string;
  company: string;
  role: string;
  track: string;
  compensation: string;
  location: string;
  cutoffDate: string;
  status: 'open' | 'review' | 'completed';
  benchmarkReadiness: number;
  criteriaRuleId: string;
  registeredCount: number;
  eligibleCount: number;
  remediationCount: number;
  pendingReviewCount: number;
  mandatorySkills: string[];
  portalUrl: string;
}

export interface SharedResumeReview {
  id: string;
  studentId: string;
  studentName: string;
  targetRole: string;
  driveName: string;
  version: string;
  submittedAt: string;
  status: 'pending' | 'endorsed' | 'changes_requested';
  originalBullet: string;
  proposedBullet: string;
  facultyNote: string;
  verifiedItems: string[];
  urgency: 'high' | 'normal' | 'gated';
  closesIn?: string;
}

export interface RemediationModule {
  id: string;
  code: string;
  title: string;
  type: string;
  assignedCount: number;
  completedCount: number;
  overdueCount: number;
  avgPassPct: number;
  statusText: string;
  isMandatory: boolean;
  description: string;
}

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  postedAgo: string;
  matchPct: number;
  concordance: string;
  source: string;
  compensation?: string;
  tags: { name: string; status: 'verified' | 'gap' | 'neutral' }[];
  description: string;
  roleThresholds: {
    skill: string;
    threshold: number;
    verifiedLevel: number | null;
    outcome: string;
    isGap?: boolean;
  }[];
  preferredStack: { name: string; delta?: string; missing?: boolean }[];
}

export interface SkillDemandItem {
  id: string;
  name: string;
  category: string;
  mentionType?: 'Required' | 'Preferred' | 'Mentioned';
  requiredFraction?: number;
  actionType?: 'Learn' | 'Assess' | 'Maintain';
  penetrationPct: number;
  jobCount: number;
  totalSample: number;
  targetDepth: string;
  tools: string;
  verifiedDepth: number | null;
  verifiedLabel: string;
  isGap?: boolean;
  isExceeded?: boolean;
  sourceNote: string;
  provenance?: ProvenanceType;
  roleDemandByTrack?: {
    backend: number;
    devops: number;
    data: number;
  };
}

export type ProvenanceType = 'serpapi_live' | 'curated_fallback' | 'demo_fixture';

export type EvidenceSourceType = 'self-reported' | 'project' | 'coursework' | 'verified_assessment';

export interface CompetencyItem {
  id: string;
  name: string;
  category: string;
  proficiency: number | null; // 0-5 scale, null strictly for unmeasured/unknown
  targetLevel: number;
  requirementType: 'Required' | 'Preferred' | 'Mentioned';
  evidenceSource: EvidenceSourceType | null;
  evidenceLabel: string;
}

export interface StudentProfileData {
  id: string;
  name: string;
  registerNumber?: string;
  email: string;
  program: string;
  department: string;
  specialization: string;
  semester: string;
  cgpa: number;
  standingArrears?: number;
  tenthMarks?: string;
  twelfthMarks?: string;
  graduationYear: string;
  targetRole: string;
  competencies: CompetencyItem[];
}

export interface ResumeSuggestionDiff {
  id: number;
  title: string;
  category: 'Relevance' | 'Evidence' | 'Clarity';
  priority: 'High Priority' | 'ATS Keyword Match' | 'Stylistic Lift';
  rationale: string;
  originalPassage: string;
  proposedPassage: string;
  ruleRef: string;
  status: 'pending' | 'accepted' | 'rejected';
}

export type SRMPlacementTier = 'Super Dream' | 'Dream' | 'Day Sharing';
export type InterviewRoundMode = 'technical' | 'hr';

export interface CDCInterviewScorecard {
  technicalCompetency: number; // 0-100
  coreProblemSolving: number; // 0-100
  communicationConfidence: number; // 0-100
  overallScore: number; // 0-100
  srmRecommendationGrade: 'S' | 'A+' | 'A' | 'B';
  recommendationTitle: string;
  recommendationText: string;
  strengths: string[];
  weakPointsToFix: string[];
}


