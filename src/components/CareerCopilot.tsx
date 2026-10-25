import React, { useState, useRef, useEffect } from 'react';
import { StudentProfileData, UserRole } from '../types';

export interface ActionableToolCard {
  id: string;
  type: 'launch_quiz' | 'add_roadmap_task' | 'navigate' | 'audit_resume' | 'schedule_workshop' | 'batch_nudge';
  title: string;
  subtitle: string;
  targetSkillId?: string;
  targetPath?: string;
  timeEstimate?: string;
  targetCohort?: string;
  targetStudentIds?: string[];
  status: 'pending' | 'confirmed' | 'dismissed';
}

export interface CopilotCitation {
  label: string;
  type: 'skill' | 'role' | 'benchmark' | 'milestone' | 'cohort' | 'review' | 'flag';
  targetId?: string;
}

export interface CopilotMessage {
  id: string;
  sender: 'copilot' | 'user';
  text: string;
  timestamp: string;
  citations?: CopilotCitation[];
  toolCard?: ActionableToolCard;
}

interface CareerCopilotProps {
  userRole: UserRole;
  profile: StudentProfileData;
  readinessPct: number;
  facultyName?: string;
  department?: string;
  activeCohort?: string;
  onNavigate: (path: string) => void;
  onLaunchQuiz: (skillId: string) => void;
  onAddRoadmapTask: (task: { title: string; skillId?: string; time: string; objective: string }) => void;
  onAddFacultyWorkshop?: (workshop: { title: string; cohort: string; deadline: string; studentCount: number }) => void;
  onSendCohortNudges?: (targetIds: string[], reason: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export default function CareerCopilot({
  userRole,
  profile,
  readinessPct,
  facultyName = 'Prof. Sarah Jenkins',
  department = 'Computer Science & Engineering',
  activeCohort = 'CSE 2028 A',
  onNavigate,
  onLaunchQuiz,
  onAddRoadmapTask,
  onAddFacultyWorkshop,
  onSendCohortNudges,
  onShowToast,
}: CareerCopilotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isFaculty = userRole === 'faculty';

  const sqlComp = profile.competencies.find((c) => c.id === 'comp-sql');
  const sysComp = profile.competencies.find((c) => c.id === 'comp-sys');
  const gitComp = profile.competencies.find((c) => c.id === 'comp-git');
  const dockerComp = profile.competencies.find((c) => c.id === 'comp-docker');
  const redisComp = profile.competencies.find((c) => c.id === 'comp-redis');

  // Grounded starter messages per role
  const getStudentInitialMessages = (): CopilotMessage[] => [
    {
      id: 'msg-student-welcome',
      sender: 'copilot',
      text: `Hello ${profile.name.split(' ')[0]}! I'm your grounded Career Copilot for the [Role: Junior Backend Engineer (Distributed Systems)] track.\n\nYour current Readiness Index is at [Benchmark: ${readinessPct}%]. I have inspected your verified evidence: [Skill: Git & Versioning] is verified at 4.0/5.0, [Skill: System Design] is at 2.5/5.0 (Self-reported), and [Skill: SQL] is currently ${
        sqlComp?.proficiency !== null ? `verified at ${sqlComp?.proficiency.toFixed(1)}/5.0` : 'unassessed (Needs assessment)'
      }.\n\nHow can I help you accelerate your placement readiness today?`,
      timestamp: 'Just now',
      citations: [
        { label: 'Role: Junior Backend Engineer', type: 'role', targetId: 'role' },
        { label: `Benchmark: ${readinessPct}%`, type: 'benchmark', targetId: 'readiness' },
        { label: 'Skill: Git & Versioning', type: 'skill', targetId: 'comp-git' },
        { label: 'Skill: System Design', type: 'skill', targetId: 'comp-sys' },
        { label: 'Skill: SQL', type: 'skill', targetId: 'comp-sql' },
      ],
    },
  ];

  const getFacultyInitialMessages = (): CopilotMessage[] => [
    {
      id: 'msg-faculty-welcome',
      sender: 'copilot',
      text: `Welcome, ${facultyName}! I am your [Cohort: CSE 2028 A] Institutional Placement Copilot.\n\nInstitutional Cohort Grounding:\n• **Roster Size**: 45 candidates enrolled in [Cohort: CSE 2028 A] (Department of ${department})\n• **Average Readiness**: [Benchmark: 64%]\n• **Key Bottlenecks**: [Skill: Docker] is unassessed in **42%** of candidates (19 students) and [Skill: Redis] is missing in **68%** (31 students)\n• **Attention Required**: 6 students have [Flag: Incomplete Profile] and 8 candidates have [Review: Pending Resume Review]\n\nSelect a prompt below or ask about any candidate cluster or training initiative.`,
      timestamp: 'Just now',
      citations: [
        { label: 'Cohort: CSE 2028 A', type: 'cohort', targetId: 'cohort' },
        { label: 'Benchmark: 64%', type: 'benchmark', targetId: 'cohort-readiness' },
        { label: 'Skill: Docker', type: 'skill', targetId: 'skill-docker' },
        { label: 'Skill: Redis', type: 'skill', targetId: 'skill-redis' },
        { label: 'Flag: Incomplete Profile', type: 'flag', targetId: 'flag-incomplete' },
        { label: 'Review: Pending Resume Review', type: 'review', targetId: 'review-pending' },
      ],
    },
  ];

  const [studentMessages, setStudentMessages] = useState<CopilotMessage[]>(getStudentInitialMessages);
  const [facultyMessages, setFacultyMessages] = useState<CopilotMessage[]>(getFacultyInitialMessages);

  const activeMessages = isFaculty ? facultyMessages : studentMessages;
  const setActiveMessages = isFaculty ? setFacultyMessages : setStudentMessages;

  // Auto scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeMessages, isOpen]);

  // Starter prompts depending on active role
  const studentStarterPrompts = [
    'Why is Redis a high-priority gap?',
    `How do I raise my Readiness from ${readinessPct}% to 80%?`,
    'What does the Junior Backend Engineer role require?',
  ];

  const facultyStarterPrompts = [
    'What are the biggest placement bottlenecks for CSE 2028 A?',
    'Which students need follow-ups for incomplete profiles or missing assessments?',
    'Schedule a Docker & Containerization workshop for students lacking evidence.',
  ];

  const starterPrompts = isFaculty ? facultyStarterPrompts : studentStarterPrompts;

  // Student Grounded Response Generator
  const generateStudentResponse = (userInput: string): CopilotMessage => {
    const query = userInput.toLowerCase();
    const msgId = `copilot-stu-${Date.now()}`;
    const timestamp = 'Just now';

    // 1. "Why is Redis a high-priority gap?"
    if (query.includes('redis') || (query.includes('priority') && query.includes('gap'))) {
      const isRedisVerified = redisComp?.proficiency !== null;
      return {
        id: msgId,
        sender: 'copilot',
        text: isRedisVerified
          ? `[Skill: Redis] is currently recorded at ${redisComp?.proficiency?.toFixed(1)}/5.0 in your profile. In the distributed systems market, Redis appears in over 74% of backend postings as a Required tier technology for caching, session stores, and rate limiters.`
          : `[Skill: Redis] is classified as a **High-Priority Gap** for the [Role: Junior Backend Engineer (Distributed Systems)] profile because:\n\n1. **Market Demand Frequency**: Redis is mentioned in **74.4%** of backend postings (64 of 86 analyzed jobs).\n2. **Missing Evidence**: Your profile currently records Redis proficiency as **null (unverified)**.\n3. **Priority Weighting**: With our deterministic formula, missing required skills receive a **Learn weight of 2.0x**, giving Redis a high priority score of **1.935**.\n\nWould you like to schedule the Redis distributed caching milestone to your active roadmap?`,
        timestamp,
        citations: [
          { label: 'Skill: Redis', type: 'skill', targetId: 'comp-redis' },
          { label: 'Role: Junior Backend Engineer', type: 'role', targetId: 'role' },
          { label: 'Milestone: MS-03', type: 'milestone', targetId: 'ms-03' },
        ],
        toolCard: {
          id: `tool-${Date.now()}`,
          type: 'add_roadmap_task',
          title: "Add 'Learn Redis Data Structures' to Roadmap",
          subtitle: 'Est. Effort: 3-5 hrs • Covers Cache-Aside, TTL Jitter & ZSET Rate Limiters',
          targetSkillId: 'comp-redis',
          timeEstimate: '3-5 hrs',
          status: 'pending',
        },
      };
    }

    // 2. "How do I raise my Readiness from 64% to 80%?"
    if (query.includes('raise') || query.includes('readiness') || query.includes('80%') || query.includes('score')) {
      const isSqlAssessed = sqlComp?.proficiency !== null;
      const isDockerAssessed = dockerComp?.proficiency !== null;

      if (!isSqlAssessed) {
        return {
          id: msgId,
          sender: 'copilot',
          text: `Your current benchmark is at [Benchmark: ${readinessPct}%]. Because readiness measures verified evidence against [Role: Junior Backend Engineer (Distributed Systems)], you can reach **76%** immediately by taking the 3-question [Skill: SQL] verification quiz.\n\nNext steps to reach **80%+**:\n• **Step 1**: Complete [Skill: SQL] assessment #SQL-01 (+12% gain → 76%)\n• **Step 2**: Complete [Skill: Docker & Containers] quiz #DCK-101 (+10% gain → 86%)\n• **Step 3**: Verify [Skill: Redis] caching architecture (+5.4% gain)\n\nReady to verify SQL right now?`,
          timestamp,
          citations: [
            { label: `Benchmark: ${readinessPct}%`, type: 'benchmark', targetId: 'readiness' },
            { label: 'Skill: SQL', type: 'skill', targetId: 'comp-sql' },
            { label: 'Skill: Docker & Containers', type: 'skill', targetId: 'comp-docker' },
            { label: 'Role: Junior Backend Engineer', type: 'role', targetId: 'role' },
          ],
          toolCard: {
            id: `tool-${Date.now()}`,
            type: 'launch_quiz',
            title: 'Launch SQL Verification Quiz #SQL-01',
            subtitle: '3-Question Assessment • B-Tree Indexing, Hash Joins & ACID Durability',
            targetSkillId: 'comp-sql',
            timeEstimate: '3-5 min',
            status: 'pending',
          },
        };
      }

      if (!isDockerAssessed) {
        return {
          id: msgId,
          sender: 'copilot',
          text: `Excellent progress! [Skill: SQL] is already verified at ${sqlComp?.proficiency?.toFixed(1)}/5.0 with your Readiness at [Benchmark: ${readinessPct}%].\n\nTo cross **80%** into placement-ready status, verify [Skill: Docker & Containers]:\n• **Immediate Action**: Launch #DCK-101 Micro-Assessment to unlock CloudScale partner gates.\n• Target: Multi-stage Alpine builds, healthchecks, and layer caching.\n• Reward: Pushes readiness to **86%**!`,
          timestamp,
          citations: [
            { label: `Benchmark: ${readinessPct}%`, type: 'benchmark', targetId: 'readiness' },
            { label: 'Skill: Docker & Containers', type: 'skill', targetId: 'comp-docker' },
            { label: 'Milestone: MS-02', type: 'milestone', targetId: 'ms-02' },
          ],
          toolCard: {
            id: `tool-${Date.now()}`,
            type: 'launch_quiz',
            title: 'Launch Docker Verification Quiz #DCK-101',
            subtitle: '3-Question Assessment • Multi-stage builds & container restart policies',
            targetSkillId: 'comp-docker',
            timeEstimate: '3-5 min',
            status: 'pending',
          },
        };
      }

      return {
        id: msgId,
        sender: 'copilot',
        text: `Your benchmark is strong at [Benchmark: ${readinessPct}%]! To maximize your profile score toward 95%+:\n\n• **Address Missing Systems**: Complete [Skill: Redis] (#RED-201) and [Skill: Kafka] (#KAF-302) to cover distributed messaging.\n• **Upgrade Self-Reported**: Elevate [Skill: System Design] from 2.5/5.0 self-reported to audited project evidence.\n• **Audit Resume Concordance**: Align your project bullet points with active campus drives in Opportunities.`,
        timestamp,
        citations: [
          { label: `Benchmark: ${readinessPct}%`, type: 'benchmark', targetId: 'readiness' },
          { label: 'Skill: Redis', type: 'skill', targetId: 'comp-redis' },
          { label: 'Skill: Kafka', type: 'skill', targetId: 'comp-kafka' },
          { label: 'Skill: System Design', type: 'skill', targetId: 'comp-sys' },
        ],
        toolCard: {
          id: `tool-${Date.now()}`,
          type: 'navigate',
          title: 'Audit Resume Alignment in Workspace',
          subtitle: 'Verify Concordance with Active Campus Drives',
          targetPath: 'resume-analyzer',
          status: 'pending',
        },
      };
    }

    // 3. "What does the Junior Backend Engineer role require?"
    if (query.includes('junior') || query.includes('backend') || query.includes('require') || query.includes('role')) {
      return {
        id: msgId,
        sender: 'copilot',
        text: `The **[Role: Junior Backend Engineer (Distributed Systems)]** target role evaluates 7 core technical competencies:\n\n1. **Python / Core Backend**: Required (Target: 4.0/5.0) — *You have 4.2 Verified ✓*\n2. **Git & Versioning**: Required (Target: 3.0/5.0) — *You have 4.0 Verified ✓*\n3. **System Design**: Required (Target: 3.0/5.0) — *Currently 2.5 Self-reported*\n4. **SQL & Relational DBs**: Required (Target: 3.5/5.0) — *${
          sqlComp?.proficiency !== null ? `Verified at ${sqlComp?.proficiency.toFixed(1)}/5.0 ✓` : 'Needs assessment (null)'
        }*\n5. **Docker & Containers**: Required (Target: 3.5/5.0) — *${
          dockerComp?.proficiency !== null ? `Verified at ${dockerComp?.proficiency.toFixed(1)}/5.0 ✓` : 'Needs assessment (null)'
        }*\n6. **Redis Caching**: Preferred (Target: 3.0/5.0) — *Priority Gap*\n7. **Kafka Streaming**: Preferred (Target: 3.0/5.0) — *Priority Gap*\n\nReview the full competency comparison in [Milestone: MS-01] or check the Opportunities Radar.`,
        timestamp,
        citations: [
          { label: 'Role: Junior Backend Engineer', type: 'role', targetId: 'role' },
          { label: 'Skill: SQL', type: 'skill', targetId: 'comp-sql' },
          { label: 'Skill: System Design', type: 'skill', targetId: 'comp-sys' },
          { label: 'Skill: Git & Versioning', type: 'skill', targetId: 'comp-git' },
          { label: 'Skill: Redis', type: 'skill', targetId: 'comp-redis' },
        ],
        toolCard: {
          id: `tool-${Date.now()}`,
          type: 'navigate',
          title: 'Inspect Market Radar in Opportunities',
          subtitle: 'Compare 6-axis evidenced proficiency against regional job postings',
          targetPath: 'job-search',
          status: 'pending',
        },
      };
    }

    // Default student response
    return {
      id: msgId,
      sender: 'copilot',
      text: `Based on your student evidence profile for **[Role: Junior Backend Engineer (Distributed Systems)]**:\n\n• **Readiness Index**: [Benchmark: ${readinessPct}%]\n• **Verified**: Python (4.2/5.0), [Skill: Git & Versioning] (4.0/5.0)${
        sqlComp?.proficiency !== null ? `, [Skill: SQL] (${sqlComp?.proficiency?.toFixed(1)}/5.0)` : ''
      }\n• **Needs Assessment**: ${sqlComp?.proficiency === null ? '[Skill: SQL], ' : ''}[Skill: Docker & Containers]\n• **Priority Gaps**: [Skill: Redis] and Apache Kafka\n\nAsk me about any skill gap, readiness optimization, or roadmaps!`,
      timestamp,
      citations: [
        { label: 'Role: Junior Backend Engineer', type: 'role', targetId: 'role' },
        { label: `Benchmark: ${readinessPct}%`, type: 'benchmark', targetId: 'readiness' },
        { label: 'Skill: SQL', type: 'skill', targetId: 'comp-sql' },
        { label: 'Skill: Redis', type: 'skill', targetId: 'comp-redis' },
      ],
      toolCard: {
        id: `tool-${Date.now()}`,
        type: 'launch_quiz',
        title: sqlComp?.proficiency === null ? 'Launch SQL Verification Quiz #SQL-01' : 'Explore Market Demand in Opportunities',
        subtitle: sqlComp?.proficiency === null ? 'Boost Readiness from 64% to 76%' : 'Analyze Concordance & Role Thresholds',
        targetSkillId: sqlComp?.proficiency === null ? 'comp-sql' : undefined,
        targetPath: sqlComp?.proficiency !== null ? 'job-search' : undefined,
        status: 'pending',
      },
    };
  };

  // Faculty Grounded Response Generator
  const generateFacultyResponse = (userInput: string): CopilotMessage => {
    const query = userInput.toLowerCase();
    const msgId = `copilot-fac-${Date.now()}`;
    const timestamp = 'Just now';

    // 1. "What are the biggest placement bottlenecks for CSE 2028 A?"
    if (query.includes('bottleneck') || query.includes('blocker') || query.includes('biggest')) {
      return {
        id: msgId,
        sender: 'copilot',
        text: `Analysis of **[Cohort: CSE 2028 A]** (45 students total, average benchmark [Benchmark: 64%]):\n\n1. **[Skill: Docker] Evidence Deficit (Primary Bottleneck)**:\n   • **42% of students (19/45)** have unassessed or null containerization evidence.\n   • Immediate Impact: 3 upcoming Tier-1 enterprise campus drives (CloudScale, Datadog) enforce a hard cutoff of ≥ 3.5 in Docker.\n\n2. **[Skill: Redis] Missing Systems Architecture (Secondary)**:\n   • **68% of candidates (31/45)** have no recorded Redis caching assessment.\n\n3. **[Review: Pending Resume Review]**: 8 students have revised resumes awaiting faculty endorsement in the review queue.\n\nRecommended Action: Schedule a technical containerization workshop to bridge the 19 unassessed students before the drive deadline.`,
        timestamp,
        citations: [
          { label: 'Cohort: CSE 2028 A', type: 'cohort', targetId: 'cohort' },
          { label: 'Benchmark: 64%', type: 'benchmark', targetId: 'cohort-readiness' },
          { label: 'Skill: Docker', type: 'skill', targetId: 'skill-docker' },
          { label: 'Skill: Redis', type: 'skill', targetId: 'skill-redis' },
          { label: 'Review: Pending Resume Review', type: 'review', targetId: 'review-pending' },
        ],
        toolCard: {
          id: `tool-${Date.now()}`,
          type: 'schedule_workshop',
          title: 'Schedule Docker Bootcamp (Deadline: Nov 15)',
          subtitle: 'Target: 19 students in CSE 2028 A lacking containerization evidence',
          targetCohort: 'CSE 2028 A',
          timeEstimate: 'Nov 15',
          status: 'pending',
        },
      };
    }

    // 2. "Which students need follow-ups for incomplete profiles or missing assessments?"
    if (query.includes('follow-up') || query.includes('follow up') || query.includes('incomplete') || query.includes('missing') || query.includes('flag')) {
      return {
        id: msgId,
        sender: 'copilot',
        text: `Roster Follow-Up Audit for **[Cohort: CSE 2028 A]** (Masked Student Privacy Enforced):\n\n**Cluster A: [Flag: Incomplete Profile] (6 Candidates)**:\n• **AIMORA-DEMO-001**: Missing verified Capstone repo & external project audit\n• **AIMORA-DEMO-002**: Unassessed [Skill: SQL] Quiz #SQL-01\n• **AIMORA-DEMO-003**: [Skill: Docker] #DCK-101 is null\n• **AIMORA-DEMO-004**: Draft resume uploaded but no credentials linked\n• **AIMORA-DEMO-005**: Missing CGPA transcript endorsement\n• **AIMORA-DEMO-006**: Missing [Skill: SQL] & Git coursework records\n\n**Cluster B: [Review: Pending Resume Review] (8 Candidates)**:\n• 8 candidates submitted IEEE P2863 resume updates awaiting faculty signature.\n\nWould you like to dispatch batch institutional notification nudges to these 6 flagged candidates?`,
        timestamp,
        citations: [
          { label: 'Cohort: CSE 2028 A', type: 'cohort', targetId: 'cohort' },
          { label: 'Flag: Incomplete Profile', type: 'flag', targetId: 'flag-incomplete' },
          { label: 'Review: Pending Resume Review', type: 'review', targetId: 'review-pending' },
          { label: 'Skill: SQL', type: 'skill', targetId: 'skill-sql' },
          { label: 'Skill: Docker', type: 'skill', targetId: 'skill-docker' },
        ],
        toolCard: {
          id: `tool-${Date.now()}`,
          type: 'batch_nudge',
          title: 'Send Batch Cohort Nudge',
          subtitle: 'Send profile completion reminders to 6 flagged students (AIMORA-DEMO-001 to AIMORA-DEMO-006)',
          targetCohort: 'CSE 2028 A',
          targetStudentIds: [
            'AIMORA-DEMO-001',
            'AIMORA-DEMO-002',
            'AIMORA-DEMO-003',
            'AIMORA-DEMO-004',
            'AIMORA-DEMO-005',
            'AIMORA-DEMO-006',
          ],
          status: 'pending',
        },
      };
    }

    // 3. "Schedule a Docker & Containerization workshop for students lacking evidence."
    if (query.includes('docker') || query.includes('workshop') || query.includes('schedule') || query.includes('training')) {
      return {
        id: msgId,
        sender: 'copilot',
        text: `Proposal for Institutional Remediation Workshop:\n\n• **Module**: Docker & Multi-Stage Containerization Bootcamp (#DCK-101)\n• **Cohort**: [Cohort: CSE 2028 A]\n• **Target Audience**: **19 candidates** currently lacking verified containerization evidence (proficiency null)\n• **Syllabus**: Multi-stage Alpine builds, healthchecks, layer caching, and Docker Compose\n• **Placement Gate**: Unlocks CloudScale Enterprise & Stripe campus drive eligibility\n• **Proposed Deadline**: **Nov 15, 2026**\n\nClick Confirm below to add this bootcamp to the active Institutional Remediation Catalog.`,
        timestamp,
        citations: [
          { label: 'Cohort: CSE 2028 A', type: 'cohort', targetId: 'cohort' },
          { label: 'Skill: Docker', type: 'skill', targetId: 'skill-docker' },
          { label: 'Benchmark: 64%', type: 'benchmark', targetId: 'cohort-readiness' },
        ],
        toolCard: {
          id: `tool-${Date.now()}`,
          type: 'schedule_workshop',
          title: 'Schedule Docker Bootcamp (Deadline: Nov 15)',
          subtitle: 'Target: 19 students in CSE 2028 A lacking containerization evidence',
          targetCohort: 'CSE 2028 A',
          timeEstimate: 'Nov 15',
          status: 'pending',
        },
      };
    }

    // Default faculty response
    return {
      id: msgId,
      sender: 'copilot',
      text: `Institutional intelligence for **[Cohort: CSE 2028 A]** (45 candidates, average [Benchmark: 64%]):\n\n• **Primary Bottleneck**: [Skill: Docker] unassessed in **42%** of candidates (19 students).\n• **Secondary Bottleneck**: [Skill: Redis] missing in **68%** of candidates (31 students).\n• **Flagged Follow-ups**: 6 students have [Flag: Incomplete Profile] (AIMORA-DEMO-001 to AIMORA-DEMO-006).\n• **Pending Reviews**: 8 resume submissions in [Review: Pending Resume Review].\n\nHow would you like to intervene?`,
      timestamp,
      citations: [
        { label: 'Cohort: CSE 2028 A', type: 'cohort', targetId: 'cohort' },
        { label: 'Benchmark: 64%', type: 'benchmark', targetId: 'cohort-readiness' },
        { label: 'Skill: Docker', type: 'skill', targetId: 'skill-docker' },
        { label: 'Flag: Incomplete Profile', type: 'flag', targetId: 'flag-incomplete' },
        { label: 'Review: Pending Resume Review', type: 'review', targetId: 'review-pending' },
      ],
      toolCard: {
        id: `tool-${Date.now()}`,
        type: 'schedule_workshop',
        title: 'Schedule Docker Bootcamp (Deadline: Nov 15)',
        subtitle: 'Target: 19 students in CSE 2028 A lacking containerization evidence',
        targetCohort: 'CSE 2028 A',
        timeEstimate: 'Nov 15',
        status: 'pending',
      },
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query) return;

    const userMessage: CopilotMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Just now',
    };

    setActiveMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const response = isFaculty ? generateFacultyResponse(query) : generateStudentResponse(query);
      setActiveMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 450);
  };

  const handleClearThread = () => {
    if (isFaculty) {
      setFacultyMessages(getFacultyInitialMessages());
      onShowToast('Institutional Placement Copilot thread reset.', 'info');
    } else {
      setStudentMessages(getStudentInitialMessages());
      onShowToast('Career Copilot conversation thread reset.', 'info');
    }
  };

  // Citation chip click handler
  const handleCitationClick = (citation: CopilotCitation) => {
    if (isFaculty) {
      if (citation.type === 'cohort' || citation.type === 'benchmark') {
        onNavigate('admin-overview');
        onShowToast(`Focused on cohort analytics: ${activeCohort}`, 'info');
      } else if (citation.type === 'review') {
        onNavigate('admin-reviews-training');
        onShowToast('Navigated to Pending Candidate Resume Review Queue', 'info');
      } else if (citation.type === 'flag') {
        onNavigate('admin-students');
        onShowToast('Navigated to Student Roster flagged follow-up list', 'info');
      } else if (citation.type === 'skill') {
        onNavigate('admin-skill-analytics');
        onShowToast(`Focused on cohort skill distribution: ${citation.label}`, 'info');
      }
      return;
    }

    // Student citation handler
    if (
      citation.targetId === 'comp-sql' ||
      citation.targetId === 'comp-redis' ||
      citation.targetId === 'comp-docker' ||
      citation.targetId === 'comp-git' ||
      citation.targetId === 'comp-sys'
    ) {
      onNavigate('career-plan');
      onShowToast(`Highlighted competency: ${citation.label}`, 'info');
      setTimeout(() => {
        const el = document.getElementById(citation.targetId || '');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 200);
    } else if (citation.type === 'role' || citation.type === 'benchmark') {
      onNavigate('career-plan');
      onShowToast(`Grounded against target role: ${profile.targetRole}`, 'info');
    } else if (citation.type === 'milestone') {
      onNavigate('career-plan');
      onShowToast(`Focused on Roadmap milestone: ${citation.label}`, 'info');
    }
  };

  // Tool card action confirmation
  const handleToolCardConfirm = (msgId: string, card: ActionableToolCard) => {
    setActiveMessages((prev) =>
      prev.map((msg) =>
        msg.id === msgId && msg.toolCard
          ? { ...msg, toolCard: { ...msg.toolCard, status: 'confirmed' } }
          : msg
      )
    );

    // Faculty Actions
    if (card.type === 'schedule_workshop') {
      onAddFacultyWorkshop?.({
        title: card.title,
        cohort: card.targetCohort || activeCohort,
        deadline: card.timeEstimate || 'Nov 15',
        studentCount: 19,
      });
      onNavigate('admin-reviews-training');
      onShowToast(
        `Docker Bootcamp (Deadline: Nov 15) assigned to 19 students in ${activeCohort}! Added to Faculty Training catalog.`,
        'success'
      );
      return;
    }

    if (card.type === 'batch_nudge') {
      const studentIds = card.targetStudentIds || [
        'AIMORA-DEMO-001',
        'AIMORA-DEMO-002',
        'AIMORA-DEMO-003',
        'AIMORA-DEMO-004',
        'AIMORA-DEMO-005',
        'AIMORA-DEMO-006',
      ];
      onSendCohortNudges?.(studentIds, 'Incomplete Profile & Missing Assessments');
      onNavigate('admin-students');
      onShowToast(
        `Batch reminders dispatched to 6 flagged students (${studentIds[0]}–${studentIds[studentIds.length - 1]})!`,
        'success'
      );
      return;
    }

    // Student Actions
    if (card.type === 'launch_quiz' && card.targetSkillId) {
      onNavigate('career-plan');
      onLaunchQuiz(card.targetSkillId);
      onShowToast(`Launched ${card.title}! Modal opened in Career Plan.`, 'success');
    } else if (card.type === 'add_roadmap_task') {
      onAddRoadmapTask({
        title: card.title.replace("Add '", '').replace("' to Roadmap", ''),
        skillId: card.targetSkillId,
        time: card.timeEstimate || '3-5 hrs',
        objective: card.subtitle,
      });
      onNavigate('career-plan');
      onShowToast(`Milestone '${card.title}' committed to your Dynamic Roadmap!`, 'success');
    } else if (card.type === 'navigate' && card.targetPath) {
      onNavigate(card.targetPath);
      onShowToast(`Switched view to ${card.targetPath}.`, 'info');
    }
  };

  // Tool card action dismissal
  const handleToolCardDismiss = (msgId: string) => {
    setActiveMessages((prev) =>
      prev.map((msg) =>
        msg.id === msgId && msg.toolCard
          ? { ...msg, toolCard: { ...msg.toolCard, status: 'dismissed' } }
          : msg
      )
    );
    onShowToast('Action dismissed.', 'info');
  };

  // Render text with clickable citation pills inline
  const renderMessageTextWithCitations = (msg: CopilotMessage) => {
    const parts = msg.text.split(/(\[[^\]]+\])/g);
    return (
      <div className="text-xs leading-relaxed whitespace-pre-line text-[#D6D6DC]">
        {parts.map((part, index) => {
          if (part.startsWith('[') && part.endsWith(']')) {
            const rawLabel = part.slice(1, -1);
            const isCohortOrFlag = rawLabel.startsWith('Cohort') || rawLabel.startsWith('Flag') || rawLabel.startsWith('Review');
            return (
              <button
                key={index}
                onClick={() => {
                  const cit = msg.citations?.find(
                    (c) => part.includes(c.label) || c.label.includes(rawLabel)
                  );
                  if (cit) handleCitationClick(cit);
                  else onShowToast(`Reference: ${rawLabel}`, 'info');
                }}
                className={`inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-full text-[11px] font-mono cursor-pointer transition-colors align-baseline ${
                  isCohortOrFlag
                    ? 'bg-[#ffba35]/15 hover:bg-[#ffba35]/30 text-[#ffba35] border border-[#ffba35]/40'
                    : 'bg-[#8052ff]/15 hover:bg-[#8052ff]/30 text-[#cdbdff] hover:text-white border border-[#8052ff]/40'
                }`}
                title={`Click to inspect ${rawLabel}`}
              >
                <span className="material-symbols-outlined text-[11px]">
                  {isCohortOrFlag ? 'hub' : 'label'}
                </span>
                <span>{rawLabel}</span>
              </button>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </div>
    );
  };

  return (
    <>
      {/* 1. Floating Trigger Button in Bottom-Right Corner (Role-Adaptive) */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full text-white shadow-2xl flex items-center justify-center border hover:scale-105 active:scale-95 transition-all cursor-pointer group ${
          isFaculty
            ? 'bg-gradient-to-tr from-[#946200] via-[#c68908] to-[#ffba35] border-[#ffd580]/50'
            : 'bg-gradient-to-tr from-[#6839e0] to-[#8052ff] border-[#9b76ff]/50'
        }`}
        aria-label={isFaculty ? 'Open Institutional Placement Copilot' : 'Open Conversational Career Copilot'}
        title={isFaculty ? 'Institutional Placement Copilot (Faculty Console)' : 'Career Copilot'}
      >
        <span className="material-symbols-outlined text-[26px] group-hover:rotate-12 transition-transform">
          {isOpen ? 'close' : isFaculty ? 'shield' : 'auto_awesome'}
        </span>
        {!isOpen && (
          <span
            className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-black ${
              isFaculty ? 'bg-[#ffba35]' : 'bg-[#55C98B]'
            }`}
          />
        )}
      </button>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 sm:hidden animate-fade-in"
        />
      )}

      {/* 2. Sleek Obsidian Drawer (380px Desktop / Fullscreen when toggled / Full-width Mobile) */}
      <aside
        className={`fixed top-0 right-0 h-full bg-[#0D0D0F] border-l border-[#202023] z-50 flex flex-col shadow-2xl transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } ${isFullscreen ? 'w-full' : 'w-full sm:w-[380px]'}`}
      >
        {/* Header - Role-Adaptive */}
        <div className="p-4 border-b border-[#202023] bg-[#16161A] flex flex-col gap-2">
          <div className={`flex flex-col gap-2 ${isFullscreen ? 'max-w-4xl mx-auto w-full' : ''}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
                    isFaculty
                      ? 'bg-[#ffba35]/20 border-[#ffba35]/40 text-[#ffba35]'
                      : 'bg-[#8052ff]/20 border-[#8052ff]/40 text-[#cdbdff]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isFaculty ? 'shield' : 'auto_awesome'}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white tracking-wide">
                      {isFaculty ? 'Institutional Placement Copilot' : 'Career Copilot'}
                    </h3>
                    <span
                      className={`w-2 h-2 rounded-full ${isFaculty ? 'bg-[#ffba35]' : 'bg-[#55C98B]'}`}
                      title="Active & Grounded"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#9A9A9A]">
                    {isFaculty ? (
                      <span className="text-[#ffba35] font-semibold">FACULTY PLACEMENT CELL</span>
                    ) : (
                      <span>Grounded Placement Mentor</span>
                    )}
                    <span>•</span>
                    <span>{isFaculty ? facultyName : 'Student View'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleClearThread}
                  className="p-1.5 rounded hover:bg-[#202023] text-[#9A9A9A] hover:text-white transition-colors cursor-pointer"
                  title="Clear Conversation Thread"
                >
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                </button>
                <button
                  onClick={() => setIsFullscreen((prev) => !prev)}
                  className="p-1.5 rounded hover:bg-[#202023] text-[#9A9A9A] hover:text-white transition-colors cursor-pointer"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View'}
                  aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen View'}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                  </span>
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded hover:bg-[#202023] text-[#9A9A9A] hover:text-white transition-colors cursor-pointer"
                  title="Close Copilot"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>

            {/* Active Context Tag (Cohort in Faculty vs Target Role in Student) */}
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded bg-[#0D0D0F] border border-[#202023] text-[11px] font-mono">
              {isFaculty ? (
                <>
                  <span className="text-[#9A9A9A] truncate max-w-[220px]">
                    Cohort: <strong className="text-white">{activeCohort}</strong>
                  </span>
                  <span className="text-[#ffba35] font-bold">45 Candidates (64% Avg)</span>
                </>
              ) : (
                <>
                  <span className="text-[#9A9A9A] truncate max-w-[220px]">
                    Role: <strong className="text-white">{profile.targetRole}</strong>
                  </span>
                  <span className="text-[#55C98B] font-bold">{readinessPct}% Index</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Conversation Thread / Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className={isFullscreen ? 'max-w-4xl mx-auto space-y-4' : 'space-y-4'}>
            {/* Quick-Start Prompt Pills */}
            <div className="space-y-1.5 pb-2 border-b border-[#202023]/60">
            <span className="text-[10px] font-mono uppercase text-[#9A9A9A] tracking-wider">
              {isFaculty ? 'Institutional Action Prompts' : 'Quick Suggestions'}
            </span>
            <div className="flex flex-col gap-1.5">
              {starterPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className={`w-full text-left px-3 py-2 rounded-lg bg-[#16161A] hover:bg-[#1E1E24] border border-[#202023] text-xs text-[#D6D6DC] hover:text-white transition-all cursor-pointer flex items-center justify-between group ${
                    isFaculty ? 'hover:border-[#ffba35]/60' : 'hover:border-[#8052ff]/60'
                  }`}
                >
                  <span className="truncate">{prompt}</span>
                  <span
                    className={`material-symbols-outlined text-[14px] group-hover:translate-x-0.5 transition-transform shrink-0 ml-2 ${
                      isFaculty ? 'text-[#ffba35]' : 'text-[#8052ff]'
                    }`}
                  >
                    arrow_forward
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Render Messages */}
          {activeMessages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col gap-1.5 ${isUser ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[92%] p-3.5 rounded-xl border text-xs ${
                    isUser
                      ? isFaculty
                        ? 'bg-[#c68908] text-white border-[#c68908] rounded-br-none'
                        : 'bg-[#8052ff] text-white border-[#8052ff] rounded-br-none'
                      : 'bg-[#16161A] text-[#D6D6DC] border-[#202023] rounded-bl-none shadow-md'
                  }`}
                >
                  {isUser ? (
                    <div className="leading-relaxed whitespace-pre-line">{msg.text}</div>
                  ) : (
                    renderMessageTextWithCitations(msg)
                  )}

                  {/* Actionable Tool Card (Interactive Confirmation) */}
                  {msg.toolCard && (
                    <div
                      className={`mt-3 p-3 rounded-lg border border-dashed bg-[#0D0D0F]/90 space-y-2 ${
                        isFaculty ? 'border-[#ffba35]/60' : 'border-[#8052ff]/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span
                              className={`material-symbols-outlined text-[15px] ${
                                isFaculty ? 'text-[#ffba35]' : 'text-[#8052ff]'
                              }`}
                            >
                              {msg.toolCard.type === 'schedule_workshop'
                                ? 'event_available'
                                : msg.toolCard.type === 'batch_nudge'
                                ? 'send_time_extension'
                                : msg.toolCard.type === 'launch_quiz'
                                ? 'quiz'
                                : 'add_task'}
                            </span>
                            <span>{msg.toolCard.title}</span>
                          </div>
                          <p className="text-[11px] text-[#9A9A9A] mt-0.5 leading-normal">
                            {msg.toolCard.subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Tool Card Buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#202023]">
                        {msg.toolCard.status === 'pending' ? (
                          <div className="flex items-center gap-2 w-full justify-end">
                            <button
                              onClick={() => handleToolCardDismiss(msg.id)}
                              className="px-2.5 py-1 rounded bg-[#16161A] hover:bg-[#202023] text-[11px] font-mono text-[#9A9A9A] hover:text-white border border-[#202023] cursor-pointer transition-colors"
                            >
                              Dismiss
                            </button>
                            <button
                              onClick={() => handleToolCardConfirm(msg.id, msg.toolCard!)}
                              className={`px-3 py-1 rounded text-white text-[11px] font-mono font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                                isFaculty
                                  ? 'bg-[#c68908] hover:bg-[#ffba35] text-black font-bold'
                                  : 'bg-[#8052ff] hover:bg-[#8052ff]/90 text-white'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[13px]">check</span>
                              Confirm
                            </button>
                          </div>
                        ) : msg.toolCard.status === 'confirmed' ? (
                          <span className="text-[11px] font-mono text-[#55C98B] flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            {msg.toolCard.type === 'schedule_workshop'
                              ? 'Assigned ✓ Added to Faculty Training List'
                              : msg.toolCard.type === 'batch_nudge'
                              ? 'Nudges Sent ✓ Institutional Reminders Dispatched'
                              : 'Confirmed ✓ Action executed'}
                          </span>
                        ) : (
                          <span className="text-[11px] font-mono text-[#9A9A9A] italic">
                            Dismissed
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <span className="text-[10px] font-mono text-[#9A9A9A] px-1">
                  {isUser ? 'You' : isFaculty ? 'Placement Copilot' : 'Career Copilot'} · {msg.timestamp}
                </span>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[#16161A] border border-[#202023] text-xs text-[#9A9A9A] w-fit">
              <span
                className={`w-1.5 h-1.5 rounded-full animate-ping ${
                  isFaculty ? 'bg-[#ffba35]' : 'bg-[#8052ff]'
                }`}
              />
              <span className="font-mono text-[11px]">
                {isFaculty ? 'Grounded institutional analysis...' : 'Copilot grounding response...'}
              </span>
            </div>
          )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-[#202023] bg-[#16161A]">
          <div className={isFullscreen ? 'max-w-4xl mx-auto' : ''}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  isFaculty
                    ? 'Ask about CSE 2028 A, bottlenecks, workshops...'
                    : 'Ask about Redis, SQL, readiness, gaps...'
                }
                className="flex-1 bg-[#0D0D0F] border border-[#202023] focus:border-[#8052ff] rounded-lg px-3 py-2 text-xs text-white placeholder-[#8B8B93] focus:outline-none font-sans"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className={`p-2 rounded-lg disabled:opacity-40 text-white transition-colors cursor-pointer shrink-0 ${
                  isFaculty
                    ? 'bg-[#c68908] hover:bg-[#ffba35] text-black font-bold'
                    : 'bg-[#8052ff] hover:bg-[#8052ff]/90 text-white'
                }`}
                title="Send Message"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
              </button>
            </form>
            <div className="flex items-center justify-between mt-2 text-[10px] font-mono text-[#9A9A9A]">
              <span>
                {isFaculty ? 'Grounded on CSE 2028 A cohort roster' : 'Grounded strictly on student profile'}
              </span>
              <span>Enter to send</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
