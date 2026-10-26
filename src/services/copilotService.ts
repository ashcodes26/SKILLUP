import { GoogleGenAI } from '@google/genai';
import { StudentProfileData } from '../types';
import { ActionableToolCard, CopilotCitation, CopilotMessage } from '../components/CareerCopilot';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (window as any).__GEMINI_API_KEY__;
  if (!apiKey) return null;
  try {
    return new GoogleGenAI({ apiKey });
  } catch (e) {
    console.warn('Failed to initialize GoogleGenAI for Copilot:', e);
    return null;
  }
}

/**
 * Extracts [Type: Label] citations from text if not provided in JSON
 */
function extractCitationsFromText(text: string): CopilotCitation[] {
  const regex = /\[(Skill|Role|Benchmark|Milestone|Cohort|Review|Flag):\s*([^\]]+)\]/gi;
  const citations: CopilotCitation[] = [];
  const seen = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const rawType = match[1].toLowerCase();
    const label = `${match[1]}: ${match[2].trim()}`;
    if (!seen.has(label)) {
      seen.add(label);
      let type: CopilotCitation['type'] = 'skill';
      if (rawType.includes('role')) type = 'role';
      else if (rawType.includes('benchmark')) type = 'benchmark';
      else if (rawType.includes('milestone')) type = 'milestone';
      else if (rawType.includes('cohort')) type = 'cohort';
      else if (rawType.includes('review')) type = 'review';
      else if (rawType.includes('flag')) type = 'flag';

      citations.push({
        label,
        type,
        targetId: match[2].trim().toLowerCase().replace(/[^a-z0-9]/g, '-'),
      });
    }
  }
  return citations;
}

/**
 * Queries Gemini 3.5 Flash for the Student Career Copilot persona.
 */
export async function queryStudentCopilotWithGemini(params: {
  userInput: string;
  profile: StudentProfileData;
  readinessPct: number;
  recentHistory?: { role: 'user' | 'model'; content: string }[];
}): Promise<CopilotMessage | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  const { profile, readinessPct, userInput } = params;

  // Compile verified competencies and gaps
  const verifiedSkills = profile.competencies
    .filter((c) => c.proficiency !== null)
    .map((c) => `${c.name} (${c.proficiency?.toFixed(1)}/5.0, source: ${c.evidenceLabel || 'assessment'})`)
    .join(', ');

  const unassessedSkills = profile.competencies
    .filter((c) => c.proficiency === null)
    .map((c) => `${c.name} (target: ${c.targetLevel.toFixed(1)}/5.0, priority gap)`)
    .join(', ');

  const systemPrompt = `You are the SRMIST Directorate of Career Centre (CDC) Career Copilot.
You are counseling an SRM candidate for corporate placement drives (Super Dream: Amazon ₹42 LPA, Cisco ₹24.5 LPA; Dream: Barclays ₹14 LPA).

CANDIDATE GROUNDING:
- Candidate Name: ${profile.name}
- Register Number: ${profile.registerNumber || profile.id || 'N/A'}
- Program: ${profile.program || 'B.Tech CSE'} (${profile.specialization || 'School of Computing'})
- CGPA: ${profile.cgpa} / 10.0 (Standing Arrears: ${profile.standingArrears ?? 0})
- Target Role: ${profile.targetRole}
- Institutional Placement Readiness Index: ${readinessPct}%
- Verified Competencies: ${verifiedSkills || 'Python (4.2/5.0), Git (4.0/5.0)'}
- Priority Gaps: ${unassessedSkills || 'Docker (unassessed), Redis (missing), Kafka (missing)'}

INSTRUCTIONS:
1. Provide sharp, realistic, conversational placement coaching strictly grounded in the candidate's actual numbers.
2. When mentioning specific skills, roles, benchmarks, or milestones, tag them with bracketed citations so the UI creates clickable chips:
   - [Skill: SkillName] (e.g. [Skill: Redis], [Skill: Docker])
   - [Role: RoleName] (e.g. [Role: Junior Backend Engineer])
   - [Benchmark: XX%] (e.g. [Benchmark: ${readinessPct}%])
   - [Milestone: MilestoneCode] (e.g. [Milestone: MS-03])
3. If the candidate's question is actionable (e.g. asking how to bridge a gap, learn a tool, or verify a skill), generate ONE relevant interactive toolCard.
   Valid toolCard types:
   - "add_roadmap_task": for adding learning/practice tasks to their active roadmap
   - "launch_quiz": for taking an instant skill verification assessment
   - "audit_resume": for scanning resume bullets against target job description

Return a valid JSON object matching this schema:
{
  "text": "Detailed, encouraging, grounded response in markdown format with [Tag: Value] citations",
  "citations": [
    { "label": "Skill: Redis", "type": "skill", "targetId": "comp-redis" }
  ],
  "toolCard": {
    "type": "add_roadmap_task" | "launch_quiz" | "audit_resume",
    "title": "Short action title",
    "subtitle": "Clear benefit and estimated effort (e.g., 3-5 hrs)",
    "targetSkillId": "comp-redis",
    "timeEstimate": "3-5 hrs"
  }
}

Return ONLY raw JSON. No markdown code blocks.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: `${systemPrompt}\n\nStudent Asks: "${userInput}"`,
    });

    let raw = response.text?.trim() || '';
    if (raw.startsWith('```json')) {
      raw = raw.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (raw.startsWith('```')) {
      raw = raw.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    try {
      const parsed = JSON.parse(raw);
      const text = parsed.text || raw;
      const citations = (parsed.citations && parsed.citations.length > 0)
        ? parsed.citations
        : extractCitationsFromText(text);

      const toolCard: ActionableToolCard | undefined = parsed.toolCard
        ? {
            id: `tool-${Date.now()}`,
            type: parsed.toolCard.type || 'add_roadmap_task',
            title: parsed.toolCard.title || 'Recommended Action',
            subtitle: parsed.toolCard.subtitle || 'Generated by Gemini 3.5 Flash',
            targetSkillId: parsed.toolCard.targetSkillId,
            timeEstimate: parsed.toolCard.timeEstimate || '2-4 hrs',
            status: 'pending',
          }
        : undefined;

      return {
        id: `copilot-gemini-${Date.now()}`,
        sender: 'copilot',
        text,
        timestamp: 'Just now',
        citations,
        toolCard,
      };
    } catch (parseErr) {
      if (raw.length > 20) {
        return {
          id: `copilot-gemini-${Date.now()}`,
          sender: 'copilot',
          text: raw,
          timestamp: 'Just now',
          citations: extractCitationsFromText(raw),
        };
      }
    }
    return null;
  } catch (error) {
    console.warn('Live Gemini Student Copilot query failed, falling back:', error);
    return null;
  }
}

/**
 * Queries Gemini 3.5 Flash for the Faculty Placement Intelligence Copilot persona.
 */
export async function queryFacultyCopilotWithGemini(params: {
  userInput: string;
  facultyName?: string;
  department?: string;
  activeCohort?: string;
}): Promise<CopilotMessage | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  const { facultyName, department, activeCohort, userInput } = params;

  const systemPrompt = `You are the SRMIST Directorate of Career Centre (CDC) Institutional Placement Intelligence Copilot.
You are assisting ${facultyName || 'Dr. S. Soundararajan'}, Faculty Placement Lead for ${department || 'School of Computing, SRMIST'}.

COHORT GROUNDING:
- Active Cohort: ${activeCohort || 'B.Tech CSE — Batch 2026 (Section A)'}
- Cohort Size: 45 enrolled candidates
- Average Institutional Readiness: 64% (Benchmark target: 80%+)
- Key Bottlenecks:
  * [Skill: Docker] is unassessed in 42% of candidates (19 students)
  * [Skill: Redis] is missing in 68% of candidates (31 students)
  * 6 candidates have [Flag: Incomplete Profile]
  * 8 candidates have [Review: Pending Resume Review]
- Active Placement Drives:
  * Amazon SDE-1 Super Dream (₹42 LPA, Cutoff: 85% readiness, mandatory Docker & Distributed Systems)
  * Cisco Systems Super Dream (₹24.5 LPA, Cutoff: 80% readiness)
  * Barclays Dream (₹14 LPA, Cutoff: 75% readiness)

INSTRUCTIONS:
1. Provide executive-level institutional analytics, cohort trends, and tactical placement interventions.
2. Tag institutional entities using square bracket citations for the UI:
   - [Cohort: CohortName] (e.g. [Cohort: CSE 2026 A])
   - [Skill: SkillName] (e.g. [Skill: Docker], [Skill: Redis])
   - [Benchmark: XX%] (e.g. [Benchmark: 64%])
   - [Flag: FlagName] (e.g. [Flag: Incomplete Profile])
   - [Review: ReviewStatus] (e.g. [Review: Pending Resume Review])
3. When faculty asks about scheduling workshops, nudging candidates, or viewing rosters, generate an actionable toolCard.
   Valid toolCard types:
   - "schedule_workshop": for creating hands-on remediation labs (e.g., Docker containerization bootcamps)
   - "batch_nudge": for sending automated notifications to students with missing assessments
   - "navigate": for jumping to student rosters or report manifests

Return a valid JSON object matching this schema:
{
  "text": "Executive placement intelligence in structured markdown with bullet points and [Tag: Value] citations",
  "citations": [
    { "label": "Cohort: CSE 2026 A", "type": "cohort", "targetId": "cohort-cse-2026" }
  ],
  "toolCard": {
    "type": "schedule_workshop" | "batch_nudge" | "navigate",
    "title": "Action Title",
    "subtitle": "Target audience and action summary (e.g., 19 candidates lacking Docker evidence)",
    "targetCohort": "CSE 2026 A",
    "timeEstimate": "3 hrs"
  }
}

Return ONLY raw JSON. No markdown code blocks.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: `${systemPrompt}\n\nFaculty Question: "${userInput}"`,
    });

    let raw = response.text?.trim() || '';
    if (raw.startsWith('```json')) {
      raw = raw.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (raw.startsWith('```')) {
      raw = raw.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    try {
      const parsed = JSON.parse(raw);
      const text = parsed.text || raw;
      const citations = (parsed.citations && parsed.citations.length > 0)
        ? parsed.citations
        : extractCitationsFromText(text);

      const toolCard: ActionableToolCard | undefined = parsed.toolCard
        ? {
            id: `tool-${Date.now()}`,
            type: parsed.toolCard.type || 'schedule_workshop',
            title: parsed.toolCard.title || 'Institutional Action',
            subtitle: parsed.toolCard.subtitle || 'Generated by Gemini 3.5 Flash',
            targetCohort: parsed.toolCard.targetCohort || activeCohort || 'CSE 2026 A',
            timeEstimate: parsed.toolCard.timeEstimate || '2 hrs',
            status: 'pending',
          }
        : undefined;

      return {
        id: `copilot-gemini-${Date.now()}`,
        sender: 'copilot',
        text,
        timestamp: 'Just now',
        citations,
        toolCard,
      };
    } catch (parseErr) {
      if (raw.length > 20) {
        return {
          id: `copilot-gemini-${Date.now()}`,
          sender: 'copilot',
          text: raw,
          timestamp: 'Just now',
          citations: extractCitationsFromText(raw),
        };
      }
    }
    return null;
  } catch (error) {
    console.warn('Live Gemini Faculty Copilot query failed, falling back:', error);
    return null;
  }
}
