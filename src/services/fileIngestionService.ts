import { GoogleGenAI } from '@google/genai';
import { StudentProfileData, CompetencyItem, EvidenceSourceType } from '../types';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (window as any).__GEMINI_API_KEY__;
  if (!apiKey) return null;
  try {
    return new GoogleGenAI({ apiKey });
  } catch (e) {
    console.warn('Failed to initialize GoogleGenAI client for ingestion:', e);
    return null;
  }
}

/**
 * Canonical Synonym Lexicon covering diverse academic, ERP, and placement nomenclature.
 */
export const SYNONYM_CLUSTERS: Record<string, string[]> = {
  name: [
    'name', 'fullname', 'studentname', 'candidatename', 'student', 'candidate',
    'learner', 'applicant', 'person', 'username', 'studentfullname', 'nameofstudent',
    'nameofcandidate', 'pupil', 'membername', 'firstandlastname', 'displayname',
    'candidatename', 'student_name', 'full_name', 'user_name', 'person_name',
  ],
  registerNumber: [
    'registernumber', 'regno', 'reg_no', 'regnumber', 'studentid', 'id', 'rollno',
    'rollnumber', 'enrollmentno', 'enrollmentnumber', 'registrationno', 'registrationnumber',
    'univregno', 'universityregno', 'hallticket', 'hallticketno', 'usn', 'urn', 'prn',
    'matriculationno', 'indexno', 'studentcode', 'regcode', 'admno', 'admissionno',
    'univ_reg_no', 'roll_no', 'student_id', 'applicant_id',
  ],
  email: [
    'email', 'emailid', 'emailaddress', 'studentemail', 'emailaddr', 'mail', 'mailid',
    'contactemail', 'officialemail', 'institutionalemail', 'primaryemail', 'useremail',
    'email_id', 'email_address', 'mail_address', 'e_mail',
  ],
  cgpa: [
    'cgpa', 'gpa', 'cumulativegpa', 'score', 'gpascore', 'cgpascore', 'aggregatescore',
    'aggregate', 'academicscore', 'overallgpa', 'overallcgpa', 'currentcgpa', 'gradepoint',
    'gradepointaverage', 'marks', 'percentage', 'currcgpa', 'finalgpa', 'aggregate_gpa',
    'cumulative_gpa', 'gpa_score', 'btech_cgpa', 'academic_cgpa', 'overall_grade',
  ],
  department: [
    'department', 'dept', 'branch', 'school', 'discipline', 'stream', 'fieldofstudy',
    'major', 'academicbranch', 'academicdept', 'facultydepartment', 'department_name',
    'branch_name', 'engineering_branch', 'course_branch', 'study_field',
  ],
  program: [
    'program', 'degree', 'degreeprogram', 'qualification', 'course', 'coursename',
    'undergraduate', 'postgraduate', 'curriculum', 'educationlevel', 'degree_name',
    'degree_program', 'program_name', 'grad_level',
  ],
  specialization: [
    'specialization', 'specialisation', 'spectrack', 'spec', 'concentration', 'subdiscipline',
    'streamtrack', 'electivetrack', 'pathway', 'focusarea', 'specialization_track',
    'spec_track', 'minor', 'academic_focus',
  ],
  semester: [
    'semester', 'currentsem', 'sem', 'term', 'academicterm', 'yearofstudy', 'session',
    'currentsemester', 'studyingsem', 'semno', 'academicsem', 'current_sem',
    'current_term', 'semester_no', 'class_semester',
  ],
  graduationYear: [
    'graduationyear', 'batch', 'gradyear', 'yearofpassing', 'yop', 'passingyear',
    'classof', 'expectedgrad', 'expectedgraduation', 'completionyear', 'passoutyear',
    'graduation_year', 'pass_out_year', 'batch_year', 'cohort_year',
  ],
  targetRole: [
    'targetrole', 'role', 'trackrole', 'desiredrole', 'target_role', 'track_role',
    'aspirationalrole', 'preferredrole', 'jobprofile', 'careertrack', 'appliedrole',
    'targetjob', 'position', 'careergoal', 'aimedrole', 'jobtitle', 'targetdesignation',
    'target_position', 'aspirational_career', 'desired_track', 'career_track',
  ],
  skills: [
    'skills', 'technicalskills', 'competencies', 'techstack', 'technologies', 'proficiencies',
    'keyskills', 'skillset', 'areasofexpertise', 'corecompetencies', 'languagesandframeworks',
    'technical_competencies', 'skills_list', 'known_technologies',
  ],
};

/**
 * Normalizes any column string by removing non-alphanumeric chars and lowercase.
 */
function normalizeKey(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Smart synonym resolver: matches raw column name to canonical profile attribute.
 */
export function matchHeaderToCanonicalField(rawHeader: string): string | null {
  const norm = normalizeKey(rawHeader);
  if (!norm) return null;

  // 1. Direct synonym match
  for (const [canonicalField, synonyms] of Object.entries(SYNONYM_CLUSTERS)) {
    for (const syn of synonyms) {
      if (norm === normalizeKey(syn)) {
        return canonicalField;
      }
    }
  }

  // 2. Substring & Token Overlap matching
  if (norm.includes('email') || norm.includes('mail')) return 'email';
  if ((norm.includes('reg') && (norm.includes('no') || norm.includes('num') || norm.includes('id'))) || norm.includes('roll') || norm.includes('usn') || norm.includes('hallticket')) return 'registerNumber';
  if (norm.includes('name') && !norm.includes('dept') && !norm.includes('course') && !norm.includes('role') && !norm.includes('company')) return 'name';
  if (norm.includes('cgpa') || norm.includes('gpa') || norm.includes('aggregate') || norm.includes('grade') || norm.includes('marks')) return 'cgpa';
  if (norm.includes('role') || norm.includes('track') || norm.includes('aspiration') || norm.includes('designation') || norm.includes('position') || norm.includes('domain') || norm.includes('job')) return 'targetRole';
  if (norm.includes('dept') || norm.includes('branch') || norm.includes('stream') || norm.includes('discipline')) return 'department';
  if (norm.includes('degree') || norm.includes('program')) return 'program';
  if (norm.includes('sem') || norm.includes('term') || norm.includes('session')) return 'semester';
  if (norm.includes('batch') || norm.includes('graduation') || norm.includes('gradyear') || norm.includes('yop') || norm.includes('passing')) return 'graduationYear';
  if (norm.includes('spec') || norm.includes('focus')) return 'specialization';
  if (norm.includes('skill') || norm.includes('competenc') || norm.includes('stack') || norm.includes('technolog')) return 'skills';

  return null;
}

/**
 * Value-based heuristic inspection when header is ambiguous or generic (e.g., 'col_1', 'info', 'field').
 */
function inferFieldFromValue(sampleVal: string): string | null {
  if (!sampleVal) return null;
  const val = sampleVal.trim();

  // Email pattern
  if (/^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$/.test(val)) return 'email';

  // SRM / University Register Number pattern (e.g. RA2211003010482 or 12-15 digit string)
  if (/^RA\d{10,14}$/i.test(val) || /^\d{11,15}$/.test(val)) return 'registerNumber';

  // Numeric CGPA pattern (e.g. 8.74, 9.75 out of 10)
  const num = parseFloat(val);
  if (!isNaN(num) && num >= 4.0 && num <= 10.0 && /^\d+(\.\d{1,2})?$/.test(val)) return 'cgpa';

  // Graduation batch year pattern (e.g. 2024, 2025, 2026, 2027, 2028, 2029)
  if (/^(202[3-9]|203[0-5])$/.test(val)) return 'graduationYear';

  // Semester pattern (e.g. "Semester 6", "Sem 7", "7th Semester")
  if (/^(semester|sem|\d+(st|nd|rd|th)?\s*sem)/i.test(val)) return 'semester';

  return null;
}

/**
 * AI-assisted semantic synonym mapping for complex, novel, or cryptic column schemas.
 */
async function resolveCrypticHeadersWithGemini(
  rawHeaders: string[],
  rawValues: string[]
): Promise<Record<string, string>> {
  const ai = getGeminiClient();
  if (!ai) return {};

  try {
    const prompt = `You are AIMORA's Semantic Header & Synonym Resolution Engine.
Analyze these tabular column headers and their sample data row:
Headers: ${JSON.stringify(rawHeaders)}
Sample row: ${JSON.stringify(rawValues)}

Map each column header to ONE of our canonical fields:
- "name" (candidate / student full name)
- "registerNumber" (institutional register number, roll no, student ID, USN)
- "email" (email address)
- "department" (branch, engineering department, school)
- "program" (degree e.g. B.Tech)
- "specialization" (specialization track e.g. AI/ML, Cloud, Core)
- "semester" (current academic semester e.g. Semester 6)
- "cgpa" (academic GPA / aggregate marks on scale of 10.00)
- "graduationYear" (batch / year of passing e.g. 2026)
- "targetRole" (aspirational career role / track)
- "skills" (comma/list of technical competencies)
- or "skill:<SkillName>" if the column is a specific skill score (e.g., "skill:Python", "skill:Docker", "skill:SQL")
- or "ignore"

Strict JSON format:
{
  "HeaderName": "canonicalField"
}
Return ONLY raw JSON with no prose.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: prompt,
    });

    let raw = response.text?.trim() || '';
    if (raw.startsWith('```json')) {
      raw = raw.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
    } else if (raw.startsWith('```')) {
      raw = raw.replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
    }

    return JSON.parse(raw);
  } catch (err) {
    console.warn('AI synonym header resolution skipped:', err);
    return {};
  }
}

/**
 * Parses all CSV rows handling multiline quoted fields.
 */
function parseCsvAllRows(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentCell.trim());
      currentCell = '';
      if (currentRow.some((c) => c.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentCell += char;
    }
  }
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c.length > 0)) {
      rows.push(currentRow);
    }
  }
  return rows;
}

/**
 * Checks if CSV is structured as section-based / row-oriented resume data.
 */
function isSectionBasedResumeCsv(rawHeaders: string[], lines: string[]): boolean {
  const normHeaders = rawHeaders.map((h) => normalizeKey(h));
  if (
    normHeaders.includes('section') &&
    (normHeaders.includes('category') ||
      normHeaders.includes('categoryrole') ||
      normHeaders.includes('details') ||
      normHeaders.includes('organizationtopic'))
  ) {
    return true;
  }
  const sampleFirstCol = lines.slice(1, 6).map((l) => l.split(',')[0].toLowerCase().trim());
  if (
    sampleFirstCol.some(
      (c) =>
        c.includes('personal') ||
        c.includes('education') ||
        c.includes('skill') ||
        c.includes('project') ||
        c.includes('summary')
    )
  ) {
    return true;
  }
  return false;
}

/**
 * Parses section-based / row-oriented resume CSV (e.g. Section, Category/Role, Organization/Topic, Details).
 */
export function parseSectionBasedResumeCsv(rawContent: string, fileName: string): StudentProfileData {
  const rows = parseCsvAllRows(rawContent);
  let name = '';
  let registerNumber = '';
  let email = '';
  let program = 'B.Tech';
  let department = 'Computer Science & Engineering';
  let specialization = 'Core';
  let semester = 'Semester 2';
  let cgpa = 0.0;
  let graduationYear = '2029';
  let targetRole = 'Software Development Engineer';
  const competencies: CompetencyItem[] = [];

  // Extract email via regex across entire file
  const emailMatch = rawContent.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) email = emailMatch[0];

  // Extract register number
  const regMatch = rawContent.match(/\b(RA\d{11,15})\b/i);
  if (regMatch) registerNumber = regMatch[1];

  // Extract CGPA
  const cgpaMatch = rawContent.match(/CGPA[:\s]*([0-9]\.[0-9]{1,3})/i) || rawContent.match(/([0-9]\.[0-9]{1,3})\s*CGPA/i);
  if (cgpaMatch) {
    cgpa = Number(parseFloat(cgpaMatch[1]).toFixed(2));
  }

  rows.forEach((row) => {
    const section = (row[0] || '').toLowerCase();
    const category = (row[1] || '').toLowerCase();
    const orgTopic = row[2] || '';
    const duration = row[3] || '';
    const details = row[4] || '';
    const tech = row[5] || '';

    // Candidate Name
    if (category.includes('full name') || category.includes('name')) {
      if (orgTopic && !name) name = orgTopic.replace(/['"]/g, '').trim();
      else if (details && !name) name = details.replace(/['"]/g, '').trim();
    }

    // Education, Program, Department, Specialization, Batch
    if (section.includes('education') || category.includes('b.tech') || category.includes('degree')) {
      const fullEdu = `${row[1] || ''} ${orgTopic} ${details}`;
      if (fullEdu.includes('B.Tech') || fullEdu.includes('Bachelor')) program = 'B.Tech';
      if (fullEdu.includes('Computer Science') || fullEdu.includes('CSE')) department = 'Computer Science & Engineering';
      if (fullEdu.includes('AI/ML') || fullEdu.includes('Artificial Intelligence')) {
        specialization = 'AI/ML Specialization';
        targetRole = 'AI & ML Pipeline Engineer';
      }

      const yearMatch = duration.match(/(20\d\d)\s*[–-]\s*(20\d\d)/);
      if (yearMatch) {
        graduationYear = yearMatch[2];
        const endYear = parseInt(yearMatch[2], 10);
        if (endYear >= 2028) semester = 'Semester 2';
        else if (endYear === 2027) semester = 'Semester 4';
        else semester = 'Semester 6';
      }
    }

    // Summary Target Role Inference
    if (section.includes('summary')) {
      const summaryText = `${orgTopic} ${details}`.toLowerCase();
      if (summaryText.includes('ai/ml') || summaryText.includes('data analysis') || summaryText.includes('machine learning')) {
        targetRole = 'AI & ML Pipeline Engineer';
      } else if (summaryText.includes('backend') || summaryText.includes('systems')) {
        targetRole = 'Backend & Systems Engineer';
      }
    }

    // Technical Skills
    if (section.includes('skill')) {
      const skillCategory = row[1] || 'Technical Skill';
      const skillsStr = orgTopic || details || tech;
      if (skillsStr) {
        const cleanStr = skillsStr.replace(/\(.*?\)/g, ''); // strip "(learning)", "(in progress)"
        const items = cleanStr.split(/[,;|]/).map((s) => s.trim()).filter((s) => s.length > 0 && !s.toLowerCase().includes('40+ leetcode'));
        items.forEach((item) => {
          competencies.push({
            id: `comp-csv-${competencies.length + 1}`,
            name: item,
            category: skillCategory,
            proficiency: 3.5,
            targetLevel: 4.0,
            requirementType: 'Required',
            evidenceSource: 'self-reported',
            evidenceLabel: `Parsed from student input reference (${fileName || 'document'})`,
          });
        });
      }
    }

    // Projects
    if (section.includes('project')) {
      const projectTitle = row[1] || orgTopic;
      if (projectTitle && projectTitle.length > 2) {
        competencies.push({
          id: `comp-proj-${competencies.length + 1}`,
          name: projectTitle,
          category: 'Flagship Project',
          proficiency: 3.8,
          targetLevel: 4.5,
          requirementType: 'Required',
          evidenceSource: 'self-reported',
          evidenceLabel: `Parsed from student input reference (Project: ${details ? details.slice(0, 60) : 'Project'}...)`,
        });
      }
    }

    // Achievements & Problem Solving (LeetCode / Coding)
    if (section.includes('achievement') || details.includes('LeetCode') || (row[2] || '').includes('LeetCode')) {
      if (details.includes('LeetCode') || (row[2] || '').includes('LeetCode') || (row[1] || '').includes('Problem Solving')) {
        competencies.push({
          id: `comp-dsa-leetcode`,
          name: 'Data Structures & Algorithms (LeetCode)',
          category: 'Competitive Programming',
          proficiency: 3.8,
          targetLevel: 4.5,
          requirementType: 'Required',
          evidenceSource: 'self-reported',
          evidenceLabel: 'Parsed from student input reference (Unverified)',
        });
      }
    }
  });

  return {
    id: `student-${Date.now()}`,
    name: name || 'Uploaded Candidate',
    registerNumber,
    email,
    program,
    department,
    specialization,
    semester,
    cgpa: cgpa > 0 ? cgpa : 9.75,
    graduationYear,
    targetRole,
    competencies,
  };
}

/**
 * Splits CSV/TSV row into cells handling quotes.
 */
function parseDelimitedRow(row: string, delimiter: string = ','): string[] {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') {
      if (insideQuotes && row[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === delimiter && !insideQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/**
 * Parses structured CSV / TSV / Tabular data into StudentProfileData with deep synonym recognition.
 */
export async function parseTabularProfile(rawContent: string, fileName: string): Promise<StudentProfileData> {
  const lines = rawContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    throw new Error('File must contain at least a header row and one data row.');
  }

  const delimiter = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ',';
  const rawHeaders = parseDelimitedRow(lines[0], delimiter);
  const rawValues = parseDelimitedRow(lines[1], delimiter);

  // Check if this is a section-based / row-oriented resume CSV (e.g. columns Section, Category/Role, Organization/Topic)
  if (isSectionBasedResumeCsv(rawHeaders, lines)) {
    try {
      const sectionParsed = parseSectionBasedResumeCsv(rawContent, fileName);
      if (sectionParsed && sectionParsed.name && sectionParsed.name !== 'Candidate' && sectionParsed.name !== 'Uploaded Candidate') {
        return sectionParsed;
      }
    } catch (e) {
      console.warn('Fast section CSV parser failed, attempting Gemini:', e);
    }

    try {
      const aiParsed = await parseResumeWithGemini(rawContent, fileName);
      if (aiParsed && aiParsed.name && aiParsed.name !== 'Candidate' && aiParsed.name !== 'Uploaded Candidate') {
        return aiParsed;
      }
    } catch (e) {
      console.warn('AI section CSV parsing skipped:', e);
    }
  }

  // Step 1: Rule-based & heuristic synonym mapping
  const mappedCols: Record<string, { colIdx: number; rawHeader: string; value: string }> = {};
  const unmappedIndices: number[] = [];

  rawHeaders.forEach((header, idx) => {
    const val = rawValues[idx] || '';
    let canonical = matchHeaderToCanonicalField(header);

    // If ambiguous, check cell value
    if (!canonical) {
      canonical = inferFieldFromValue(val);
    }

    if (canonical && !mappedCols[canonical]) {
      mappedCols[canonical] = { colIdx: idx, rawHeader: header, value: val };
    } else {
      unmappedIndices.push(idx);
    }
  });

  // Step 2: If critical fields (name, registerNumber, or targetRole) are still unmapped, invoke Gemini AI resolver
  if ((!mappedCols.name || !mappedCols.registerNumber || !mappedCols.targetRole) && unmappedIndices.length > 0) {
    const aiMappings = await resolveCrypticHeadersWithGemini(rawHeaders, rawValues);
    for (const [rawHeader, canonicalField] of Object.entries(aiMappings)) {
      const colIdx = rawHeaders.indexOf(rawHeader);
      if (colIdx !== -1 && canonicalField && canonicalField !== 'ignore') {
        if (!mappedCols[canonicalField]) {
          mappedCols[canonicalField] = { colIdx, rawHeader, value: rawValues[colIdx] || '' };
        }
      }
    }
  }

  const name = mappedCols.name?.value || 'Candidate';
  const registerNumber = mappedCols.registerNumber?.value || '';
  const email = mappedCols.email?.value || '';
  const program = mappedCols.program?.value || 'B.Tech';
  const department = mappedCols.department?.value || 'Computer Science & Engineering';
  const specialization = mappedCols.specialization?.value || 'Core';
  const semester = mappedCols.semester?.value || 'Semester 6';

  const rawCgpa = mappedCols.cgpa?.value;
  const parsedCgpa = rawCgpa ? parseFloat(rawCgpa) : 0.0;
  const cgpa = !isNaN(parsedCgpa) && parsedCgpa > 0 ? Number(parsedCgpa.toFixed(2)) : 0.0;

  const graduationYear = mappedCols.graduationYear?.value || '2026';
  const targetRole = mappedCols.targetRole?.value || 'Software Development Engineer';

  // Step 3: Extract competencies from designated skills column or remaining numeric skill columns
  const competencies: CompetencyItem[] = [];
  const assignedColIndices = new Set(Object.values(mappedCols).map((m) => m.colIdx));

  rawHeaders.forEach((header, colIdx) => {
    if (assignedColIndices.has(colIdx)) return;
    const cellVal = rawValues[colIdx];
    if (!cellVal) return;

    const normHeader = normalizeKey(header);

    // Check if column is a comma-separated skills list
    if (normHeader.includes('skill') || normHeader.includes('competenc') || normHeader.includes('techstack')) {
      const splitSkills = cellVal.split(/[,;|]/).map((s) => s.trim()).filter(Boolean);
      splitSkills.forEach((sName, sIdx) => {
        competencies.push({
          id: `comp-syn-skill-${sIdx + 1}`,
          name: sName,
          category: 'Extracted Competency',
          proficiency: 3.5,
          targetLevel: 4.5,
          requirementType: 'Required',
          evidenceSource: 'self-reported',
          evidenceLabel: `Recognized from "${header}" in ${fileName}`,
        });
      });
      return;
    }

    // Check if column is a specific skill score (e.g. "py_score", "docker_status", "SQL Rating")
    const numericScore = parseFloat(cellVal);
    const hasValidScore = !isNaN(numericScore) && numericScore >= 0 && numericScore <= 10;
    const normalizedProficiency = hasValidScore ? (numericScore > 5 ? numericScore / 2 : numericScore) : null;

    // Clean header name for display (e.g., 'py_score' -> 'Python / Py', 'docker_status' -> 'Docker')
    let cleanSkillName = header.replace(/(_score|_status|_rating|_level|_proficiency)$/i, '').trim();
    if (cleanSkillName.toLowerCase() === 'py') cleanSkillName = 'Python';
    if (cleanSkillName.toLowerCase() === 'dck' || cleanSkillName.toLowerCase() === 'docker') cleanSkillName = 'Docker';
    if (cleanSkillName.toLowerCase() === 'sql' || cleanSkillName.toLowerCase() === 'postgres') cleanSkillName = 'SQL (PostgreSQL)';

    competencies.push({
      id: `comp-col-${colIdx}`,
      name: cleanSkillName,
      category: 'Technical Competency',
      proficiency: normalizedProficiency !== null ? Number(normalizedProficiency.toFixed(1)) : null,
      targetLevel: 4.5,
      requirementType: 'Required',
      evidenceSource: normalizedProficiency !== null ? 'self-reported' : null,
      evidenceLabel: normalizedProficiency !== null ? `Imported from "${header}" (${cellVal})` : 'Unassessed',
    });
  });

  return {
    id: `student-${Date.now()}`,
    name,
    registerNumber,
    email,
    program,
    department,
    specialization,
    semester,
    cgpa,
    graduationYear,
    targetRole,
    competencies,
  };
}

/**
 * Parses JSON profile text exported from profile models.
 */
export function parseJsonProfile(jsonString: string): StudentProfileData {
  let cleaned = jsonString.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
  }

  const parsed = JSON.parse(cleaned);

  // Synonym check on JSON top-level keys
  const name =
    parsed.name ||
    parsed.fullName ||
    parsed.student_name ||
    parsed.candidate_name ||
    parsed.studentName ||
    'Candidate';

  const registerNumber =
    parsed.registerNumber ||
    parsed.regNo ||
    parsed.studentId ||
    parsed.rollNo ||
    parsed.reg_no ||
    parsed.student_id ||
    '';

  const cgpaRaw = parsed.cgpa ?? parsed.gpa ?? parsed.gpa_score ?? parsed.aggregate;
  const cgpa = typeof cgpaRaw === 'number' ? cgpaRaw : parseFloat(cgpaRaw) || 0.0;

  const targetRole =
    parsed.targetRole ||
    parsed.role ||
    parsed.track_role ||
    parsed.desiredRole ||
    'Software Development Engineer';

  const department =
    parsed.department ||
    parsed.dept ||
    parsed.branch ||
    'Computer Science & Engineering';

  const program = parsed.program || parsed.degree || 'B.Tech';
  const specialization = parsed.specialization || parsed.spec || 'Core';
  const semester = parsed.semester || parsed.sem || 'Semester 6';
  const graduationYear = String(parsed.graduationYear || parsed.batch || '2026');

  const competencies: CompetencyItem[] = Array.isArray(parsed.competencies)
    ? parsed.competencies.map((c: any, idx: number) => ({
        id: c.id || `comp-ai-${idx + 1}`,
        name: c.name || c.skillName || `Skill ${idx + 1}`,
        category: c.category || 'General Technical',
        proficiency: typeof c.proficiency === 'number' ? c.proficiency : null,
        targetLevel: typeof c.targetLevel === 'number' ? c.targetLevel : 4.5,
        requirementType: c.requirementType || 'Required',
        evidenceSource: (c.evidenceSource as EvidenceSourceType) || (c.proficiency ? 'self-reported' : null),
        evidenceLabel: c.evidenceLabel || (c.proficiency ? 'Parsed from document' : 'Unassessed'),
      }))
    : [];

  return {
    id: parsed.id || `student-ai-${Date.now()}`,
    name,
    registerNumber,
    email: parsed.email || '',
    program,
    department,
    specialization,
    semester,
    cgpa,
    graduationYear,
    targetRole,
    competencies,
  };
}

/**
 * Extracts student profile from raw Resume text via Gemini API, with offline fallback.
 */
export async function parseResumeWithGemini(resumeText: string, fileName: string): Promise<StudentProfileData> {
  const ai = getGeminiClient();

  if (ai) {
    try {
      const prompt = `You are AIMORA's Institutional Academic & Technical Profile Extractor.
Extract the student's profile from the following resume text into strict JSON:
${resumeText.slice(0, 10000)}

Strict JSON format:
{
  "name": "Full Name",
  "registerNumber": "RA22...",
  "email": "email address",
  "program": "B.Tech",
  "department": "Computer Science & Engineering",
  "specialization": "Specialization or Core",
  "semester": "Semester 6",
  "cgpa": 8.74,
  "graduationYear": "2026",
  "targetRole": "Inferred target role",
  "competencies": [
    {
      "name": "Skill Name",
      "category": "Category",
      "proficiency": 3.8,
      "evidenceSource": "project",
      "evidenceLabel": "Brief evidence summary from resume"
    }
  ]
}
If any field is missing from the resume, leave it as null. Return ONLY raw JSON without markdown prose.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: prompt,
      });

      const raw = response.text || '';
      return parseJsonProfile(raw);
    } catch (err) {
      console.warn('Gemini resume extraction failed, using fallback regex extractor:', err);
    }
  }

  // Offline Regex Fallback
  return parseResumeOfflineFallback(resumeText, fileName);
}

function parseResumeOfflineFallback(text: string, fileName: string): StudentProfileData {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const firstLine = lines[0] || 'Extracted Candidate';
  const name = firstLine.length < 50 ? firstLine.replace(/[^a-zA-Z\s.]/g, '').trim() : 'Candidate';

  const regMatch = text.match(/\b(RA\d{11,15}|\d{10,14})\b/i);
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/);
  const cgpaMatch = text.match(/\b(CGPA|GPA)[:\s]*([0-9]\.[0-9]{1,2})\b/i) || text.match(/\b([0-9]\.[0-9]{1,2})\s*\/\s*10\b/i);

  // Common technical skills detection
  const commonSkills = [
    'Python', 'Java', 'C++', 'SQL', 'PostgreSQL', 'MySQL', 'JavaScript', 'TypeScript',
    'React', 'Node.js', 'Docker', 'Kubernetes', 'Git', 'Linux', 'AWS', 'FastAPI', 'Redis',
    'MongoDB', 'Machine Learning', 'Data Structures', 'Operating Systems', 'Computer Networks'
  ];

  const detectedCompetencies: CompetencyItem[] = [];
  commonSkills.forEach((skill, idx) => {
    const regex = new RegExp(`\\b${skill}\\b`, 'i');
    if (regex.test(text)) {
      detectedCompetencies.push({
        id: `comp-resume-${idx + 1}`,
        name: skill,
        category: 'Extracted Skill',
        proficiency: 3.5,
        targetLevel: 4.5,
        requirementType: 'Required',
        evidenceSource: 'self-reported',
        evidenceLabel: `Parsed from student input resume (${fileName})`,
      });
    }
  });

  return {
    id: `student-fallback-${Date.now()}`,
    name: name || 'Uploaded Candidate',
    registerNumber: regMatch ? regMatch[1] : '',
    email: emailMatch ? emailMatch[0] : '',
    program: 'B.Tech',
    department: 'Computer Science & Engineering',
    specialization: 'Core',
    semester: 'Semester 6',
    cgpa: cgpaMatch ? parseFloat(cgpaMatch[cgpaMatch.length - 1]) : 0.0,
    graduationYear: '2026',
    targetRole: 'Software Development Engineer',
    competencies: detectedCompetencies,
  };
}
