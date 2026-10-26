import React, { useState, useEffect, useRef } from 'react';
import {
  StudentProfileData,
  AssessmentQuestion,
  SemesterAssessmentResult,
} from '../../types';
import {
  getSemesterAssessmentQuestions,
  evaluateSemesterAssessment,
  SEMESTER_SUBJECT_CONFIGS,
} from '../../services/semesterAssessmentService';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Award,
  BarChart3,
  RefreshCw,
  ArrowRight,
  Bookmark,
  Check,
  X,
  Code2,
} from 'lucide-react';

interface SemesterAssessmentScreenProps {
  profile: StudentProfileData;
  onNavigate?: (path: string) => void;
  onCompleteAssessment?: (result: SemesterAssessmentResult) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

type ExamState = 'intro' | 'active' | 'submitting' | 'results';

export default function SemesterAssessmentScreen({
  profile,
  onNavigate,
  onCompleteAssessment,
  onShowToast,
}: SemesterAssessmentScreenProps) {
  const [examState, setExamState] = useState<ExamState>('intro');
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(15 * 60); // 15 mins
  const [isLoadingQuestions, setIsLoadingQuestions] = useState<boolean>(false);
  const [result, setResult] = useState<SemesterAssessmentResult | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const timerRef = useRef<any>(null);

  const studentSemester = profile.semester || 'Semester 6';
  const subjects = SEMESTER_SUBJECT_CONFIGS[studentSemester] || SEMESTER_SUBJECT_CONFIGS['Semester 6'];

  // Start Exam
  const handleStartExam = async () => {
    setIsLoadingQuestions(true);
    try {
      const fetchedQuestions = await getSemesterAssessmentQuestions(
        studentSemester,
        profile.department || 'Computer Science & Engineering'
      );
      setQuestions(fetchedQuestions);
      setCurrentIndex(0);
      setAnswers({});
      setMarkedForReview({});
      setTimeRemainingSeconds(15 * 60);
      setExamState('active');
    } catch (e) {
      console.error('Failed to load questions:', e);
      onShowToast?.('Failed to initialize assessment questions. Using offline diagnostic.', 'warning');
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  // Timer Effect
  useEffect(() => {
    if (examState === 'active') {
      timerRef.current = setInterval(() => {
        setTimeRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleSubmitExam();
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
  }, [examState, questions, answers]);

  const handleSelectOption = (optionIndex: number) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionIndex,
    }));
  };

  const toggleMarkForReview = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    setMarkedForReview((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id],
    }));
  };

  const handleSubmitExam = () => {
    setShowSubmitModal(false);
    setExamState('submitting');

    setTimeout(() => {
      const timeSpent = 15 * 60 - timeRemainingSeconds;
      const evaluation = evaluateSemesterAssessment(questions, answers, timeSpent);
      setResult(evaluation);
      setExamState('results');
      onCompleteAssessment?.(evaluation);
      onShowToast?.(`Assessment completed! Score: ${evaluation.percentageScore}%`, 'success');
    }, 600);
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const markedCount = Object.values(markedForReview).filter(Boolean).length;
  const currentQ = questions[currentIndex];

  // -------------------------------------------------------------
  // VIEW: INTRO SCREEN
  // -------------------------------------------------------------
  if (examState === 'intro') {
    return (
      <div className="min-h-[85vh] bg-slate-900 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="border-b border-slate-800 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
              <Award className="w-3.5 h-3.5" />
              Academic Diagnostic Assessment
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {studentSemester} Technical Knowledge Diagnostic
            </h1>
            <p className="mt-2 text-slate-400 text-sm">
              Standardized departmental assessment for <span className="text-slate-200 font-medium">{profile.department}</span>.
              Completing this diagnostic benchmark elevates your verified competencies and placement readiness.
            </p>
          </div>

          {/* Student Profile Overview Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Candidate</span>
              <p className="text-base font-semibold text-white mt-1">{profile.name}</p>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{profile.registerNumber || profile.id || 'N/A'}</p>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Current Semester</span>
              <p className="text-base font-semibold text-emerald-400 mt-1">{studentSemester}</p>
              <p className="text-xs text-slate-400 mt-0.5">CGPA: {profile.cgpa.toFixed(2)}</p>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Diagnostic Duration</span>
              <p className="text-base font-semibold text-white mt-1">15 Minutes</p>
              <p className="text-xs text-slate-400 mt-0.5">12 Core Technical Questions</p>
            </div>
          </div>

          {/* Syllabus / Curriculum Covered */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              Curriculum Core Subjects Assessed
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {subjects.map((sub) => (
                <div key={sub.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-mono text-indigo-400 uppercase font-semibold">{sub.code}</div>
                    <h3 className="text-sm font-semibold text-white mt-1">{sub.name}</h3>
                    <ul className="mt-3 space-y-1.5 text-xs text-slate-400">
                      {sub.topics.slice(0, 3).map((topic, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/60" />
                          {topic}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-wrap gap-1">
                    {sub.skillsTrained.map((skill, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Diagnostic Impact Rules */}
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-5 flex items-start gap-4">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1 text-sm">
              <h3 className="font-semibold text-emerald-300">Verified Assessment Certification</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Scoring 60% or higher directly verifies your technical competency ratings from <em>Self-Reported</em> to
                <span className="text-emerald-400 font-semibold"> Verified Assessment</span> on your placement profile,
                directly boosting your institutional readiness score for Super Dream recruitment.
              </p>
            </div>
          </div>

          {/* Action CTA */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleStartExam}
              disabled={isLoadingQuestions}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-white transition-all shadow-lg shadow-indigo-600/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isLoadingQuestions ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating Exam Paper...
                </>
              ) : (
                <>
                  Begin Diagnostic Assessment
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: SUBMITTING STATE
  // -------------------------------------------------------------
  if (examState === 'submitting') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-slate-900 text-slate-100 p-6">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
            <RefreshCw className="w-8 h-8 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-white">Grading Technical Assessment</h2>
          <p className="text-sm text-slate-400">
            Evaluating your responses across DBMS, Operating Systems, and Networks, and compiling your competency verification report...
          </p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: ACTIVE EXAM ROOM
  // -------------------------------------------------------------
  if (examState === 'active' && currentQ) {
    const isAnswered = answers[currentQ.id] !== undefined;
    const isMarked = !!markedForReview[currentQ.id];
    const isUrgent = timeRemainingSeconds < 180;

    return (
      <div className="min-h-[90vh] bg-slate-950 text-slate-100 flex flex-col">
        {/* Top Floating Control Bar */}
        <header className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono font-semibold">
              {studentSemester} Exam
            </div>
            <span className="text-slate-400 text-xs hidden sm:inline">
              Question <strong className="text-white">{currentIndex + 1}</strong> of {questions.length}
            </span>
          </div>

          {/* Countdown Timer */}
          <div
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-mono font-bold transition-colors ${
              isUrgent
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-400 animate-pulse'
                : 'bg-slate-800 border-slate-700 text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            {formatTimer(timeRemainingSeconds)}
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMarkForReview}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                isMarked
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isMarked ? 'fill-amber-400' : ''}`} />
              <span className="hidden sm:inline">{isMarked ? 'Marked' : 'Mark for Review'}</span>
            </button>

            <button
              onClick={() => setShowSubmitModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
            >
              Submit Exam
            </button>
          </div>
        </header>

        {/* Main Exam Content Layout */}
        <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question & Options Area (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
              {/* Question Subject & Meta Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {currentQ.subject}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Topic: {currentQ.topic}</span>
                </div>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded font-semibold uppercase ${
                    currentQ.difficulty === 'hard'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}
                >
                  {currentQ.difficulty}
                </span>
              </div>

              {/* Question Text */}
              <div className="space-y-4">
                <h2 className="text-lg sm:text-xl font-medium text-white leading-relaxed">
                  <span className="font-mono text-indigo-400 mr-2 font-bold">{currentIndex + 1}.</span>
                  {currentQ.question}
                </h2>

                {/* Optional Code Snippet */}
                {currentQ.codeSnippet && (
                  <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs sm:text-sm text-slate-300 overflow-x-auto">
                    <div className="flex items-center gap-2 text-slate-500 text-[10px] mb-2 uppercase font-semibold">
                      <Code2 className="w-3.5 h-3.5" /> Code Snippet / Context
                    </div>
                    <pre className="text-emerald-400 font-mono">{currentQ.codeSnippet}</pre>
                  </div>
                )}
              </div>

              {/* Options List */}
              <div className="space-y-3 pt-2">
                {currentQ.options.map((option, optIdx) => {
                  const isSelected = answers[currentQ.id] === optIdx;
                  const optionLetters = ['A', 'B', 'C', 'D'];

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 ${
                        isSelected
                          ? 'bg-indigo-600/15 border-indigo-500/80 text-white shadow-sm shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800/80 hover:border-slate-600'
                      }`}
                    >
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-800 border border-slate-700 text-slate-400'
                        }`}
                      >
                        {optionLetters[optIdx]}
                      </span>
                      <span className="text-sm font-medium leading-relaxed pt-0.5">{option}</span>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                <button
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {isAnswered && (
                    <button
                      onClick={() => {
                        const copy = { ...answers };
                        delete copy[currentQ.id];
                        setAnswers(copy);
                      }}
                      className="text-xs text-slate-400 hover:text-slate-200 underline font-medium px-2 py-1"
                    >
                      Clear Selection
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (currentIndex < questions.length - 1) {
                        setCurrentIndex((prev) => prev + 1);
                      } else {
                        setShowSubmitModal(true);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
                  >
                    {currentIndex === questions.length - 1 ? 'Review & Submit' : 'Next Question'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Question Palette (1 col) */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Question Palette</h3>
                <span className="text-xs font-mono text-slate-400">
                  {answeredCount}/{questions.length} Answered
                </span>
              </div>

              {/* Grid of question buttons */}
              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 gap-2.5">
                {questions.map((q, idx) => {
                  const answered = answers[q.id] !== undefined;
                  const marked = !!markedForReview[q.id];
                  const isCurrent = idx === currentIndex;

                  let colorClass = 'bg-slate-800/80 border-slate-700 text-slate-400 hover:border-slate-500';
                  if (answered && marked) {
                    colorClass = 'bg-amber-600/30 border-amber-500 text-amber-300 font-bold';
                  } else if (answered) {
                    colorClass = 'bg-emerald-600/30 border-emerald-500 text-emerald-300 font-bold';
                  } else if (marked) {
                    colorClass = 'bg-purple-600/30 border-purple-500 text-purple-300 font-bold';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-9 rounded-xl border text-xs font-mono font-bold flex items-center justify-center transition-all ${colorClass} ${
                        isCurrent ? 'ring-2 ring-indigo-400 scale-105' : ''
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Status Legend */}
              <div className="space-y-2 pt-3 border-t border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-emerald-500/40 border border-emerald-500" />
                  <span className="text-slate-300">Answered ({answeredCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-purple-500/40 border border-purple-500" />
                  <span className="text-slate-300">Marked for Review ({markedCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700" />
                  <span className="text-slate-400">Unanswered ({questions.length - answeredCount})</span>
                </div>
              </div>
            </div>

            {/* Quick Candidate Summary */}
            <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-4 text-xs space-y-2">
              <span className="font-semibold text-slate-300">Student Reference:</span>
              <p className="text-slate-400 font-medium">{profile.name}</p>
              <p className="text-slate-500 font-mono">{profile.registerNumber}</p>
            </div>
          </div>
        </div>

        {/* Submit Confirmation Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Ready to Submit Assessment?</h3>
                <p className="text-xs text-slate-400">
                  You have answered <strong className="text-white">{answeredCount}</strong> out of{' '}
                  <strong className="text-white">{questions.length}</strong> questions.
                  {questions.length - answeredCount > 0 && (
                    <span className="text-rose-400 block mt-1">
                      ⚠️ You still have {questions.length - answeredCount} unanswered questions!
                    </span>
                  )}
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Return to Exam
                </button>
                <button
                  onClick={handleSubmitExam}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20"
                >
                  Yes, Submit Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: RESULTS & SCORECARD
  // -------------------------------------------------------------
  if (examState === 'results' && result) {
    const isPassing = result.percentageScore >= 60;
    const srmGrade =
      result.percentageScore >= 90
        ? 'S'
        : result.percentageScore >= 75
        ? 'A+'
        : result.percentageScore >= 60
        ? 'A'
        : 'B';

    return (
      <div className="min-h-[85vh] bg-slate-900 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Banner */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Award className="w-3.5 h-3.5" />
                  {studentSemester} Technical Diagnostic Completed
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Assessment Scorecard & Verification Report
                </h1>
                <p className="text-slate-400 text-xs sm:text-sm">
                  Candidate: <span className="text-slate-200 font-semibold">{profile.name}</span> •{' '}
                  <span className="font-mono text-slate-300">{profile.registerNumber}</span>
                </p>
              </div>

              {/* Overall Score Badge */}
              <div className="flex items-center gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shrink-0">
                <div className="text-center pr-3 border-r border-slate-800">
                  <div className="text-3xl font-black text-indigo-400">{result.percentageScore}%</div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black text-emerald-400">{srmGrade}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">SRM Grade</div>
                </div>
              </div>
            </div>

            {/* Profile Impact Alert */}
            <div
              className={`p-4 rounded-2xl border flex items-start gap-3.5 text-xs ${
                isPassing
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                  : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg shrink-0 ${
                  isPassing ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                {isPassing ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm">
                  {isPassing
                    ? 'Verified Competencies Successfully Updated!'
                    : 'Remediation Recommended for Core Subjects'}
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  {isPassing
                    ? `Matching semester technical skills (PostgreSQL, OS Concurrency, Networking) have been upgraded to "Verified Assessment" on your Career Plan. Your institutional readiness score has been elevated.`
                    : `Your score is below the 60% verification threshold. Review the questions and concept explanations below, and retake the diagnostic to certify your competencies.`}
                </p>
              </div>
            </div>

            {/* Subject Performance Breakdown Bars */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                Subject-Wise Proficiency Breakdown
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.subjectScores.map((sub, i) => (
                  <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200 truncate pr-2">{sub.subject}</span>
                      <span className="font-mono font-bold text-indigo-400">{sub.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          sub.percentage >= 75
                            ? 'bg-emerald-500'
                            : sub.percentage >= 50
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                        style={{ width: `${sub.percentage}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-slate-400 flex justify-between">
                      <span>Correct: {sub.correct}/{sub.total}</span>
                      <span>{sub.percentage >= 75 ? 'Proficient' : sub.percentage >= 50 ? 'Moderate' : 'Needs Focus'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Question-by-Question Detailed Review */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-400" />
                Question Analysis & Concept Solutions
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                {result.correctAnswers} of {result.totalQuestions} Correct
              </span>
            </div>

            <div className="space-y-4">
              {result.reviewedQuestions.map((q, idx) => {
                const userChoice = result.answers[q.id];
                const isCorrect = userChoice === q.correctIndex;
                const isUnanswered = userChoice === undefined;

                return (
                  <div
                    key={q.id}
                    className={`bg-slate-950 border rounded-2xl p-5 sm:p-6 space-y-4 transition-all ${
                      isCorrect
                        ? 'border-emerald-500/30'
                        : isUnanswered
                        ? 'border-slate-800'
                        : 'border-rose-500/30'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isCorrect
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : isUnanswered
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {isCorrect ? <Check className="w-3.5 h-3.5" /> : isUnanswered ? '?' : <X className="w-3.5 h-3.5" />}
                        </span>
                        <span className="text-xs font-semibold text-indigo-400 font-mono">
                          Question {idx + 1} • {q.subject}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                        {q.topic}
                      </span>
                    </div>

                    {/* Question Statement */}
                    <p className="text-sm font-medium text-slate-200">{q.question}</p>

                    {/* Code Snippet if present */}
                    {q.codeSnippet && (
                      <div className="bg-slate-900 p-3 rounded-lg font-mono text-xs text-emerald-400 border border-slate-800">
                        <pre>{q.codeSnippet}</pre>
                      </div>
                    )}

                    {/* Options Review */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                      {q.options.map((opt, optIdx) => {
                        const isThisCorrect = optIdx === q.correctIndex;
                        const isThisChosen = optIdx === userChoice;

                        let badgeStyle = 'bg-slate-900/50 border-slate-800 text-slate-400';
                        if (isThisCorrect) {
                          badgeStyle = 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300 font-semibold';
                        } else if (isThisChosen && !isThisCorrect) {
                          badgeStyle = 'bg-rose-950/40 border-rose-500/60 text-rose-300 line-through';
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${badgeStyle}`}
                          >
                            <span>{opt}</span>
                            {isThisCorrect && (
                              <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold shrink-0">
                                Correct Answer
                              </span>
                            )}
                            {isThisChosen && !isThisCorrect && (
                              <span className="text-[10px] font-mono uppercase text-rose-400 font-bold shrink-0">
                                Your Choice
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Conceptual Explanation */}
                    <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-3.5 text-xs text-slate-300 space-y-1">
                      <span className="font-bold text-indigo-300 block">Technical Concept & Rationale:</span>
                      <p className="leading-relaxed text-slate-300">{q.explanation}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                setExamState('intro');
                setResult(null);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retake Semester Diagnostic
            </button>

            <button
              onClick={() => onNavigate?.('career-plan')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.01]"
            >
              View Updated Career Plan & Verified Skills
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
