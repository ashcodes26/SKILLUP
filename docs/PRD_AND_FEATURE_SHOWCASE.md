# AIMORA — Product Requirements Document (PRD) & Feature Showcase
**Deterministic Placement Readiness & Skill-Gap Bridging Platform**  
*Tailored for SRM Institute of Science and Technology — Directorate of Career Centre (CDC)*  
*Version: 2.4.0 • October 2026 • Production Release*

---

## 1. Executive Summary & Vision

### 1.1 The Core Problem
In the Indian engineering campus ecosystem (and global higher education), **80%+ of engineering graduates are deemed unemployable for high-tier engineering roles despite high academic GPAs (8.5+ CGPA)**. 

Legacy placement platforms (and competitors like **Havelock**) suffer from fundamental flaws:
1. **Self-Reported Hallucination**: Students claim proficiency on static profiles; platforms assign arbitrary 0–100 scores without grounded proof.
2. **Generic EdTech Firehoses**: When a gap is detected, competitors recommend 40-hour generic video courses that students never finish.
3. **Disjointed Placement Disconnect**: Training tools operate in a vacuum, completely disconnected from institutional recruiters (CDC/Placement Cells) and real company cutoff gates.
4. **Passive & Text-Heavy Interfaces**: Students are overwhelmed by walls of developer jargon, disclaimers, and boring quizzes.

### 1.2 The AIMORA Solution
**AIMORA** is an institutional-grade, **evidence-grounded placement readiness engine**. It bridges the gap between student academic records and elite corporate hiring gates (Super Dream: ₹42 LPA Amazon / ₹24.5 LPA Cisco, Dream: ₹14 LPA Barclays) through:
- **Zero-Hallucination Competency Verification**: Missing skills are strictly marked `null` (never assumed 0 or estimated) until verified via interactive quizzes or sandbox Proof-of-Work code.
- **Cinematic Reactive Voice Interview Room**: Interactive voice avatar with real-time speech boundary synchronization, word-by-word glowing teleprompter subtitles, and institutional rubric scorecards.
- **Dynamic Multi-Role Market Radar**: Regional job market intelligence calculated using SerpApi real-world job posting distributions with mathematical priority ranking.
- **Surgical Resume Bullet Diffing**: Evidence-linked before/after diffs with single-click Accept/Reject/Undo actions and instant PDF/DOCX exports.
- **Closed-Loop Institutional Faculty Governance**: Live cohort telemetry for Placement Directors to monitor readiness, send automated nudges, and unlock drive eligibility.

---

## 2. Competitive Analysis: AIMORA vs. Havelock & Incumbents

| Capability / Dimension | Havelock & Generic Portals | AIMORA (Our Platform) | Why AIMORA Wins in Demos / Pitches |
| :--- | :--- | :--- | :--- |
| **Evidence Grounding** | Self-reported checklists or static multiple-choice questions. | **Proof-of-Work Studio Drawer & Interactive Assessment Gates**. | We don't believe claims; students build actual runnable solutions to unlock ratings. |
| **Skill Gap Representation** | Arbitrary percentages (e.g., "72% Python"). | **Strict `null` vs. Verified Depth (0.0 to 5.0)** with evidence badges. | Eliminates recruiter distrust. Unknown is unmeasured, never faked. |
| **Mock Interview Experience** | Static text bots or simple audio recording playback. | **Cinematic Reactive 3D Avatar with Word-by-Word Glowing Karaoke Subtitles**. | Visual & acoustic fidelity mimicking real high-pressure corporate interviews. |
| **Market Intelligence** | Stale static skills lists updated once a year. | **Live Multi-Role 6-Axis Radar with Formulaic Priority Engine**. | Mathematical prioritization: $\text{Demand} \times (1 + 0.5 \times \text{Req}) \times \text{Action Weight}$. |
| **Resume Optimization** | Generic rewrite dumps that rewrite the entire resume with AI hallucinations. | **Surgical Passage Diffs with Proof-of-Work Verification**. | Granular diff control: candidate reviews exact metrics (e.g., "reduced p99 latency from 420ms to 68ms"). |
| **Placement Gate Binding** | None. Pure B2C study tool. | **B2B Institutional CDC Placement Engine with Super Dream CTC Gates**. | Directly wired into institutional cutoffs (e.g., unlocking ₹42 LPA Amazon Super Dream drive). |
| **User Experience** | Cluttered, overwhelming text walls and dev jargon. | **Minimalism But Not Ordinary (Linear / Raycast Obsidian Dark UI)**. | High data density, ultra-fast Vite 8 architecture, responsive micro-animations. |

---

## 3. User Personas & Localized Profiles

### Persona A: Student Candidate
- **Name**: Aravind R. (Register No: `RA2211003010482`)
- **Institution**: SRM Institute of Science and Technology (SRMIST, Kattankulathur)
- **Cohort**: 7th Semester B.Tech Computer Science and Engineering (School of Computing, Batch 2022–2026)
- **Academic Standing**: CGPA `8.74 / 10.00`, 0 Standing Arrears (Cleared)
- **Target Tier**: Super Dream Placement (Amazon ₹42.0 LPA, Cisco Systems ₹24.5 LPA)
- **Primary Target Role**: Backend / Distributed Systems Engineer

### Persona B: Faculty Placement Director / CDC Coordinator
- **Name**: Dr. S. Soundararajan
- **Department**: Directorate of Career Centre (CDC) — SRMIST
- **Responsibility**: Overseeing 45+ B.Tech CSE candidates in Section A, ensuring 100% eligibility for Super Dream & Dream drives, auditing skill gaps before company visits.

---

## 4. Complete Feature List & Architectural Breakdown

### Module 1: Executive Command Hero & Competency Matrix (`CareerPlanScreen`)
- **Readiness Gauge**: Deterministic index calculated from verified competencies vs. target role weights.
- **Tabular CTC & Academic Badges**: Super Dream target (`₹42.0 LPA`), Current Academic CGPA (`8.74 / 10.00`), Standing Arrears (`0`), 10th/12th percentages (`92% / 89%`).
- **Interactive Competency Matrix**:
  - Filter Tabs: `All`, `Verified` (depth $\ge$ target), `Gaps` (unassessed or below cutoff).
  - Micro-action buttons: `[Take Assessment]` for instant quiz triggers, `[Build Proof-of-Work]` for coding challenges.
  - Interactive status badges: Amber for self-reported/needs assessment, Emerald for verified assessments, Crimson for critical company blockers.

### Module 2: AI Voice Interview Room with Teleprompter & Karaoke Highlight (`InterviewRoomScreen`)
- **Reactive Interviewer Avatar**: 5 dynamic states (`idle`, `listening`, `speaking`, `thinking`, `evaluated`) with animated acoustic equalizer waveforms.
- **Smooth Subtitle Fade-In**: Closed-captioning container animates into view on interviewer turn start (`animate-subtitle-fade-in`).
- **Word-by-Word Karaoke Glowing Subtitle Engine**:
  - SpeechSynthesis `boundary` event listener synchronizes speech audio with word indices.
  - Active word glows in lilac (`#cdbdff`) with ambient luminescence (`text-shadow: 0 0 12px rgba(205, 189, 255, 0.6)`).
  - Previously spoken words remain visible in crisp white; upcoming words remain hidden until vocalized.
  - Automated ticker timer fallback ensures smooth progression even in headless or muted browser environments.
- **Hands-Free Speech-to-Text Input**: Integrated Web Speech Recognition with a 2,000ms silence auto-submit countdown.
- **CDC Evaluation Scorecard Modal**: Comprehensive rubric evaluating Technical Depth, Communication, Behavioral STAR format, and specific remedial recommendations.

### Module 3: Proof-of-Work Studio Drawer (`ProofOfWorkStudioDrawer`)
- **Slide-out Code IDE Drawer**: Dedicated environment to submit verifiable technical artifacts for identified gaps (e.g., Redis distributed queue, Docker multi-stage build).
- **Automated Verification Harness**: Runs validation against architecture requirements, generating an instant verification certificate that updates profile proficiency to `4.0 Verified`.

### Module 4: Interactive Skill Dependency Tech-Tree (`SkillTechTreeModal`)
- **Prerequisite Graph Visualizer**: Interactive modal rendering node hierarchies (e.g., Redis Streams $\rightarrow$ Event Driven Systems $\rightarrow$ Distributed Consensus).
- **State Highlighting**: Locked nodes, in-progress targets, and verified prerequisites with glowing connector lines.

### Module 5: 6-Axis Market Demand Radar & Multi-Role Priority Engine (`SkillDemandScreen`)
- **SVG Radar Chart**: Dual-polygon visualization comparing evidenced candidate depth (0–100%) against live market demand (%).
- **Multi-Role Comparative Analysis**: Compare up to 3 engineering tracks simultaneously (Backend Systems, DevOps/Cloud, Data Engineering).
- **Deterministic Recommendation Priority Engine**:
  $$\text{Priority Score} = \text{Demand Fraction} \times (1 + 0.5 \times \text{Required Fraction}) \times \text{Action Weight}$$
  Categorizes skills into `Learn` (2.0x), `Assess` (1.5x), or `Maintain` (0.25x).

### Module 6: Surgical Resume Analyzer & Diff Workspace (`ResumeAnalyzerScreen`)
- **Split Diff Workspace**: Side-by-side view of original candidate resume vs. evidence-grounded revisions.
- **Granular Passage Diffing**: Individual `[Accept]`, `[Reject]`, and `[Undo]` actions for bullet suggestions.
- **Factual Integrity Guard**: Prohibits hallucinated metrics; guarantees numbers tie to verified coursework or Proof-of-Work labs.
- **Frictionless 1-Click Multi-Format Export**: Generates pre-formatted `.pdf`, `.docx`, and `.txt` files instantly in the browser.

### Module 7: LinkedIn Profile Optimizer & Public Insights
- **Headline Diagnostics**: Analysis of character count, keyword saturation, and value proposition.
- **About Summary Critique**: Structural breakdown evaluating hooks, technical taxonomy, and calls to action.

### Module 8: Campus Placement Hub & Super Dream Drives (`PlacementHubScreen`)
- **Institutional Recruiter Listings**: Real campus drives categorized by tier:
  - Super Dream: Amazon SDE-1 (`₹42.0 LPA`), Cisco Systems Cloud Engineer (`₹24.5 LPA`).
  - Dream: Barclays Backend Developer (`₹14.0 LPA`).
- **Eligibility Gate Locks**: Real-time evaluation of CGPA, standing arrears, and required technical proficiencies.
- **Interactive Remediation Gate**: Taking the accredited Docker Containerization Quiz (`#DCK-101`) directly unlocks the CloudScale Super Dream drive application.

### Module 9: Faculty Placement Director Console (`FacultyOverviewScreen`, `FacultyStudentsScreen`, etc.)
- **Cohort Health Overview**: Metric cards showing cohort readiness average, Super Dream eligible ratio, and high-risk students.
- **Student Roster & Deep-Dive Drawer**: Click on any student (e.g., Aravind R.) to inspect verified skill trees, interview history, and attendance.
- **Batch Interventions**: One-click cohort nudges and mandatory remediation assignment triggers.
- **Cohort CSV Ingestion Engine**: Upload institutional CSV rosters with automatic column mapping and validation.

### Module 10: Career Copilot AI Drawer (`CareerCopilot`)
- **Persistent Floating Assistant**: Context-aware copilot accessible from any screen via `Ctrl/Cmd + K` or floating action button.
- **One-Click Quick Actions**: Instant quiz launching, roadmap tailoring, and resume bullet generation.

---

## 5. Pitching Scripts & Talking Points

### 5.1 The 60-Second Elevator Pitch
> *"Every year, over 1.5 million engineers graduate in India, yet top tech firms struggle to fill entry-level roles offering ₹20 to ₹40 LPA. Why? Because academic CGPAs don't prove production competency, and platforms like Havelock only offer generic video courses and unverified self-assessments.*
>
> *Enter **AIMORA**: the first evidence-grounded placement readiness engine built directly for university Career Development Centres like SRMIST. Instead of guessing, AIMORA audits real skill gaps, provides hands-on Proof-of-Work challenges, and trains candidates inside a cinematic Voice Interview Room with word-by-word synchronized subtitles and automated scoring. When a student verifies a skill, their resume is surgically upgraded with verified metrics, and institutional Super Dream placement gates unlock automatically.*
>
> *We turn unverified students into day-one ready engineers with mathematical proof."*

### 5.2 The 3-Minute Executive Pitch (For Investors & Placement Directors)
> **[Slide 1 / Introduction: The Hiring Paradox]**  
> *"Good morning. In engineering placements, there is a fundamental paradox: Companies like Amazon and Cisco want to hire, and universities like SRMIST have thousands of 8.5+ CGPA students. But less than 15% clear the initial technical gate. Current solutions like Havelock or generic mock interview portals fail because they rely on self-reported questionnaires and passive multiple-choice quizzes that any candidate can cheat on."*
>
> **[Slide 2 / The Core Innovation: Deterministic Evidence]**  
> *"AIMORA solves this with three core breakthroughs:*
> *First: **Zero Hallucination Grounding**. If a student hasn't proven a skill, it is strictly null. We never fake readiness. To turn a skill green, the student must complete a verifiable Proof-of-Work or pass an institutional assessment.*
> *Second: **The Cinematic Voice Interview Room**. We have built an AI technical interviewer that looks, speaks, and evaluates like a senior engineering manager. With live reactive avatars, Web Speech boundary word-by-word karaoke glow subtitles, and hands-free microphone listening, candidates experience real interview pressure.*
> *Third: **Closed-Loop Campus Integration**. When student Aravind R. verifies his Docker containerization gap, three things happen instantly: his Market Radar score increases, his resume diff is updated with verified latency and artifact metrics, and his placement gate for Cisco's ₹24.5 LPA Super Dream drive unlocks in the Placement Hub."*
>
> **[Slide 3 / Institutional ROI]**  
> *"For students, it transforms career anxiety into a clear, gamified roadmap to high-paying jobs. For universities and Placement Directors like Dr. Soundararajan, it provides real-time cohort telemetry, allowing them to fix batch weaknesses weeks before recruiters arrive on campus.*
> *AIMORA isn't another study app—it is the modern operating system for university placements."*

---

## 6. The Killer Live Demo Showcase Flow (Step-by-Step)

Follow this 5-step sequence during your live demo for maximum audience impact:

### Step 1: The Executive Command Hero (Establish the Stakes)
1. **Navigate to**: `http://localhost:3000` $\rightarrow$ **My Career Plan**.
2. **Point out**:
   - The obsidian Linear-style minimalist aesthetic.
   - Student identity: **Aravind R.** (`RA2211003010482`), CGPA **8.74**, Targeting **Super Dream ₹42.0 LPA Amazon**.
   - Show the **Readiness Index (82%)** and the **Competency Matrix**.
3. **Action**: Click the **Gaps** filter tab. Show that **Redis** and **Kafka** are flagged as priority blockers that prevent full Super Dream eligibility.

### Step 2: Proof-of-Work & Tech-Tree (Bridge the Gap Live)
1. **Action**: Click on **Redis** or the **[Build Proof-of-Work Project]** button.
2. **Showcase**: The **Proof-of-Work Studio Drawer** slides out.
3. **Action**: Show the architectural requirements for high-throughput queuing, click **Run Verification Suite**.
4. **Result**: The verification passes, displaying an evidence certificate and updating the skill to **Verified (4.0/5.0)** with readiness jumping dynamically!
5. **Alternative**: Click on **Market Radar**, click the **Kafka** node on the 6-axis SVG radar to open the **Interactive Skill Tech-Tree Modal**, showcasing glowing prerequisite paths.

### Step 3: The AI Voice Interview Room (The "Wow" Factor)
1. **Navigate to**: **Interview Room** (or click the microphone icon in the top header).
2. **Showcase**:
   - The reactive 3D avatar with live equalizer waveform bars.
   - The **Cinematic Closed-Captioning Teleprompter Bar**.
3. **Action**: Trigger the question playback (or click `Ask Next`).
4. **Key Feature to Highlight**: Point at the teleprompter as the interviewer speaks:
   - **Smooth Fade-In**: The container slides and fades in gracefully.
   - **Active Karaoke Glow**: Watch each individual word light up in **glowing violet (`#cdbdff`)** at the exact millisecond it is vocalized!
   - **Clean Progressive Reveal**: Notice how upcoming words don't clutter the screen until spoken.
5. **Action**: Speak into the microphone (or click `Quick Voice Answer`) $\rightarrow$ Observe the hands-free auto-submission countdown $\rightarrow$ Review the instant **CDC Interview Scorecard Modal**.

### Step 4: Surgical Resume Diffing & Instant Export (Tangible Asset)
1. **Navigate to**: **Career Assets** $\rightarrow$ **Resume Analyzer**.
2. **Showcase**:
   - The side-by-side split workspace.
   - Show how the AI suggests quantifying SQL latency and Docker multi-stage builds.
3. **Action**: Click **[Accept Revision]** on the PostgreSQL indexing passage.
4. **Result**: Observe the live document instantly update with green diff highlights and the alignment score jumping from 82% to 94%.
5. **Action**: Click **Instant Export PDF** or **DOCX** $\rightarrow$ Show the file downloading directly to the desktop in seconds.

### Step 5: The Faculty Placement Console (The Institutional Buy-In)
1. **Action**: In the top right header, click **Faculty View**.
2. **Showcase**:
   - Seamless role transition to **Dr. S. Soundararajan (CDC Coordinator)**.
   - Institutional dashboard showing **Cohort 2026 CSE Section A** telemetry.
   - Super Dream readiness breakdown (Amazon, Cisco, Barclays).
   - Show how student Aravind R.'s newly verified credentials reflect across the faculty roster.
3. **Closing Statement**: *"AIMORA is the only platform that connects student learning, voice simulation, resume assets, and institutional placement drives into a single, unified loop."*

---

## 7. Technical Architecture Summary
- **Frontend Stack**: Vite 8.3.5, React 19.0.1, Tailwind CSS v4, Lucide React, Motion.
- **Audio & Speech Engine**: Native Web Speech API (`SpeechSynthesisUtterance` with `onboundary` tracking + `SpeechRecognition`).
- **Styling Architecture**: Obsidian Dark Palette (`#09090b` canvas, `#121214` card surfaces, `#27272a` borders, `#8052ff` violet, `#10b981` emerald, `#ffba35` amber).
- **Build Performance**: 38 modules compiled in **397ms**, 0 errors, 0 runtime dependencies on external proprietary CDNs.
