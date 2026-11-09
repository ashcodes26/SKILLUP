import { GoogleGenAI } from '@google/genai';

export interface TurnExchange {
  question: string;
  answer: string;
  feedback?: string;
  idealModelAnswer?: string;
  stageTitle?: string;
}

export interface RealtimeFollowupResult {
  naturalFeedback: string;
  nextQuestion: string;
  combinedSpokenText: string;
  idealModelAnswer?: string;
  stageTitle?: string;
}

export interface QuestionEvaluationItem {
  roundNumber: number;
  stageTitle: string;
  question: string;
  studentAnswer: string;
  isInsufficient: boolean;
  strengthsAndGaps: string;
  idealModelAnswer: string;
  score: number; // 0 to 100
}

export interface CDCEvaluationReport {
  verdict: 'Placement Ready' | 'Nearly Ready' | 'Developing' | 'Needs Improvement';
  overallScore: number;
  srmGrade: 'S' | 'A+' | 'A' | 'B';
  placementTier: 'Super Dream Ready' | 'Dream Ready' | 'Day Sharing Ready' | 'Remediation Required';
  recommendationTitle: string;
  scores: {
    technicalDepth: number;
    systemArchitecture: number;
    communication: number;
    problemSolving: number;
  };
  summary: string;
  quotedStrengths: string[];
  missedConcepts: string[];
  actionableRemediation: string[];
  questionBreakdown: QuestionEvaluationItem[];
}

export interface InterviewStage {
  stageNumber: number;
  title: string;
  focus: string;
  guidance: string;
}

export const TECHNICAL_STAGES: InterviewStage[] = [
  {
    stageNumber: 1,
    title: 'Core Foundations & Data Structures',
    focus: 'Time/space complexity, memory structures, hashing, and language runtime internals',
    guidance: 'Evaluate foundational mechanics and correctness. Probe on algorithmic complexity and implementation trade-offs.',
  },
  {
    stageNumber: 2,
    title: 'Deep-Dive Architecture & Data Modeling',
    focus: 'Database schema, indexing strategies, API contracts, caching layers, and pipeline design',
    guidance: 'Evaluate architectural soundness. Ask how data flows, which tables/collections are created, and how indexes accelerate queries.',
  },
  {
    stageNumber: 3,
    title: 'Production Failure Modes & Concurrency',
    focus: 'Race conditions, split-brain, deadlocks, partition tolerance, and cache stampedes',
    guidance: 'Test resilience and depth under pressure. Introduce a sudden failure mode (network partition, latency spike, database lock) and observe their troubleshooting.',
  },
  {
    stageNumber: 4,
    title: 'Engineering Trade-offs & Judgment',
    focus: 'CAP theorem balances, latency vs consistency, cost vs performance, and operational telemetry',
    guidance: 'Bar raiser decision-making. Force a hard trade-off between consistency and availability, or ask for concrete telemetry metrics they would monitor.',
  },
];

export const HR_STAGES: InterviewStage[] = [
  {
    stageNumber: 1,
    title: 'Background, Motivation & Project Ownership',
    focus: 'Self-introduction, flagship project ownership, and role alignment',
    guidance: 'Assess technical self-awareness, authentic passion, and clarity of communication.',
  },
  {
    stageNumber: 2,
    title: 'Technical Conflict & Disagreement (STAR)',
    focus: 'Handling differing technical opinions, architectural disagreements, and team alignment',
    guidance: 'Look for structured STAR communication (Situation, Task, Action, Result) and collaborative resolution.',
  },
  {
    stageNumber: 3,
    title: 'Failure, Blameless Post-Mortems & Learning',
    focus: 'A mistake made in production or coursework, ownership taken, and lessons instituted',
    guidance: 'Gauge intellectual humility, ownership bias, and resilience under pressure.',
  },
  {
    stageNumber: 4,
    title: 'Leadership Principles & Career Vision',
    focus: 'Bias for action, customer obsession, and SRM CDC placement aspirations',
    guidance: 'Evaluate organizational maturity, ethical compass, and company culture fit.',
  },
];

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (window as any).__GEMINI_API_KEY__;
  if (!apiKey) return null;
  try {
    return new GoogleGenAI({ apiKey });
  } catch (e) {
    console.warn('Failed to initialize GoogleGenAI client:', e);
    return null;
  }
}

/**
 * Checks if candidate's response is an admission of lack of knowledge or trivial refusal.
 */
export function isInsufficientResponse(text: string): boolean {
  if (!text) return true;
  const cleaned = text.trim().toLowerCase().replace(/['".,?!]/g, '');
  const insufficientPatterns = [
    'i dont know',
    'dont know',
    'do not know',
    'no idea',
    'idk',
    'skip',
    'pass',
    'not sure',
    'no clue',
    'cannot answer',
    'cant answer',
    'havent learned',
    'no answer',
    'unaware',
  ];

  if (cleaned.length < 8) return true;
  for (const pattern of insufficientPatterns) {
    if (cleaned === pattern || cleaned.includes(pattern)) {
      return true;
    }
  }
  return false;
}

/**
 * Generates natural technical feedback, next stage-adaptive question, and the ideal model answer for the current question.
 */
export async function generateRealtimeFollowup(params: {
  companyName: string;
  targetRole: string;
  questionAsked: string;
  studentAnswer: string;
  turnNumber: number;
  roundMode?: 'technical' | 'hr';
}): Promise<RealtimeFollowupResult> {
  const ai = getGeminiClient();
  const answer = params.studentAnswer.trim();
  const isHR = params.roundMode === 'hr';
  const stages = isHR ? HR_STAGES : TECHNICAL_STAGES;
  const currentStageIndex = Math.min(stages.length - 1, Math.max(0, params.turnNumber));
  const currentStage = stages[currentStageIndex];
  const isInsufficient = isInsufficientResponse(answer);

  if (!ai || (!answer && !isInsufficient)) {
    return fallbackFollowup(params.questionAsked, currentStageIndex, answer, isHR);
  }

  const prompt = `You are a Principal Engineering Bar Raiser at ${params.companyName} conducting a mock placement interview for an SRMIST candidate targeting: ${params.targetRole}.

Current Interview Stage: Stage ${currentStage.stageNumber} — ${currentStage.title}
Focus Area: ${currentStage.focus}
Stage Guidance: ${currentStage.guidance}

Previous Question Asked to Candidate:
"${params.questionAsked}"

Candidate's Answer:
"${answer || "I don't know"}"

${isInsufficient ? `NOTE: The candidate stated they do not know or could not answer the previous question.
Acknowledge their admission candidly (e.g. that the scenario is demanding in production), then pivot to a fresh, foundational question appropriate for Stage ${currentStage.stageNumber} (${currentStage.title}). DO NOT repeat the previous question!` : ''}

TASK:
1. Provide an authentic, natural reaction and feedback to what the candidate just said.
2. Ask a sharp, new question for Stage ${currentStage.stageNumber}: ${currentStage.title}.
3. Provide the "Ideal Model Answer" for the previous question that was asked.

CRITICAL INSTRUCTIONS:
- NEVER use generic robotic fillers like "Makes sense", "Understood", "Got it", "I see", or "That sounds good".
- DO NOT repeat phrases between naturalFeedback and nextQuestion.
- FEEDBACK (1 sentence): Reaction acknowledging their response or knowledge limit.
- NEXT QUESTION (1-2 sentences): A fresh, distinct question for Stage ${currentStage.stageNumber} (${currentStage.title}).
- IDEAL MODEL ANSWER (2-3 sentences): Concise benchmark answer for the previous question.

Return a valid JSON object matching this schema:
{
  "naturalFeedback": "1 sentence of direct technical reaction (NEVER say 'makes sense')",
  "nextQuestion": "1-2 sentences new question for Stage ${currentStage.stageNumber}",
  "combinedSpokenText": "The complete spoken text combining feedback and next question",
  "idealModelAnswer": "2-3 sentences exemplary benchmark answer for the previous question"
}

Return ONLY raw JSON without markdown code fences.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
    });

    let raw = response.text?.trim() || '';
    if (raw.startsWith('```json')) {
      raw = raw.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (raw.startsWith('```')) {
      raw = raw.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    try {
      const parsed = JSON.parse(raw);
      if (parsed.nextQuestion) {
        const naturalFeedback = (parsed.naturalFeedback || '').trim();
        const nextQuestion = (parsed.nextQuestion || '').trim();
        const combinedSpokenText =
          parsed.combinedSpokenText?.trim() ||
          (naturalFeedback ? `${naturalFeedback} ${nextQuestion}` : nextQuestion);

        return {
          naturalFeedback,
          nextQuestion,
          combinedSpokenText,
          idealModelAnswer: parsed.idealModelAnswer?.trim() || 'Comprehensive answer articulating complexity, failure isolation, and concrete engineering trade-offs.',
          stageTitle: currentStage.title,
        };
      }
    } catch (parseErr) {
      if (raw.length > 25) {
        return {
          naturalFeedback: 'Noted your technical rationale regarding the system constraints.',
          nextQuestion: raw,
          combinedSpokenText: `Noted your technical rationale regarding the system constraints. ${raw}`,
          idealModelAnswer: 'Strong answer demonstrating end-to-end data flow, complexity bounds, and resilience patterns.',
          stageTitle: currentStage.title,
        };
      }
    }

    return fallbackFollowup(params.questionAsked, params.turnNumber, answer, isHR);
  } catch (error) {
    console.warn('Live Gemini follow-up failed, using deterministic fallback:', error);
    return fallbackFollowup(params.questionAsked, params.turnNumber, answer, isHR);
  }
}

/**
 * Transcribes recorded student audio using Gemini Flash multimodal capabilities when browser Web Speech API encounters network limitations.
 */
export async function transcribeAudioWithGemini(audioBlob: Blob): Promise<string> {
  const ai = getGeminiClient();
  if (!ai || !audioBlob || audioBlob.size === 0) return '';
  try {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64Audio = btoa(binary);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            mimeType: audioBlob.type || 'audio/webm',
            data: base64Audio,
          },
        },
        'Listen to this student answer for a technical job interview. Transcribe the spoken English accurately. Return ONLY the transcribed text verbatim, nothing else.',
      ],
    });
    return response.text?.trim() || '';
  } catch (err) {
    console.warn('Gemini audio transcription fallback failed:', err);
    return '';
  }
}

/**
 * Analyzes the student's actual transcribed answers across the entire session to generate the final CDC Evaluation Scorecard.
 */
export async function generateFinalAnalysis(params: {
  companyName: string;
  targetRole: string;
  candidateName?: string;
  candidateId?: string;
  roundMode?: 'technical' | 'hr';
  exchanges: TurnExchange[];
}): Promise<CDCEvaluationReport> {
  const ai = getGeminiClient();
  const cName = params.candidateName || 'Candidate';
  const cId = params.candidateId || 'RA2511003010482';
  const isHR = params.roundMode === 'hr';

  // Check if all or majority of answers are "I don't know" or empty
  const answers = params.exchanges.map((e) => (e.answer || '').trim());
  const validAnswers = answers.filter((a) => !isInsufficientResponse(a));

  if (validAnswers.length === 0) {
    return generateFailureScorecard(cName, cId, params.companyName, params.exchanges, answers.join(' '));
  }

  const transcriptText = params.exchanges
    .map(
      (e, idx) =>
        `Round ${idx + 1} (${e.stageTitle || `Stage ${idx + 1}`}):\nQuestion: ${e.question}\nCandidate Answer: ${e.answer || '(No answer provided)'}\nIdeal Reference: ${e.idealModelAnswer || 'Standard production benchmark'}\n`
    )
    .join('\n');

  const prompt = `You are the Directorate of Career Centre (CDC) Placement Evaluation Committee at SRMIST.
Evaluate candidate ${cName} (${cId}) for the ${params.targetRole} role at ${params.companyName}.

Candidate Transcript:
${transcriptText}

CRITICAL GRADING CRITERIA:
- If the candidate gave superficial, evasive, or 'I don't know' answers, YOU MUST GRADE REALISTICALLY HARSH (Overall score between 20 and 45, Grade: "B", placementTier: "Remediation Required", verdict: "Needs Improvement").
- Only give "Placement Ready" (85+) and Grade "S" (Super Dream Ready) if the candidate explicitly articulated technical architecture, trade-offs, algorithms, or concrete code details.
- "Nearly Ready" (Score: 70-84, Grade "A+", placementTier: "Dream Ready") is for good foundations but missed subtle edge cases.
- "Developing" (Score: 50-69, Grade "A", placementTier: "Day Sharing Ready") is for basic awareness lacking depth.
- NEVER invent strengths the candidate did not demonstrate! Quote verbatim words they actually said.
- Provide a question-by-question breakdown evaluating every round in the transcript.

Return a valid JSON object matching this schema:
{
  "verdict": "Placement Ready" | "Nearly Ready" | "Developing" | "Needs Improvement",
  "overallScore": number (integer between 15 and 96),
  "srmGrade": "S" | "A+" | "A" | "B",
  "placementTier": "Super Dream Ready" | "Dream Ready" | "Day Sharing Ready" | "Remediation Required",
  "recommendationTitle": string (e.g. "RECOMMENDED FOR SUPER DREAM DRIVE" or "NOT RECOMMENDED — REMEDIATION REQUIRED"),
  "scores": {
    "technicalDepth": number (integer between 10 and 98),
    "systemArchitecture": number (integer between 10 and 98),
    "communication": number (integer between 10 and 98),
    "problemSolving": number (integer between 10 and 98)
  },
  "summary": string (2-3 sentences accurately describing what ${cName} articulated and why this score was assigned),
  "quotedStrengths": string[] (2-3 verbatim phrases or positive elements from their answers),
  "missedConcepts": string[] (2-3 specific technical concepts or edge cases they failed to address),
  "actionableRemediation": string[] (2 concrete technical projects or study areas needed),
  "questionBreakdown": [
    {
      "roundNumber": number,
      "stageTitle": string,
      "question": string,
      "studentAnswer": string,
      "isInsufficient": boolean,
      "strengthsAndGaps": string,
      "idealModelAnswer": string,
      "score": number
    }
  ]
}

Return ONLY raw JSON without markdown code fences.`;

  try {
    if (!ai) {
      return fallbackHeuristicAnalysis(cName, cId, params.companyName, params.exchanges, isHR);
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
    });

    let raw = response.text?.trim() || '';
    if (raw.startsWith('```json')) {
      raw = raw.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (raw.startsWith('```')) {
      raw = raw.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const parsed: CDCEvaluationReport = JSON.parse(raw);
    if (!parsed.questionBreakdown || parsed.questionBreakdown.length === 0) {
      parsed.questionBreakdown = buildDefaultQuestionBreakdown(params.exchanges, parsed.overallScore);
    }
    return parsed;
  } catch (error) {
    console.warn('Live Gemini final evaluation failed, using deterministic fallback:', error);
    return fallbackHeuristicAnalysis(cName, cId, params.companyName, params.exchanges, isHR);
  }
}

function generateFailureScorecard(
  candidateName: string,
  candidateId: string,
  companyName: string,
  exchanges: TurnExchange[],
  userSaid: string
): CDCEvaluationReport {
  const breakdown: QuestionEvaluationItem[] = exchanges.map((e, idx) => ({
    roundNumber: idx + 1,
    stageTitle: e.stageTitle || `Round ${idx + 1}`,
    question: e.question,
    studentAnswer: e.answer || "I don't know",
    isInsufficient: true,
    strengthsAndGaps: 'Candidate explicitly admitted lack of knowledge or skipped response. Zero technical depth articulated.',
    idealModelAnswer:
      e.idealModelAnswer ||
      'An exemplary answer defines the underlying algorithmic time/space bounds, describes concrete database indexing or concurrency handling, and evaluates trade-offs under peak production traffic.',
    score: 20,
  }));

  return {
    verdict: 'Needs Improvement',
    overallScore: 24,
    srmGrade: 'B',
    placementTier: 'Remediation Required',
    recommendationTitle: `NOT RECOMMENDED FOR ${companyName.toUpperCase()} DRIVE — REMEDIATION REQUIRED (Grade: B)`,
    scores: {
      technicalDepth: 18,
      systemArchitecture: 15,
      communication: 38,
      problemSolving: 22,
    },
    summary: `Candidate ${candidateName} (${candidateId}) responded with "${userSaid || "I don't know"}" and did not articulate technical knowledge, architectural concepts, or problem-solving approaches for ${companyName}'s requirements.`,
    quotedStrengths: [
      'Acknowledged knowledge gap honestly instead of fabricating non-working syntax',
      'Completed session engagement without premature disconnect',
    ],
    missedConcepts: [
      'Failed to explain core technical architecture, database indexing, or queuing mechanics',
      'Did not articulate trade-offs, algorithms, or implementation strategies',
      'No evidence of hands-on production code experience demonstrated in spoken answers',
    ],
    actionableRemediation: [
      'Complete Redis-Backed Sliding-Window Rate Limiter Proof-of-Work in Career Plan to establish baseline verified depth',
      'Review CS-305 Database Systems coursework and attend CDC communication viva sessions before re-attempting',
    ],
    questionBreakdown: breakdown,
  };
}

function buildDefaultQuestionBreakdown(exchanges: TurnExchange[], overallScore: number): QuestionEvaluationItem[] {
  return exchanges.map((e, idx) => {
    const insufficient = isInsufficientResponse(e.answer);
    return {
      roundNumber: idx + 1,
      stageTitle: e.stageTitle || `Stage ${idx + 1}`,
      question: e.question,
      studentAnswer: e.answer || '(No answer recorded)',
      isInsufficient: insufficient,
      strengthsAndGaps: insufficient
        ? 'Admitted knowledge gap; missed foundational concepts.'
        : 'Demonstrated relevant technical vocabulary and structured communication.',
      idealModelAnswer:
        e.idealModelAnswer ||
        'Articulates algorithmic complexity, outlines failure recovery mechanisms, and quantifies trade-offs.',
      score: insufficient ? 25 : Math.max(50, Math.min(95, overallScore + (idx % 2 === 0 ? 4 : -4))),
    };
  });
}

function fallbackHeuristicAnalysis(
  candidateName: string,
  candidateId: string,
  companyName: string,
  exchanges: TurnExchange[],
  isHR = false
): CDCEvaluationReport {
  const combined = exchanges.map((e) => (e.answer || '').trim()).join(' ');

  if (isInsufficientResponse(combined)) {
    return generateFailureScorecard(candidateName, candidateId, companyName, exchanges, combined);
  }

  const length = combined.length;
  if (length < 80) {
    return {
      verdict: 'Developing',
      overallScore: 54,
      srmGrade: 'A',
      placementTier: 'Day Sharing Ready',
      recommendationTitle: `DEVELOPING CANDIDATE — REQUIRES REMEDIATION BEFORE ${companyName.toUpperCase()} SUPER DREAM DRIVE (Grade: A)`,
      scores: {
        technicalDepth: 52,
        systemArchitecture: 48,
        communication: 62,
        problemSolving: 55,
      },
      summary: `Candidate ${candidateName} provided brief, high-level answers with limited depth. Demonstrates basic vocabulary but lacked detailed explanations of trade-offs and edge cases for ${companyName}.`,
      quotedStrengths: [
        'Attempted answer with appropriate high-level vocabulary',
        'Maintained structured turn-taking',
      ],
      missedConcepts: [
        'Did not explain edge-case failure modes under high concurrency load',
        'Lacked concrete metrics (latency, memory footprint, throughput) in response',
      ],
      actionableRemediation: [
        'Practice STAR-format structuring to expand answers with Situation, Task, Action, and Measurable Result',
        'Complete Docker Containerization (#DCK-101) lab to deepen practical systems depth',
      ],
      questionBreakdown: buildDefaultQuestionBreakdown(exchanges, 54),
    };
  }

  return {
    verdict: 'Placement Ready',
    overallScore: 88,
    srmGrade: 'S',
    placementTier: 'Super Dream Ready',
    recommendationTitle: `RECOMMENDED FOR ${companyName.toUpperCase()} SUPER DREAM ON-CAMPUS DRIVE (Grade: S)`,
    scores: {
      technicalDepth: 90,
      systemArchitecture: 86,
      communication: 92,
      problemSolving: 85,
    },
    summary: `Candidate ${candidateName} (${candidateId}) demonstrated strong technical depth and clear articulation for ${companyName}. Successfully explained architectural trade-offs with production engineering vocabulary.`,
    quotedStrengths: [
      'Articulated concrete systems trade-offs with structured technical rationale',
      'Maintained confident hands-free verbal pacing matching corporate panel standards',
    ],
    missedConcepts: [
      'Could provide deeper quantitative p99 latency benchmarks under extreme peak loads',
    ],
    actionableRemediation: [
      'Refine resume bullet metrics with verified Proof-of-Work latency numbers in Career Assets',
    ],
    questionBreakdown: buildDefaultQuestionBreakdown(exchanges, 88),
  };
}

const TECHNICAL_STAGE_FALLBACKS: RealtimeFollowupResult[] = [
  {
    naturalFeedback: 'Acknowledging knowledge limits is respected in technical reviews.',
    nextQuestion: 'Let us start with foundational data structures: can you explain the lookup complexity of a Hash Table versus a Binary Search Tree, and under what conditions a Hash Table could degrade to O(N)?',
    combinedSpokenText: 'Acknowledging knowledge limits is respected in technical reviews. Let us start with foundational data structures: can you explain the lookup complexity of a Hash Table versus a Binary Search Tree, and under what conditions a Hash Table could degrade to O(N)?',
    idealModelAnswer: 'A Hash Table offers average O(1) lookups via hashing but degrades to O(N) under high collision frequency without chaining or open addressing rehashes. A balanced BST (like Red-Black tree) guarantees O(log N) worst-case.',
    stageTitle: 'Core Foundations & Data Structures',
  },
  {
    naturalFeedback: 'Database schema design and indexing tradeoffs are critical in production.',
    nextQuestion: 'How would you design a basic relational database schema for an order service, and what composite index would you create to optimize customer order lookups by date?',
    combinedSpokenText: 'Database schema design and indexing tradeoffs are critical in production. How would you design a basic relational database schema for an order service, and what composite index would you create to optimize customer order lookups by date?',
    idealModelAnswer: 'Create an orders table with id (primary key), customer_id (foreign key), and created_at. Add a composite B-tree index on (customer_id, created_at DESC) so lookups filter by customer and return chronological records without an extra sorting pass.',
    stageTitle: 'Deep-Dive Architecture & Data Modeling',
  },
  {
    naturalFeedback: 'Distributed edge cases and network partitions require resilient fallback mechanisms.',
    nextQuestion: 'If a payment service API begins intermittently timing out under peak load, how would you implement a circuit breaker and retry mechanism to protect upstream callers?',
    combinedSpokenText: 'Distributed edge cases and network partitions require resilient fallback mechanisms. If a payment service API begins intermittently timing out under peak load, how would you implement a circuit breaker and retry mechanism to protect upstream callers?',
    idealModelAnswer: 'Implement a circuit breaker with closed, open, and half-open states. If error rate exceeds a threshold (e.g. 50%), open the circuit immediately to fail-fast. Apply exponential backoff with jitter on retries and queue deferred orders in Kafka.',
    stageTitle: 'Production Failure Modes & Concurrency',
  },
  {
    naturalFeedback: 'Every engineering architecture involves balancing trade-offs.',
    nextQuestion: 'When designing a distributed caching layer with Redis, how do you balance the trade-off between cache consistency and read latency when database records are updated?',
    combinedSpokenText: 'Every engineering architecture involves balancing trade-offs. When designing a distributed caching layer with Redis, how do you balance the trade-off between cache consistency and read latency when database records are updated?',
    idealModelAnswer: 'Use Cache-Aside with Write-Through or transactional CDC invalidation. Accept temporary eventual consistency or use read-your-own-writes tokens to guarantee immediate read visibility for the updating user while maintaining sub-millisecond cache reads for others.',
    stageTitle: 'Engineering Trade-offs & Judgment',
  },
];

const HR_STAGE_FALLBACKS: RealtimeFollowupResult[] = [
  {
    naturalFeedback: 'Clear project ownership and self-awareness are key.',
    nextQuestion: 'Tell me about the engineering project you are proudest of. What was your specific architectural contribution, and what was the outcome?',
    combinedSpokenText: 'Clear project ownership and self-awareness are key. Tell me about the engineering project you are proudest of. What was your specific architectural contribution, and what was the outcome?',
    idealModelAnswer: 'An exemplary STAR answer clearly highlights a specific Situation, personal Task responsibility, measurable Action taken, and quantitative Result achieved.',
    stageTitle: 'Background, Motivation & Project Ownership',
  },
  {
    naturalFeedback: 'Navigating technical disagreements requires objective data.',
    nextQuestion: 'Describe a situation where you had a differing technical opinion from a peer or lead. How did you test both hypotheses and align on the decision?',
    combinedSpokenText: 'Navigating technical disagreements requires objective data. Describe a situation where you had a differing technical opinion from a peer or lead. How did you test both hypotheses and align on the decision?',
    idealModelAnswer: 'Focuses on blameless empirical benchmarking (e.g. load testing both solutions), actively listening to trade-offs, and committing to the team outcome.',
    stageTitle: 'Technical Conflict & Disagreement (STAR)',
  },
  {
    naturalFeedback: 'Learning from mistakes is essential for engineering maturity.',
    nextQuestion: 'Tell me about a technical mistake or outage you experienced in your coursework or projects. How did you contain it and ensure it never happens again?',
    combinedSpokenText: 'Learning from mistakes is essential for engineering maturity. Tell me about a technical mistake or outage you experienced in your coursework or projects. How did you contain it and ensure it never happens again?',
    idealModelAnswer: 'Articulates blameless post-mortem analysis, immediate mitigation, automated regression test coverage, and updating operational safeguards.',
    stageTitle: 'Failure, Blameless Post-Mortems & Learning',
  },
  {
    naturalFeedback: 'Understanding long-term engineering impact sets candidates apart.',
    nextQuestion: 'Why are you specifically interested in our engineering culture, and where do you see your technical depth growing over the next 2 years?',
    combinedSpokenText: 'Understanding long-term engineering impact sets candidates apart. Why are you specifically interested in our engineering culture, and where do you see your technical depth growing over the next 2 years?',
    idealModelAnswer: 'Connects personal passions (distributed scale, high throughput, systems design) directly with the company products and team technical stack.',
    stageTitle: 'Leadership Principles & Career Vision',
  },
];

function fallbackFollowup(prevQuestion: string, turn: number, studentAnswer?: string, isHR = false): RealtimeFollowupResult {
  const pool = isHR ? HR_STAGE_FALLBACKS : TECHNICAL_STAGE_FALLBACKS;
  const idx = Math.min(pool.length - 1, Math.max(0, turn));
  return pool[idx];
}
