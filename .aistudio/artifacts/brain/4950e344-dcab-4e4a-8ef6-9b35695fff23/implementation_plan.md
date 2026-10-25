# Core Student Journey: Role Alignment, Micro-Assessment Loop & Market Demand Radar

This plan outlines the end-to-end interactive student workflow across **My Career Plan** and **Opportunities**, connecting a student's verified competency profile (`null`-preserving 0–5 scale) to target role requirements, an ordered learning roadmap with provenance-tagged resources, a live 3-question SQL verification quiz, and an embedded Market Demand Radar with deterministic priority scoring.

## User Review & Critical Decisions

> [!IMPORTANT]
> Review the confirmed product and grading decisions below before code execution begins.

- **Confirmed Decision 1 — Deterministic SQL Micro-Assessment Grading**: The 3-question SQL assessment maps `3/3` correct answers to `3.5/5.0` (Verified), `2/3` correct answers to `3.0/5.0`, and `1/3` correct answers to `2.0/5.0`, updating the skill badge to `"Verified (3.5/5.0)"` (when passed at 3/3) and setting the evidence record to `"Placement Hub Quiz #SQL-01"`.
- **Confirmed Decision 2 — Embedded Market Demand Radar in Opportunities**: The Market Demand Radar chart and Priority Recommendations panel will be embedded directly at the top of the **Opportunities** view above the ranked job listings and threshold breakdown.
- **Confirmed Decision 3 — Live Cross-View State Synchronization**: Completing a micro-assessment in **My Career Plan** immediately updates shared application state, recalculating the overall Readiness Index banner, the Opportunities Market Demand Radar polygon, priority rankings, and individual job match percentages in real time.

---

## 1. Overview & Core Concept

- **What It Does**: Provides a deterministic, closed-loop career readiness workflow where students evaluate their current competency evidence against the saved target role **"Junior Backend Engineer (Distributed Systems)"**, bridge unassessed (`null`) or missing skills via a structured roadmap with provenance-tagged resources (`[Google Search]` and `[Curated]`), take an interactive micro-assessment to convert unassessed skills into verified credentials, and inspect live market demand vs. personal proficiency inside **Opportunities**.
- **Target Audience / Persona**: Final-year Computer Science & Engineering students preparing for technical campus placement drives and distributed systems backend roles.
- **Key Value**: Eliminates opaque readiness scores and silent zero-coercion by strictly distinguishing unassessed skills (`null` / `"Needs assessment"`) from verified missing skills (`0.0`), while giving students an immediate, verifiable way to prove competency and watch their role alignment and market radar update live.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Target Role & Alignment Inspection (`My Career Plan`)**:
     - The student lands on **My Career Plan** and sees the prominent Readiness Index banner (starting at **64%**) labeled: *"Informational skill-evidence benchmark against target role."*
     - Against the saved target role **"Junior Backend Engineer (Distributed Systems)"**, the student inspects their initial competency states:
       - **SQL & Relational DB**: `null` / `"Needs assessment"` with an interactive **Take Assessment** button.
       - **System Design**: `2.5/5.0` (`Self-reported`).
       - **Git & Versioning**: `4.0/5.0` (`Verified`).
       - **Python**: `4.2/5.0` (`Verified`).
       - **Docker & Containerization**: `null` / `"Needs assessment"`.
       - **Redis & Kafka**: `Missing / Priority Gaps`.
  2. **Dynamic Learning Roadmap Execution (`My Career Plan`)**:
     - Below the alignment breakdown, an ordered milestone timeline targets missing and unassessed skills (starting with SQL & Relational DB Optimization, Docker Containerization, Redis Caching, and Kafka Event Streaming).
     - Each milestone displays a clear **Objective**, **Estimated Time** (e.g., `"3-5 hrs"`), clickable learning resources tagged with `[Google Search]` or `[Curated]` provenance badges, and a direct status action (**Take Assessment** or **Mark Progress**).
  3. **Working Micro-Assessment Quiz Loop (`#SQL-01`)**:
     - Clicking **Take Assessment** on the SQL competency card or roadmap milestone opens a 3-question multiple-choice modal covering composite B-tree indexing, join execution optimization, and ACID transaction isolation.
     - Submitting the quiz deterministically grades the answers (`3/3 → 3.5/5.0`, `2/3 → 3.0/5.0`, `1/3 → 2.0/5.0`), updates the SQL skill badge from `null / Needs assessment` to `"Verified (3.5/5.0)"`, sets the evidence label to `"Placement Hub Quiz #SQL-01"`, marks the corresponding roadmap milestone completed, and immediately recalculates the overall Readiness Index banner (rising from **64%** to **76%+**).
  4. **Market Demand Radar & Priority Engine (`Opportunities` Tab)**:
     - Navigating to **Opportunities** displays an embedded top section featuring a 6-axis SVG **Market Demand Radar** comparing the student's evidenced proficiency (`0–100` scale) against market demand percentage (`%`) for the role's top 6 skills (`Python`, `SQL`, `Docker`, `Redis`, `Git & Versioning`, `Kafka`).
     - Adjacent to the radar chart, the **Priority Recommendations Panel** ranks missing and unassessed skills using the deterministic priority weighting formula (`demand_fraction × (1 + 0.5 × required_fraction) × action_weight`), highlighting which skill to tackle next and updating live once SQL or Docker assessments are completed.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: High-contrast Dark Void institutional engineering console with crisp 1px structural borders and zero decorative bloat.
  - *Color Palette & Mood*: Deep obsidian canvas (`#000000`), elevated card surfaces (`#0D0D0F` and `#16161A`), subtle hairline borders (`#202023` and `#363639`), primary violet accent (`#8052ff` / `#cdbdff`), semantic emerald for verified evidence (`#55C98B`), and warm amber (`#ffba35`) for `null` / `"Needs assessment"` states and priority gaps.
  - *Typography & Hierarchy*: Clean sans-serif headings paired with tabular monospace numerals (`JetBrains Mono`, `tabular-nums`) for all scores (`3.5/5.0`), readiness percentages (`64%`), estimated durations (`3-5 hrs`), and priority weights.
  - *Component Styling & Layout*: Single-elevation containers within a responsive desktop layout (`max-w-7xl`), separating sections via clean borders and whitespace.

- **Interactive Feedback & Motion**:
  - Instant modal transitions for the 3-question micro-assessment, live answer counter (`3 / 3 answered`), toast confirmation banners upon quiz grading, and smooth SVG radar polygon morphing when skill scores change.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Strict `null` Preservation for Unassessed Skills**
  - *Chosen Approach*: Represent unassessed skills (such as initial SQL and Docker) as `null` in state and render them explicitly as `"Needs assessment"` rather than `0.0`.
  - *Why*: Prevents conflating "not yet tested" with "failed assessment (0.0)", maintaining honest readiness and coverage calculations.
  - *Alternatives Considered*: Defaulting unassessed skills to `0`, which distorts average proficiency metrics and misleads students and faculty.
- **Decision 2: Shared Competency State Across Student Views**
  - *Chosen Approach*: Lift the active student competency state and quiz completion handlers to the root application container so **My Career Plan**, **Opportunities**, **Market Radar**, and **Placement Hub** read from a single source of truth.
  - *Why*: Guarantees that verifying SQL (`#SQL-01`) or Docker (`#DCK-101`) in **My Career Plan** immediately updates the radar chart, priority ranking, and job match concordance in **Opportunities** without page reloads.
  - *Alternatives Considered*: Isolated component-local state per tab, which would cause stale scores when switching tabs.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:

```
┌───────────────────────────────────────────────────────────────────────────┐
│                   Root Application State (Shared Store)                   │
│  • targetRole: "Junior Backend Engineer (Distributed Systems)"            │
│  • competencies[]: Python (4.2), Git (4.0), System Design (2.5),          │
│                    SQL (null -> 3.5), Docker (null -> 4.0),               │
│                    Redis (Missing Gap), Kafka (Missing Gap)               │
│  • computedReadinessPct (64% -> 76% -> 88%)                               │
└───────────────────┬───────────────────────────────────────┬───────────────┘
                    │                                       │
                    ▼                                       ▼
┌───────────────────────────────────────┐ ┌─────────────────────────────────┐
│         My Career Plan View           │ │        Opportunities View       │
│                                       │ │                                 │
│ ┌───────────────────────────────────┐ │ │ ┌─────────────────────────────┐ │
│ │ Readiness Index Banner (64%)      │ │ │ │ Embedded Market Demand      │ │
│ │ "Informational skill-evidence     │ │ │ │ Radar (SVG 6-Axis 0-100%)   │ │
│ │  benchmark against target role."  │ │ │ │ + Priority Weighting Engine │ │
│ └───────────────────────────────────┘ │ │ └─────────────────────────────┘ │
│ ┌───────────────────────────────────┐ │ │ ┌─────────────────────────────┐ │
│ │ Role Alignment & Competency Grid  │ │ │ │ Ranked Job Postings &       │ │
│ │ • Validated Strengths             │ │ │ │ Live Role Threshold Table   │ │
│ │ • Priority Gaps (Redis, Kafka)    │ │ │ │ (Syncs SQL & Docker scores) │ │
│ │ • Needs Assessment (SQL, Docker)  │ │ │ └─────────────────────────────┘ │
│ └─────────────────┬─────────────────┘ │ └─────────────────────────────────┘
│                   │                   │
│ ┌─────────────────▼─────────────────┐ │
│ │ Dynamic Learning Roadmap          │ │
│ │ • Objective & Time ("3-5 hrs")    │ │
│ │ • [Google Search] & [Curated]     │ │
│ │ • "Take Assessment" Trigger       │ │
│ └─────────────────┬─────────────────┘ │
│                   │                   │
│ ┌─────────────────▼─────────────────┐ │
│ │ 3-Question Micro-Assessment Modal │ │
│ │ • Indexing, Joins, ACID (#SQL-01) │ │
│ │ • Grades 3/3 -> 3.5/5.0 Verified  │ │
│ └───────────────────────────────────┘ │
└───────────────────────────────────────┘
```

- **Data Model & State**:
  - **Competency Record**: Holds `id`, `name`, `proficiency` (`number | null`), `targetLevel` (`number`), `statusBadge` (`"Needs assessment" | "Self-reported" | "Verified" | "Missing / Priority Gap"`), `evidenceLabel`, and `marketDemandPct`.
  - **Roadmap Milestone**: Holds `id`, `skillId`, `title`, `objective`, `estimatedTime` (e.g., `"3-5 hrs"`), `resources` (`{ title, url, provenanceTag: '[Google Search]' | '[Curated]' }[]`), and `quizCode`.
  - **Priority Recommendation Formula**:
    $$\text{Priority Score} = \text{demand\_fraction} \times (1 + 0.5 \times \text{required\_fraction}) \times \text{action\_weight}$$
    where `Learn = 2.0`, `Assess = 1.5`, and `Maintain = 0.25`.

- **Interactive Component & State Mapping**:
  - **Take Assessment Action**: Clicking **Take Assessment** on the SQL competency card, alignment row, or roadmap milestone opens the `#SQL-01` modal with 3 multiple-choice questions (B-tree indexing, hash vs. nested-loop join optimization, ACID isolation levels).
  - **Deterministic Submission Handler**: Validates that all 3 questions are answered, counts correct selections, assigns `3.5` (for 3/3), `3.0` (for 2/3), or `2.0` (for 1/3), updates `statusBadge` to `"Verified (3.5/5.0)"` and `evidenceLabel` to `"Placement Hub Quiz #SQL-01"`, and triggers a live recalculation of the Readiness Index banner and the Opportunities Market Demand Radar.
