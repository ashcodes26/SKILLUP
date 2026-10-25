import React, { useState, useEffect, useRef } from 'react';
import { StudentProfileData, SRMPlacementTier, InterviewRoundMode, CDCInterviewScorecard } from '../../types';
import { INITIAL_STUDENT_PROFILE } from '../../data/mockData';
import ReactiveInterviewerAvatar, { AvatarState } from '../../components/ReactiveInterviewerAvatar';

interface InterviewRoomScreenProps {
  onNavigate?: (screen: string) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'warning') => void;
  profile?: StudentProfileData;
}

interface TargetCompanyOption {
  id: string;
  name: string;
  role: string;
  tier: SRMPlacementTier;
  ctc: string;
  location: string;
  eligibilityCutoff: string;
  isEligible: boolean;
  logoIcon: string;
  color: string;
}

interface InterviewQuestionData {
  id: number;
  topic: string;
  question: string;
  hint: string;
  starterSnippet: string;
  expectedKeywords: string[];
}

interface DialogueTurn {
  id: string;
  speaker: 'interviewer' | 'student';
  speakerName: string;
  text: string;
  timestamp: string;
  topic?: string;
  scoreMatchPct?: number;
}

const TARGET_COMPANIES: TargetCompanyOption[] = [
  {
    id: 'amazon-sde1',
    name: 'Amazon',
    role: 'Software Development Engineer - SDE-1 (Distributed Systems)',
    tier: 'Super Dream',
    ctc: '₹42.0 LPA',
    location: 'Bengaluru / Chennai',
    eligibilityCutoff: 'CGPA ≥ 8.00 • 0 Standing Arrears',
    isEligible: true,
    logoIcon: 'cloud',
    color: '#ffba35',
  },
  {
    id: 'cisco-se',
    name: 'Cisco Systems',
    role: 'Software Engineer - Distributed Core & Cloud Platforms',
    tier: 'Super Dream',
    ctc: '₹24.5 LPA',
    location: 'Bengaluru',
    eligibilityCutoff: 'CGPA ≥ 7.50 • 0 Standing Arrears',
    isEligible: true,
    logoIcon: 'hub',
    color: '#8052ff',
  },
  {
    id: 'barclays-ta',
    name: 'Barclays',
    role: 'Technology Analyst - Backend & Systems Engineering',
    tier: 'Dream',
    ctc: '₹14.0 LPA',
    location: 'Pune / Chennai',
    eligibilityCutoff: 'CGPA ≥ 7.00 • 0 Standing Arrears',
    isEligible: true,
    logoIcon: 'account_balance',
    color: '#60A5FA',
  },
  {
    id: 'natwest-ase',
    name: 'NatWest Group',
    role: 'Associate Software Engineer - Banking Cloud & APIs',
    tier: 'Dream',
    ctc: '₹10.5 LPA',
    location: 'Chennai (DLF IT Park)',
    eligibilityCutoff: 'CGPA ≥ 6.50 • 0 Standing Arrears',
    isEligible: true,
    logoIcon: 'payments',
    color: '#34D399',
  },
  {
    id: 'tcs-digital',
    name: 'TCS Digital',
    role: 'Systems Engineer - Digital Transformation & Enterprise Apps',
    tier: 'Day Sharing',
    ctc: '₹7.5 LPA',
    location: 'Chennai / Hyderabad',
    eligibilityCutoff: 'All CSE Eligible • 0 Standing Arrears',
    isEligible: true,
    logoIcon: 'developer_board',
    color: '#A78BFA',
  },
];

const TECHNICAL_QUESTIONS: InterviewQuestionData[] = [
  {
    id: 1,
    topic: 'PostgreSQL & Database Indexing Scale',
    question:
      'In your order service project, why did you choose B-Tree indexing over Hash indexing in PostgreSQL? How did your composite indices reduce p99 latency to 68ms while maintaining strict ACID compliance under 4,500 req/s load?',
    hint: 'Mention column ordering in composite indices (equality columns leading, range columns second) and WAL durability fsync guarantees.',
    starterSnippet:
      'In PostgreSQL 15, we selected B-Tree indices because our queries combine equality filtering with high-cardinality timestamp range scans (WHERE created_at >= ...). Hash indices only support equality comparison (=) and do not support range scans or ordering. To achieve 68ms p99 latency...',
    expectedKeywords: ['B-Tree', 'range queries', 'equality', 'WAL', 'ACID', 'composite index', 'latency'],
  },
  {
    id: 2,
    topic: 'Distributed Caching & Redis Streams',
    question:
      'Your resume mentions an asynchronous distributed event worker pipeline processing 12,000+ status events/sec with Redis. How did you prevent message loss in the event of a worker process crash, and how did you prevent Redis cache stampedes?',
    hint: 'Distinguish between standard Redis Pub/Sub (fire-and-forget) versus Redis Streams (consumer groups + PEL/XACK) and mention cache-aside mutex locks or TTL jitter.',
    starterSnippet:
      'To prevent message drops, we utilized Redis Streams with Consumer Groups rather than basic Pub/Sub. Redis Streams maintain a Pending Entries List (PEL); if a worker crashes before sending an XACK acknowledgment, another worker claims the pending message. For cache stampedes, we implemented...',
    expectedKeywords: ['Redis Streams', 'Consumer Groups', 'PEL', 'XACK', 'Pub/Sub', 'cache stampede', 'TTL'],
  },
  {
    id: 3,
    topic: 'Container Security & Docker Footprint',
    question:
      'You highlighted multi-stage Alpine Docker builds slashing your image footprint by 64% (820MB to 295MB). What security contexts and non-root execution practices did you enforce to prevent container escape in a shared Kubernetes cluster?',
    hint: 'Discuss multi-stage binary stripping, USER non-root, read-only root filesystems, and dropping Linux capabilities.',
    starterSnippet:
      'In our multi-stage Dockerfile, the builder stage compiles the binary with dependencies, and the final stage copies only the minimal runtime executable onto an Alpine 3.19 base. We explicitly added USER nonroot:nonroot, dropped default Linux capabilities with --cap-drop=ALL, and enabled read-only root filesystem...',
    expectedKeywords: ['multi-stage', 'Alpine', 'non-root', 'USER', 'security context', 'capabilities', 'attack surface'],
  },
  {
    id: 4,
    topic: 'Distributed Systems & Capstone Heartbeats',
    question:
      'In your Autonomous Routing Mesh capstone across 24 nodes, how did your Python gRPC routing daemon detect network partitions and prevent split-brain consensus failures during inter-service heartbeat verification?',
    hint: 'Discuss quorum consensus, heartbeat timeouts, lease renewals, and failure detectors like phi-accrual or exponential backoff.',
    starterSnippet:
      'We implemented a quorum-based heartbeat mechanism over HTTP/2 gRPC streams with bidirectional keep-alives. To prevent split-brain during network partitions, a node partition requires a strict majority quorum (N/2 + 1 = 13 nodes) to commit route updates...',
    expectedKeywords: ['gRPC', 'heartbeat', 'quorum', 'split-brain', 'partition', 'consensus', 'keep-alive'],
  },
  {
    id: 5,
    topic: 'Dynamic Follow-up: High-Throughput Resilience & Storage Engine',
    question:
      'Following up on your architecture choices: under extreme database write spikes, how does your PostgreSQL autovacuum daemon manage table bloat and transaction wraparound, and what isolation level did you use to prevent phantom reads in financial ledger entries?',
    hint: 'Mention SERIALIZABLE or REPEATABLE READ with optimistic concurrency control, and autovacuum cost limit tuning.',
    starterSnippet:
      'For our financial ledger mutations, we configured REPEATABLE READ with application-level retry loops to prevent phantom reads without incurring full Serializable snapshot locks. For table bloat, we tuned autovacuum_vacuum_cost_limit to 1000 and lowered autovacuum_vacuum_scale_factor to 0.05 on high-write tables...',
    expectedKeywords: ['REPEATABLE READ', 'phantom reads', 'autovacuum', 'bloat', 'isolation level', 'dead tuples'],
  },
];

const HR_QUESTIONS: InterviewQuestionData[] = [
  {
    id: 1,
    topic: 'Capstone Collaboration & Conflict Resolution',
    question:
      'Tell me about a situation in your 7th semester capstone or lab project at SRMIST where you had a significant technical disagreement with a team member. How did you resolve it without compromising the delivery deadline?',
    hint: 'Use the STAR method (Situation, Task, Action, Result). Focus on objective benchmarking data rather than emotional argument.',
    starterSnippet:
      'During our Autonomous Routing Mesh capstone, our team was divided between using REST over HTTP/1.1 vs gRPC Protobuf for inter-node communication. To resolve the debate objectively, I set up an isolated benchmark testing throughput and serialized payload size across 1,000 concurrent RPCs...',
    expectedKeywords: ['STAR', 'benchmark', 'data-driven', 'compromise', 'deadline', 'teamwork', 'communication'],
  },
  {
    id: 2,
    topic: 'Company Alignment & SRM Placement Strategy',
    question:
      'You hold an 8.74 CGPA with 0 standing arrears at SRMIST, qualifying for all placement tiers. Why are you specifically targeting our engineering culture over other Super Dream campus offers this season?',
    hint: 'Connect specific architectural challenges of the company with your own verified evidence (e.g., distributed scale, latency, high-concurrency).',
    starterSnippet:
      'While I am fortunate to qualify across placement tiers, my primary engineering motivation is working on planet-scale distributed infrastructure. Your team handles millions of transactions per second where microsecond latency optimizations and database durability directly impact millions of users...',
    expectedKeywords: ['culture', 'distributed scale', 'architecture', 'long-term', 'motivation', 'impact'],
  },
  {
    id: 3,
    topic: 'Engineering Ethics & Production Pressure',
    question:
      'Suppose 24 hours before a major product deployment, you discover a race condition in a Redis transaction that affects 0.1% of orders. Your tech lead wants to ship anyway to meet quarterly OKRs. How do you handle this?',
    hint: 'Address customer trust, data integrity, risk quantification, and proposing mitigation (e.g. feature flags, hotfix patch, or phased rollout).',
    starterSnippet:
      'In distributed backend systems, customer trust and financial ledger accuracy are non-negotiable. Rather than simply blocking the release or silently complying, I would immediately quantify the blast radius: 0.1% under 50,000 orders is 50 corrupted transactions. I would propose a phased rollout behind a feature flag...',
    expectedKeywords: ['customer trust', 'blast radius', 'feature flag', 'data integrity', 'mitigation', 'ethics'],
  },
  {
    id: 4,
    topic: 'Continuous Learning Outside University Curriculum',
    question:
      'What backend engineering or distributed systems topic have you explored completely independently outside the SRM university curriculum over the past 6 months?',
    hint: 'Demonstrate intrinsic curiosity, independent hands-on implementation, reading technical blogs or academic whitepapers.',
    starterSnippet:
      'Outside our standard coursework, I spent the last few months diving deeply into the Raft distributed consensus protocol and LSM-trees (Log-Structured Merge-trees) used in modern storage engines like RocksDB. I built a minimal key-value store in Python to understand write amplification...',
    expectedKeywords: ['Raft', 'consensus', 'LSM-tree', 'RocksDB', 'whitepaper', 'independent', 'curiosity'],
  },
];

export default function InterviewRoomScreen({
  onNavigate,
  onShowToast,
  profile = INITIAL_STUDENT_PROFILE,
}: InterviewRoomScreenProps) {
  // Stepper: 'setup' | 'live' | 'scorecard'
  const [step, setStep] = useState<'setup' | 'live' | 'scorecard'>('setup');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('amazon-sde1');
  const [roundMode, setRoundMode] = useState<InterviewRoundMode>('technical');

  // Full-Screen Immersive Mode
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  // Transcript Drawer Toggle
  const [isTranscriptOpen, setIsTranscriptOpen] = useState<boolean>(false);
  // Hands-Free Auto Turn-Taking (Auto submits after 2-second silence)
  const [isHandsFreeEnabled, setIsHandsFreeEnabled] = useState<boolean>(true);
  // Manual text fallback editor expanded
  const [showManualEditor, setShowManualEditor] = useState<boolean>(false);

  // Avatar Animation State: 'speaking' | 'listening' | 'thinking' | 'idle'
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');

  // Interview Questions & Progress
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [liveInterimSpeech, setLiveInterimSpeech] = useState<string>('');
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(900); // 15:00
  const [dialogueHistory, setDialogueHistory] = useState<DialogueTurn[]>([]);

  // Word-by-Word Karaoke Subtitle Synchronization State
  const [activeCharIndex, setActiveCharIndex] = useState<number>(-1);
  const [activeWordIndex, setActiveWordIndex] = useState<number>(-1);
  const [subtitleAnimKey, setSubtitleAnimKey] = useState<number>(0);
  const wordTickerTimerRef = useRef<NodeJS.Timeout | null>(null);
  const boundaryFiredRef = useRef<boolean>(false);

  // Audio / Speech & Natural Voice Engine State
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [silenceCounter, setSilenceCounter] = useState<number>(0);
  const [micPermissionDenied, setMicPermissionDenied] = useState<boolean>(false);

  // Natural Voice Studio Customization State
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [speechRate, setSpeechRate] = useState<number>(0.96); // Warm, measured executive cadence
  const [speechPitch, setSpeechPitch] = useState<number>(0.98); // Natural chest resonance
  const [showVoiceStudioModal, setShowVoiceStudioModal] = useState<boolean>(false);

  // Refs for timers & speech recognition
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const currentAnswerRef = useRef<string>('');

  currentAnswerRef.current = userAnswer;

  const selectedCompany = TARGET_COMPANIES.find((c) => c.id === selectedCompanyId) || TARGET_COMPANIES[0];
  const activeQuestions = roundMode === 'technical' ? TECHNICAL_QUESTIONS : HR_QUESTIONS;
  const currentQuestion = activeQuestions[currentQuestionIndex] || activeQuestions[0];

  // Tokenize question into discrete words with character offsets for karaoke highlighting
  const questionWordTokens = React.useMemo(() => {
    const text = currentQuestion.question || '';
    const tokens: Array<{ word: string; start: number; end: number; index: number }> = [];
    const regex = /\S+/g;
    let match: RegExpExecArray | null;
    let idx = 0;
    while ((match = regex.exec(text)) !== null) {
      tokens.push({
        word: match[0],
        start: match.index,
        end: match.index + match[0].length,
        index: idx++,
      });
    }
    return tokens;
  }, [currentQuestion.question]);

  const interviewerName =
    roundMode === 'technical'
      ? 'Vikram Ramanathan'
      : 'Meenakshi Sundaram';
  const interviewerRole =
    roundMode === 'technical'
      ? 'CDC Technical Panel Lead & Staff Engineer'
      : 'CDC Talent Acquisition Director';

  // Format MM:SS
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Live Timer Countdown
  useEffect(() => {
    if (step === 'live') {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [step]);

  // Clean up speech synthesis & recognition on unmount or screen exit
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      if (wordTickerTimerRef.current) {
        clearInterval(wordTickerTimerRef.current);
      }
    };
  }, []);

  // Voice Engine: Rank and select highest-fidelity natural voices asynchronously
  useEffect(() => {
    const loadAndRankVoices = () => {
      if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          const isFemale = roundMode === 'hr';
          // Filter and rank English voices
          const ranked = [...voices]
            .filter((v) => v.lang.startsWith('en'))
            .sort((a, b) => {
              const aName = a.name.toLowerCase();
              const bName = b.name.toLowerCase();

              const getScore = (name: string) => {
                let s = 0;
                if (name.includes('natural') || name.includes('online') || name.includes('neural')) s += 50;
                if (name.includes('enhanced') || name.includes('premium')) s += 40;
                if (name.includes('google')) s += 35;
                if (isFemale) {
                  if (name.includes('jenny') || name.includes('aria') || name.includes('samantha') || name.includes('female') || name.includes('victoria') || name.includes('karen')) s += 25;
                } else {
                  if (name.includes('guy') || name.includes('ryan') || name.includes('daniel') || name.includes('david') || name.includes('male') || name.includes('alex') || name.includes('rishi') || name.includes('george')) s += 25;
                }
                return s;
              };

              return getScore(bName) - getScore(aName);
            });

          setAvailableVoices(ranked.length > 0 ? ranked : voices);

          // If no custom voice chosen yet, auto-select the best natural voice
          if (!selectedVoiceURI && ranked.length > 0) {
            setSelectedVoiceURI(ranked[0].voiceURI);
          }
        }
      }
    };

    loadAndRankVoices();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadAndRankVoices;
    }
  }, [roundMode]);

  // When step switches to 'live', initiate dialogue with first question
  useEffect(() => {
    if (step === 'live') {
      const initialTurn: DialogueTurn = {
        id: `turn-${Date.now()}-q1`,
        speaker: 'interviewer',
        speakerName: interviewerName,
        text: currentQuestion.question,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        topic: currentQuestion.topic,
      };
      setDialogueHistory([initialTurn]);

      // Speak Question automatically after entrance animation
      const delay = setTimeout(() => {
        speakInterviewerQuestion(currentQuestion.question);
      }, 600);
      return () => clearTimeout(delay);
    }
  }, [step]);

  // Preview Voice Sample
  const handlePreviewVoice = (voiceURI?: string, customRate?: number, customPitch?: number) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const testPhrase =
        roundMode === 'technical'
          ? "Hello Aravind, I am Vikram from the CDC technical panel. Let's examine your distributed backend systems and index scaling."
          : "Hello Aravind, I am Meenakshi from the placement board. I'll be exploring your capstone teamwork and leadership principles.";

      const utt = new SpeechSynthesisUtterance(testPhrase);
      utt.rate = customRate ?? speechRate;
      utt.pitch = customPitch ?? speechPitch;

      const chosenVoice =
        availableVoices.find((v) => v.voiceURI === (voiceURI || selectedVoiceURI)) ||
        availableVoices[0];
      if (chosenVoice) {
        utt.voice = chosenVoice;
      }

      window.speechSynthesis.speak(utt);
    }
  };

  // Speak Interviewer Question via Natural Voice Engine with Word-Boundary Synchronization
  const speakInterviewerQuestion = (text: string) => {
    // 1. Mute/Stop microphone while avatar speaks to prevent audio loopback
    stopStudentMic();

    // Reset karaoke word-boundary and trigger subtitle smooth fade-in
    setSubtitleAnimKey((prev) => prev + 1);
    setActiveCharIndex(0);
    setActiveWordIndex(0);
    boundaryFiredRef.current = false;
    if (wordTickerTimerRef.current) {
      clearInterval(wordTickerTimerRef.current);
      wordTickerTimerRef.current = null;
    }

    if ('speechSynthesis' in window && !isMuted) {
      window.speechSynthesis.cancel();

      // Format text with human prosody micro-pauses at hyphens & brackets
      const humanizedText = text.replace(/ — /g, ', ').replace(/ \/ /g, ' or ');

      const utterance = new SpeechSynthesisUtterance(humanizedText);
      utterance.rate = speechRate; // Natural unhurried executive pace (0.96)
      utterance.pitch = speechPitch; // Rich chest resonance (0.98)

      // 2. Attach SpeechSynthesis Word-Boundary Event
      utterance.onboundary = (event: SpeechSynthesisEvent) => {
        if (event.name === 'word') {
          boundaryFiredRef.current = true;
          setActiveCharIndex(event.charIndex);

          // Locate word token by character index offset
          const token =
            questionWordTokens.find(
              (t) => event.charIndex >= t.start && event.charIndex <= t.end
            ) || questionWordTokens.find((t) => t.start >= event.charIndex);

          if (token) {
            setActiveWordIndex(token.index);
          }
        }
      };

      // Select chosen high-fidelity natural voice
      const activeVoice =
        availableVoices.find((v) => v.voiceURI === selectedVoiceURI) ||
        availableVoices[0];
      if (activeVoice) {
        utterance.voice = activeVoice;
      }

      setAvatarState('speaking');

      // Fallback ticker to guarantee smooth karaoke progression if system engine skips boundary events
      const totalTokens = questionWordTokens.length || 1;
      let fallbackIndex = 0;
      wordTickerTimerRef.current = setInterval(() => {
        if (!boundaryFiredRef.current) {
          fallbackIndex++;
          if (fallbackIndex < totalTokens) {
            setActiveWordIndex(fallbackIndex);
          } else {
            if (wordTickerTimerRef.current) clearInterval(wordTickerTimerRef.current);
          }
        }
      }, Math.round(285 / speechRate));

      utterance.onend = () => {
        if (wordTickerTimerRef.current) clearInterval(wordTickerTimerRef.current);
        setActiveWordIndex(questionWordTokens.length);
        setActiveCharIndex(-1);
        // Once avatar finishes speaking, transition to listening and open mic hands-free!
        setAvatarState('listening');
        startStudentMic();
      };

      utterance.onerror = () => {
        if (wordTickerTimerRef.current) clearInterval(wordTickerTimerRef.current);
        setActiveWordIndex(questionWordTokens.length);
        setActiveCharIndex(-1);
        setAvatarState('listening');
        startStudentMic();
      };

      window.speechSynthesis.speak(utterance);
    } else {
      // If speechSynthesis unavailable or muted, simulate short speaking duration with word ticker
      setAvatarState('speaking');
      const totalTokens = questionWordTokens.length || 1;
      let fallbackIndex = 0;
      wordTickerTimerRef.current = setInterval(() => {
        fallbackIndex++;
        if (fallbackIndex < totalTokens) {
          setActiveWordIndex(fallbackIndex);
        } else {
          if (wordTickerTimerRef.current) clearInterval(wordTickerTimerRef.current);
        }
      }, 260);

      setTimeout(() => {
        if (wordTickerTimerRef.current) clearInterval(wordTickerTimerRef.current);
        setActiveWordIndex(questionWordTokens.length);
        setAvatarState('listening');
        startStudentMic();
      }, 2800);
    }
  };

  // Start Student Microphone using Web Speech API
  const startStudentMic = () => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicPermissionDenied(true);
      onShowToast?.('SpeechRecognition API not available in this browser. Fallback input is ready.', 'info');
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsMicActive(true);
        setMicPermissionDenied(false);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalChunk += transcript;
          } else {
            interim += transcript;
          }
        }

        if (interim) {
          setLiveInterimSpeech(interim);
        }

        if (finalChunk) {
          setUserAnswer((prev) => {
            const updated = prev ? `${prev} ${finalChunk.trim()}` : finalChunk.trim();
            return updated;
          });
          setLiveInterimSpeech('');
        }

        // --- Hands-Free Turn Taking: 2-Second Silence Detection ---
        if (isHandsFreeEnabled) {
          // Reset existing silence timer
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current);
          }

          // Start 2000ms countdown after last word spoken
          silenceTimeoutRef.current = setTimeout(() => {
            const accumulated = (currentAnswerRef.current || finalChunk || interim).trim();
            // Ensure student has spoken meaningful words (> 15 chars) before auto-submitting
            if (accumulated.length >= 15) {
              handleAutoSubmitTurn(accumulated);
            }
          }, 2000);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicPermissionDenied(true);
          setIsMicActive(false);
          onShowToast?.('Microphone permission required for voice engine. You can also type your answer.', 'warning');
        }
      };

      recognition.onend = () => {
        // If still in listening state and not speaking, keep recognition alive
        if (avatarState === 'listening' && isMicActive) {
          try {
            recognition.start();
          } catch (e) {
            setIsMicActive(false);
          }
        } else {
          setIsMicActive(false);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Speech recognition init error:', err);
      setIsMicActive(false);
    }
  };

  // Stop Student Microphone
  const stopStudentMic = () => {
    setIsMicActive(false);
    setLiveInterimSpeech('');
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
  };

  // Toggle Microphone Manually
  const handleToggleMic = () => {
    if (isMicActive) {
      stopStudentMic();
      onShowToast?.('Microphone muted.', 'info');
    } else {
      setAvatarState('listening');
      startStudentMic();
      onShowToast?.('Microphone active — Listening to your technical response...', 'info');
    }
  };

  // Auto-Submit Turn when 2-second silence is detected
  const handleAutoSubmitTurn = (answerText: string) => {
    stopStudentMic();
    setAvatarState('thinking');
    onShowToast?.('2-second pause detected — Auto-submitting response...', 'info');

    // Simulate thinking & evaluation for 1.6s before interviewer speaks follow-up
    setTimeout(() => {
      commitTurnAndAdvance(answerText);
    }, 1600);
  };

  // Manual Submit Button Handler
  const handleManualSubmit = () => {
    const textToSubmit = userAnswer.trim() || liveInterimSpeech.trim() || currentQuestion.starterSnippet;
    stopStudentMic();
    setAvatarState('thinking');

    setTimeout(() => {
      commitTurnAndAdvance(textToSubmit);
    }, 1200);
  };

  // Commit Answer & Advance to Next Question / Dynamic Grill
  const commitTurnAndAdvance = (text: string) => {
    const finalAnswer = text || currentQuestion.starterSnippet;

    // Record response
    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: finalAnswer,
    }));

    // Record into dialogue history
    const studentTurn: DialogueTurn = {
      id: `turn-${Date.now()}-student`,
      speaker: 'student',
      speakerName: `${profile.name} (Candidate)`,
      text: finalAnswer,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      topic: currentQuestion.topic,
    };

    setDialogueHistory((prev) => [...prev, studentTurn]);
    setUserAnswer('');
    setLiveInterimSpeech('');

    // Advance question or finish
    if (currentQuestionIndex < activeQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      const nextQuestion = activeQuestions[nextIndex];

      const nextInterviewerTurn: DialogueTurn = {
        id: `turn-${Date.now()}-q${nextIndex + 1}`,
        speaker: 'interviewer',
        speakerName: interviewerName,
        text: nextQuestion.question,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        topic: nextQuestion.topic,
      };

      setDialogueHistory((prev) => [...prev, nextInterviewerTurn]);

      // Speak next question
      speakInterviewerQuestion(nextQuestion.question);
      onShowToast?.(`Advancing to Question ${nextIndex + 1} of ${activeQuestions.length}!`, 'success');
    } else {
      handleFinishInterview();
    }
  };

  // Finish Interview & Transition to Scorecard
  const handleFinishInterview = () => {
    stopStudentMic();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setAvatarState('idle');
    setStep('scorecard');
    onShowToast?.('Interview completed! Official SRM CDC Evaluation Scorecard generated.', 'success');
  };

  // Replay Question Speech
  const handleReplayQuestion = () => {
    speakInterviewerQuestion(currentQuestion.question);
  };

  // Insert Starter Template into response
  const handleInsertStarter = () => {
    setUserAnswer(currentQuestion.starterSnippet);
    onShowToast?.('Inserted suggested structured answer template.', 'info');
  };

  // Toggle Full-screen Viewport
  const handleToggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Calculate CDC Scorecard Deterministically
  const calculateScorecard = (): CDCInterviewScorecard => {
    const answeredCount = Object.keys(responses).length + (userAnswer.trim() ? 1 : 0);
    const ratio = Math.max(0.75, Math.min(1.0, (answeredCount || 4) / activeQuestions.length));

    if (roundMode === 'technical') {
      const techScore = Math.round(86 * ratio);
      const probScore = Math.round(82 * ratio);
      const commScore = Math.round(88 * ratio);
      const overall = Math.round((techScore + probScore + commScore) / 3);

      return {
        technicalCompetency: techScore,
        coreProblemSolving: probScore,
        communicationConfidence: commScore,
        overallScore: overall,
        srmRecommendationGrade: overall >= 82 ? 'S' : overall >= 75 ? 'A+' : 'A',
        recommendationTitle:
          overall >= 82
            ? 'RECOMMENDED FOR SUPER DREAM ON-CAMPUS DRIVE (Grade: S)'
            : 'RECOMMENDED FOR DREAM ON-CAMPUS DRIVE (Grade: A+)',
        recommendationText: `Candidate Aravind R. (RA2211003010482) demonstrated outstanding technical clarity and live verbal articulation during ${selectedCompany.name}'s mock technical panel. Excellent depth on PostgreSQL composite indexing, Redis Streams consumer groups, and container security.`,
        strengths: [
          'Articulated composite B-Tree index column ordering (equality columns first, range second) with exact p99 latency trade-offs.',
          'Differentiated Redis Streams with Consumer Groups (PEL & XACK) from fire-and-forget Pub/Sub to prevent message loss.',
          'Demonstrated deep awareness of container security contexts (--cap-drop=ALL, non-root USER) in Alpine multi-stage builds.',
          'Fluid hands-free voice articulation matching SRM CDC Super Dream drive expectations.',
        ],
        weakPointsToFix: [
          'Explicitly quantify PostgreSQL write-ahead log (WAL) fsync overhead when discussing ACID durability under 4,500 req/s.',
          'Provide mathematical backoff parameters when implementing Redis cache stampede mutex locks.',
          'Review distributed deadlock recovery protocols for multi-node consensus heartbeats.',
        ],
      };
    } else {
      const techScore = Math.round(82 * ratio);
      const probScore = Math.round(84 * ratio);
      const commScore = Math.round(92 * ratio);
      const overall = Math.round((techScore + probScore + commScore) / 3);

      return {
        technicalCompetency: techScore,
        coreProblemSolving: probScore,
        communicationConfidence: commScore,
        overallScore: overall,
        srmRecommendationGrade: 'S',
        recommendationTitle: 'HIGHLY RECOMMENDED FOR SUPER DREAM HR INTERVIEW (Grade: S)',
        recommendationText: `Candidate Aravind R. exhibited exemplary behavioral composure, STAR-method articulation, and high organizational maturity aligned with ${selectedCompany.name}'s engineering leadership principles.`,
        strengths: [
          'Structured answers methodically using the STAR method (Situation, Task, Action, Result).',
          'Navigated technical disagreements using objective empirical benchmarks rather than personal opinions.',
          'Demonstrated clear ethical commitment to customer trust over meeting hasty sprint OKRs.',
        ],
        weakPointsToFix: [
          'Connect personal long-term learning goals directly with the specific company’s 3-year product roadmap.',
          'Mention specific mentor feedback received during the 7th semester capstone project.',
        ],
      };
    }
  };

  const scorecard = calculateScorecard();

  // Export Assessment Report as TXT File
  const handleExportReport = () => {
    const reportText = `================================================================================
DIRECTORATE OF CAREER CENTRE (CDC) — SRMIST KATTANKULATHUR
OFFICIAL CANDIDATE MOCK INTERVIEW ASSESSMENT REPORT
================================================================================
Generated: ${new Date().toLocaleString()}
Candidate: ${profile.name} (Register No: ${profile.registerNumber || 'RA2211003010482'})
Program: ${profile.program}
School: School of Computing, SRMIST Kattankulathur
Academic Ledger: CGPA: ${profile.cgpa} / 10.00 | Standing Arrears: ${profile.standingArrears ?? 0} | 10th: 92% | 12th: 89%

TARGET PLACEMENT DRIVE:
Company: ${selectedCompany.name}
Role: ${selectedCompany.role}
Drive Tier: ${selectedCompany.tier} (${selectedCompany.ctc})
Interview Mode: Voice-First AI Interview Room (${roundMode === 'technical' ? 'Technical Round' : 'HR & Managerial'})
Assessor: ${interviewerName} (${interviewerRole})

EVALUATION SUMMARY & METRICS:
Overall Placement Grade: Grade ${scorecard.srmRecommendationGrade}
CDC Verdict: ${scorecard.recommendationTitle}
Overall Alignment Score: ${scorecard.overallScore} / 100

1. Technical Competency (Architecture & Systems): ${scorecard.technicalCompetency} / 100
2. Core CS Fundamentals & Problem Solving: ${scorecard.coreProblemSolving} / 100
3. Spoken Communication & Confidence (Voice Engine): ${scorecard.communicationConfidence} / 100

KEY PLACEMENT STRENGTHS IDENTIFIED:
${scorecard.strengths.map((s, i) => `[${i + 1}] ${s}`).join('\n')}

EXACT WEAK POINTS TO FIX BEFORE CAMPUS DRIVE:
${scorecard.weakPointsToFix.map((w, i) => `[${i + 1}] ${w}`).join('\n')}

COMPLETE INTERVIEW TRANSCRIPT:
${dialogueHistory
  .map(
    (turn) =>
      `[${turn.timestamp}] ${turn.speakerName.toUpperCase()}:\n"${turn.text}"\n`
  )
  .join('\n')}

================================================================================
Directorate of Career Centre (CDC) · SRMIST Kattankulathur · Placement Assessment
================================================================================`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Aravind_R_RA2211003010482_CDC_${selectedCompany.name}_Interview_Report.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast?.('Official SRM CDC Assessment Report downloaded successfully.', 'success');
  };

  return (
    <div
      ref={containerRef}
      className={`min-h-screen bg-[#070709] text-[#D6D6DC] selection:bg-[#8052ff]/30 selection:text-white transition-all ${
        isFullscreen ? 'p-4 sm:p-6 fixed inset-0 z-50 overflow-y-auto' : 'p-4 sm:p-8 space-y-6 max-w-7xl mx-auto'
      }`}
    >
      {/* Top Header: Directorate of Career Centre (CDC) — SRMIST Branding */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#202023]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2 py-0.5 rounded bg-[#8052ff]/20 text-[#cdbdff] font-bold border border-[#8052ff]/40">
              SRMIST CDC
            </span>
            <span className="text-[#9A9A9A]">·</span>
            <span className="text-[#55C98B] font-semibold">CAMPUS PLACEMENT ENGINE</span>
            <span className="text-[#9A9A9A]">·</span>
            <span className="text-[#ffba35] font-semibold">VOICE-FIRST AI INTERVIEW ROOM</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
            Directorate of Career Centre (CDC) — SRMIST Mock Interview Room
          </h1>
          <p className="text-xs text-[#8B8B93] mt-0.5">
            Voice-first hands-free simulation with live reactive interviewer avatar, project grilling, and official CDC scoring rubrics.
          </p>
        </div>

        {/* Action Controls & Candidate Credential Pill */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <div className="bg-[#16161A] border border-[#363639] rounded-lg px-3 py-2 text-xs font-mono flex items-center gap-2.5">
            <div>
              <span className="text-white font-bold">{profile.name}</span>{' '}
              <span className="text-[#9A9A9A]">({profile.registerNumber || 'RA2211003010482'})</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-[#55C98B]/20 text-[#55C98B] font-bold text-[11px] border border-[#55C98B]/30">
              CGPA: {profile.cgpa}
            </span>
          </div>

          {/* Fullscreen Toggle Button */}
          <button
            onClick={handleToggleFullscreen}
            className="px-3 py-2 rounded-lg bg-[#16161A] hover:bg-[#202023] border border-[#363639] hover:border-[#8052ff] text-white text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
            title={isFullscreen ? 'Exit Full-Screen' : 'Enter Full-Screen Mode'}
          >
            <span className="material-symbols-outlined text-[16px] text-[#ffba35]">
              {isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
            </span>
            <span className="hidden sm:inline">{isFullscreen ? 'Exit Fullscreen' : 'Full-Screen'}</span>
          </button>

          {step === 'live' && (
            <button
              onClick={() => setIsTranscriptOpen(!isTranscriptOpen)}
              className={`px-3 py-2 rounded-lg border text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer ${
                isTranscriptOpen
                  ? 'bg-[#8052ff] text-white border-[#8052ff]'
                  : 'bg-[#16161A] text-[#cdbdff] border-[#363639] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">receipt_long</span>
              <span>Transcript ({dialogueHistory.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* STEP 1: Setup / Company & Round Selection */}
      {step === 'setup' && (
        <div className="space-y-6 animate-fade-in">
          {/* Eligibility Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#16161A] via-[#1E1E24] to-[#16161A] border border-[#55C98B]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[#55C98B] text-[20px] shrink-0 mt-0.5">
                verified
              </span>
              <div>
                <span className="font-bold text-white">SRMIST Placement Eligibility Status:</span>{' '}
                <span className="text-[#55C98B] font-semibold">Cleared for All Campus Placement Tiers.</span>
                <p className="text-[11px] text-[#9A9A9A] mt-0.5">
                  Standing CGPA 8.74 exceeds Super Dream cutoffs (≥ 8.00). 0 standing arrears. 10th: 92% • 12th: 89%.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded bg-[#55C98B]/20 text-[#55C98B] border border-[#55C98B]/40 font-mono text-[11px] font-bold shrink-0">
              Tier 1 Priority Shortlist
            </span>
          </div>

          {/* Round Toggle Bar */}
          <div className="bg-[#0D0D0F] border border-[#202023] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-white">Select Interview Round Mode</h2>
              <p className="text-xs text-[#9A9A9A]">Choose between in-depth technical resume probing or executive HR grilling.</p>
            </div>

            <div className="flex items-center gap-2 bg-[#16161A] p-1 rounded-lg border border-[#363639]">
              <button
                onClick={() => setRoundMode('technical')}
                className={`px-3.5 py-2 rounded text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  roundMode === 'technical'
                    ? 'bg-[#8052ff] text-white font-bold shadow-md'
                    : 'text-[#9A9A9A] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">code</span>
                <span>Round 1: Technical &amp; Resume Grill</span>
              </button>
              <button
                onClick={() => setRoundMode('hr')}
                className={`px-3.5 py-2 rounded text-xs font-mono font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  roundMode === 'hr'
                    ? 'bg-[#ffba35] text-black font-bold shadow-md'
                    : 'text-[#9A9A9A] hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">psychology</span>
                <span>Round 2: HR &amp; Managerial</span>
              </button>
            </div>
          </div>

          {/* Company Selection Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Active SRM Campus Placement Drives (Select Target Company)
              </h2>
              <span className="text-xs text-[#9A9A9A] font-mono">5 Drives Available</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TARGET_COMPANIES.map((company) => {
                const isSelected = selectedCompanyId === company.id;
                return (
                  <div
                    key={company.id}
                    onClick={() => setSelectedCompanyId(company.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#16161A] border-[#8052ff] ring-1 ring-[#8052ff] shadow-lg shadow-[#8052ff]/10'
                        : 'bg-[#0D0D0F] border-[#202023] hover:border-[#363639]'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-9 h-9 rounded-lg border flex items-center justify-center"
                            style={{
                              backgroundColor: `${company.color}20`,
                              borderColor: `${company.color}40`,
                              color: company.color,
                            }}
                          >
                            <span className="material-symbols-outlined text-[20px]">{company.logoIcon}</span>
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white">{company.name}</h3>
                            <span className="text-[11px] text-[#9A9A9A]">{company.location}</span>
                          </div>
                        </div>

                        {/* Tier Badge */}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                            company.tier === 'Super Dream'
                              ? 'bg-[#ffba35]/20 text-[#ffba35] border-[#ffba35]/40'
                              : company.tier === 'Dream'
                              ? 'bg-[#60A5FA]/20 text-[#60A5FA] border-[#60A5FA]/40'
                              : 'bg-[#A78BFA]/20 text-[#A78BFA] border-[#A78BFA]/40'
                          }`}
                        >
                          {company.tier}
                        </span>
                      </div>

                      <div className="mt-3">
                        <div className="text-xs font-semibold text-[#cdbdff]">{company.role}</div>
                        <div className="text-base font-bold font-mono text-white mt-0.5">{company.ctc}</div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-[#202023] text-[11px] font-mono text-[#9A9A9A]">
                        <span>Gate: </span>
                        <span className="text-white">{company.eligibilityCutoff}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#202023] flex items-center justify-between">
                      <span className="text-[11px] font-mono text-[#55C98B] flex items-center gap-1 font-semibold">
                        <span className="material-symbols-outlined text-[13px]">check_circle</span>
                        <span>Candidate Eligible</span>
                      </span>

                      <button
                        type="button"
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-colors ${
                          isSelected
                            ? 'bg-[#8052ff] text-white'
                            : 'bg-[#202023] text-[#9A9A9A] hover:text-white'
                        }`}
                      >
                        {isSelected ? 'Selected ✓' : 'Select'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Voice Engine Setup Info & Launch Action */}
          <div className="bg-[#0D0D0F] border border-[#202023] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8052ff] text-[18px]">record_voice_over</span>
                <span>Voice-First AI Interview Engine Ready for {selectedCompany.name}</span>
              </div>
              <p className="text-xs text-[#9A9A9A]">
                Full hands-free turn taking: Avatar asks questions, automatically listens to your response, and advances after a 2-second silence pause.
              </p>
            </div>

            <button
              onClick={() => {
                setStep('live');
                setCurrentQuestionIndex(0);
                setUserAnswer('');
                setDialogueHistory([]);
                setResponses({});
                setSecondsRemaining(900);
                onShowToast?.(
                  `Entered Voice-First Interview Room for ${selectedCompany.name} (${selectedCompany.tier})!`,
                  'success'
                );
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#8052ff] to-[#6035d8] hover:opacity-95 text-white font-mono font-bold text-xs transition-all shadow-xl shadow-[#8052ff]/20 flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">mic</span>
              <span>Launch Voice Interview Room →</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Full-Screen Live Interactive Interview Chamber with Reactive Avatar */}
      {step === 'live' && (
        <div className="relative space-y-4 animate-fade-in">
          {/* Top Control Bar: Company, Timer, Stepper, Hands-Free Toggle */}
          <div className="bg-[#0D0D0F]/90 backdrop-blur-md border border-[#202023] rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg border flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: `${selectedCompany.color}20`,
                  borderColor: `${selectedCompany.color}40`,
                  color: selectedCompany.color,
                }}
              >
                <span className="material-symbols-outlined text-[18px]">{selectedCompany.logoIcon}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">{selectedCompany.name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#ffba35]/15 text-[#ffba35] border border-[#ffba35]/30 font-mono font-bold">
                    {selectedCompany.tier}
                  </span>
                </div>
                <div className="text-[11px] text-[#9A9A9A] font-mono">
                  {roundMode === 'technical' ? 'Round 1: Technical & Systems Architecture Grill' : 'Round 2: HR & Cultural Alignment'}
                </div>
              </div>
            </div>

            {/* Stepper, Countdown Timer, Hands-Free Switch */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="px-3 py-1.5 rounded-lg bg-[#16161A] border border-[#363639] text-xs font-mono flex items-center gap-1.5">
                <span className="text-[#9A9A9A]">Question:</span>
                <span className="text-white font-bold">
                  {currentQuestionIndex + 1} / {activeQuestions.length}
                </span>
              </div>

              <div className="px-3 py-1.5 rounded-lg bg-[#16161A] border border-[#363639] text-xs font-mono flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-[#EB5757] animate-pulse">timer</span>
                <span className="text-white font-bold tabular-nums">{formatTimer(secondsRemaining)}</span>
              </div>

              {/* Hands-Free Mode Toggle */}
              <button
                onClick={() => {
                  setIsHandsFreeEnabled(!isHandsFreeEnabled);
                  onShowToast?.(
                    !isHandsFreeEnabled
                      ? 'Hands-Free Auto Turn-Taking Enabled (2s silence auto-submit)'
                      : 'Hands-Free Disabled (Manual Submit required)',
                    'info'
                  );
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer border ${
                  isHandsFreeEnabled
                    ? 'bg-[#55C98B]/20 text-[#55C98B] border-[#55C98B]/40 font-semibold'
                    : 'bg-[#16161A] text-[#9A9A9A] border-[#363639]'
                }`}
                title="When ON, speech is auto-submitted 2 seconds after you stop speaking"
              >
                <span className="material-symbols-outlined text-[15px]">
                  {isHandsFreeEnabled ? 'auto_mode' : 'touch_app'}
                </span>
                <span>{isHandsFreeEnabled ? 'Hands-Free: ON' : 'Hands-Free: OFF'}</span>
              </button>

              {/* End & Score Button */}
              <button
                onClick={handleFinishInterview}
                className="px-3 py-1.5 rounded-lg bg-[#202023] hover:bg-[#363639] text-[#ffba35] border border-[#363639] text-xs font-mono font-semibold transition-colors cursor-pointer"
              >
                Finish &amp; Scorecard
              </button>
            </div>
          </div>

          {/* Main Visual Stage: Centered Live Reactive Avatar & Cinematic Teleprompter */}
          <div className="relative min-h-[500px] flex flex-col items-center justify-between p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#0D0D12] via-[#09090C] to-[#040406] border border-[#202023] shadow-2xl overflow-hidden">
            {/* Ambient Background Grid Pattern */}
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#8052ff_1px,transparent_1px)] [background-size:24px_24px]" />

            {/* Top Toolbar inside chamber: Topic Tag, Question Replay, Mic Toggle */}
            <div className="relative z-10 w-full flex items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-[#8052ff]/15 text-[#cdbdff] border border-[#8052ff]/30 font-semibold">
                  Topic: {currentQuestion.topic}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowVoiceStudioModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-[#16161A] hover:bg-[#202023] text-[#cdbdff] hover:text-white border border-[#363639] hover:border-[#8052ff] text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Configure natural voice persona, pitch, and executive pacing"
                >
                  <span className="material-symbols-outlined text-[15px] text-[#55C98B]">graphic_eq</span>
                  <span>Voice Studio</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] uppercase font-bold bg-[#55C98B]/20 text-[#55C98B] border border-[#55C98B]/30 hidden sm:inline">
                    Natural
                  </span>
                </button>

                <button
                  onClick={handleReplayQuestion}
                  className="px-2.5 py-1 rounded-lg bg-[#16161A] hover:bg-[#202023] text-[#cdbdff] hover:text-white border border-[#363639] text-xs transition-colors flex items-center gap-1 cursor-pointer"
                  title="Re-play question speech"
                >
                  <span className="material-symbols-outlined text-[15px]">replay</span>
                  <span>Replay Audio</span>
                </button>

                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                    isMuted
                      ? 'bg-red-950/40 border-red-500/50 text-red-400'
                      : 'bg-[#16161A] border-[#363639] text-[#9A9A9A] hover:text-white'
                  }`}
                  title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isMuted ? 'volume_off' : 'volume_up'}
                  </span>
                </button>
              </div>
            </div>

            {/* Centered Reactive AI Avatar Component */}
            <div className="relative z-10 my-4 sm:my-6 flex flex-col items-center">
              <ReactiveInterviewerAvatar
                state={avatarState}
                interviewerName={interviewerName}
                interviewerRole={interviewerRole}
                companyName={selectedCompany.name}
                roundMode={roundMode}
                isMuted={isMuted}
              />
            </div>

            {/* Microphone Permission Warning / Fallback Notice */}
            {micPermissionDenied && (
              <div className="relative z-10 w-full max-w-2xl mb-3 p-3 rounded-xl bg-amber-950/30 border border-amber-600/40 text-amber-200 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-400 text-[18px]">mic_off</span>
                  <span>Microphone access not granted. You can type answers or insert structured templates below!</span>
                </div>
                <button
                  onClick={() => setShowManualEditor(true)}
                  className="px-2.5 py-1 rounded bg-amber-500 text-black font-mono font-bold text-[11px] cursor-pointer shrink-0"
                >
                  Open Editor
                </button>
              </div>
            )}

            {/* Cinematic Closed-Captioning Subtitle Teleprompter Bar */}
            <div className="relative z-10 w-full max-w-3xl">
              <div
                key={`subtitle-card-${subtitleAnimKey}`}
                className="animate-subtitle-fade-in shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex flex-col space-y-3 transition-all"
                style={{
                  background: 'rgba(13, 13, 15, 0.85)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '16px 24px',
                }}
              >
                {/* Speaker indicator tag */}
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    {avatarState === 'speaking' ? (
                      <span className="flex items-center gap-1.5 text-[#cdbdff] font-bold">
                        <span className="w-2 h-2 rounded-full bg-[#8052ff] animate-ping" />
                        <span>{interviewerName} (Asking Question)</span>
                      </span>
                    ) : avatarState === 'listening' ? (
                      <span className="flex items-center gap-1.5 text-[#55C98B] font-bold">
                        <span className="w-2 h-2 rounded-full bg-[#55C98B] animate-ping" />
                        <span>{profile.name} (Live Voice Stream)</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[#ffba35] font-bold">
                        <span className="w-2 h-2 rounded-full bg-[#ffba35] animate-spin" />
                        <span>Evaluating Response &amp; Formulating Grill...</span>
                      </span>
                    )}
                  </div>

                  {isHandsFreeEnabled && avatarState === 'listening' && (
                    <span className="text-[10px] text-[#9A9A9A] font-mono">
                      (Pause for 2s to auto-submit)
                    </span>
                  )}
                </div>

                {/* Subtitle Teleprompter Text Display with Word-by-Word Karaoke Highlighting */}
                <div className="min-h-[56px] text-sm sm:text-base leading-relaxed">
                  {avatarState === 'speaking' ? (
                    <p className="leading-relaxed transition-all duration-150">
                      <span className="text-white/60 font-serif mr-1 text-lg leading-none">&ldquo;</span>
                      {questionWordTokens.map((token) => {
                        const isCurrentlySpoken = token.index === activeWordIndex;
                        const isAlreadySpoken = token.index < activeWordIndex;

                        if (isCurrentlySpoken) {
                          return (
                            <span
                              key={token.index}
                              className="font-bold inline transition-colors duration-150 mx-[2px]"
                              style={{
                                color: '#cdbdff',
                                textShadow: '0 0 12px rgba(205, 189, 255, 0.6), 0 0 20px rgba(128, 82, 255, 0.35)',
                              }}
                            >
                              {token.word}
                            </span>
                          );
                        }

                        if (isAlreadySpoken) {
                          return (
                            <span
                              key={token.index}
                              className="font-medium transition-colors duration-150 mx-[2px]"
                              style={{ color: '#FFFFFF', opacity: 1 }}
                            >
                              {token.word}
                            </span>
                          );
                        }

                        // Upcoming words are hidden while speaking (do not display underneath ongoing words)
                        return null;
                      })}
                      {activeWordIndex >= questionWordTokens.length - 1 && (
                        <span className="text-white/60 font-serif ml-1 text-lg leading-none">&rdquo;</span>
                      )}
                    </p>
                  ) : avatarState === 'thinking' ? (
                    <p className="text-[#ffba35] font-mono text-xs sm:text-sm animate-pulse">
                      Analyzing technical claims: evaluating PostgreSQL indexing, ACID transaction guarantees, and distributed PEL state against SRM CDC rubric...
                    </p>
                  ) : (
                    <div className="text-white space-y-1">
                      {userAnswer || liveInterimSpeech ? (
                        <p className="text-[#55C98B] font-mono text-xs sm:text-sm">
                          {userAnswer}{' '}
                          <span className="text-white/80 italic">{liveInterimSpeech}</span>
                          <span className="inline-block w-1.5 h-4 bg-[#55C98B] animate-pulse ml-1 align-middle" />
                        </p>
                      ) : (
                        <div>
                          <p className="text-white/90 text-sm font-medium mb-1 line-clamp-2">
                            &ldquo;{currentQuestion.question}&rdquo;
                          </p>
                          <p className="text-[#9A9A9A] font-mono text-xs italic">
                            Speak naturally into your microphone... Live speech will stream here.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Live Controls: Mic Toggle, Template Inserter, Manual Submit */}
                <div className="pt-2 border-t border-[#202023] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleToggleMic}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isMicActive
                          ? 'bg-[#EB5757] text-white shadow-lg shadow-red-500/20 animate-pulse'
                          : 'bg-[#16161A] text-[#55C98B] hover:text-white border border-[#363639]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isMicActive ? 'mic_off' : 'mic'}
                      </span>
                      <span>{isMicActive ? 'Mute Mic' : 'Start Mic'}</span>
                    </button>

                    <button
                      onClick={handleInsertStarter}
                      className="px-2.5 py-1.5 rounded-lg bg-[#16161A] hover:bg-[#202023] text-[#cdbdff] border border-[#363639] transition-colors cursor-pointer"
                      title="Load sample high-grade answer template"
                    >
                      + Answer Template
                    </button>

                    <button
                      onClick={() => setShowManualEditor(!showManualEditor)}
                      className="px-2.5 py-1.5 rounded-lg bg-[#16161A] hover:bg-[#202023] text-[#9A9A9A] hover:text-white border border-[#363639] transition-colors cursor-pointer"
                    >
                      {showManualEditor ? 'Hide Text Editor' : 'Type Response'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleManualSubmit}
                      disabled={avatarState === 'thinking'}
                      className="px-4 py-1.5 rounded-lg bg-[#55C98B] hover:bg-[#55C98B]/90 text-black font-bold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <span>
                        {currentQuestionIndex < activeQuestions.length - 1
                          ? 'Submit & Next →'
                          : 'Submit & Finish'}
                      </span>
                      <span className="material-symbols-outlined text-[15px]">send</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Optional Manual Textarea Drawer for Text Fallback */}
            {showManualEditor && (
              <div className="relative z-10 w-full max-w-3xl mt-4 p-4 rounded-xl bg-[#121217] border border-[#2a2a34] space-y-2 animate-fade-in">
                <div className="flex items-center justify-between text-xs font-mono text-[#9A9A9A]">
                  <span>Manual Text Input (For quiet rooms or microphone-free setups):</span>
                  <span>{userAnswer.length} chars</span>
                </div>
                <textarea
                  rows={4}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your technical answer here..."
                  className="w-full bg-[#16161A] border border-[#363639] rounded-lg p-3 text-xs text-white font-mono leading-relaxed focus:outline-none focus:border-[#8052ff] resize-none"
                />
              </div>
            )}
          </div>

          {/* Collapsible Transcript Side Drawer */}
          {isTranscriptOpen && (
            <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-[#0D0D0F] border-l border-[#202023] p-5 shadow-2xl flex flex-col justify-between animate-fade-in">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#202023]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#8052ff] text-[20px]">receipt_long</span>
                    <h3 className="text-sm font-bold text-white">Live Interview Transcript</h3>
                  </div>
                  <button
                    onClick={() => setIsTranscriptOpen(false)}
                    className="p-1 rounded text-[#9A9A9A] hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-4 space-y-4 max-h-[75vh] overflow-y-auto pr-1">
                  {dialogueHistory.length === 0 ? (
                    <div className="text-xs text-[#9A9A9A] font-mono p-4 text-center">
                      No dialogue recorded yet. Speak into the microphone to begin.
                    </div>
                  ) : (
                    dialogueHistory.map((turn) => (
                      <div
                        key={turn.id}
                        className={`p-3 rounded-xl border text-xs font-mono space-y-1.5 ${
                          turn.speaker === 'interviewer'
                            ? 'bg-[#141419] border-[#2c2c36]'
                            : 'bg-[#101a14] border-[#1f3d2a]'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span
                            className={`font-bold ${
                              turn.speaker === 'interviewer' ? 'text-[#cdbdff]' : 'text-[#55C98B]'
                            }`}
                          >
                            {turn.speakerName}
                          </span>
                          <span className="text-[#9A9A9A]">{turn.timestamp}</span>
                        </div>
                        {turn.topic && (
                          <div className="text-[10px] text-[#ffba35] font-semibold">
                            [{turn.topic}]
                          </div>
                        )}
                        <p className="text-white leading-relaxed">{turn.text}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-[#202023]">
                <button
                  onClick={() => setIsTranscriptOpen(false)}
                  className="w-full py-2 rounded-lg bg-[#16161A] text-white text-xs font-mono font-medium hover:bg-[#202023]"
                >
                  Close Transcript
                </button>
              </div>
            </div>
          )}

          {/* Natural Voice Studio Customization Modal */}
          {showVoiceStudioModal && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
              <div className="w-full max-w-lg bg-[#0e0e14] border border-[#2c2c38] rounded-2xl p-6 shadow-2xl space-y-5 text-xs font-mono">
                <div className="flex items-center justify-between pb-3 border-b border-[#202023]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#8052ff]/20 text-[#cdbdff] border border-[#8052ff]/30 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[20px]">graphic_eq</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">CDC Natural Voice Studio</h3>
                      <p className="text-[11px] text-[#9A9A9A]">Select neural speech synthesis models, executive cadence, and resonance</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowVoiceStudioModal(false)}
                    className="p-1 rounded text-[#9A9A9A] hover:text-white text-base cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                {/* Voice Model Selector */}
                <div className="space-y-2">
                  <label className="text-white font-semibold flex items-center justify-between">
                    <span>Active Voice Model:</span>
                    <span className="text-[11px] text-[#55C98B] font-mono">
                      {availableVoices.length} Voices Detected
                    </span>
                  </label>
                  <select
                    value={selectedVoiceURI}
                    onChange={(e) => {
                      setSelectedVoiceURI(e.target.value);
                      handlePreviewVoice(e.target.value);
                    }}
                    className="w-full bg-[#16161A] border border-[#363639] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-[#8052ff] cursor-pointer"
                  >
                    {availableVoices.map((v) => {
                      const isNatural =
                        v.name.toLowerCase().includes('natural') ||
                        v.name.toLowerCase().includes('online') ||
                        v.name.toLowerCase().includes('neural') ||
                        v.name.toLowerCase().includes('google') ||
                        v.name.toLowerCase().includes('enhanced');
                      return (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {isNatural ? '★ [Natural Neural] ' : ''}{v.name} ({v.lang})
                        </option>
                      );
                    })}
                  </select>
                  <p className="text-[10px] text-[#9A9A9A]">
                    Prioritizing high-fidelity neural voices matching {roundMode === 'technical' ? 'Vikram Ramanathan (Technical Panel Lead)' : 'Meenakshi Sundaram (HR Director)'}.
                  </p>
                </div>

                {/* Speed Slider */}
                <div className="space-y-1.5 bg-[#141419] p-3.5 rounded-xl border border-[#202023]">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">Speech Pacing / Cadence:</span>
                    <span className="text-[#cdbdff] font-bold">
                      {speechRate.toFixed(2)}x {speechRate === 0.96 ? '(Natural Executive)' : ''}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.80"
                    max="1.20"
                    step="0.02"
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="w-full accent-[#8052ff] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#9A9A9A]">
                    <span>0.80x (Deliberate)</span>
                    <span className="text-[#cdbdff]">0.96x (Natural)</span>
                    <span>1.20x (Fast)</span>
                  </div>
                </div>

                {/* Pitch Slider */}
                <div className="space-y-1.5 bg-[#141419] p-3.5 rounded-xl border border-[#202023]">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">Vocal Pitch &amp; Resonance:</span>
                    <span className="text-[#ffba35] font-bold">
                      {speechPitch.toFixed(2)} {speechPitch === 0.98 ? '(Warm Chest Tone)' : ''}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.85"
                    max="1.15"
                    step="0.01"
                    value={speechPitch}
                    onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                    className="w-full accent-[#ffba35] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-[#9A9A9A]">
                    <span>0.85 (Deep)</span>
                    <span className="text-[#ffba35]">0.98 (Warm Natural)</span>
                    <span>1.15 (Higher)</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-[#202023] flex items-center justify-between gap-3">
                  <button
                    onClick={() => handlePreviewVoice()}
                    className="px-3.5 py-2 rounded-lg bg-[#16161A] hover:bg-[#202023] text-white border border-[#363639] hover:border-[#8052ff] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px] text-[#55C98B]">volume_up</span>
                    <span>Test Voice Preview</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSpeechRate(0.96);
                        setSpeechPitch(0.98);
                      }}
                      className="px-3 py-2 rounded-lg text-[#9A9A9A] hover:text-white transition-colors cursor-pointer"
                    >
                      Reset Defaults
                    </button>
                    <button
                      onClick={() => setShowVoiceStudioModal(false)}
                      className="px-4 py-2 rounded-lg bg-[#8052ff] hover:bg-[#8052ff]/90 text-white font-bold transition-colors cursor-pointer"
                    >
                      Apply &amp; Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 3: CDC Placement Performance Scorecard */}
      {step === 'scorecard' && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Outcome Grade Header */}
          <div className="bg-[#0D0D0F] border border-[#202023] rounded-xl p-6 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#9A9A9A]">
                  <span className="text-[#ffba35] font-semibold">DIRECTORATE OF CAREER CENTRE (CDC)</span>
                  <span>·</span>
                  <span>OFFICIAL INTERVIEW ASSESSMENT</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {scorecard.recommendationTitle}
                </h2>
                <p className="text-xs text-[#8B8B93] mt-1 max-w-2xl leading-relaxed">
                  {scorecard.recommendationText}
                </p>
              </div>

              {/* Overall Score Circle / Pill */}
              <div className="flex items-center gap-4 bg-[#16161A] p-4 rounded-xl border border-[#363639] shrink-0">
                <div className="text-center font-mono">
                  <div className="text-xs text-[#9A9A9A] uppercase">Overall Score</div>
                  <div className="text-3xl sm:text-4xl font-bold text-[#55C98B] tabular-nums">
                    {scorecard.overallScore}
                    <span className="text-xs text-[#9A9A9A] font-normal"> / 100</span>
                  </div>
                </div>
                <div className="h-10 w-px bg-[#202023]" />
                <div className="text-center font-mono">
                  <div className="text-xs text-[#9A9A9A] uppercase">CDC Grade</div>
                  <div className="text-3xl sm:text-4xl font-bold text-[#ffba35]">
                    {scorecard.srmRecommendationGrade}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Three Key Evaluation Metrics Scorecards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Metric 1: Technical Competency */}
            <div className="bg-[#0D0D0F] border border-[#202023] rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-[#9A9A9A]">
                  <span>1. TECHNICAL COMPETENCY</span>
                  <span className="text-[#cdbdff]">Architecture</span>
                </div>
                <div className="text-3xl font-bold font-mono text-[#cdbdff] mt-2 tabular-nums">
                  {scorecard.technicalCompetency} <span className="text-xs font-normal text-[#9A9A9A]">/ 100</span>
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-[#16161A] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#8052ff] h-full rounded-full transition-all duration-500"
                    style={{ width: `${scorecard.technicalCompetency}%` }}
                  />
                </div>
                <div className="mt-2 text-[11px] font-mono text-[#9A9A9A]">
                  PostgreSQL indexing, Redis streaming, Docker multi-stage
                </div>
              </div>
            </div>

            {/* Metric 2: Core CS & Problem Solving */}
            <div className="bg-[#0D0D0F] border border-[#202023] rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-[#9A9A9A]">
                  <span>2. CORE CS &amp; PROBLEM SOLVING</span>
                  <span className="text-[#55C98B]">Algorithms</span>
                </div>
                <div className="text-3xl font-bold font-mono text-[#55C98B] mt-2 tabular-nums">
                  {scorecard.coreProblemSolving} <span className="text-xs font-normal text-[#9A9A9A]">/ 100</span>
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-[#16161A] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#55C98B] h-full rounded-full transition-all duration-500"
                    style={{ width: `${scorecard.coreProblemSolving}%` }}
                  />
                </div>
                <div className="mt-2 text-[11px] font-mono text-[#9A9A9A]">
                  ACID durability, quorum consensus, cache stampede locks
                </div>
              </div>
            </div>

            {/* Metric 3: Communication & Confidence */}
            <div className="bg-[#0D0D0F] border border-[#202023] rounded-xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-[#9A9A9A]">
                  <span>3. COMMUNICATION &amp; CONFIDENCE</span>
                  <span className="text-[#ffba35]">Voice Engine</span>
                </div>
                <div className="text-3xl font-bold font-mono text-[#ffba35] mt-2 tabular-nums">
                  {scorecard.communicationConfidence} <span className="text-xs font-normal text-[#9A9A9A]">/ 100</span>
                </div>
              </div>
              <div className="mt-3">
                <div className="w-full bg-[#16161A] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#ffba35] h-full rounded-full transition-all duration-500"
                    style={{ width: `${scorecard.communicationConfidence}%` }}
                  />
                </div>
                <div className="mt-2 text-[11px] font-mono text-[#9A9A9A]">
                  Hands-free verbal pacing, precise phrasing, zero fluff
                </div>
              </div>
            </div>
          </div>

          {/* Qualitative Detailed Feedback: Strengths & Weak Points */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-[#0D0D0F] border border-[#202023] rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[#202023]">
                <span className="material-symbols-outlined text-[#55C98B] text-[20px]">thumb_up</span>
                <h3 className="text-sm font-bold text-white">Key Placement Strengths Identified</h3>
              </div>
              <ul className="space-y-2.5">
                {scorecard.strengths.map((str, idx) => (
                  <li key={idx} className="p-3 rounded-lg bg-[#16161A] border border-[#202023] text-xs text-[#D6D6DC] flex items-start gap-2.5">
                    <span className="text-[#55C98B] font-bold">✓</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weak Points to Fix */}
            <div className="bg-[#0D0D0F] border border-[#202023] rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-[#202023]">
                <span className="material-symbols-outlined text-[#ffba35] text-[20px]">warning</span>
                <h3 className="text-sm font-bold text-white">Exact Weak Points to Fix Before Campus Drive</h3>
              </div>
              <ul className="space-y-2.5">
                {scorecard.weakPointsToFix.map((wp, idx) => (
                  <li key={idx} className="p-3 rounded-lg bg-[#16161A] border border-[#202023] text-xs text-[#D6D6DC] flex items-start gap-2.5">
                    <span className="text-[#ffba35] font-bold">!</span>
                    <span>{wp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="bg-[#0D0D0F] border border-[#202023] rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setStep('setup')}
                className="px-4 py-2 rounded-lg bg-[#202023] hover:bg-[#363639] text-white text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Switch Company / Round</span>
              </button>
              <button
                onClick={() => {
                  setStep('live');
                  setCurrentQuestionIndex(0);
                  setUserAnswer('');
                  setDialogueHistory([]);
                  setResponses({});
                  setSecondsRemaining(900);
                  onShowToast?.('Retaking interview session from Question 1!', 'info');
                }}
                className="px-4 py-2 rounded-lg bg-[#16161A] hover:bg-[#202023] text-[#cdbdff] border border-[#363639] text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">replay</span>
                <span>Retake Mock Interview</span>
              </button>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleExportReport}
                className="px-4 py-2 rounded-lg bg-[#55C98B] hover:bg-[#55C98B]/90 text-black font-mono font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Download CDC Assessment Report</span>
              </button>

              <button
                onClick={() => onNavigate?.('career-plan')}
                className="px-4 py-2 rounded-lg bg-[#8052ff] hover:bg-[#8052ff]/90 text-white font-mono font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Back to Dashboard</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
