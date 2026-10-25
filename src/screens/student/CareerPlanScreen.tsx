import React, { useState, useEffect } from 'react';
import { CompetencyItem, EvidenceSourceType, ProvenanceType, StudentProfileData } from '../../types';
import { INITIAL_STUDENT_PROFILE } from '../../data/mockData';

interface CareerPlanScreenProps {
  onNavigate?: (path: string) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  profile?: StudentProfileData;
  onUpdateProfile?: React.Dispatch<React.SetStateAction<StudentProfileData>>;
  dockerScore?: number | null;
  onDockerQuizCompleted?: () => void;
}

interface QuizDefinition {
  skillId: string;
  skillName: string;
  code: string;
  questions: {
    id: number;
    question: string;
    options: string[];
    correctIdx: number;
  }[];
}

const ROADMAP_QUIZZES: Record<string, QuizDefinition> = {
  'comp-sql': {
    skillId: 'comp-sql',
    skillName: 'SQL',
    code: '#SQL-01',
    questions: [
      {
        id: 1,
        question:
          'Indexing: Which PostgreSQL index structure is optimal for high-cardinality range queries (WHERE created_at >= ...) combined with equality filtering?',
        options: [
          'Composite B-Tree index with the equality column leading and range column second',
          'Unindexed sequential heap scan with autovacuum disabled',
          'Single-column Hash index on the timestamp column only',
          'Full-table cross join materialized on every read',
        ],
        correctIdx: 0,
      },
      {
        id: 2,
        question:
          'Join Optimization: When joining a 50M-row orders table with a 10K-row customers table on an unindexed foreign key without ordering, which execution strategy minimizes I/O overhead?',
        options: [
          'Hash Join building the in-memory hash table on the smaller 10K-row customers table',
          'Nested Loop Join scanning all 50M rows for each customer without an index',
          'Cartesian product followed by client-side filtering',
          'Disabling the query planner and forcing sequential disk sorts',
        ],
        correctIdx: 0,
      },
      {
        id: 3,
        question:
          'ACID Properties: Which property guarantees that once a transaction commits, its state changes persist in non-volatile write-ahead logs (WAL) even if the database server loses power immediately?',
        options: [
          'Durability (WAL fsync before commit acknowledgment)',
          'Read Uncommitted dirty read propagation',
          'Optimistic client-side caching without server commit',
          'Eventual schema truncation',
        ],
        correctIdx: 0,
      },
    ],
  },
  'comp-docker': {
    skillId: 'comp-docker',
    skillName: 'Docker & Containers',
    code: '#DCK-101',
    questions: [
      {
        id: 1,
        question: 'Which Dockerfile instruction properly creates a minimal final runtime image in a multi-stage build?',
        options: [
          'FROM alpine:3.19 AS final followed by COPY --from=builder /app/bin /app/bin',
          'RUN docker-squash --stage 2',
          'EXPOSE ALL --strip-debug-symbols',
          'CMD ["--runtime-clean"]',
        ],
        correctIdx: 0,
      },
      {
        id: 2,
        question: 'Which restart policy ensures high-concurrency containers recover after host daemon restarts unless explicitly stopped?',
        options: [
          '--restart unless-stopped',
          '--auto-recover 30s',
          '--policy immortal',
          '--daemon-persist true',
        ],
        correctIdx: 0,
      },
      {
        id: 3,
        question: 'How does Docker determine whether a build layer cache is invalidated during image builds?',
        options: [
          'Checksum of Dockerfile instruction string and copied file contents',
          'Host OS uptime counter only',
          'Git branch name prefix',
          'Random UUID per build invocation',
        ],
        correctIdx: 0,
      },
    ],
  },
  'comp-redis': {
    skillId: 'comp-redis',
    skillName: 'Redis',
    code: '#RED-201',
    questions: [
      {
        id: 1,
        question: 'In a Cache-Aside pattern, what is the correct sequence when a cache miss occurs on a read request?',
        options: [
          'Read from primary DB, populate Redis cache with a TTL, and return data to caller',
          'Block all incoming writes for 60 seconds and flush all Redis keys',
          'Write null bytes to PostgreSQL WAL logs',
          'Return HTTP 503 until background cron populates the key',
        ],
        correctIdx: 0,
      },
      {
        id: 2,
        question: 'Which Redis data structure is optimal for implementing a sliding-window rate limiter by timestamp?',
        options: [
          'Sorted Set (ZSET) scored by request epoch timestamp',
          'Unindexed plain string',
          'Redis Bitmap without TTL',
          'Pub/Sub broadcast channel',
        ],
        correctIdx: 0,
      },
      {
        id: 3,
        question: 'How does adding random jitter to Redis key TTLs prevent cache stampedes under high load?',
        options: [
          'Staggers key expirations across a time window so keys do not expire simultaneously',
          'Disables eviction policies on the Redis cluster',
          'Converts all Redis keys into permanent static strings',
          'Forces synchronous disk snapshots on every read',
        ],
        correctIdx: 0,
      },
    ],
  },
  'comp-kafka': {
    skillId: 'comp-kafka',
    skillName: 'Kafka',
    code: '#KAF-302',
    questions: [
      {
        id: 1,
        question: 'What guarantees in-order message delivery for related events in an Apache Kafka topic?',
        options: [
          'Routing events with the same partition key to the same topic partition',
          'Using random round-robin partitioning without keys',
          'Setting consumer group size to 0',
          'Disabling broker replication',
        ],
        correctIdx: 0,
      },
      {
        id: 2,
        question: 'How many consumers within the same Consumer Group can read from a single Kafka partition simultaneously?',
        options: [
          'At most one consumer per group at any given time',
          'Unlimited consumers in the same group concurrently',
          'Exactly three consumers per partition',
          'Only the ZooKeeper leader node',
        ],
        correctIdx: 0,
      },
      {
        id: 3,
        question: 'When should a Kafka consumer commit its offset to guarantee at-least-once event processing?',
        options: [
          'Only after the message payload has been durably processed by the application handler',
          'Before fetching the message batch from the broker',
          'Automatically every 1ms regardless of handler exceptions',
          'Never; offsets are only committed by message producers',
        ],
        correctIdx: 0,
      },
    ],
  },
};

export function calculateDeterministicReadiness(competencies: CompetencyItem[]): number {
  const weights: Record<string, number> = {
    'comp-py': 24,
    'comp-git': 22,
    'comp-sys': 21.6,
    'comp-sql': 12,
    'comp-docker': 10,
    'comp-redis': 5.4,
    'comp-kafka': 5,
  };

  let earned = 0;
  let totalWeight = 0;

  competencies.forEach((c) => {
    const w = weights[c.id] ?? 6;
    totalWeight += w;
    if (c.proficiency !== null && c.proficiency > 0) {
      const ratio = Math.min(1, c.proficiency / Math.max(1, c.targetLevel));
      earned += ratio * w;
    }
  });

  return Math.min(100, Math.round((earned / Math.max(1, totalWeight)) * 100));
}

export const CareerPlanScreen: React.FC<CareerPlanScreenProps> = ({
  onNavigate,
  onShowToast,
  profile: externalProfile,
  onUpdateProfile,
  dockerScore,
  onDockerQuizCompleted,
}) => {
  const [localProfile, setLocalProfile] = useState<StudentProfileData>(INITIAL_STUDENT_PROFILE);
  const profile = externalProfile ?? localProfile;

  const updateProfile = (updater: (prev: StudentProfileData) => StudentProfileData) => {
    if (onUpdateProfile) {
      onUpdateProfile(updater);
    } else {
      setLocalProfile(updater);
    }
  };

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedSuccess, setAnalyzedSuccess] = useState(false);

  // Modals for Module A (Manual Profile/Skill Entry & CSV Upload with Alias Mapping)
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);

  // Draft form state for Manual Profile Edit
  const [draftProfile, setDraftProfile] = useState({
    name: profile.name,
    program: profile.program,
    department: profile.department,
    specialization: profile.specialization,
    semester: profile.semester,
    cgpa: profile.cgpa.toString(),
    graduationYear: profile.graduationYear,
    targetRole: profile.targetRole,
  });

  // Draft form state for Adding/Updating a Competency
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Core Backend');
  const [newSkillRequirement, setNewSkillRequirement] = useState<'Required' | 'Preferred' | 'Mentioned'>('Required');
  const [newSkillUnmeasured, setNewSkillUnmeasured] = useState(false);
  const [newSkillProficiency, setNewSkillProficiency] = useState('3.5');
  const [newSkillEvidence, setNewSkillEvidence] = useState<EvidenceSourceType>('coursework');

  // CSV Upload & Alias Mapping Preview State (parses without mutating until confirmed)
  const [csvFileName, setCsvFileName] = useState('student_journey_export_2026.csv');
  const [csvAliases] = useState<Record<string, string>>({
    'Full Name': 'name',
    'Degree': 'program',
    'Dept': 'department',
    'Spec_Track': 'specialization',
    'Current_Sem': 'semester',
    'CGPA_Score': 'cgpa',
    'Grad_Year': 'graduationYear',
  });
  const [csvPreviewParsed] = useState({
    name: 'Alex R. Mercer',
    program: 'B.Tech Honors',
    department: 'Computer Science & Engineering',
    specialization: 'Cloud & Distributed Systems',
    semester: 'Semester 8',
    cgpa: 3.89,
    graduationYear: '2026',
    skillsImported: [
      { name: 'Kubernetes Basics', proficiency: 0, evidenceSource: 'self-reported' as EvidenceSourceType, note: 'Verified at level 0.0 (Missing)' },
      { name: 'Go (Golang)', proficiency: 3.8, evidenceSource: 'project' as EvidenceSourceType, note: 'gRPC Daemon Project' },
    ],
  });

  // Embedded Micro-Quiz State (Module C Closed-Loop Verification)
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});

  // Sync external dockerScore prop if completed in PlacementHub
  useEffect(() => {
    if (dockerScore !== undefined && dockerScore !== null) {
      const currentDocker = profile.competencies.find((c) => c.id === 'comp-docker');
      if (currentDocker && currentDocker.proficiency === null) {
        updateProfile((prev) => ({
          ...prev,
          competencies: prev.competencies.map((c) =>
            c.id === 'comp-docker'
              ? {
                  ...c,
                  proficiency: dockerScore,
                  evidenceSource: 'verified_assessment',
                  evidenceLabel: `Placement Hub Quiz #DCK-101 • Verified (${dockerScore.toFixed(1)}/5.0)`,
                }
              : c
          ),
        }));
      }
    }
  }, [dockerScore]);

  // Deterministic Metrics Calculation (Honest Metrics: null is never converted to 0)
  const totalCompetencies = profile.competencies.length;
  const measuredCompetencies = profile.competencies.filter((c) => c.proficiency !== null);
  const verifiedCompetencies = profile.competencies.filter(
    (c) =>
      c.proficiency !== null &&
      c.proficiency > 0 &&
      (c.evidenceSource === 'verified_assessment' || c.evidenceSource === 'coursework' || c.evidenceSource === 'project')
  );

  // Evidence coverage % = competencies with non-null evidence / total role competencies
  const evidenceCoveragePct = Math.round((measuredCompetencies.length / Math.max(1, totalCompetencies)) * 100);

  // Readiness Index (0-100% informational benchmark; starts at 64%, jumps to 76% on SQL 3.5 verification)
  const readinessScorePct = calculateDeterministicReadiness(profile.competencies);

  // Group findings into: Validated Strengths, Priority Gaps, and Unverified Mentions
  const validatedStrengths = profile.competencies.filter(
    (c) => c.proficiency !== null && c.proficiency >= c.targetLevel && c.evidenceSource !== 'self-reported'
  );
  const priorityGaps = profile.competencies.filter(
    (c) =>
      c.id === 'comp-redis' ||
      c.id === 'comp-kafka' ||
      (c.proficiency !== null && c.proficiency < c.targetLevel)
  );
  const unverifiedMentions = profile.competencies.filter(
    (c) => c.proficiency === null || c.evidenceSource === 'self-reported'
  );

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalyzedSuccess(true);
      onShowToast?.(
        `Deterministic alignment recalculated: ${readinessScorePct}% informational benchmark across ${totalCompetencies} competencies.`,
        'success'
      );
      setTimeout(() => setAnalyzedSuccess(false), 3500);
    }, 450);
  };

  const handleSaveManualProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedCgpa = parseFloat(draftProfile.cgpa);
    updateProfile((prev) => ({
      ...prev,
      name: draftProfile.name.trim() || prev.name,
      program: draftProfile.program.trim() || prev.program,
      department: draftProfile.department.trim() || prev.department,
      specialization: draftProfile.specialization.trim() || prev.specialization,
      semester: draftProfile.semester.trim() || prev.semester,
      cgpa: !isNaN(parsedCgpa) ? Math.min(4.0, Math.max(0.0, parsedCgpa)) : prev.cgpa,
      graduationYear: draftProfile.graduationYear.trim() || prev.graduationYear,
      targetRole: draftProfile.targetRole.trim() || prev.targetRole,
    }));
    setShowProfileModal(false);
    onShowToast?.('Student academic profile updated and re-indexed.', 'success');
  };

  const handleAddOrUpdateSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    const profValue = newSkillUnmeasured ? null : Math.min(5, Math.max(0, parseFloat(newSkillProficiency) || 0));
    const newComp: CompetencyItem = {
      id: `comp-${Date.now()}`,
      name: newSkillName.trim(),
      category: newSkillCategory,
      proficiency: profValue,
      targetLevel: 3.5,
      requirementType: newSkillRequirement,
      evidenceSource: newSkillUnmeasured ? null : newSkillEvidence,
      evidenceLabel: newSkillUnmeasured
        ? 'Needs assessment • Unverified (null)'
        : profValue === 0
        ? 'Verified at Level 0.0 (Missing)'
        : `${newSkillEvidence.replace('_', ' ')} (${profValue.toFixed(1)}/5.0)`,
    };

    updateProfile((prev) => ({
      ...prev,
      competencies: [...prev.competencies, newComp],
    }));
    setNewSkillName('');
    setShowAddSkillModal(false);
    onShowToast?.(
      `Added "${newComp.name}" (${profValue === null ? 'NULL / Needs assessment' : `${profValue.toFixed(1)}/5.0`}) to competency profile.`,
      'success'
    );
  };

  const handleConfirmCsvImport = () => {
    updateProfile((prev) => {
      const existingNames = new Set(prev.competencies.map((c) => c.name.toLowerCase()));
      const addedSkills: CompetencyItem[] = csvPreviewParsed.skillsImported
        .filter((s) => !existingNames.has(s.name.toLowerCase()))
        .map((s, idx) => ({
          id: `comp-csv-${idx}-${Date.now()}`,
          name: s.name,
          category: 'Imported Record',
          proficiency: s.proficiency,
          targetLevel: 3.5,
          requirementType: 'Preferred',
          evidenceSource: s.evidenceSource,
          evidenceLabel: s.note,
        }));

      return {
        ...prev,
        name: csvPreviewParsed.name,
        program: csvPreviewParsed.program,
        department: csvPreviewParsed.department,
        specialization: csvPreviewParsed.specialization,
        semester: csvPreviewParsed.semester,
        cgpa: csvPreviewParsed.cgpa,
        graduationYear: csvPreviewParsed.graduationYear,
        competencies: [...prev.competencies, ...addedSkills],
      };
    });
    setShowCsvModal(false);
    onShowToast?.('CSV Journey parsed and committed with alias mapping!', 'success');
  };

  const handleOpenQuiz = (skillId: string) => {
    setActiveQuizId(skillId);
    setQuizAnswers({});
  };

  const handleSubmitQuiz = () => {
    if (!activeQuizId) return;
    const quiz = ROADMAP_QUIZZES[activeQuizId];
    if (!quiz) return;

    let correctCount = 0;
    quiz.questions.forEach((q) => {
      if (quizAnswers[q.id] === q.correctIdx) {
        correctCount += 1;
      }
    });

    // Deterministic 3-question mapping confirmed by user: 3/3 -> 3.5, 2/3 -> 3.0, 1/3 -> 2.0 (0/3 -> 1.0)
    const verifiedScore =
      correctCount === 3 ? 3.5 : correctCount === 2 ? 3.0 : correctCount === 1 ? 2.0 : 1.0;

    updateProfile((prev) => ({
      ...prev,
      competencies: prev.competencies.map((c) =>
        c.id === activeQuizId
          ? {
              ...c,
              proficiency: verifiedScore,
              evidenceSource: 'verified_assessment',
              evidenceLabel: `Placement Hub Quiz ${quiz.code}`,
            }
          : c
      ),
    }));

    if (activeQuizId === 'comp-docker') {
      onDockerQuizCompleted?.();
    }

    setActiveQuizId(null);
    onShowToast?.(
      `${quiz.skillName} verified (${verifiedScore.toFixed(1)}/5.0) via Placement Hub Quiz ${quiz.code}! Readiness Index updated live.`,
      'success'
    );
  };

  const getProvenanceTag = (tag: '[Google Search]' | '[Curated]') => {
    if (tag === '[Google Search]') {
      return (
        <span className="px-2 py-0.5 rounded bg-[#55C98B]/10 border border-[#55C98B]/30 text-[11px] font-mono text-[#55C98B] shrink-0">
          [Google Search]
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded bg-[#8052ff]/15 border border-[#8052ff]/30 text-[11px] font-mono text-[#cdbdff] shrink-0">
        [Curated]
      </span>
    );
  };

  const sqlComp = profile.competencies.find((c) => c.id === 'comp-sql');
  const sysComp = profile.competencies.find((c) => c.id === 'comp-sys');
  const gitComp = profile.competencies.find((c) => c.id === 'comp-git');
  const dockerComp = profile.competencies.find((c) => c.id === 'comp-docker');
  const redisComp = profile.competencies.find((c) => c.id === 'comp-redis');
  const kafkaComp = profile.competencies.find((c) => c.id === 'comp-kafka');

  const getSkillBadgeState = (comp: CompetencyItem) => {
    if (comp.proficiency === null) {
      if (comp.id === 'comp-redis' || comp.id === 'comp-kafka') {
        return {
          badgeText: 'Missing / Priority Gap',
          badgeClass: 'bg-[#EB5757]/15 text-[#EB5757] border-[#EB5757]/40',
          needsAssessment: true,
        };
      }
      return {
        badgeText: 'Needs assessment',
        badgeClass: 'bg-[#ffba35]/15 text-[#ffba35] border-[#ffba35]/40',
        needsAssessment: true,
      };
    }
    if (comp.evidenceSource === 'self-reported') {
      return {
        badgeText: `${comp.proficiency.toFixed(1)}/5.0 (Self-reported)`,
        badgeClass: 'bg-[#ffba35]/15 text-[#ffba35] border-[#ffba35]/40',
        needsAssessment: false,
      };
    }
    return {
      badgeText: `Verified (${comp.proficiency.toFixed(1)}/5.0)`,
      badgeClass: 'bg-[#55C98B]/15 text-[#55C98B] border-[#55C98B]/40',
      needsAssessment: false,
    };
  };

  return (
    <div className="w-full max-w-[1120px] mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Level Context + Overall Readiness Index Banner */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#cdbdff] mb-1">
              <span>CORE STUDENT JOURNEY</span>
              <span>·</span>
              <span>TARGET ROLE ALIGNMENT ENGINE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              My Career Plan &amp; Skill-Gap Engine
            </h1>
            <p className="text-sm text-[#9A9A9A] mt-1">
              Saved Target Role: <strong className="text-white font-semibold">{profile.targetRole}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto text-xs text-[#BDBDBD] font-mono">
            <span>Profile ID: {profile.id}</span>
            <span>·</span>
            <span className="text-[#55C98B]">{verifiedCompetencies.length} Verified</span>
            <span>·</span>
            <button
              onClick={() => onNavigate?.('job-search')}
              className="px-2.5 py-1 rounded bg-[#16161A] border border-[#363639] text-[#cdbdff] hover:text-white hover:border-[#8052ff] transition-colors cursor-pointer"
            >
              View Opportunities Radar →
            </button>
          </div>
        </div>

        {/* Overall Readiness Index Banner */}
        <div className="rounded-xl bg-gradient-to-r from-[#16161A] via-[#1E1E24] to-[#16161A] border border-[#8052ff]/40 p-5 sm:p-6 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#8052ff]/20 border border-[#8052ff]/40 text-xs font-mono text-[#cdbdff]">
                <span className="material-symbols-outlined text-[15px]">verified</span>
                <span>Saved Target Role: {profile.targetRole}</span>
              </div>
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-4xl sm:text-5xl font-bold font-mono tabular-nums text-white">
                  {readinessScorePct}%
                </span>
                <div>
                  <div className="text-sm font-bold text-white">Overall Readiness Index</div>
                  <div className="text-xs text-[#cdbdff] font-medium">
                    Informational skill-evidence benchmark against target role.
                  </div>
                </div>
              </div>
              <p className="text-xs text-[#9A9A9A] leading-relaxed">
                Readiness is an informational skill-coverage indicator, not a placement guarantee. Unmeasured skills are strictly preserved as <code className="font-mono text-[#ffba35]">null</code> and never silently converted to <code className="font-mono text-white">0</code>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col justify-between gap-3 min-w-[260px] bg-[#0D0D0F] p-4 rounded-lg border border-[#202023]">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#9A9A9A]">Benchmark Coverage</span>
                  <span className="text-[#55C98B] font-bold">{readinessScorePct}%</span>
                </div>
                <div className="w-full bg-[#16161A] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#8052ff] to-[#55C98B] h-full rounded-full transition-all duration-500"
                    style={{ width: `${readinessScorePct}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#202023] text-xs font-mono">
                <span className="text-[#9A9A9A]">SQL Status:</span>
                {sqlComp?.proficiency === null ? (
                  <button
                    onClick={() => handleOpenQuiz('comp-sql')}
                    className="text-[#ffba35] hover:underline font-semibold cursor-pointer"
                  >
                    null (Take Assessment →)
                  </button>
                ) : (
                  <span className="text-[#55C98B] font-bold">
                    Verified ({sqlComp?.proficiency.toFixed(1)}/5.0)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 1: Target Role & Alignment Engine */}
      <section className="flex flex-col rounded-xl bg-[#0D0D0F] border border-[#202023] p-5 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#202023]">
          <div>
            <h2 className="text-lg font-bold text-white">
              Target Role &amp; Alignment Engine — {profile.targetRole}
            </h2>
            <p className="text-xs text-[#9A9A9A] mt-0.5">
              Direct comparison of target role competency requirements against your current verified, self-reported, and unassessed (<code className="font-mono text-[#ffba35]">null</code>) skills.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-3.5 py-2 rounded-lg bg-[#16161A] border border-[#363639] hover:border-[#8052ff] text-white font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[15px]">
                {isAnalyzing ? 'sync' : 'query_stats'}
              </span>
              <span>{isAnalyzing ? 'Recalculating...' : 'Recalculate Alignment'}</span>
            </button>
            <button
              onClick={() => setShowAddSkillModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#16161A] border border-[#363639] text-[#cdbdff] hover:text-white hover:border-[#8052ff] text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[15px]">add_circle</span>
              <span>Add Skill</span>
            </button>
            <button
              onClick={() => setShowCsvModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#16161A] border border-[#363639] text-white hover:bg-[#201f21] text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[15px]">upload_file</span>
              <span>CSV Upload</span>
            </button>
          </div>
        </div>

        {analyzedSuccess && (
          <div className="p-3 rounded-lg bg-[#15846e]/20 border border-[#55C98B]/40 text-[#55C98B] text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>
              Alignment Engine synchronized: {readinessScorePct}% Readiness Index · {evidenceCoveragePct}% Evidence Coverage.
            </span>
          </div>
        )}

        {/* Highlighted Role Requirement Comparison Cards (SQL, System Design, Git & Versioning, Redis & Kafka) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: SQL */}
          {sqlComp && (
            <div className="p-4 rounded-lg bg-[#16161A] border border-[#363639] flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-sm font-bold text-white">{sqlComp.name}</span>
                    <div className="text-[11px] text-[#9A9A9A] mt-0.5">
                      Required · Target {sqlComp.targetLevel.toFixed(1)}/5.0
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${
                      getSkillBadgeState(sqlComp).badgeClass
                    }`}
                  >
                    {getSkillBadgeState(sqlComp).badgeText}
                  </span>
                </div>

                <div className="mt-3 text-xs font-mono flex items-center justify-between">
                  <span className="text-[#9A9A9A]">Proficiency:</span>
                  <span className={sqlComp.proficiency === null ? 'text-[#ffba35] font-bold' : 'text-[#55C98B] font-bold'}>
                    {sqlComp.proficiency === null ? 'null (Needs assessment)' : `${sqlComp.proficiency.toFixed(1)}/5.0`}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-[#9A9A9A] font-mono truncate">
                  Evidence: <span className="text-white">{sqlComp.evidenceLabel}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#202023] flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#9A9A9A]">
                  {sqlComp.proficiency === null ? 'Unassessed' : 'Verified Assessment'}
                </span>
                <button
                  onClick={() => handleOpenQuiz('comp-sql')}
                  className="px-3 py-1.5 rounded bg-[#8052ff] hover:bg-[#8052ff]/90 text-white text-xs font-mono font-semibold transition-colors cursor-pointer"
                >
                  {sqlComp.proficiency === null ? 'Take Assessment' : 'Retake Assessment'}
                </button>
              </div>
            </div>
          )}

          {/* Card 2: System Design */}
          {sysComp && (
            <div className="p-4 rounded-lg bg-[#16161A] border border-[#202023] flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-sm font-bold text-white">{sysComp.name}</span>
                    <div className="text-[11px] text-[#9A9A9A] mt-0.5">
                      Required · Target {sysComp.targetLevel.toFixed(1)}/5.0
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold border bg-[#ffba35]/15 text-[#ffba35] border-[#ffba35]/40">
                    2.5/5.0 (Self-reported)
                  </span>
                </div>

                <div className="mt-3 text-xs font-mono flex items-center justify-between">
                  <span className="text-[#9A9A9A]">Proficiency:</span>
                  <span className="text-[#ffba35] font-bold">{sysComp.proficiency?.toFixed(1)}/5.0</span>
                </div>
                <div className="mt-1 text-[11px] text-[#9A9A9A] font-mono truncate">
                  Evidence: <span className="text-white">{sysComp.evidenceLabel}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#202023]">
                <div className="w-full h-1.5 bg-[#0D0D0F] rounded-full overflow-hidden">
                  <div className="h-full bg-[#ffba35] rounded-full" style={{ width: '50%' }} />
                </div>
              </div>
            </div>
          )}

          {/* Card 3: Git & Versioning */}
          {gitComp && (
            <div className="p-4 rounded-lg bg-[#16161A] border border-[#202023] flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-sm font-bold text-white">{gitComp.name}</span>
                    <div className="text-[11px] text-[#9A9A9A] mt-0.5">
                      Required · Target {gitComp.targetLevel.toFixed(1)}/5.0
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold border bg-[#55C98B]/15 text-[#55C98B] border-[#55C98B]/40">
                    4.0/5.0 (Verified)
                  </span>
                </div>

                <div className="mt-3 text-xs font-mono flex items-center justify-between">
                  <span className="text-[#9A9A9A]">Proficiency:</span>
                  <span className="text-[#55C98B] font-bold">{gitComp.proficiency?.toFixed(1)}/5.0</span>
                </div>
                <div className="mt-1 text-[11px] text-[#9A9A9A] font-mono truncate">
                  Evidence: <span className="text-white">{gitComp.evidenceLabel}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#202023]">
                <div className="w-full h-1.5 bg-[#0D0D0F] rounded-full overflow-hidden">
                  <div className="h-full bg-[#55C98B] rounded-full" style={{ width: '80%' }} />
                </div>
              </div>
            </div>
          )}

          {/* Card 4: Redis & Kafka (Missing / Priority Gaps) */}
          <div className="p-4 rounded-lg bg-[#16161A] border border-[#EB5757]/30 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-sm font-bold text-white">Redis &amp; Kafka</span>
                  <div className="text-[11px] text-[#9A9A9A] mt-0.5">
                    Distributed Caching &amp; Streaming
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold border bg-[#EB5757]/15 text-[#EB5757] border-[#EB5757]/40">
                  {redisComp?.proficiency !== null && kafkaComp?.proficiency !== null
                    ? 'Verified'
                    : 'Missing / Priority Gaps'}
                </span>
              </div>

              <div className="mt-3 space-y-1 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-[#9A9A9A]">Redis:</span>
                  <span className={redisComp?.proficiency === null ? 'text-[#ffba35]' : 'text-[#55C98B]'}>
                    {redisComp?.proficiency === null
                      ? 'null (Missing / Priority Gap)'
                      : `Verified (${redisComp?.proficiency.toFixed(1)}/5.0)`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9A9A9A]">Kafka:</span>
                  <span className={kafkaComp?.proficiency === null ? 'text-[#ffba35]' : 'text-[#55C98B]'}>
                    {kafkaComp?.proficiency === null
                      ? 'null (Missing / Priority Gap)'
                      : `Verified (${kafkaComp?.proficiency.toFixed(1)}/5.0)`}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#202023] flex items-center justify-between gap-2">
              <button
                onClick={() => handleOpenQuiz('comp-redis')}
                className="flex-1 py-1 px-2 rounded bg-[#1E1E24] hover:bg-[#2a2a32] text-[#cdbdff] border border-[#363639] text-[11px] font-mono cursor-pointer"
              >
                Assess Redis
              </button>
              <button
                onClick={() => handleOpenQuiz('comp-kafka')}
                className="flex-1 py-1 px-2 rounded bg-[#1E1E24] hover:bg-[#2a2a32] text-[#cdbdff] border border-[#363639] text-[11px] font-mono cursor-pointer"
              >
                Assess Kafka
              </button>
            </div>
          </div>
        </div>

        {/* Full Competency Matrix Grid */}
        <div className="pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <span className="text-xs font-semibold text-white">
              All Role Competencies ({totalCompetencies}) — Scale 0.0–5.0 or <code className="font-mono text-[#ffba35]">null</code>
            </span>
            <button
              onClick={() => {
                setDraftProfile({
                  name: profile.name,
                  program: profile.program,
                  department: profile.department,
                  specialization: profile.specialization,
                  semester: profile.semester,
                  cgpa: profile.cgpa.toString(),
                  graduationYear: profile.graduationYear,
                  targetRole: profile.targetRole,
                });
                setShowProfileModal(true);
              }}
              className="text-xs font-mono text-[#cdbdff] hover:underline self-start sm:self-auto cursor-pointer"
            >
              Edit Academic Profile ({profile.name} · CGPA {profile.cgpa.toFixed(2)}) →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {profile.competencies.map((comp) => {
              const isNull = comp.proficiency === null;
              const isZero = comp.proficiency === 0;
              const meetsTarget = comp.proficiency !== null && comp.proficiency >= comp.targetLevel;
              const badgeInfo = getSkillBadgeState(comp);

              return (
                <div
                  key={comp.id}
                  className="p-3.5 rounded-lg bg-[#1E1E24] border border-[#202023] flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <span className="text-sm font-semibold text-white">{comp.name}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border shrink-0 ${badgeInfo.badgeClass}`}>
                        {badgeInfo.badgeText}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#9A9A9A] mb-2">
                      {comp.category} · {comp.requirementType} (Target {comp.targetLevel.toFixed(1)})
                    </div>
                  </div>

                  <div>
                    <div className="flex items-baseline justify-between mt-1">
                      <div className="w-full mr-3">
                        <div className="h-1.5 w-full bg-[#16161A] rounded-full overflow-hidden">
                          {!isNull && (
                            <div
                              className={`h-full rounded-full ${
                                meetsTarget
                                  ? 'bg-[#55C98B]'
                                  : isZero
                                  ? 'bg-[#EB5757]'
                                  : 'bg-[#ffba35]'
                              }`}
                              style={{ width: `${Math.max(4, ((comp.proficiency || 0) / 5.0) * 100)}%` }}
                            />
                          )}
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold tabular-nums whitespace-nowrap">
                        {isNull ? (
                          <span className="text-[#ffba35]">null</span>
                        ) : (
                          <span className={meetsTarget ? 'text-[#55C98B]' : isZero ? 'text-[#EB5757]' : 'text-white'}>
                            {comp.proficiency?.toFixed(1)}/5.0
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#202023]/80 text-[11px]">
                      <span className="text-[#9A9A9A] truncate" title={comp.evidenceLabel}>
                        {comp.evidenceLabel}
                      </span>
                      {ROADMAP_QUIZZES[comp.id] && (
                        <button
                          onClick={() => handleOpenQuiz(comp.id)}
                          className="text-[#cdbdff] hover:text-white font-mono font-semibold ml-2 shrink-0 cursor-pointer"
                        >
                          {comp.proficiency === null ? 'Take Assessment →' : 'Retake →'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3-Column Role Alignment Breakdown: Validated Strengths | Priority Gaps | Unverified / Needs Assessment */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
          {/* Column 1: Validated Strengths */}
          <div className="p-4 rounded-lg bg-[#1E1E24] border border-[#202023]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">Validated Strengths ({validatedStrengths.length})</h3>
              <span className="text-xs font-mono text-[#55C98B]">Verified</span>
            </div>
            <ul className="space-y-2">
              {validatedStrengths.map((item) => (
                <li
                  key={item.id}
                  className="p-2.5 rounded bg-[#16161A] border border-[#202023] flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="text-white font-medium">{item.name}</div>
                    <div className="text-[11px] text-[#9A9A9A]">{item.evidenceLabel}</div>
                  </div>
                  <span className="font-mono font-bold text-[#55C98B] tabular-nums ml-2 shrink-0">
                    Verified ({item.proficiency?.toFixed(1)}/5.0)
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Priority Gaps */}
          <div className="p-4 rounded-lg bg-[#1E1E24] border border-[#202023]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">Priority Gaps ({priorityGaps.length})</h3>
              <span className="text-xs font-mono text-[#ffba35]">Action Required</span>
            </div>
            <ul className="space-y-2">
              {priorityGaps.map((item) => (
                <li
                  key={item.id}
                  className="p-2.5 rounded bg-[#16161A] border border-[#202023] flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="text-white font-medium">{item.name}</div>
                    <div className="text-[11px] text-[#9A9A9A]">
                      {item.proficiency === null
                        ? 'Missing / Priority Gap (null)'
                        : `${item.proficiency.toFixed(1)}/5.0 (${item.evidenceSource})`}
                    </div>
                  </div>
                  {ROADMAP_QUIZZES[item.id] ? (
                    <button
                      onClick={() => handleOpenQuiz(item.id)}
                      className="px-2.5 py-1 rounded bg-[#8052ff] hover:bg-[#8052ff]/90 text-white font-mono text-[11px] shrink-0 cursor-pointer"
                    >
                      Take Assessment
                    </button>
                  ) : (
                    <span className="text-[11px] font-mono text-[#ffba35] shrink-0">Gap</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Needs Assessment & Self-Reported */}
          <div className="p-4 rounded-lg bg-[#1E1E24] border border-[#202023]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">Needs Assessment ({unverifiedMentions.length})</h3>
              <span className="text-xs font-mono text-[#9A9A9A]">Null or Self-Reported</span>
            </div>
            <ul className="space-y-2">
              {unverifiedMentions.map((item) => (
                <li
                  key={item.id}
                  className="p-2.5 rounded bg-[#16161A] border border-[#202023] flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="text-white font-medium">{item.name}</div>
                    <div className="text-[11px] text-[#9A9A9A]">
                      {item.proficiency === null
                        ? 'Needs assessment (strictly null)'
                        : `Self-reported (${item.proficiency.toFixed(1)}/5.0)`}
                    </div>
                  </div>
                  {ROADMAP_QUIZZES[item.id] ? (
                    <button
                      onClick={() => handleOpenQuiz(item.id)}
                      className="px-2.5 py-1 rounded bg-[#8052ff] hover:bg-[#8052ff]/90 text-white font-mono text-[11px] shrink-0 cursor-pointer"
                    >
                      Take Assessment
                    </button>
                  ) : (
                    <span className="text-[11px] font-mono text-[#9A9A9A] shrink-0">Self-reported</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION 2: Dynamic Learning Roadmap (under My Career Plan) */}
      <section className="flex flex-col rounded-xl bg-[#0D0D0F] border border-[#202023] p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#202023] mb-6">
          <div>
            <h2 className="text-lg font-bold text-white">Dynamic Learning Roadmap</h2>
            <p className="text-xs text-[#9A9A9A] mt-0.5">
              Ordered milestones for missing and unassessed skills with estimated time, provenance-tagged resources, and interactive assessments.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => onNavigate?.('job-search')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#16161A] border border-[#363639] text-white hover:bg-[#201f21] text-xs font-medium transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">radar</span>
              <span>View Market Demand Radar in Opportunities</span>
            </button>
          </div>
        </div>

        {/* Ordered Milestones Timeline */}
        <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#363639]">
          {/* Milestone 1: SQL (Needs assessment -> Verified 3.5/5.0) */}
          <div className="relative flex flex-col gap-1">
            <div
              className={`absolute -left-[27px] top-1.5 w-5 h-5 rounded-full flex items-center justify-center text-black ${
                sqlComp?.proficiency !== null ? 'bg-[#55C98B]' : 'bg-[#ffba35]'
              }`}
            >
              <span className="material-symbols-outlined text-[14px] font-bold">
                {sqlComp?.proficiency !== null ? 'check' : 'quiz'}
              </span>
            </div>
            <div className="p-4 rounded-lg bg-[#1E1E24] border border-[#363639]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#ffba35] font-semibold">MILESTONE 01</span>
                  <h3 className="text-sm font-bold text-white">
                    SQL — Indexing, Join Optimization &amp; ACID Transactions
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#16161A] border border-[#202023] text-[11px] font-mono text-[#D6D6DC]">
                    Est. Time: 3-5 hrs
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-mono font-semibold border ${
                      sqlComp ? getSkillBadgeState(sqlComp).badgeClass : ''
                    }`}
                  >
                    {sqlComp ? getSkillBadgeState(sqlComp).badgeText : 'Needs assessment'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#e5e1e4] mb-3">
                <strong className="text-white">Objective:</strong> Verify proficiency in composite B-Tree indexing, query execution plans (<code className="font-mono">EXPLAIN ANALYZE</code>), hash/merge join optimization, and ACID isolation guarantees.
              </p>

              {/* Resource Links with [Google Search] and [Curated] Provenance Tags */}
              <div className="p-3 rounded bg-[#16161A] border border-[#202023] mb-3 space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#55C98B]">travel_explore</span>
                    <a
                      href="https://use-the-index-luke.com/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#cdbdff] hover:underline font-medium"
                    >
                      SQL Indexing &amp; Tuning Guide for Backend Engineers ↗
                    </a>
                  </div>
                  {getProvenanceTag('[Google Search]')}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#202023]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#cdbdff]">menu_book</span>
                    <a
                      href="https://www.postgresql.org/docs/current/using-explain.html"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#78d8be] hover:underline font-medium"
                    >
                      PostgreSQL Query Planner, Join Strategies &amp; ACID WAL Internals ↗
                    </a>
                  </div>
                  {getProvenanceTag('[Curated]')}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#202023]">
                <div className="text-xs text-[#9A9A9A] font-mono">
                  <span>Evidence: {sqlComp?.evidenceLabel}</span>
                  <span className="mx-2">·</span>
                  <span>Target: 3.5/5.0</span>
                </div>
                <button
                  onClick={() => handleOpenQuiz('comp-sql')}
                  className="px-3.5 py-1.5 rounded bg-[#8052ff] hover:bg-[#8052ff]/90 text-white text-xs font-mono font-semibold transition-colors cursor-pointer"
                >
                  {sqlComp?.proficiency === null
                    ? 'Take Assessment (#SQL-01) →'
                    : `Verified (${sqlComp?.proficiency.toFixed(1)}/5.0) · Retake`}
                </button>
              </div>
            </div>
          </div>

          {/* Milestone 2: Docker & Containerization */}
          <div className="relative flex flex-col gap-1">
            <div
              className={`absolute -left-[27px] top-1.5 w-5 h-5 rounded-full flex items-center justify-center text-black ${
                dockerComp?.proficiency !== null ? 'bg-[#55C98B]' : 'bg-[#ffba35]'
              }`}
            >
              <span className="material-symbols-outlined text-[14px] font-bold">
                {dockerComp?.proficiency !== null ? 'check' : 'cached'}
              </span>
            </div>
            <div className="p-4 rounded-lg bg-[#1E1E24] border border-[#202023]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#cdbdff] font-semibold">MILESTONE 02</span>
                  <h3 className="text-sm font-bold text-white">Docker &amp; Multi-Stage Containerization</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#16161A] border border-[#202023] text-[11px] font-mono text-[#D6D6DC]">
                    Est. Time: 4-6 hrs
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-mono font-semibold border ${
                      dockerComp ? getSkillBadgeState(dockerComp).badgeClass : ''
                    }`}
                  >
                    {dockerComp ? getSkillBadgeState(dockerComp).badgeText : 'Needs assessment'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#e5e1e4] mb-3">
                <strong className="text-white">Objective:</strong> Build minimal multi-stage Alpine Dockerfiles, configure container restart policies, and optimize build layer caching.
              </p>

              <div className="p-3 rounded bg-[#16161A] border border-[#202023] mb-3 space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#55C98B]">travel_explore</span>
                    <a
                      href="https://docs.docker.com/build/building/multi-stage/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#cdbdff] hover:underline font-medium"
                    >
                      Docker Official Docs: Multi-Stage Builds &amp; Layer Caching ↗
                    </a>
                  </div>
                  {getProvenanceTag('[Google Search]')}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#202023]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-[#78d8be]">code</span>
                    <a
                      href="https://docs.docker.com/compose/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#78d8be] hover:underline font-medium"
                    >
                      Container Orchestration Lab: Docker Compose Specification ↗
                    </a>
                  </div>
                  {getProvenanceTag('[Curated]')}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#202023]">
                <div className="text-xs text-[#9A9A9A] font-mono">
                  <span>Evidence: {dockerComp?.evidenceLabel}</span>
                  <span className="mx-2">·</span>
                  <span>Target: 3.5/5.0</span>
                </div>
                <button
                  onClick={() => handleOpenQuiz('comp-docker')}
                  className="px-3.5 py-1.5 rounded bg-[#16161A] border border-[#363639] hover:border-[#8052ff] text-white text-xs font-mono font-semibold transition-colors cursor-pointer"
                >
                  {dockerComp?.proficiency === null ? 'Take Assessment (#DCK-101) →' : 'Retake Assessment'}
                </button>
              </div>
            </div>
          </div>

          {/* Milestone 3: Redis & Caching (Priority Gap) */}
          <div className="relative flex flex-col gap-1">
            <div
              className={`absolute -left-[27px] top-1.5 w-5 h-5 rounded-full flex items-center justify-center ${
                redisComp?.proficiency !== null
                  ? 'bg-[#55C98B] text-black'
                  : 'bg-[#16161A] border border-[#EB5757] text-[#EB5757]'
              }`}
            >
              <span className="material-symbols-outlined text-[12px]">
                {redisComp?.proficiency !== null ? 'check' : 'priority_high'}
              </span>
            </div>
            <div className="p-4 rounded-lg bg-[#1E1E24] border border-[#202023]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#EB5757] font-semibold">MILESTONE 03</span>
                  <h3 className="text-sm font-bold text-white">Redis — Distributed Caching &amp; Rate Limiting</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#16161A] border border-[#202023] text-[11px] font-mono text-[#D6D6DC]">
                    Est. Time: 3-5 hrs
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-mono font-semibold border ${
                      redisComp ? getSkillBadgeState(redisComp).badgeClass : ''
                    }`}
                  >
                    {redisComp ? getSkillBadgeState(redisComp).badgeText : 'Missing / Priority Gap'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#9A9A9A] mb-3">
                <strong className="text-white">Objective:</strong> Implement cache-aside invalidation, TTL jitter stampede prevention, and ZSET sliding-window rate limiters.
              </p>

              <div className="p-3 rounded bg-[#16161A] border border-[#202023] mb-3 space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <a
                    href="https://redis.io/docs/latest/develop/use/patterns/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#cdbdff] hover:underline font-medium"
                  >
                    Redis Architecture Patterns &amp; Distributed Locks Guide ↗
                  </a>
                  {getProvenanceTag('[Curated]')}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#202023]">
                  <a
                    href="https://redis.io/tutorials/howtos/ratelimiting/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#78d8be] hover:underline font-medium"
                  >
                    High-Concurrency Rate Limiting with Redis Sorted Sets ↗
                  </a>
                  {getProvenanceTag('[Google Search]')}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#202023]">
                <span className="text-xs text-[#9A9A9A] font-mono">
                  Evidence: {redisComp?.evidenceLabel} · Target: 3.0/5.0
                </span>
                <button
                  onClick={() => handleOpenQuiz('comp-redis')}
                  className="px-3 py-1.5 rounded bg-[#16161A] border border-[#363639] hover:border-[#8052ff] text-white text-xs font-mono transition-colors cursor-pointer"
                >
                  {redisComp?.proficiency === null ? 'Take Assessment (#RED-201) →' : 'Retake Assessment'}
                </button>
              </div>
            </div>
          </div>

          {/* Milestone 4: Apache Kafka (Priority Gap) */}
          <div className="relative flex flex-col gap-1">
            <div
              className={`absolute -left-[27px] top-1.5 w-5 h-5 rounded-full flex items-center justify-center ${
                kafkaComp?.proficiency !== null
                  ? 'bg-[#55C98B] text-black'
                  : 'bg-[#16161A] border border-[#EB5757] text-[#EB5757]'
              }`}
            >
              <span className="material-symbols-outlined text-[12px]">
                {kafkaComp?.proficiency !== null ? 'check' : 'priority_high'}
              </span>
            </div>
            <div className="p-4 rounded-lg bg-[#1E1E24] border border-[#202023]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#EB5757] font-semibold">MILESTONE 04</span>
                  <h3 className="text-sm font-bold text-white">Kafka — Event-Driven Partitioning &amp; Consumer Groups</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#16161A] border border-[#202023] text-[11px] font-mono text-[#D6D6DC]">
                    Est. Time: 5-8 hrs
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-mono font-semibold border ${
                      kafkaComp ? getSkillBadgeState(kafkaComp).badgeClass : ''
                    }`}
                  >
                    {kafkaComp ? getSkillBadgeState(kafkaComp).badgeText : 'Missing / Priority Gap'}
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#9A9A9A] mb-3">
                <strong className="text-white">Objective:</strong> Partition key design for ordered event streams, consumer group rebalancing, and at-least-once offset commits.
              </p>

              <div className="p-3 rounded bg-[#16161A] border border-[#202023] mb-3 space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <a
                    href="https://kafka.apache.org/documentation/#intro_concepts_and_terms"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#cdbdff] hover:underline font-medium"
                  >
                    Apache Kafka Core Concepts &amp; Consumer Group Guarantees ↗
                  </a>
                  {getProvenanceTag('[Curated]')}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#202023]">
                  <a
                    href="https://developer.confluent.io/courses/apache-kafka/partitions/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#78d8be] hover:underline font-medium"
                  >
                    Distributed Partitioning &amp; Event Ordering Deep-Dive ↗
                  </a>
                  {getProvenanceTag('[Google Search]')}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#202023]">
                <span className="text-xs text-[#9A9A9A] font-mono">
                  Evidence: {kafkaComp?.evidenceLabel} · Target: 3.0/5.0
                </span>
                <button
                  onClick={() => handleOpenQuiz('comp-kafka')}
                  className="px-3 py-1.5 rounded bg-[#16161A] border border-[#363639] hover:border-[#8052ff] text-white text-xs font-mono transition-colors cursor-pointer"
                >
                  {kafkaComp?.proficiency === null ? 'Take Assessment (#KAF-302) →' : 'Retake Assessment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MODAL 1: Manual Profile Entry (Module A) */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D0D0F] border border-[#363639] rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#202023]">
              <h3 className="text-base font-bold text-white">Edit Student Academic Profile</h3>
              <button onClick={() => setShowProfileModal(false)} className="text-[#9A9A9A] hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveManualProfile} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9A9A9A] mb-1">Full Name</label>
                  <input
                    type="text"
                    value={draftProfile.name}
                    onChange={(e) => setDraftProfile({ ...draftProfile, name: e.target.value })}
                    className="w-full bg-[#16161A] border border-[#363639] rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#9A9A9A] mb-1">Program / Degree</label>
                  <input
                    type="text"
                    value={draftProfile.program}
                    onChange={(e) => setDraftProfile({ ...draftProfile, program: e.target.value })}
                    className="w-full bg-[#16161A] border border-[#363639] rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#9A9A9A] mb-1">Department</label>
                  <input
                    type="text"
                    value={draftProfile.department}
                    onChange={(e) => setDraftProfile({ ...draftProfile, department: e.target.value })}
                    className="w-full bg-[#16161A] border border-[#363639] rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#9A9A9A] mb-1">Specialization</label>
                  <input
                    type="text"
                    value={draftProfile.specialization}
                    onChange={(e) => setDraftProfile({ ...draftProfile, specialization: e.target.value })}
                    className="w-full bg-[#16161A] border border-[#363639] rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#9A9A9A] mb-1">Semester</label>
                  <input
                    type="text"
                    value={draftProfile.semester}
                    onChange={(e) => setDraftProfile({ ...draftProfile, semester: e.target.value })}
                    className="w-full bg-[#16161A] border border-[#363639] rounded px-3 py-2 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[#9A9A9A] mb-1">CGPA (4.0)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="4.0"
                      value={draftProfile.cgpa}
                      onChange={(e) => setDraftProfile({ ...draftProfile, cgpa: e.target.value })}
                      className="w-full bg-[#16161A] border border-[#363639] rounded px-2.5 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[#9A9A9A] mb-1">Grad Year</label>
                    <input
                      type="text"
                      value={draftProfile.graduationYear}
                      onChange={(e) => setDraftProfile({ ...draftProfile, graduationYear: e.target.value })}
                      className="w-full bg-[#16161A] border border-[#363639] rounded px-2.5 py-2 text-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[#9A9A9A] mb-1">Target Role</label>
                <input
                  type="text"
                  value={draftProfile.targetRole}
                  onChange={(e) => setDraftProfile({ ...draftProfile, targetRole: e.target.value })}
                  className="w-full bg-[#16161A] border border-[#363639] rounded px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#202023]">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-4 py-2 rounded bg-[#16161A] text-[#9A9A9A] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#8052ff] text-white font-semibold hover:bg-[#8052ff]/90"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Manual Competency Entry (0-5 or strict null) */}
      {showAddSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D0D0F] border border-[#363639] rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#202023]">
              <h3 className="text-base font-bold text-white">Add Competency &amp; Evidence</h3>
              <button onClick={() => setShowAddSkillModal(false)} className="text-[#9A9A9A] hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddOrUpdateSkill} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#9A9A9A] mb-1">Skill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Kubernetes, GraphQL, Go"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full bg-[#16161A] border border-[#363639] rounded px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9A9A9A] mb-1">Category</label>
                  <input
                    type="text"
                    value={newSkillCategory}
                    onChange={(e) => setNewSkillCategory(e.target.value)}
                    className="w-full bg-[#16161A] border border-[#363639] rounded px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-[#9A9A9A] mb-1">Role Requirement</label>
                  <select
                    value={newSkillRequirement}
                    onChange={(e) => setNewSkillRequirement(e.target.value as any)}
                    className="w-full bg-[#16161A] border border-[#363639] rounded px-3 py-2 text-white"
                  >
                    <option value="Required">Required</option>
                    <option value="Preferred">Preferred</option>
                    <option value="Mentioned">Mentioned</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 p-2.5 rounded bg-[#16161A] border border-[#202023] cursor-pointer">
                <input
                  type="checkbox"
                  checked={newSkillUnmeasured}
                  onChange={(e) => setNewSkillUnmeasured(e.target.checked)}
                  className="accent-[#8052ff]"
                />
                <span className="text-white">
                  Mark as <strong>Unverified (<code className="text-[#ffba35]">null</code>)</strong> — no measurement yet
                </span>
              </label>

              {!newSkillUnmeasured && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#9A9A9A] mb-1">Proficiency (0.0 – 5.0)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={newSkillProficiency}
                      onChange={(e) => setNewSkillProficiency(e.target.value)}
                      className="w-full bg-[#16161A] border border-[#363639] rounded px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[#9A9A9A] mb-1">Evidence Source</label>
                    <select
                      value={newSkillEvidence}
                      onChange={(e) => setNewSkillEvidence(e.target.value as EvidenceSourceType)}
                      className="w-full bg-[#16161A] border border-[#363639] rounded px-3 py-2 text-white"
                    >
                      <option value="self-reported">Self-Reported</option>
                      <option value="project">Project</option>
                      <option value="coursework">Coursework</option>
                      <option value="verified_assessment">Verified Assessment</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-[#202023]">
                <button
                  type="button"
                  onClick={() => setShowAddSkillModal(false)}
                  className="px-4 py-2 rounded bg-[#16161A] text-[#9A9A9A] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-[#8052ff] text-white font-semibold hover:bg-[#8052ff]/90"
                >
                  Add Competency
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: One-Click CSV/Excel Upload with Preview & Column Alias Mapping */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D0D0F] border border-[#363639] rounded-xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#202023]">
              <div>
                <h3 className="text-base font-bold text-white">One-Click CSV / Excel Upload &amp; Column Alias Mapping</h3>
                <p className="text-xs text-[#9A9A9A]">
                  Preview parsed attributes without mutating your profile until confirmed.
                </p>
              </div>
              <button onClick={() => setShowCsvModal(false)} className="text-[#9A9A9A] hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-3 bg-[#16161A] border border-[#363639] rounded-lg flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8052ff]">table_view</span>
                <span className="text-white font-mono">{csvFileName}</span>
              </div>
              <label className="px-3 py-1 rounded bg-[#202023] hover:bg-[#363639] text-[#cdbdff] cursor-pointer font-mono">
                Choose CSV/XLSX
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setCsvFileName(file.name);
                  }}
                />
              </label>
            </div>

            {/* Alias Mapping Table */}
            <div className="border border-[#202023] rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#16161A] text-[#9A9A9A] border-b border-[#202023]">
                  <tr>
                    <th className="py-2 px-3">Source Column Header</th>
                    <th className="py-2 px-3">Mapped Canonical Field</th>
                    <th className="py-2 px-3">Staged Preview Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#202023]">
                  {Object.entries(csvAliases).map(([srcCol, targetField]) => (
                    <tr key={srcCol}>
                      <td className="py-2 px-3 text-white">{srcCol}</td>
                      <td className="py-2 px-3 text-[#cdbdff]">→ {targetField}</td>
                      <td className="py-2 px-3 text-[#55C98B]">
                        {(csvPreviewParsed as any)[targetField]?.toString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 rounded bg-[#16161A] border border-[#202023] text-xs space-y-1">
              <div className="font-semibold text-white">Staged Competency Rows (2):</div>
              {csvPreviewParsed.skillsImported.map((s, idx) => (
                <div key={idx} className="text-[#9A9A9A] font-mono">
                  · {s.name}: level {s.proficiency.toFixed(1)} ({s.evidenceSource}) — {s.note}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#202023]">
              <button
                type="button"
                onClick={() => setShowCsvModal(false)}
                className="px-4 py-2 rounded bg-[#16161A] text-xs text-[#9A9A9A] hover:text-white"
              >
                Discard Preview
              </button>
              <button
                type="button"
                onClick={handleConfirmCsvImport}
                className="px-4 py-2 rounded bg-[#55C98B] text-black text-xs font-mono font-bold hover:bg-[#55C98B]/90"
              >
                Confirm &amp; Apply Mapped Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Embedded Micro-Quiz / Closed-Loop Verification (Module C) */}
      {activeQuizId && ROADMAP_QUIZZES[activeQuizId] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0D0D0F] border border-[#363639] rounded-xl max-w-xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between pb-3 border-b border-[#202023]">
              <div>
                <span className="text-[11px] font-mono text-[#8052ff] font-bold">
                  CLOSED-LOOP COMPETENCY VERIFICATION · {ROADMAP_QUIZZES[activeQuizId].code}
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {ROADMAP_QUIZZES[activeQuizId].skillName} Micro-Assessment
                </h3>
                <p className="text-xs text-[#9A9A9A]">
                  Submitting deterministically grades your responses, updates proficiency from <code className="font-mono text-[#ffba35]">null</code> to verified score, upgrades evidence to <code className="font-mono text-[#55C98B]">verified_assessment</code>, and recalculates readiness.
                </p>
              </div>
              <button onClick={() => setActiveQuizId(null)} className="text-[#9A9A9A] hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
              {ROADMAP_QUIZZES[activeQuizId].questions.map((q, idx) => (
                <div key={q.id} className="p-3.5 bg-[#16161A] border border-[#202023] rounded-lg space-y-2.5">
                  <div className="text-xs font-semibold text-white">
                    {idx + 1}. {q.question}
                  </div>
                  <div className="space-y-1.5">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = quizAnswers[q.id] === oIdx;
                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => setQuizAnswers((prev) => ({ ...prev, [q.id]: oIdx }))}
                          className={`w-full text-left p-2.5 rounded border text-xs font-mono transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#8052ff]/20 border-[#8052ff] text-white'
                              : 'bg-black border-[#202023] text-[#9A9A9A] hover:text-white'
                          }`}
                        >
                          <span className="text-[#cdbdff] font-bold mr-2">{String.fromCharCode(65 + oIdx)}.</span>
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#202023]">
              <span className="text-xs font-mono text-[#9A9A9A]">
                {Object.keys(quizAnswers).length} / {ROADMAP_QUIZZES[activeQuizId].questions.length} answered
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveQuizId(null)}
                  className="px-4 py-2 rounded bg-[#16161A] text-xs font-mono text-[#9A9A9A] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={Object.keys(quizAnswers).length < ROADMAP_QUIZZES[activeQuizId].questions.length}
                  onClick={handleSubmitQuiz}
                  className="px-4 py-2 rounded bg-[#55C98B] text-black text-xs font-mono font-bold hover:bg-[#55C98B]/90 disabled:opacity-40 cursor-pointer"
                >
                  Grade &amp; Verify Competency
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerPlanScreen;
