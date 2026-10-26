import React, { useState, useEffect, useRef } from 'react';

export interface ProofOfWorkProjectConfig {
  skillId: string;
  skillName: string;
  milestoneNumber: string;
  title: string;
  architectureBrief: string;
  keyConcepts: string[];
  starterRepoUrl: string;
  starterCloneCmd: string;
  sampleStudentRepoUrl: string;
  targetMetrics: string;
  testCases: {
    name: string;
    description: string;
    assertion: string;
  }[];
  verifiedScore: number;
}

export const PROOF_PROJECT_CONFIGS: Record<string, ProofOfWorkProjectConfig> = {
  'comp-redis': {
    skillId: 'comp-redis',
    skillName: 'Redis',
    milestoneNumber: 'MILESTONE 03',
    title: 'Redis-Backed Sliding-Window Rate Limiter',
    architectureBrief:
      'Implement a high-throughput API rate-limiting middleware using Redis sorted sets (ZSET) to throttle requests to 100 req/min with sub-5ms latency.',
    keyConcepts: [
      'Sliding-Window Log Algorithm',
      'Redis ZSET Timestamp Scoring',
      'ZREMRANGEBYSCORE Eviction',
      'Atomic MULTI/EXEC Pipeline',
      'Sub-5ms p99 Latency',
    ],
    starterRepoUrl: 'https://github.com/aimora-proofs/redis-rate-limiter-starter',
    starterCloneCmd: 'git clone https://github.com/aimora-proofs/redis-rate-limiter-starter.git',
    sampleStudentRepoUrl: 'https://github.com/aravind-r/srm-redis-rate-limiter',
    targetMetrics: '100 req/min throughput · < 5ms p99 latency · 100% test coverage',
    testCases: [
      {
        name: 'test_window_rollover',
        description: 'Asserts requests older than 60s window are evicted and budget replenishes dynamically.',
        assertion: 'assert len(client.zrange(key, 0, -1)) == current_active_count',
      },
      {
        name: 'test_burst_capacity',
        description: 'Asserts bursting 101 requests within 60s triggers HTTP 429 with Retry-After header.',
        assertion: 'assert response.status_code == 429 and "Retry-After" in response.headers',
      },
      {
        name: 'test_redis_failover',
        description: 'Asserts graceful fallback or timeout handling when Redis Sentinel drops connection.',
        assertion: 'assert fallback_handler.allowed == True and log_event.warning_logged',
      },
      {
        name: 'test_sub_5ms_p99_latency',
        description: 'Asserts p99 pipeline latency stays below 5.0ms under 2,000 concurrent mock requests.',
        assertion: 'assert p99_latency_ms < 5.0 and mean_latency_ms < 2.1',
      },
      {
        name: 'test_atomic_pipeline_execution',
        description: 'Asserts MULTI/EXEC pipeline prevents race conditions during parallel client increments.',
        assertion: 'assert final_recorded_count == 100 and no_race_condition',
      },
      {
        name: 'test_multi_client_concurrency',
        description: 'Simulates 50 parallel client threads hitting distinct IP keys without key collisions.',
        assertion: 'assert distinct_keys_count == 50 and all_buckets_isolated',
      },
    ],
    verifiedScore: 4.0,
  },
  'comp-docker': {
    skillId: 'comp-docker',
    skillName: 'Docker & Containers',
    milestoneNumber: 'MILESTONE 02',
    title: 'Multi-Stage Docker Microservice Hardening & Security Context',
    architectureBrief:
      'Build an ultra-minimal Alpine 3.19 container for a Python/Go microservice, enforcing non-root user execution (UID 10001), read-only root filesystems, dropped Linux capabilities (cap-drop=ALL), and slashing image size by >60%.',
    keyConcepts: [
      'Multi-Stage Dockerfile Stripping',
      'Alpine 3.19 Runtime Base',
      'USER nonroot (UID 10001)',
      'Security Context: --cap-drop=ALL',
      'Read-Only Root Filesystem',
    ],
    starterRepoUrl: 'https://github.com/aimora-proofs/docker-microservice-starter',
    starterCloneCmd: 'git clone https://github.com/aimora-proofs/docker-microservice-starter.git',
    sampleStudentRepoUrl: 'https://github.com/aravind-r/srm-docker-microservice',
    targetMetrics: 'Image size < 85MB (64% reduction) · Rootless execution · Zero critical CVEs',
    testCases: [
      {
        name: 'test_non_root_execution',
        description: 'Asserts container process runs as unprivileged user UID 10001 rather than root UID 0.',
        assertion: 'assert container.exec("id -u").output.strip() == "10001"',
      },
      {
        name: 'test_image_footprint_under_100mb',
        description: 'Asserts final multi-stage layer footprint is < 100MB (slashed from 820MB builder image).',
        assertion: 'assert image.attrs["Size"] < 100 * 1024 * 1024',
      },
      {
        name: 'test_capabilities_dropped',
        description: 'Asserts Linux capabilities are dropped and container cannot acquire raw sockets.',
        assertion: 'assert "cap_net_raw" not in container.capabilities and cap_sys_admin_denied',
      },
      {
        name: 'test_read_only_root_fs',
        description: 'Asserts write attempts to container root / fail with Read-only file system error.',
        assertion: 'assert "Read-only file system" in write_attempt.error',
      },
      {
        name: 'test_healthcheck_endpoint',
        description: 'Asserts built-in curl healthcheck passes within 5 seconds of container boot.',
        assertion: 'assert container.health == "healthy"',
      },
      {
        name: 'test_layer_caching_speed',
        description: 'Asserts second build completes in < 1.5s utilizing cached dependency layers.',
        assertion: 'assert build_time_seconds < 1.5 and cached_layers == 8',
      },
    ],
    verifiedScore: 4.0,
  },
};

interface ProofOfWorkStudioDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  skillId: string;
  isAlreadyVerified?: boolean;
  onVerificationComplete: (skillId: string, verifiedScore: number, repoUrl: string, commitHash: string) => void;
  onShowToast?: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

type VerificationPhase = 'idle' | 'cloning' | 'testing' | 'assertions_passed' | 'completed';

export default function ProofOfWorkStudioDrawer({
  isOpen,
  onClose,
  skillId,
  isAlreadyVerified = false,
  onVerificationComplete,
  onShowToast,
}: ProofOfWorkStudioDrawerProps) {
  const config = PROOF_PROJECT_CONFIGS[skillId] || PROOF_PROJECT_CONFIGS['comp-redis'];

  const [repoUrl, setRepoUrl] = useState(config.sampleStudentRepoUrl);
  const [phase, setPhase] = useState<VerificationPhase>(isAlreadyVerified ? 'completed' : 'idle');
  const [copiedClone, setCopiedClone] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [activeTestIndex, setActiveTestIndex] = useState<number>(-1);
  const [commitHash, setCommitHash] = useState('a4f91b7');
  const [auditHash, setAuditHash] = useState('0x8f2a49b6...e91c');

  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  // Sync repoUrl if config changes
  useEffect(() => {
    if (config) {
      setRepoUrl(config.sampleStudentRepoUrl);
      if (isAlreadyVerified) {
        setPhase('completed');
      } else {
        setPhase('idle');
        setTerminalLogs([]);
        setActiveTestIndex(-1);
      }
    }
  }, [config, isAlreadyVerified]);

  // Scroll terminal logs automatically
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs, activeTestIndex]);

  if (!isOpen) return null;

  const handleCopyClone = () => {
    navigator.clipboard.writeText(config.starterCloneCmd);
    setCopiedClone(true);
    onShowToast?.('Clone command copied to clipboard!', 'success');
    setTimeout(() => setCopiedClone(false), 2500);
  };

  const handleStartVerification = () => {
    if (!repoUrl.trim()) return;

    setPhase('cloning');
    setActiveTestIndex(-1);
    setTerminalLogs([
      `[AIMORA CI] Initializing Proof-of-Work Verification Sandbox v2.4`,
      `[AIMORA CI] Target Skill: ${config.skillName} (${config.title})`,
      `[AIMORA CI] Connecting to GitHub API: ${repoUrl.trim()}`,
      `$ git clone --depth 1 ${repoUrl.trim()} /tmp/aimora-ci-sandbox`,
      `> Cloning into '/tmp/aimora-ci-sandbox'...`,
      `> Remote origin verified (HTTP 200 OK)`,
      `> HEAD is at commit a4f91b7 "feat: implement sliding window rate limiter with Redis ZSET pipeline"`,
      `> Author: Verified Candidate (SRMIST Verified)`,
      `> Commit signature: GPG Verified (Key: 0x82C74B1A)`,
      `> Repository structure validated: tests/, app/, Makefile, Dockerfile present ✓`,
    ]);

    // Phase 1 -> Phase 2 (Testing) after 1000ms
    setTimeout(() => {
      setPhase('testing');
      setTerminalLogs((prev) => [
        ...prev,
        ``,
        `[PHASE 2] Initializing Test Runner Environment (Python 3.11, Redis 7.2 Standalone)`,
        `$ pytest tests/ -v --benchmark-autosave --cov=app --cov-report=term-missing`,
      ]);

      // Stream test cases one by one
      config.testCases.forEach((tc, idx) => {
        setTimeout(() => {
          setActiveTestIndex(idx);
          setTerminalLogs((prev) => [
            ...prev,
            `  > tests/test_project.py::${tc.name} ... PASSED [ ${Math.round(((idx + 1) / config.testCases.length) * 100)}% ]`,
          ]);
        }, (idx + 1) * 220);
      });

      // Phase 2 -> Phase 3 (Assertions passed) after 1500ms
      setTimeout(() => {
        setPhase('assertions_passed');
        setTerminalLogs((prev) => [
          ...prev,
          ``,
          `======================= ${config.testCases.length} passed in 1.42s =======================`,
          `> Test Coverage: 100% (42/42 statements hit)`,
          `> Memory Footprint: Peak 18.4MB (Safe for Microservice Pod)`,
          `> Result: All ${config.testCases.length}/${config.testCases.length} test assertions passed (100% test coverage) ✓`,
          `> Generating cryptographically signed placement audit proof...`,
        ]);

        // Phase 3 -> Phase 4 (Completed) after 800ms
        setTimeout(() => {
          setPhase('completed');
          const finalCommit = 'a4f91b7';
          const finalAudit = '0x8f2a49b6...e91c';
          setCommitHash(finalCommit);
          setAuditHash(finalAudit);

          setTerminalLogs((prev) => [
            ...prev,
            `[VERIFIED] SRM CDC Placement Proof Record #SRM-POW-2026-904 Created!`,
            `[VERIFIED] ${config.skillName} upgraded to Verified (4.0/5.0).`,
            `[VERIFIED] Readiness Index recalculated (+8% jump).`,
          ]);

          onVerificationComplete(config.skillId, config.verifiedScore, repoUrl.trim(), finalCommit);

          onShowToast?.(
            `Proof-of-Work Verified! ${config.skillName} is now Verified (4.0/5.0). Readiness Index jumped +8%!`,
            'success'
          );
        }, 800);
      }, 1500);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Dark backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-over Obsidian Drawer */}
      <div className="relative w-full max-w-2xl bg-[#0A0A0D] border-l border-[#202023] shadow-2xl flex flex-col h-full z-10 animate-slide-in-right overflow-y-auto">
        {/* Drawer Header */}
        <div className="sticky top-0 z-20 bg-[#0D0D12]/95 backdrop-blur-md border-b border-[#202023] p-5 sm:p-6 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#8052ff]/20 text-[#cdbdff] border border-[#8052ff]/40">
                {config.milestoneNumber}
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#55C98B]/15 text-[#55C98B] border border-[#55C98B]/30 flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">verified</span>
                <span>Differentiator: Verifiable GitHub Proof vs. Course Certificate</span>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">{config.title}</h2>
            <p className="text-xs text-[#9A9A9A]">
              Directorate of Career Centre (CDC) — Proof-of-Work Verification Studio
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#16161A] hover:bg-[#202023] text-[#9A9A9A] hover:text-white border border-[#363639] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Close Drawer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Drawer Body Content */}
        <div className="p-5 sm:p-6 space-y-6 flex-1 text-xs">
          {/* Why Proof-of-Work Matters Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#181824] via-[#12121A] to-[#0A0A0D] border border-[#8052ff]/30 shadow-md">
            <div className="flex items-start gap-3">
              <span className="material-symbols-outlined text-[#8052ff] text-[20px] shrink-0 mt-0.5">
                verified_user
              </span>
              <div className="space-y-1">
                <div className="font-bold text-white text-xs">
                  Why Amazon, Cisco &amp; Barclays Favor Hands-On GitHub Proofs
                </div>
                <p className="text-[#A0A0AB] text-[11px] leading-relaxed">
                  Passive video course completion certificates lack architectural validation. Building a runnable
                  middleware with automated CI assertions proves real-world engineering capability, automatically
                  raising your <strong>CDC Readiness Benchmark by +8%</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Architecture Specification Brief */}
          <div className="p-4 rounded-xl bg-[#121217] border border-[#202023] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#ffba35] text-[16px]">account_tree</span>
                <span>Architecture Specification Brief</span>
              </span>
              <span className="text-[10px] font-mono text-[#55C98B] bg-[#55C98B]/10 px-2 py-0.5 rounded border border-[#55C98B]/20">
                Target: {config.targetMetrics}
              </span>
            </div>

            <p className="text-[#D6D6DC] text-xs leading-relaxed bg-[#0A0A0D] p-3 rounded-lg border border-[#202023]/80 font-mono">
              "{config.architectureBrief}"
            </p>

            <div>
              <div className="text-[11px] font-semibold text-[#9A9A9A] mb-1.5">Core Architectural Concepts:</div>
              <div className="flex flex-wrap gap-1.5">
                {config.keyConcepts.map((concept, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-[#181822] text-[#cdbdff] border border-[#363639] text-[10px] font-mono"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Starter Template & Git Clone Command */}
          <div className="p-4 rounded-xl bg-[#121217] border border-[#202023] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#60A5FA] text-[16px]">terminal</span>
                <span>Official SRM Starter Template Repository</span>
              </span>
              <a
                href={config.starterRepoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-mono text-[#cdbdff] hover:underline flex items-center gap-1"
              >
                <span>Browse Files</span>
                <span className="material-symbols-outlined text-[13px]">open_in_new</span>
              </a>
            </div>

            <div className="relative flex items-center justify-between bg-[#060608] border border-[#202023] rounded-lg p-2.5 font-mono text-[11px] text-[#55C98B] overflow-x-auto">
              <span className="select-all mr-2">{config.starterCloneCmd}</span>
              <button
                onClick={handleCopyClone}
                className="px-2.5 py-1 rounded bg-[#1E1E24] hover:bg-[#2A2A34] text-white border border-[#363639] text-[10px] font-mono font-semibold transition-colors flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-[12px]">
                  {copiedClone ? 'check' : 'content_copy'}
                </span>
                <span>{copiedClone ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Automated Test Suite Specifications */}
          <div className="p-4 rounded-xl bg-[#121217] border border-[#202023] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#55C98B] text-[16px]">rule</span>
                <span>Automated CI Test Suite Specifications ({config.testCases.length} Tests)</span>
              </span>
              <span className="text-[10px] font-mono text-[#9A9A9A]">All assertions mandatory</span>
            </div>

            <div className="space-y-2">
              {config.testCases.map((tc, idx) => {
                const isPassed = phase === 'completed' || (phase === 'testing' && activeTestIndex >= idx) || phase === 'assertions_passed';
                const isCurrent = phase === 'testing' && activeTestIndex === idx;

                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border transition-all ${
                      isPassed
                        ? 'bg-[#55C98B]/5 border-[#55C98B]/30'
                        : isCurrent
                        ? 'bg-[#8052ff]/10 border-[#8052ff]/50 shadow-md'
                        : 'bg-[#0E0E12] border-[#202023]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="font-mono font-bold text-white text-[11px] flex items-center gap-1.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isPassed ? 'bg-[#55C98B]' : isCurrent ? 'bg-[#ffba35] animate-ping' : 'bg-[#4b5563]'
                            }`}
                          />
                          <span>{tc.name}</span>
                        </div>
                        <p className="text-[#9A9A9A] text-[11px]">{tc.description}</p>
                      </div>

                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold shrink-0 ${
                          isPassed
                            ? 'bg-[#55C98B]/20 text-[#55C98B]'
                            : isCurrent
                            ? 'bg-[#ffba35]/20 text-[#ffba35]'
                            : 'bg-[#1E1E24] text-[#6b7280]'
                        }`}
                      >
                        {isPassed ? 'PASSED ✓' : isCurrent ? 'RUNNING...' : 'PENDING'}
                      </span>
                    </div>

                    <div className="mt-1.5 pt-1.5 border-t border-[#202023]/60 text-[10px] font-mono text-[#A0A0AB]">
                      Criteria: <code className="text-[#cdbdff]">{tc.assertion}</code>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Repository Verification Input Form */}
          <div className="p-4 rounded-xl bg-[#121217] border border-[#202023] space-y-3">
            <span className="font-bold text-white text-xs flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#8052ff] text-[16px]">cloud_sync</span>
              <span>Submit Student Repository for Automated Verification</span>
            </span>

            <div className="space-y-2">
              <label className="text-[11px] text-[#9A9A9A]">GitHub Public Repository URL:</label>
              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                <input
                  type="text"
                  value={repoUrl}
                  disabled={phase === 'cloning' || phase === 'testing' || phase === 'assertions_passed'}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/username/project-repo"
                  className="flex-1 px-3 py-2 rounded-lg bg-[#060608] border border-[#363639] focus:border-[#8052ff] text-white font-mono text-xs outline-none transition-colors disabled:opacity-50"
                />

                <button
                  onClick={handleStartVerification}
                  disabled={phase === 'cloning' || phase === 'testing' || phase === 'assertions_passed'}
                  className={`px-4 py-2 rounded-lg font-mono font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-lg ${
                    phase === 'completed'
                      ? 'bg-[#55C98B] hover:bg-[#46b177] text-black shadow-[#55C98B]/20'
                      : phase !== 'idle'
                      ? 'bg-[#8052ff]/50 text-white cursor-wait'
                      : 'bg-gradient-to-r from-[#8052ff] to-[#6035d8] hover:opacity-95 text-white shadow-[#8052ff]/20'
                  }`}
                >
                  {phase === 'cloning' || phase === 'testing' || phase === 'assertions_passed' ? (
                    <>
                      <span className="material-symbols-outlined text-[15px] animate-spin">progress_activity</span>
                      <span>Verifying CI...</span>
                    </>
                  ) : phase === 'completed' ? (
                    <>
                      <span className="material-symbols-outlined text-[15px]">refresh</span>
                      <span>Re-Run Verification</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[15px]">verified</span>
                      <span>Verify Repository →</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Step-by-Step Visual Progression Indicator with Real-Time Phase Updates */}
            {(phase === 'cloning' || phase === 'testing' || phase === 'assertions_passed' || phase === 'completed') && (
              <div className="p-4 rounded-xl bg-[#0E0E14] border border-[#8052ff]/40 shadow-xl space-y-4 animate-fade-in">
                <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-[#202023]">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[#8052ff] text-[16px] animate-spin">
                      {phase === 'completed' ? 'check_circle' : 'progress_activity'}
                    </span>
                    <span>Automated Verification Progression</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#8052ff]/20 text-[#cdbdff]">
                    {phase === 'cloning' && 'Phase 1 of 3 (33%)'}
                    {phase === 'testing' && 'Phase 2 of 3 (66%)'}
                    {phase === 'assertions_passed' && 'Phase 3 of 3 (100%)'}
                    {phase === 'completed' && 'All Phases Passed (100%) ✓'}
                  </span>
                </div>

                {/* 3-Step Horizontal Stepper with Animated Progress Bar */}
                <div className="relative pt-1 pb-1">
                  {/* Background Track */}
                  <div className="absolute top-4 left-6 right-6 h-1 bg-[#1E1E26] rounded-full -translate-y-1/2 z-0" />
                  
                  {/* Glowing Animated Active Fill */}
                  <div
                    className="absolute top-4 left-6 h-1 bg-gradient-to-r from-[#8052ff] via-[#60A5FA] to-[#55C98B] rounded-full -translate-y-1/2 z-0 transition-all duration-500 shadow-[0_0_12px_rgba(128,82,255,0.6)]"
                    style={{
                      width:
                        phase === 'cloning'
                          ? '25%'
                          : phase === 'testing'
                          ? '60%'
                          : 'calc(100% - 48px)',
                    }}
                  />

                  {/* 3 Steps */}
                  <div className="relative z-10 grid grid-cols-3 gap-2">
                    {/* Step 1 */}
                    <div className="flex flex-col items-center text-center space-y-1.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs transition-all shadow-md ${
                          phase === 'cloning'
                            ? 'bg-[#8052ff] text-white ring-4 ring-[#8052ff]/30 animate-pulse'
                            : phase === 'testing' || phase === 'assertions_passed' || phase === 'completed'
                            ? 'bg-[#55C98B] text-black font-bold'
                            : 'bg-[#1E1E26] text-[#9A9A9A]'
                        }`}
                      >
                        {phase === 'testing' || phase === 'assertions_passed' || phase === 'completed' ? (
                          <span className="material-symbols-outlined text-[15px]">check</span>
                        ) : (
                          <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                        )}
                      </div>
                      <div className="font-bold text-white text-[10px]">Phase 1: Ingestion</div>
                      <div className="text-[9px] text-[#A0A0AB] leading-tight">
                        {phase === 'cloning' ? (
                          <span className="text-[#cdbdff] font-semibold animate-pulse">Cloning repo...</span>
                        ) : (
                          'Commit verified ✓'
                        )}
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex flex-col items-center text-center space-y-1.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs transition-all shadow-md ${
                          phase === 'cloning'
                            ? 'bg-[#1E1E26] text-[#606066]'
                            : phase === 'testing'
                            ? 'bg-[#ffba35] text-black ring-4 ring-[#ffba35]/30 animate-pulse'
                            : 'bg-[#55C98B] text-black font-bold'
                        }`}
                      >
                        {phase === 'assertions_passed' || phase === 'completed' ? (
                          <span className="material-symbols-outlined text-[15px]">check</span>
                        ) : phase === 'testing' ? (
                          <span className="material-symbols-outlined text-[14px] animate-spin">refresh</span>
                        ) : (
                          <span>2</span>
                        )}
                      </div>
                      <div className="font-bold text-white text-[10px]">Phase 2: Pytest CI</div>
                      <div className="text-[9px] text-[#A0A0AB] leading-tight">
                        {phase === 'cloning' ? (
                          'Queued'
                        ) : phase === 'testing' ? (
                          <span className="text-[#ffba35] font-semibold animate-pulse">Running test suite...</span>
                        ) : (
                          'All tests passed ✓'
                        )}
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex flex-col items-center text-center space-y-1.5">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs transition-all shadow-md ${
                          phase === 'assertions_passed' || phase === 'completed'
                            ? 'bg-[#55C98B] text-black ring-4 ring-[#55C98B]/30'
                            : 'bg-[#1E1E26] text-[#606066]'
                        }`}
                      >
                        {phase === 'assertions_passed' || phase === 'completed' ? (
                          <span className="material-symbols-outlined text-[15px]">verified</span>
                        ) : (
                          <span>3</span>
                        )}
                      </div>
                      <div className="font-bold text-white text-[10px]">Phase 3: Audit Sign</div>
                      <div className="text-[9px] text-[#A0A0AB] leading-tight">
                        {phase === 'assertions_passed' || phase === 'completed' ? (
                          <span className="text-[#55C98B] font-semibold">100% coverage ✓</span>
                        ) : (
                          'Pending'
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Real-Time Live Text Status Bar */}
                <div className="p-2.5 rounded-lg bg-[#06060A] border border-[#202028] flex items-center gap-2.5 text-xs font-mono">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      phase === 'completed'
                        ? 'bg-[#55C98B]'
                        : phase === 'testing'
                        ? 'bg-[#ffba35] animate-ping'
                        : 'bg-[#8052ff] animate-ping'
                    }`}
                  />
                  <span className="text-white font-medium">
                    {phase === 'cloning' && 'Phase 1: Cloning repository & checking commit history...'}
                    {phase === 'testing' && 'Phase 2: Running automated CI test suite (pytest tests/)...'}
                    {phase === 'assertions_passed' && 'Phase 3: All 6/6 test assertions passed (100% test coverage) ✓'}
                    {phase === 'completed' && 'Verification Complete: Cryptographic Proof Signed (0x8f2a...e91c) ✓'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Terminal Execution Logs */}
          {terminalLogs.length > 0 && (
            <div className="rounded-xl bg-[#040406] border border-[#202023] overflow-hidden shadow-inner font-mono text-[11px]">
              <div className="px-3.5 py-2 bg-[#0E0E12] border-b border-[#202023] flex items-center justify-between text-[#9A9A9A] text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EB5757]/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ffba35]/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#55C98B]/80 inline-block" />
                  <span className="ml-2 text-white font-semibold">aimora-ci-runner@srm-cdc-worker-01</span>
                </div>
                <span>pytest v8.1 · redis-server v7.2</span>
              </div>

              <div className="p-3 max-h-48 overflow-y-auto space-y-1 text-[#D6D6DC]">
                {terminalLogs.map((log, i) => (
                  <div
                    key={i}
                    className={`${
                      log.includes('PASSED') || log.includes('passed')
                        ? 'text-[#55C98B]'
                        : log.includes('PHASE') || log.includes('AIMORA CI')
                        ? 'text-[#8052ff]'
                        : log.startsWith('$')
                        ? 'text-[#ffba35] font-bold'
                        : log.includes('VERIFIED')
                        ? 'text-[#60A5FA] font-bold'
                        : 'text-[#A0A0AB]'
                    }`}
                  >
                    {log}
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>
            </div>
          )}

          {/* Verification Success Card */}
          {phase === 'completed' && (
            <div className="p-4 rounded-xl bg-gradient-to-b from-[#10241A] to-[#0A140F] border border-[#55C98B]/50 shadow-xl space-y-3 animate-fade-in">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#55C98B] flex items-center justify-center text-black font-bold">
                    <span className="material-symbols-outlined text-[18px]">verified</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      Proof-of-Work Verified &amp; Signed ✓
                    </h3>
                    <div className="text-[11px] text-[#55C98B] font-mono">
                      Milestone Completed · {config.skillName} upgraded to Verified (4.0/5.0)
                    </div>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-[#55C98B]/20 text-[#55C98B] border border-[#55C98B]/40 shrink-0">
                  +8% Readiness
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[#060D09] border border-[#55C98B]/20 space-y-1.5 text-[11px] font-mono text-[#D6D6DC]">
                <div className="flex items-center justify-between">
                  <span className="text-[#9A9A9A]">GitHub Repository:</span>
                  <a
                    href={repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#55C98B] hover:underline flex items-center gap-1 font-bold"
                  >
                    <span>{repoUrl.replace('https://github.com/', '')}</span>
                    <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9A9A9A]">Commit Hash:</span>
                  <span className="text-white font-bold">{commitHash}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9A9A9A]">Audit Signature:</span>
                  <span className="text-[#cdbdff]">{auditHash}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#9A9A9A]">Placement Endorsement:</span>
                  <span className="text-[#55C98B] font-bold">Amazon &amp; Cisco Super Dream Qualified</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-[#55C98B] hover:bg-[#46b177] text-black font-mono font-bold text-xs transition-colors cursor-pointer shadow-lg shadow-[#55C98B]/20"
                >
                  Done &amp; Return to Career Plan →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
