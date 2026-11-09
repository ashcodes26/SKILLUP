# SKILLUP — Career Readiness & Institutional Placement Platform

> **Connecting verified evidence to career outcomes.**  
> Deterministic career readiness assessment, evidence-grounded resume analysis, interactive mock interviews, and institutional placement director console.

[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Compliance](https://img.shields.io/badge/Compliance-FERPA%20%7C%20IEEE%20P2863-10B981)](#compliance--audit-integrity)

---

## 📖 About SKILLUP

### The Core Problem
Conventional placement systems and resume analyzers suffer from two critical flaws:
1. **Self-Reported Inflation:** Candidates list technologies on resumes without verified proof, resulting in high ATS rejection rates and mismatched interview evaluations.
2. **AI Hallucinations:** Generic generative AI career tools often fabricate or inflate candidate proficiencies, giving students a false sense of readiness that fails during rigorous technical screenings.

### The SKILLUP Solution
**SKILLUP** is an enterprise-grade placement readiness platform engineered for universities and educational institutions. It unifies the student career preparation journey with institutional placement director workflows:
- **Evidence-Grounded Calibration:** Every score, roadmap milestone, and resume recommendation is grounded strictly in verified academic transcripts, lab practicals, placement quiz results, or verifiable GitHub proof-of-work repositories.
- **Strictly Deterministic:** Unassessed skills are stored strictly as `null` — never 0 (which falsely implies tested failure) and never an inflated estimate.
- **Interactive Neural Mesh:** A custom-engineered 3D particle brain visualizer mapping frontal (strategy), parieto-temporal (knowledge), and cerebellar (execution) competencies with real-time physics and cosmic warp transition dynamics.
- **Institutional Scale:** Designed for active graduating cohorts (e.g., Class of 2026/2027 Engineering batches), empowering placement directors with cohort-level readiness analytics, eligibility gates, and drive scheduling.

---

## 📌 Repository Metadata & Topics

For the GitHub repository **About** sidebar configuration:

| Field | Value |
|---|---|
| **Description** | Connecting verified evidence to career outcomes. Deterministic career readiness, 3D particle brain, mock interviews, and institutional placement console. |
| **Website** | `http://localhost:3000` (Local) / Custom Deployment Domain |
| **Topics** | `career-readiness`, `placement-portal`, `react-19`, `typescript`, `vite`, `canvas-3d`, `particle-system`, `resume-analyzer`, `mock-interview`, `ferpa-compliance`, `tailwindcss` |

---

## Overview

**SKILLUP** bridges student academic evidence with real-world industry hiring benchmarks. Unlike heuristic career tools, SKILLUP computes career readiness deterministically across verified coursework, lab practicals, placement assessments, and proof-of-work artifacts — preserving unverified competencies strictly as `null` to eliminate synthetic score inflation.

---

## Key Modules & Capabilities

### 🎓 Student Workspace
- **My Career Plan & Readiness Index**: Real-time deterministic readiness benchmarks against dynamically selectable target career roles (Full Stack Engineer, ML Engineer, Cloud Architect, Data Engineer).
- **Interactive 3D Particle Brain**: Real-time canvas physics engine mapping Frontal, Parieto-Temporal, and Cerebellar brain structures. Responds dynamically to cursor hover deflection, mouse rotation, click shockwaves, and keyboard inputs.
- **Cinematic Warp Transition**: High-speed cosmic particle burst upon authentication with radial shockwave and accessibility skip controls.
- **Proof-of-Work Studio**: Grounded artifact submission with Git commit hashes, live URLs, and verified lab transcripts.
- **Resume Analyzer**: ATS parsing, role match score, gap analysis, and factual resume revisions that never hallucinate unearned qualifications.
- **Interactive Mock Interview Room**: Real-time conversational interview simulation with speech recognition, text-to-speech feedback, and reactive 3D interviewer avatar.
- **Placement Hub & Opportunities**: Institutional company drives, eligibility verification, and salary distribution insights.

### 🏛️ Faculty Placement Console
- **Cohort Readiness Overview**: Batch-level readiness analytics for graduating classes (e.g., Class of 2026/2027).
- **Student Audit Directory**: Granular verification of student credentials, CGPA, arrears, and placement status under FERPA boundaries.
- **Curriculum & Skill Analytics**: Department-wide skill gap heatmaps and institutional intervention triggers.
- **Placement Drive Management**: Company profile curation, minimum CGPA/competency thresholds, and applicant shortlisting.
- **Universal Data Ingestion**: Automated ingestion of student cohorts via CSV, XLSX, TSV, JSON, and resume PDFs.

---

## Architecture & Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19, TypeScript |
| **Build & Dev Server** | Vite, ESBuild |
| **Styling & Theme** | Tailwind CSS v4, Obsidian Dark Theme |
| **Visual Computing** | HTML5 2D Canvas 60fps Neural Engine (`brainParticles.ts`) |
| **Motion & Audio** | Motion, Web Speech Synthesis API, Web Audio API |
| **Icons & Typography** | Google Material Symbols, Lucide React, Inter |

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ or v20+ recommended)
- `npm` or `pnpm`

### Installation

```bash
# Clone repository
git clone https://github.com/ashcodes26/SKILLUP.git
cd SKILLUP

# Install dependencies
npm install
```

### Environment Configuration

Create a `.env` file in the project root:

```env
VITE_GEMINI_API_KEY=your_api_key_here
```

### Running the Development Server

```bash
npm run dev
```

The application will be accessible at:
- **Local:** `http://localhost:3000/`
- **Network:** `http://<your-lan-ip>:3000/`

### Production Build & Verification

```bash
# Type check without emitting
npm run lint

# Production bundle build
npm run build

# Preview production build locally
npm run preview
```

---

## Project Structure

```
SKILLUP/
├── public/                 # Static assets, demo fixtures, avatars
│   └── assets/media/       # Studio assets and reference images
├── src/
│   ├── components/         # Reusable UI & specialized widgets
│   │   ├── ParticleBrain.tsx       # 3D interactive particle neural mesh
│   │   ├── LoginTransition.tsx     # Cinematic warp-speed burst overlay
│   │   ├── StudentHeader.tsx       # Student workspace navigation
│   │   ├── FacultyHeader.tsx       # Placement director console header
│   │   ├── CareerCopilot.tsx       # Role-adaptive conversational copilot
│   │   └── ReactiveInterviewerAvatar.tsx # 3D audio-reactive avatar
│   ├── hooks/              # Custom hooks (e.g. useReducedMotion)
│   ├── screens/
│   │   ├── auth/           # Login & Student Registration
│   │   ├── student/        # Career Plan, Resume, Interview, Placement Hub
│   │   └── faculty/        # Cohort Overview, Skill Analytics, Drive Manager
│   ├── services/           # Ingestion, Assessment, Mock Interview services
│   ├── utils/              # Math engine, perspective projection, burst physics
│   ├── data/               # Deterministic mock cohorts & benchmark curricula
│   ├── App.tsx             # Root router & role-based authentication gate
│   └── main.tsx            # Application entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## Compliance & Audit Integrity

- **Deterministic Readiness**: Missing competencies are marked `null`, never `0` or assumed positive, ensuring zero synthetic inflation.
- **FERPA & Institutional Privacy**: Candidate credentials, grade audit logs, and faculty review notes are scoped strictly to authenticated role boundaries.
- **Provenance Logging**: All evidence sources are tagged with explicit provenance (`institution_transcript`, `verified_assessment`, `proof_of_work`, or `curated_fallback`).

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
