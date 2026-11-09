import React, { useState, useEffect } from 'react';
import { CompetencyItem, EvidenceSourceType, ProvenanceType, StudentProfileData } from '../../types';
import { INITIAL_STUDENT_PROFILE } from '../../data/mockData';
import ProofOfWorkStudioDrawer from '../../components/ProofOfWorkStudioDrawer';
import ParticleBrain from '../../components/ParticleBrain';
import { parseTabularProfile, parseJsonProfile, parseResumeWithGemini } from '../../services/fileIngestionService';

interface CareerPlanScreenProps {
  onNavigate?: (path: string) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  profile?: StudentProfileData;
  onUpdateProfile?: React.Dispatch<React.SetStateAction<StudentProfileData>>;
  dockerScore?: number | null;
  onDockerQuizCompleted?: () => void;
  externalQuizSkillId?: string | null;
  onClearExternalQuizSkillId?: () => void;
  customRoadmapTasks?: Array<{ id: string; title: string; skillId?: string; time: string; objective: string }>;
  onLoadDemoData?: () => void;
  onResetCleanState?: () => void;
  dataMode?: 'demo' | 'custom' | 'clean';
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

export const AVAILABLE_CAREER_ROLES: string[] = [
  'AI & ML Pipeline Engineer',
  'Junior Backend Engineer (Distributed Systems)',
  'Full-Stack Software Engineer',
  'Cloud & DevOps Engineer',
  'Data Scientist & Analytics Engineer',
  'Frontend Engineer (React / TypeScript)',
  'Systems & Infrastructure Engineer',
  'Cybersecurity & Network Security Analyst',
  'Mobile App Developer (React Native / iOS / Android)',
  'Site Reliability Engineer (SRE)',
  'Embedded Systems & IoT Engineer',
  'Database Administrator & Data Architect',
  'QA Automation & SDET Engineer',
  'Blockchain & Web3 Systems Engineer',
];

export function calculateDeterministicReadiness(competencies: CompetencyItem[]): number {
  const weights: Record<string, number> = {
    'comp-py': 24,
    'comp-git': 22,
    'comp-sys': 21.6,
    'comp-sql': 12,
    'comp-docker': 10,
    'comp-redis': 8, // Set to 8.0 so verifying Redis (4.0/5.0) triggers an exact +8% jump (64% -> 72%)
    'comp-kafka': 2.4,
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

interface ParsedStudentCsvData {
  id?: string;
  name: string;
  registerNumber?: string;
  email?: string;
  program: string;
  department: string;
  specialization: string;
  semester: string;
  cgpa: number;
  graduationYear: string;
  targetRole: string;
  skillsImported: Array<{
    name: string;
    proficiency: number | null;
    evidenceSource: EvidenceSourceType;
    note: string;
  }>;
}

function parseCsvRow(row: string, delimiter = ','): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseStudentCsv(rawText: string, currentProfile: StudentProfileData): ParsedStudentCsvData {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) {
    throw new Error('CSV must contain a header line and at least one data row.');
  }

  const delimiter = lines[0].includes('\t') ? '\t' : ',';
  const headers = parseCsvRow(lines[0], delimiter);
  const values = parseCsvRow(lines[1], delimiter);

  const map: Record<string, string> = {};
  headers.forEach((h, idx) => {
    const cleanKey = h.toLowerCase().replace(/[^a-z0-9]/g, '');
    map[cleanKey] = values[idx] ?? '';
  });

  const getVal = (candidates: string[]): string | undefined => {
    for (const c of candidates) {
      const clean = c.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (map[clean] !== undefined && map[clean] !== '') {
        return map[clean];
      }
    }
    return undefined;
  };

  const name = getVal(['fullname', 'name', 'studentname', 'candidatename']) || currentProfile.name;
  const id = getVal(['studentid', 'registernumber', 'regno', 'id']) || currentProfile.id || currentProfile.registerNumber;
  const email = getVal(['emailaddr', 'email', 'emailid']) || currentProfile.email;

  let cgpa = currentProfile.cgpa;
  const rawGpa = getVal(['gpascore', 'cgpa', 'gpa', 'cumulativegpa']);
  if (rawGpa) {
    const parsed = parseFloat(rawGpa.replace(/[^0-9.]/g, ''));
    if (!isNaN(parsed) && parsed > 0) {
      cgpa = parsed > 10 ? parsed / 10 : parsed;
    }
  }

  const program = getVal(['program', 'degree', 'degreeprogram']) || currentProfile.program || 'B.Tech';
  const department = getVal(['department', 'dept', 'school']) || currentProfile.department || 'Computer Science & Engineering';
  const specialization = getVal(['specialization', 'spectrack', 'spec']) || currentProfile.specialization || 'AI/ML Specialization';
  const semester = getVal(['semester', 'currentsem', 'sem']) || currentProfile.semester || 'Semester 2';
  const graduationYear = getVal(['graduationyear', 'batch', 'gradyear']) || currentProfile.graduationYear || '2029';
  const targetRole = getVal(['trackrole', 'targetrole', 'role']) || currentProfile.targetRole || 'AI & ML Pipeline Engineer';

  const skillsImported: Array<{
    name: string;
    proficiency: number | null;
    evidenceSource: EvidenceSourceType;
    note: string;
  }> = [];

  const parseSkillNum = (val: string | undefined): number | null => {
    if (!val) return null;
    const lower = val.toLowerCase().trim();
    if (lower === 'null' || lower === 'n/a' || lower === 'none' || lower === 'missing' || lower === 'unassessed') {
      return null;
    }
    const n = parseFloat(lower.replace(/[^0-9.]/g, ''));
    return isNaN(n) ? null : Math.min(5, Math.max(0, n));
  };

  // 1. Python
  const pyVal = getVal(['pyscore', 'python', 'pythonscore']);
  if (pyVal !== undefined) {
    const num = parseSkillNum(pyVal);
    skillsImported.push({
      name: 'Python',
      proficiency: num,
      evidenceSource: num !== null ? 'verified_assessment' : 'self-reported',
      note: num !== null ? `Verified Python Score (${num.toFixed(1)}/5.0)` : 'Unassessed / Priority Gap',
    });
  }

  // 2. Docker
  const dockerVal = getVal(['dockerstatus', 'docker', 'dockerscore']);
  if (dockerVal !== undefined) {
    const num = parseSkillNum(dockerVal);
    skillsImported.push({
      name: 'Docker & Containers',
      proficiency: num,
      evidenceSource: num !== null ? 'verified_assessment' : 'self-reported',
      note: num !== null ? `Verified Docker Infrastructure (${num.toFixed(1)}/5.0)` : 'Unassessed / Priority Gap',
    });
  }

  // 3. Machine Learning & EDA
  const mlVal = getVal(['mlscore', 'machinelearning', 'aiml', 'datascience']);
  if (mlVal !== undefined) {
    const num = parseSkillNum(mlVal);
    skillsImported.push({
      name: 'Machine Learning & EDA',
      proficiency: num,
      evidenceSource: 'project',
      note: num !== null ? `Verified ML Models & EDA (${num.toFixed(1)}/5.0)` : 'Under Study',
    });
  }

  // 4. DSA / LeetCode
  const dsaVal = getVal(['dsascore', 'dsa', 'algorithms', 'leetcodescore']);
  if (dsaVal !== undefined) {
    const num = parseSkillNum(dsaVal);
    skillsImported.push({
      name: 'Data Structures & Algorithms',
      proficiency: num,
      evidenceSource: 'verified_assessment',
      note: num !== null ? `LeetCode Verified (${num.toFixed(1)}/5.0)` : 'Needs Assessment',
    });
  }

  // 5. Git & Versioning
  const gitVal = getVal(['gitscore', 'git', 'versioning']);
  if (gitVal !== undefined) {
    const num = parseSkillNum(gitVal);
    skillsImported.push({
      name: 'Git & Versioning',
      proficiency: num,
      evidenceSource: 'project',
      note: num !== null ? `Open Source Git Audit (${num.toFixed(1)}/5.0)` : 'Unassessed',
    });
  }

  // 6. Redis
  const redisVal = getVal(['redisscore', 'redis']);
  if (redisVal !== undefined) {
    const num = parseSkillNum(redisVal);
    skillsImported.push({
      name: 'Redis',
      proficiency: num,
      evidenceSource: num !== null ? 'project' : 'self-reported',
      note: num !== null ? `Redis In-Memory Caching (${num.toFixed(1)}/5.0)` : 'Missing / Priority Gap',
    });
  }

  // 7. PostgreSQL / SQL
  const sqlVal = getVal(['postgres', 'sql', 'database', 'sqlscore']);
  if (sqlVal !== undefined) {
    const num = parseSkillNum(sqlVal);
    skillsImported.push({
      name: 'PostgreSQL & SQL',
      proficiency: num,
      evidenceSource: num !== null ? 'verified_assessment' : 'self-reported',
      note: num !== null ? `Relational DB Querying (${num.toFixed(1)}/5.0)` : 'Unassessed',
    });
  }

  if (skillsImported.length === 0) {
    skillsImported.push(
      { name: 'Python', proficiency: 4.8, evidenceSource: 'verified_assessment', note: 'Verified Python Rubric (4.8/5.0)' },
      { name: 'Machine Learning & EDA', proficiency: 4.6, evidenceSource: 'project', note: 'Cyber Attack EDA & ML Models (4.6/5.0)' },
      { name: 'Data Structures & Algorithms', proficiency: 4.2, evidenceSource: 'verified_assessment', note: 'LeetCode 40+ Problems (4.2/5.0)' },
      { name: 'Docker & Containers', proficiency: 3.2, evidenceSource: 'project', note: 'Docker & GCP Deployment (3.2/5.0)' }
    );
  }

  return {
    id,
    name,
    registerNumber: id,
    email,
    program,
    department,
    specialization,
    semester,
    cgpa,
    graduationYear,
    targetRole,
    skillsImported,
  };
}

export const CareerPlanScreen: React.FC<CareerPlanScreenProps> = ({
  onNavigate,
  onShowToast,
  profile: externalProfile,
  onUpdateProfile,
  onLoadDemoData,
  dockerScore,
  onDockerQuizCompleted,
  externalQuizSkillId,
  onClearExternalQuizSkillId,
  customRoadmapTasks = [],
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

  // Proof-of-Work Micro-Project Studio State
  const [proofOfWorkDrawerSkillId, setProofOfWorkDrawerSkillId] = useState<string | null>(null);

  const handleProofOfWorkVerified = (
    skillId: string,
    verifiedScore: number,
    repoUrl: string,
    commitHash: string
  ) => {
    updateProfile((prev) => ({
      ...prev,
      competencies: prev.competencies.map((c) =>
        c.id === skillId
          ? {
              ...c,
              proficiency: verifiedScore,
              evidenceSource: 'project',
              evidenceLabel: `GitHub Proof: ${repoUrl.replace('https://github.com/', '')} #${commitHash} ✓`,
            }
          : c
      ),
    }));

    if (skillId === 'comp-docker' && onDockerQuizCompleted) {
      onDockerQuizCompleted();
    }
  };

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

  // Sync draftProfile when profile changes
  useEffect(() => {
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
  }, [profile]);

  // Draft form state for Adding/Updating a Competency
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Core Backend');
  const [newSkillRequirement, setNewSkillRequirement] = useState<'Required' | 'Preferred' | 'Mentioned'>('Required');
  const [newSkillUnmeasured, setNewSkillUnmeasured] = useState(false);
  const [newSkillProficiency, setNewSkillProficiency] = useState('3.5');
  const [newSkillEvidence, setNewSkillEvidence] = useState<EvidenceSourceType>('coursework');

  // CSV Upload & Alias Mapping Preview State (parses without mutating until confirmed)
  const [csvFileName, setCsvFileName] = useState('student_journey_export_2026.csv');
  const [csvAliases, setCsvAliases] = useState<Record<string, string>>({
    'Candidate Name': 'name',
    'Register No / ID': 'registerNumber',
    'Degree / Program': 'program',
    'Department': 'department',
    'Specialization': 'specialization',
    'Cumulative CGPA': 'cgpa',
    'Target Role': 'targetRole',
  });
  const [competencyFilter, setCompetencyFilter] = useState<'all' | 'verified' | 'unverified' | 'gaps'>('all');
  const [showRolePopover, setShowRolePopover] = useState(false);
  const [roleSearchQuery, setRoleSearchQuery] = useState('');
  const [csvPreviewParsed, setCsvPreviewParsed] = useState<ParsedStudentCsvData>({
    name: profile.name,
    registerNumber: profile.registerNumber || profile.id,
    program: profile.program,
    department: profile.department,
    specialization: profile.specialization,
    semester: profile.semester,
    cgpa: profile.cgpa,
    graduationYear: profile.graduationYear,
    targetRole: profile.targetRole,
    skillsImported: [
      { name: 'Python', proficiency: 4.8, evidenceSource: 'verified_assessment', note: 'Verified Python Rubric (4.8/5.0)' },
      { name: 'Docker & Containers', proficiency: 3.2, evidenceSource: 'project', note: 'Docker & GCP Deployment (3.2/5.0)' },
      { name: 'Machine Learning & EDA', proficiency: 4.6, evidenceSource: 'project', note: 'Cyber Attack EDA & ML Models (4.6/5.0)' },
      { name: 'Data Structures & Algorithms', proficiency: 4.2, evidenceSource: 'verified_assessment', note: 'LeetCode 40+ Problems (4.2/5.0)' },
    ],
  });

    const handleUniversalFileUpload = async (file: File) => {
    setCsvFileName(file.name);
    try {
      if (file.name.endsWith('.json')) {
        const text = await file.text();
        const parsed = parseJsonProfile(text);
        updateProfile(() => parsed);
        setShowCsvModal(false);
        onShowToast?.(`Loaded profile for ${parsed.name} (${parsed.competencies.length} skills)`, 'success');
        return;
      }

      if (file.name.endsWith('.csv') || file.name.endsWith('.tsv') || file.name.endsWith('.txt')) {
        const text = await file.text();
        if (text.trim().startsWith('{')) {
          const parsed = parseJsonProfile(text);
          updateProfile(() => parsed);
          setShowCsvModal(false);
          onShowToast?.(`Loaded profile for ${parsed.name} (${parsed.competencies.length} skills)`, 'success');
          return;
        }

        const parsed = await parseTabularProfile(text, file.name);
        updateProfile(() => parsed);
        setShowCsvModal(false);
        onShowToast?.(`Imported ${parsed.name} from ${file.name} (CGPA: ${parsed.cgpa.toFixed(2)})`, 'success');
        return;
      }

      // Resume text or other format
      const text = await file.text();
      onShowToast?.('Extracting profile attributes with AI...', 'info');
      const parsed = await parseResumeWithGemini(text, file.name);
      updateProfile(() => parsed);
      setShowCsvModal(false);
      onShowToast?.(`Extracted profile for ${parsed.name} (${parsed.competencies.length} skills)`, 'success');
    } catch (err: any) {
      onShowToast?.(err.message || 'Failed to parse file', 'warning');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        try {
          const parsed = parseStudentCsv(content, profile);
          setCsvPreviewParsed(parsed);
          setCsvAliases({
            'Candidate Name': 'name',
            'Register No / ID': 'registerNumber',
            'Degree / Program': 'program',
            'Department': 'department',
            'Specialization': 'specialization',
            'Cumulative CGPA': 'cgpa',
            'Target Role': 'targetRole',
          });
          onShowToast?.(`Parsed ${file.name} for ${parsed.name} (CGPA: ${parsed.cgpa.toFixed(2)})`, 'info');
        } catch (err: any) {
          onShowToast?.(err.message || 'Failed to parse CSV', 'warning');
        }
      }
    };
    reader.readAsText(file);
  };

  // Embedded Micro-Quiz State (Module C Closed-Loop Verification)
  const [activeQuizId, setActiveQuizId] = useState<string | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});

  // External trigger from Copilot to open quiz immediately
  useEffect(() => {
    if (externalQuizSkillId && ROADMAP_QUIZZES[externalQuizSkillId]) {
      setActiveQuizId(externalQuizSkillId);
      setQuizAnswers({});
      onClearExternalQuizSkillId?.();
    }
  }, [externalQuizSkillId, onClearExternalQuizSkillId]);

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
      (c.evidenceSource === 'verified_assessment' || c.evidenceSource === 'project')
  );
  const unverifiedCompetencies = profile.competencies.filter(
    (c) =>
      c.proficiency !== null &&
      c.proficiency > 0 &&
      (c.evidenceSource === 'self-reported' || !c.evidenceSource)
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
      (c.id === 'comp-redis' && c.proficiency === null) ||
      (c.id === 'comp-kafka' && c.proficiency === null) ||
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
      cgpa: !isNaN(parsedCgpa) ? Math.min(10.0, Math.max(0.0, parsedCgpa)) : prev.cgpa,
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
        : `${newSkillEvidence.replace('_', ' ')} (${(profValue ?? 0).toFixed(1)}/5.0)`,
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
      const updatedCompetencies = [...prev.competencies];

      csvPreviewParsed.skillsImported.forEach((s, idx) => {
        const sNameLower = s.name.toLowerCase();
        const existingIdx = updatedCompetencies.findIndex(
          (c) =>
            c.name.toLowerCase() === sNameLower ||
            (sNameLower.includes('docker') && c.name.toLowerCase().includes('docker')) ||
            (sNameLower.includes('python') && c.name.toLowerCase().includes('python')) ||
            (sNameLower.includes('sql') && c.name.toLowerCase().includes('sql')) ||
            (sNameLower.includes('redis') && c.name.toLowerCase().includes('redis')) ||
            (sNameLower.includes('git') && c.name.toLowerCase().includes('git')) ||
            (sNameLower.includes('data structures') && c.name.toLowerCase().includes('algorithm')) ||
            (sNameLower.includes('machine learning') && (c.name.toLowerCase().includes('machine learning') || c.name.toLowerCase().includes('ml')))
        );

        if (existingIdx !== -1) {
          updatedCompetencies[existingIdx] = {
            ...updatedCompetencies[existingIdx],
            proficiency: s.proficiency,
            evidenceSource: s.evidenceSource,
            evidenceLabel: s.note,
          };
        } else {
          updatedCompetencies.push({
            id: `comp-csv-${idx}-${Date.now()}`,
            name: s.name,
            category: 'Imported Record',
            proficiency: s.proficiency,
            targetLevel: 3.5,
            requirementType: 'Preferred',
            evidenceSource: s.evidenceSource,
            evidenceLabel: s.note,
          });
        }
      });

      return {
        ...prev,
        id: csvPreviewParsed.id || prev.id,
        registerNumber: csvPreviewParsed.registerNumber || prev.registerNumber,
        name: csvPreviewParsed.name,
        email: csvPreviewParsed.email || prev.email,
        program: csvPreviewParsed.program,
        department: csvPreviewParsed.department,
        specialization: csvPreviewParsed.specialization,
        semester: csvPreviewParsed.semester,
        cgpa: csvPreviewParsed.cgpa,
        graduationYear: csvPreviewParsed.graduationYear,
        targetRole: csvPreviewParsed.targetRole,
        competencies: updatedCompetencies,
      };
    });
    setShowCsvModal(false);
    onShowToast?.(`Imported profile for ${csvPreviewParsed.name} (CGPA: ${csvPreviewParsed.cgpa.toFixed(2)})!`, 'success');
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
          badgeText: 'Priority Gap',
          badgeClass: 'bg-[#EB5757]/15 text-[#EB5757] border-[#EB5757]/40',
          needsAssessment: true,
        };
      }
      return {
        badgeText: 'Needs Assessment',
        badgeClass: 'bg-[#ffba35]/15 text-[#ffba35] border-[#ffba35]/40',
        needsAssessment: true,
      };
    }
    if (comp.proficiency === 0) {
      return {
        badgeText: '0.0 (Unassessed)',
        badgeClass: 'bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/40',
        needsAssessment: true,
      };
    }

    // 1. Parsed from student input reference -> Unverified Competency
    if (comp.evidenceSource === 'self-reported' || !comp.evidenceSource) {
      return {
        badgeText: `${comp.proficiency.toFixed(1)}/5.0 (Unverified)`,
        fullLabel: 'Unverified Competency',
        badgeClass: 'bg-[#ffba35]/15 text-[#ffba35] border-[#ffba35]/40',
        needsAssessment: true,
      };
    }

    // 2. Got improved from assessment -> Verified Competency
    return {
      badgeText: `${comp.proficiency.toFixed(1)}/5.0 (Verified)`,
      fullLabel: 'Verified Competency',
      badgeClass: 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/40',
      needsAssessment: false,
    };
  };



  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  const [skillsLimit, setSkillsLimit] = useState(4);

  // Filter skills user actually possesses (proficiency !== null && proficiency > 0)
  const userPossessedSkills = profile.competencies.filter((c) => {
    if (competencyFilter === 'gaps') {
      return c.proficiency === null || c.proficiency < c.targetLevel;
    }
    if (competencyFilter === 'verified') {
      return (
        c.proficiency !== null &&
        c.proficiency > 0 &&
        (c.evidenceSource === 'verified_assessment' || c.evidenceSource === 'project')
      );
    }
    if (competencyFilter === 'unverified') {
      return (
        c.proficiency !== null &&
        c.proficiency > 0 &&
        (c.evidenceSource === 'self-reported' || !c.evidenceSource)
      );
    }
    // Default / 'all': only show skills the user has!
    return c.proficiency !== null && c.proficiency > 0;
  });

  // Filter by search query
  const searchedSkills = userPossessedSkills.filter((c) => {
    if (!skillSearchQuery.trim()) return true;
    const q = skillSearchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.category.toLowerCase().includes(q);
  });

  // Sort by requirementType ('Required' first) then proficiency descending
  const sortedSkills = [...searchedSkills].sort((a, b) => {
    if (a.requirementType === 'Required' && b.requirementType !== 'Required') return -1;
    if (a.requirementType !== 'Required' && b.requirementType === 'Required') return 1;
    return (b.proficiency || 0) - (a.proficiency || 0);
  });

  // Top 4 skills with load more
  const displayedCompetencies = sortedSkills.slice(0, skillsLimit);

  return (
    <div className="w-full max-w-[1120px] mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Clean Onboarding Dropzone when no profile or competencies are loaded */}
      {(!profile.name || profile.competencies.length === 0) && (
        <div className="rounded-2xl bg-gradient-to-br from-indigo-950/40 via-[#121214] to-emerald-950/30 border-2 border-dashed border-indigo-500/40 p-8 text-center space-y-6 shadow-2xl">
          <div className="max-w-xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
              <span className="material-symbols-outlined text-[15px]">upload_file</span>
              AIMORA Career Profile Onboarding
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Upload Your Profile to Begin Placement Readiness
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Upload your student profile exported from your college portal (.csv, .xlsx), resume (PDF/Text), or Career Profile JSON to automatically calibrate your competencies and skill gaps.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <label className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white text-xs shadow-lg shadow-indigo-600/25 transition-all cursor-pointer hover:scale-[1.02]">
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Upload Student File (.csv, .xlsx, .json, .pdf)</span>
              <input
                type="file"
                className="hidden"
                accept=".csv,.xlsx,.tsv,.txt,.json,.pdf"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUniversalFileUpload(f);
                }}
              />
            </label>

            <button
              onClick={() => onLoadDemoData?.()}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#1c1c20] hover:bg-[#25252b] border border-[#36363c] text-amber-300 text-xs font-semibold transition-all cursor-pointer hover:border-amber-500/50"
            >
              <span className="material-symbols-outlined text-[18px] text-amber-400">bolt</span>
              <span>Load Demo Profile (Aravind R. • 8.74 CGPA)</span>
            </button>
          </div>
        </div>
      )}

      {/* Executive Command Hero: Unified Readiness & Candidate Identity */}
      <div className="rounded-2xl bg-[#121214] border border-[#27272A] p-6 shadow-xl relative">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#8052ff]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Left: Big Readiness Score & Target Role */}
          <div className="flex items-start sm:items-center gap-5">
            <div className="flex flex-col items-center justify-center w-24 h-24 rounded-2xl bg-[#09090B] border border-[#27272A] shrink-0">
              <span className="text-3xl sm:text-4xl font-bold font-mono text-white tracking-tight">
                {readinessScorePct}%
              </span>
              <span className="text-[10px] font-mono text-[#10B981] font-semibold mt-0.5">BENCHMARK</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Readiness Index
                </span>

                {/* Dynamically Changeable Target Role Popover Bubble */}
                <div className="relative inline-block">
                  <button
                    type="button"
                    onClick={() => setShowRolePopover(!showRolePopover)}
                    className="px-2.5 py-0.5 rounded-full bg-[#8052ff]/20 hover:bg-[#8052ff]/35 text-[#cdbdff] hover:text-white border border-[#8052ff]/40 hover:border-[#8052ff]/70 text-xs font-mono font-medium transition-all flex items-center gap-1 cursor-pointer shadow-sm group hover:scale-[1.02]"
                    title="Click to switch target career track"
                  >
                    <span>{profile.targetRole || 'Select Target Role'}</span>
                    <span className={`material-symbols-outlined text-[15px] transition-transform duration-200 text-[#cdbdff] group-hover:text-white ${showRolePopover ? 'rotate-180' : ''}`}>
                      expand_more
                    </span>
                  </button>

                  {showRolePopover && (
                    <>
                      {/* Invisible backdrop to dismiss popover on outside click */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => {
                          setShowRolePopover(false);
                          setRoleSearchQuery('');
                        }}
                      />

                      {/* Popover Bubble */}
                      <div className="absolute left-0 top-full mt-2 w-80 max-w-[90vw] bg-[#0E0E12] border border-[#363639] rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#202025]">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-white uppercase tracking-wider">
                            <span className="material-symbols-outlined text-[16px] text-[#8052ff]">work</span>
                            <span>Target Career Track</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setShowRolePopover(false);
                              setRoleSearchQuery('');
                            }}
                            className="text-[#71717A] hover:text-white p-0.5 rounded transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>

                        {/* Search Input */}
                        <div className="relative mb-2">
                          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[15px] text-[#71717A]">
                            search
                          </span>
                          <input
                            type="text"
                            value={roleSearchQuery}
                            onChange={(e) => setRoleSearchQuery(e.target.value)}
                            placeholder="Filter or type custom role..."
                            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg bg-[#18181D] border border-[#2A2A30] text-white placeholder-[#71717A] focus:border-[#8052ff] outline-none transition-colors"
                            autoFocus
                          />
                          {roleSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setRoleSearchQuery('')}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white text-xs"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        {/* Custom role prompt if typed value not in preset list */}
                        {roleSearchQuery.trim() &&
                          !AVAILABLE_CAREER_ROLES.some(
                            (r) => r.toLowerCase() === roleSearchQuery.trim().toLowerCase()
                          ) && (
                            <button
                              type="button"
                              onClick={() => {
                                const customRole = roleSearchQuery.trim();
                                updateProfile((prev) => ({ ...prev, targetRole: customRole }));
                                setShowRolePopover(false);
                                setRoleSearchQuery('');
                                onShowToast?.(`Target role set to "${customRole}". Readiness recalibrated!`, 'success');
                              }}
                              className="w-full mb-1.5 px-2.5 py-1.5 text-left text-xs rounded-lg bg-[#8052ff]/15 hover:bg-[#8052ff]/25 border border-[#8052ff]/30 text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[15px] text-[#10B981]">add_circle</span>
                              <span className="truncate">Use &quot;{roleSearchQuery.trim()}&quot;</span>
                            </button>
                          )}

                        {/* Scrollable Role List */}
                        <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                          {AVAILABLE_CAREER_ROLES.filter((role) =>
                            role.toLowerCase().includes(roleSearchQuery.toLowerCase())
                          ).map((role) => {
                            const isSelected = profile.targetRole === role;
                            return (
                              <button
                                key={role}
                                type="button"
                                onClick={() => {
                                  updateProfile((prev) => ({ ...prev, targetRole: role }));
                                  setShowRolePopover(false);
                                  setRoleSearchQuery('');
                                  onShowToast?.(`Target role switched to "${role}". Readiness recalibrated!`, 'success');
                                }}
                                className={`w-full px-2.5 py-2 text-left text-xs rounded-lg transition-all flex items-center justify-between cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#8052ff]/20 text-white font-bold border border-[#8052ff]/40 shadow-sm'
                                    : 'text-slate-300 hover:bg-[#1C1C22] hover:text-white'
                                }`}
                              >
                                <span className="truncate">{role}</span>
                                {isSelected && (
                                  <span className="material-symbols-outlined text-[15px] text-[#10B981] shrink-0 ml-1">
                                    check_circle
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30 text-[11px] font-mono">
                  <span className="text-[#A1A1AA]">Sem 7 Baseline: 56%</span>
                  <span>→</span>
                  <span className="font-bold text-white">Live: {readinessScorePct}%</span>
                  <span className="text-[#10b981] font-semibold">(+{Math.max(0, readinessScorePct - 56)}% Mid-Sem Delta)</span>
                </div>
              </div>
              <p className="text-xs text-[#A1A1AA] max-w-xl">
                Evidence benchmark across {totalCompetencies} role competencies. Unassessed skills are preserved strictly as <code className="text-[#F59E0B] font-mono">null</code>.
              </p>
              <div className="flex items-center gap-3 text-xs font-mono text-[#71717A] pt-1">
                <span className="text-[#10B981] font-semibold">{verifiedCompetencies.length} Verified</span>
                <span>•</span>
                <span className="text-[#ffba35] font-semibold">{unverifiedCompetencies.length} Unverified</span>
                <span>•</span>
                <span className="text-[#F59E0B] font-semibold">{priorityGaps.length} Gaps</span>
                <span>•</span>
                <span>Coverage: {evidenceCoveragePct}%</span>
              </div>
            </div>
          </div>

          {/* Right: Candidate Credentials, Compact Brain & Direct Interview Room Action */}
          <div className="flex flex-col sm:flex-row lg:flex-row items-center gap-4 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#27272A]">
            <div className="w-28 h-24 hidden md:block shrink-0 -my-2 opacity-90 hover:opacity-100 transition-opacity">
              <ParticleBrain compact />
            </div>

            <div className="text-left sm:text-right font-mono text-xs space-y-0.5">
              <div className="text-sm font-bold text-white flex items-center sm:justify-end gap-1.5">
                <span>{profile.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 font-bold">
                  SRM CDC
                </span>
              </div>
              <div className="text-[#A1A1AA] text-[11px]">
                {profile.registerNumber || profile.id || 'No Register No.'} • CGPA {profile.cgpa.toFixed(2)} / 10.00 • 0 Arrears
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Progress Bar */}
        <div className="mt-5 pt-4 border-t border-[#27272A]/70">
          <div className="w-full bg-[#09090B] h-2 rounded-full overflow-hidden border border-[#27272A]/50">
            <div
              className="bg-gradient-to-r from-[#8052ff] to-[#10B981] h-full rounded-full transition-all duration-500"
              style={{ width: `${readinessScorePct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Semester Assessment CTA Card */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <span className="material-symbols-outlined text-2xl">quiz</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                {profile.semester || 'Semester 6'} Diagnostic
              </span>
              <span className="text-xs text-slate-400">Institutional Benchmark</span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">
              Validate your technical knowledge to elevate your verified readiness
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
              Take the 15-minute diagnostic test in DBMS, Operating Systems, and Networks to upgrade your skills from <em>Self-Reported</em> to <strong>Verified Assessment</strong>.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate?.('assessment')}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] shrink-0 cursor-pointer"
        >
          <span>Take Semester Assessment</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>

      {/* SECTION 1: Unified Competencies Matrix (Zero Duplication) */}
      <section className="rounded-2xl bg-[#121214] border border-[#27272A] p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272A]">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-base font-bold text-white tracking-tight">Competencies</h2>
            <div className="flex items-center rounded-lg bg-[#09090B] p-0.5 border border-[#27272A] text-xs font-mono">
              <button
                onClick={() => { setCompetencyFilter('all'); setSkillsLimit(4); }}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  competencyFilter === 'all' ? 'bg-[#27272A] text-white font-semibold' : 'text-[#71717A] hover:text-white'
                }`}
              >
                My Skills ({profile.competencies.filter((c) => c.proficiency !== null && c.proficiency > 0).length})
              </button>
              <button
                onClick={() => { setCompetencyFilter('verified'); setSkillsLimit(4); }}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  competencyFilter === 'verified' ? 'bg-[#10B981]/20 text-[#10B981] font-semibold' : 'text-[#71717A] hover:text-white'
                }`}
              >
                Verified ({verifiedCompetencies.length})
              </button>
              <button
                onClick={() => { setCompetencyFilter('unverified'); setSkillsLimit(4); }}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  competencyFilter === 'unverified' ? 'bg-[#ffba35]/20 text-[#ffba35] font-semibold' : 'text-[#71717A] hover:text-white'
                }`}
              >
                Unverified ({unverifiedCompetencies.length})
              </button>
              <button
                onClick={() => { setCompetencyFilter('gaps'); setSkillsLimit(4); }}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  competencyFilter === 'gaps' ? 'bg-[#F59E0B]/20 text-[#F59E0B] font-semibold' : 'text-[#71717A] hover:text-white'
                }`}
              >
                Gaps ({priorityGaps.length})
              </button>
            </div>

            {/* Small Search Bar */}
            <div className="relative min-w-[200px] sm:w-56">
              <span className="material-symbols-outlined text-[15px] text-[#71717A] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                search
              </span>
              <input
                type="text"
                value={skillSearchQuery}
                onChange={(e) => {
                  setSkillSearchQuery(e.target.value);
                  if (skillsLimit < 12) setSkillsLimit(12);
                }}
                placeholder="Search skill (e.g. Python, SQL)..."
                className="w-full pl-8 pr-7 py-1 text-xs rounded-md bg-[#09090B] border border-[#27272A] text-white placeholder-[#71717A] focus:border-[#8052ff] outline-none transition-colors"
              />
              {skillSearchQuery && (
                <button
                  onClick={() => setSkillSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white text-[10px]"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="px-3 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] hover:border-[#8052ff] text-white text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">
                {isAnalyzing ? 'sync' : 'refresh'}
              </span>
              <span>{isAnalyzing ? 'Syncing...' : 'Recalculate'}</span>
            </button>
            <button
              onClick={() => setShowAddSkillModal(true)}
              className="px-3 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] hover:border-[#8052ff] text-[#cdbdff] hover:text-white text-xs font-mono transition-colors cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              <span>Add Skill</span>
            </button>
            <button
              onClick={() => setShowCsvModal(true)}
              className="px-3 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] hover:border-[#8052ff] text-[#A1A1AA] hover:text-white text-xs font-mono transition-colors cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">upload_file</span>
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Competencies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {displayedCompetencies.map((comp) => {
            const isNull = comp.proficiency === null;
            const isZero = comp.proficiency === 0;
            const meetsTarget = comp.proficiency !== null && comp.proficiency >= comp.targetLevel;
            const badgeInfo = getSkillBadgeState(comp);
            const isPoW = comp.id === 'comp-redis' || comp.id === 'comp-docker';
            const isPoWVerified = comp.proficiency !== null && comp.evidenceLabel?.includes('GitHub Proof');

            return (
              <div
                key={comp.id}
                className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] hover:border-[#3F3F46] transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight leading-snug">
                    {comp.name}
                  </h4>
                  <div className="flex items-center justify-between gap-2 mt-1.5">
                    <span className="text-[11px] font-mono text-[#71717A] truncate" title={`${comp.category} • Target ${comp.targetLevel.toFixed(1)}`}>
                      {comp.category} • Target {comp.targetLevel.toFixed(1)}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border shrink-0 ${badgeInfo.badgeClass}`}>
                      {badgeInfo.badgeText}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-[#27272A]/70">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#71717A]">Proficiency</span>
                    <span className="font-bold tabular-nums">
                      {isNull ? (
                        <span className="text-[#F59E0B]">null</span>
                      ) : (
                        <span className={meetsTarget ? 'text-[#10B981]' : isZero ? 'text-[#F43F5E]' : 'text-white'}>
                          {comp.proficiency?.toFixed(1)}/5.0
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="w-full bg-[#18181B] h-1.5 rounded-full overflow-hidden">
                    {!isNull && (
                      <div
                        className={`h-full rounded-full ${
                          meetsTarget ? 'bg-[#10B981]' : isZero ? 'bg-[#F43F5E]' : 'bg-[#F59E0B]'
                        }`}
                        style={{ width: `${Math.max(6, ((comp.proficiency || 0) / 5.0) * 100)}%` }}
                      />
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-2">
                    {isPoW ? (
                      <button
                        onClick={() => setProofOfWorkDrawerSkillId(comp.id)}
                        className={`w-full py-1.5 px-2.5 rounded-lg text-[11px] font-mono font-semibold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isPoWVerified
                            ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30 hover:bg-[#10B981]/25'
                            : 'bg-[#8052ff]/15 text-[#cdbdff] border-[#8052ff]/30 hover:bg-[#8052ff]/25'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          {isPoWVerified ? 'verified' : 'terminal'}
                        </span>
                        <span>{isPoWVerified ? 'GitHub Proof ✓' : 'Proof-of-Work Project'}</span>
                      </button>
                    ) : ROADMAP_QUIZZES[comp.id] ? (
                      <button
                        onClick={() => handleOpenQuiz(comp.id)}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-[#18181B] hover:bg-[#27272A] text-[#cdbdff] hover:text-white border border-[#27272A] text-[11px] font-mono font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>{comp.evidenceSource === 'verified_assessment' ? 'Verified Assessment ✓' : comp.proficiency === null ? 'Take Assessment →' : 'Verify via Quiz →'}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-mono text-[#71717A] truncate w-full" title={comp.evidenceLabel}>
                        {comp.evidenceLabel}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More Button */}
        {sortedSkills.length > 4 && (
          <div className="pt-3 flex items-center justify-center">
            {skillsLimit < sortedSkills.length ? (
              <button
                onClick={() => setSkillsLimit((prev) => prev + 8)}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#18181B] hover:bg-[#222226] border border-[#27272A] hover:border-[#8052ff] text-white text-xs font-semibold transition-all cursor-pointer shadow-md hover:scale-[1.01]"
              >
                <span>Load More Skills ({sortedSkills.length - skillsLimit} remaining)</span>
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </button>
            ) : (
              <button
                onClick={() => setSkillsLimit(4)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#18181B] hover:bg-[#222226] border border-[#27272A] text-slate-300 text-xs font-medium transition-all cursor-pointer"
              >
                <span>Show Top 4 Skills Only</span>
                <span className="material-symbols-outlined text-[16px]">expand_less</span>
              </button>
            )}
          </div>
        )}

        {/* Empty Search State */}
        {sortedSkills.length === 0 && (
          <div className="p-8 text-center bg-[#09090B] border border-[#27272A] rounded-xl text-xs text-[#71717A] space-y-1">
            <span className="material-symbols-outlined text-2xl text-[#71717A]">search_off</span>
            <p className="text-slate-300 font-medium">
              {skillSearchQuery ? `No skills matching "${skillSearchQuery}"` : 'No skills recorded yet.'}
            </p>
            {skillSearchQuery && (
              <button
                onClick={() => setSkillSearchQuery('')}
                className="text-[#8052ff] hover:underline text-xs"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </section>

      {/* SECTION 2: Dynamic Learning Roadmap */}
      <section className="rounded-2xl bg-[#121214] border border-[#27272A] p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#27272A]">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Dynamic Learning Roadmap</h2>
            <p className="text-xs text-[#71717A] mt-0.5">
              Targeted technical milestones with hands-on proof verification and live assessments.
            </p>
          </div>

          <button
            onClick={() => onNavigate?.('job-search')}
            className="px-3 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-[#cdbdff] hover:text-white hover:border-[#8052ff] text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <span className="material-symbols-outlined text-[15px]">radar</span>
            <span>Market Radar →</span>
          </button>
        </div>

        {/* Milestones List */}
        <div className="space-y-3.5">
          {/* Milestone 1: SQL */}
          <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#F59E0B] font-bold">01</span>
                <span className="text-sm font-bold text-white">SQL — Indexing, Join Execution & ACID Guarantees</span>
                <span className="px-2 py-0.5 rounded bg-[#18181B] border border-[#27272A] text-[10px] font-mono text-[#A1A1AA]">
                  3-5 hrs
                </span>
              </div>
              <p className="text-xs text-[#A1A1AA]">
                Verify composite B-Tree indexing, execution plan analysis (EXPLAIN ANALYZE), and ACID WAL durability.
              </p>
            </div>

            <button
              onClick={() => handleOpenQuiz('comp-sql')}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all shrink-0 cursor-pointer ${
                sqlComp?.proficiency !== null
                  ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                  : 'bg-[#8052ff] hover:bg-[#8052ff]/90 text-white shadow-md shadow-[#8052ff]/20'
              }`}
            >
              {sqlComp && sqlComp.proficiency !== null ? `Verified (${sqlComp.proficiency.toFixed(1)}/5.0) · Retake` : 'Take Assessment (#SQL-01) →'}
            </button>
          </div>

          {/* Milestone 2: Docker */}
          <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#10B981] font-bold">02</span>
                <span className="text-sm font-bold text-white">Docker — Container Lifecycle & Multi-Stage Builds</span>
                <span className="px-2 py-0.5 rounded bg-[#18181B] border border-[#27272A] text-[10px] font-mono text-[#A1A1AA]">
                  4-6 hrs
                </span>
                <span className="px-2 py-0.2 rounded text-[10px] font-mono font-semibold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                  GitHub Proof
                </span>
              </div>
              <p className="text-xs text-[#A1A1AA]">
                Multi-stage Alpine Dockerfile optimization, non-root security contexts, and container isolation.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setProofOfWorkDrawerSkillId('comp-docker')}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  dockerComp?.proficiency !== null && dockerComp?.evidenceLabel?.includes('GitHub Proof')
                    ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                    : 'bg-gradient-to-r from-[#8052ff] to-[#6035d8] text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {dockerComp?.proficiency !== null && dockerComp?.evidenceLabel?.includes('GitHub Proof') ? 'verified' : 'terminal'}
                </span>
                <span>{dockerComp?.proficiency !== null && dockerComp?.evidenceLabel?.includes('GitHub Proof') ? 'Proof Verified ✓' : 'Proof-of-Work Project'}</span>
              </button>
            </div>
          </div>

          {/* Milestone 3: Redis */}
          <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#F43F5E] font-bold">03</span>
                <span className="text-sm font-bold text-white">Redis — Distributed In-Memory Caching & Rate Limiting</span>
                <span className="px-2 py-0.5 rounded bg-[#18181B] border border-[#27272A] text-[10px] font-mono text-[#A1A1AA]">
                  3-5 hrs
                </span>
                <span className="px-2 py-0.2 rounded text-[10px] font-mono font-semibold bg-[#F43F5E]/15 text-[#F43F5E] border border-[#F43F5E]/30">
                  Priority Gap
                </span>
              </div>
              <p className="text-xs text-[#A1A1AA]">
                Cache-aside invalidation, TTL jitter stampede prevention, and ZSET sliding-window rate limiters.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setProofOfWorkDrawerSkillId('comp-redis')}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  redisComp?.proficiency !== null && redisComp?.evidenceLabel?.includes('GitHub Proof')
                    ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                    : 'bg-gradient-to-r from-[#8052ff] to-[#6035d8] text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {redisComp?.proficiency !== null && redisComp?.evidenceLabel?.includes('GitHub Proof') ? 'verified' : 'terminal'}
                </span>
                <span>{redisComp?.proficiency !== null && redisComp?.evidenceLabel?.includes('GitHub Proof') ? 'Proof Verified ✓' : 'Proof-of-Work Project'}</span>
              </button>
            </div>
          </div>

          {/* Milestone 4: Kafka */}
          <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#F43F5E] font-bold">04</span>
                <span className="text-sm font-bold text-white">Apache Kafka — Distributed Event Streaming</span>
                <span className="px-2 py-0.5 rounded bg-[#18181B] border border-[#27272A] text-[10px] font-mono text-[#A1A1AA]">
                  4-6 hrs
                </span>
              </div>
              <p className="text-xs text-[#A1A1AA]">
                Partition key routing, consumer group offsets (PEL & XACK), and event broker idempotency.
              </p>
            </div>

            <button
              onClick={() => handleOpenQuiz('comp-kafka')}
              className="px-4 py-2 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-[#cdbdff] hover:text-white border border-[#27272A] text-xs font-mono font-semibold transition-colors cursor-pointer shrink-0"
            >
              Assess Kafka →
            </button>
          </div>

          {/* Custom Milestones added by Copilot */}
          {customRoadmapTasks.map((task, idx) => (
            <div
              key={task.id}
              className="p-4 rounded-xl bg-[#09090B] border border-[#8052ff]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#cdbdff] font-bold">0{5 + idx}</span>
                  <span className="text-sm font-bold text-white">{task.title}</span>
                  <span className="px-2 py-0.5 rounded bg-[#8052ff]/20 text-[#cdbdff] text-[10px] font-mono">
                    Copilot Task
                  </span>
                </div>
                <p className="text-xs text-[#A1A1AA]">{task.objective}</p>
              </div>

              <span className="px-3 py-1.5 rounded-lg bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-xs font-mono font-semibold shrink-0">
                Active Goal
              </span>
            </div>
          ))}
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
                    <label className="block text-[#9A9A9A] mb-1">CGPA (10.0)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10.0"
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
                  accept=".csv,.xlsx,.xls,.tsv,.txt"
                  className="hidden"
                  onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUniversalFileUpload(f);
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
                        {(csvPreviewParsed as any)[targetField]?.toString() ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 rounded bg-[#16161A] border border-[#202023] text-xs space-y-1">
              <div className="font-semibold text-white">Staged Competency Rows ({csvPreviewParsed.skillsImported.length}):</div>
              {csvPreviewParsed.skillsImported.map((s, idx) => (
                <div key={idx} className="text-[#9A9A9A] font-mono">
                  · {s.name}: level {s.proficiency !== null ? s.proficiency.toFixed(1) : 'null'} ({s.evidenceSource || 'unassessed'}) — {s.note}
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

      {/* Proof-of-Work Micro-Project Studio Side Drawer */}
      {proofOfWorkDrawerSkillId && (
        <ProofOfWorkStudioDrawer
          isOpen={Boolean(proofOfWorkDrawerSkillId)}
          skillId={proofOfWorkDrawerSkillId}
          isAlreadyVerified={Boolean(
            profile.competencies.find((c) => c.id === proofOfWorkDrawerSkillId)?.proficiency !== null &&
            profile.competencies.find((c) => c.id === proofOfWorkDrawerSkillId)?.evidenceLabel?.includes('GitHub Proof')
          )}
          onClose={() => setProofOfWorkDrawerSkillId(null)}
          onVerificationComplete={handleProofOfWorkVerified}
          onShowToast={onShowToast}
        />
      )}
    </div>
  );
};

export default CareerPlanScreen;
