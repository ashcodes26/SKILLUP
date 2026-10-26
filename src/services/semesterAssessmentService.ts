import { GoogleGenAI } from '@google/genai';
import { AssessmentQuestion, SemesterAssessmentResult, SemesterCurriculumSubject } from '../types';

export const SEMESTER_SUBJECT_CONFIGS: Record<string, SemesterCurriculumSubject[]> = {
  'Semester 3': [
    {
      id: 'dsa',
      name: 'Data Structures & Algorithms',
      code: 'CS2001',
      topics: ['Arrays & Strings', 'Linked Lists', 'Binary Search Trees', 'Sorting & Searching', 'Recursion'],
      skillsTrained: ['dsa', 'python', 'problem-solving'],
    },
    {
      id: 'oops',
      name: 'Object-Oriented Programming',
      code: 'CS2002',
      topics: ['Classes & Objects', 'Polymorphism', 'Inheritance', 'Interfaces', 'Memory Management'],
      skillsTrained: ['oop', 'java', 'cpp'],
    },
    {
      id: 'dml',
      name: 'Digital Logic & Architecture',
      code: 'CS2003',
      topics: ['Boolean Algebra', 'Logic Gates', 'ALU Design', 'Registers & Cache', 'Instruction Cycles'],
      skillsTrained: ['computer-architecture'],
    },
  ],
  'Semester 4': [
    {
      id: 'dsa_adv',
      name: 'Advanced Data Structures',
      code: 'CS2004',
      topics: ['AVL & Red-Black Trees', 'Graph Algorithms (Dijkstra, BFS, DFS)', 'Dynamic Programming', 'Disjoint Sets'],
      skillsTrained: ['dsa', 'algorithms'],
    },
    {
      id: 'theory_comp',
      name: 'Theory of Computation',
      code: 'CS2005',
      topics: ['Finite Automata', 'Regular Expressions', 'Context-Free Grammars', 'Turing Machines', 'Decidability'],
      skillsTrained: ['automata', 'formal-languages'],
    },
    {
      id: 'software_eng',
      name: 'Software Engineering & Agile',
      code: 'CS2006',
      topics: ['SDLC Models', 'Agile & Scrum', 'UML Diagrams', 'CI/CD Pipelines', 'Testing Frameworks'],
      skillsTrained: ['git', 'software-engineering'],
    },
  ],
  'Semester 5': [
    {
      id: 'dbms',
      name: 'Database Management Systems',
      code: 'CS3001',
      topics: ['Relational Model', 'SQL Queries & Joins', 'B-Tree & Hash Indexing', 'Normalization (1NF-BCNF)', 'ACID & Transactions'],
      skillsTrained: ['postgres', 'sql', 'database-design'],
    },
    {
      id: 'os',
      name: 'Operating Systems',
      code: 'CS3002',
      topics: ['Process Scheduling', 'Threads & Concurrency', 'Semaphores & Mutex', 'Virtual Memory & Paging', 'Deadlock Detection'],
      skillsTrained: ['os-internals', 'concurrency', 'systems-programming'],
    },
    {
      id: 'networks',
      name: 'Computer Networks',
      code: 'CS3003',
      topics: ['OSI & TCP/IP Layers', 'TCP 3-Way Handshake', 'Congestion Control', 'DNS & HTTP/2', 'Subnetting & CIDR'],
      skillsTrained: ['networking', 'network-protocols'],
    },
  ],
  'Semester 6': [
    {
      id: 'dbms',
      name: 'Database Management Systems & Indexing',
      code: 'CS3001',
      topics: ['Relational Modeling', 'Composite Indexing', 'Query Execution Plans', 'Locking & MVCC', 'Transactions'],
      skillsTrained: ['postgres', 'sql', 'database-design'],
    },
    {
      id: 'os',
      name: 'Operating Systems & Concurrency',
      code: 'CS3002',
      topics: ['Virtual Memory Paging', 'Context Switching Overhead', 'Deadlock Avoidance', 'Race Conditions', 'System Calls'],
      skillsTrained: ['os-internals', 'concurrency', 'systems-programming'],
    },
    {
      id: 'networks',
      name: 'Computer Networks & Security',
      code: 'CS3003',
      topics: ['TCP Flow Control vs Congestion', 'TLS/HTTPS Handshake', 'DNS Resolution', 'Subnet Routing', 'Socket Programming'],
      skillsTrained: ['networking', 'security', 'http'],
    },
  ],
  'Semester 7': [
    {
      id: 'cloud',
      name: 'Cloud Computing & Distributed Systems',
      code: 'CS4001',
      topics: ['CAP Theorem & PACELC', 'Microservices Architecture', 'Docker Containers & Kubernetes', 'Event-Driven Messaging', 'gRPC'],
      skillsTrained: ['docker', 'kubernetes', 'cloud-architecture'],
    },
    {
      id: 'sysdes',
      name: 'System Design & High Scale',
      code: 'CS4002',
      topics: ['Consistent Hashing', 'Read/Write Replicas', 'Redis Caching Patterns', 'Rate Limiting', 'Database Sharding'],
      skillsTrained: ['system-design', 'redis', 'scalability'],
    },
    {
      id: 'infosec',
      name: 'Information Security & Cryptography',
      code: 'CS4003',
      topics: ['Public Key Infrastructure (RSA/ECC)', 'OWASP Top 10 Mitigations', 'OAuth2 & JWTs', 'Hash Salting & Argon2', 'Zero Trust'],
      skillsTrained: ['security', 'cryptography'],
    },
  ],
  'Semester 8': [
    {
      id: 'sysdes',
      name: 'Enterprise System Architecture',
      code: 'CS4004',
      topics: ['SLA/SLO Budgeting', 'Kafka Streaming Pipelines', 'Eventual Consistency', 'Disaster Recovery & Multi-Region'],
      skillsTrained: ['kafka', 'system-design', 'enterprise-architecture'],
    },
    {
      id: 'devops',
      name: 'DevOps & Site Reliability',
      code: 'CS4005',
      topics: ['Infrastructure as Code (Terraform)', 'Kubernetes Ingress & Mesh', 'Prometheus & Grafana Telemetry', 'Blue-Green Deployments'],
      skillsTrained: ['devops', 'docker', 'ci-cd'],
    },
    {
      id: 'ai_systems',
      name: 'AI Engineering & Production ML',
      code: 'CS4006',
      topics: ['Model Quantization', 'Vector Databases & Embeddings', 'RAG Pipelines', 'Inference Latency Optimization'],
      skillsTrained: ['python', 'mlops', 'ai'],
    },
  ],
};

// Fallback questions for Semester 5 and 6 (Default for candidate in Semester 6)
export const CURATED_SEM6_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'sem6-db-01',
    subject: 'Database Management Systems & Indexing',
    topic: 'Composite Indexing & Leftmost Prefix',
    difficulty: 'medium',
    question: 'Given a PostgreSQL table with composite index `idx_users (country_code, signup_year, status)`, which of the following WHERE queries CANNOT utilize the index effectively and will cause a full table scan?',
    codeSnippet: `CREATE INDEX idx_users ON users(country_code, signup_year, status);`,
    options: [
      'WHERE country_code = \'IN\' AND signup_year = 2024',
      'WHERE signup_year = 2024 AND status = \'active\'',
      'WHERE country_code = \'IN\' AND status = \'active\' (utilizing partial index skip)',
      'WHERE country_code = \'IN\' AND signup_year = 2024 AND status = \'active\''
    ],
    correctIndex: 1,
    explanation: 'Composite B-Tree indexes follow the Leftmost Prefix rule. Because the index begins with `country_code`, queries that omit `country_code` (such as filtering only on `signup_year` and `status`) cannot traverse the root node of the B-tree and require a Sequential Scan.'
  },
  {
    id: 'sem6-db-02',
    subject: 'Database Management Systems & Indexing',
    topic: 'Transactions & Isolation Levels',
    difficulty: 'hard',
    question: 'In an ACID-compliant relational database running at READ COMMITTED isolation level, which concurrency anomaly can STILL occur?',
    options: [
      'Dirty Read (reading uncommitted writes from another transaction)',
      'Non-Repeatable Read (reading different values for the same row upon re-querying within the same transaction)',
      'Dirty Write (overwriting uncommitted concurrent writes)',
      'Write-Write Collision on serializable snapshot'
    ],
    correctIndex: 1,
    explanation: 'READ COMMITTED isolation guarantees that queries only read committed data (preventing Dirty Reads). However, if Transaction B commits an update to a row while Transaction A is still active, Transaction A will observe different data if it re-reads that row (Non-Repeatable Read). Preventing this requires REPEATABLE READ or SERIALIZABLE.'
  },
  {
    id: 'sem6-db-03',
    subject: 'Database Management Systems & Indexing',
    topic: 'Database Normalization',
    difficulty: 'medium',
    question: 'A table is in Third Normal Form (3NF) if and only if it is in 2NF and:',
    options: [
      'Every non-prime attribute is fully functional dependent on the candidate key',
      'There is no transitive functional dependency of non-prime attributes on candidate keys',
      'For every functional dependency X -> Y, X is a superkey (Boyce-Codd definition)',
      'Multivalued dependencies are eliminated into separate tables'
    ],
    correctIndex: 1,
    explanation: '3NF removes transitive dependencies (e.g. A -> B and B -> C, where non-prime attribute C depends on non-prime attribute B rather than solely the primary key). Option 3 defines BCNF, which is stricter than 3NF.'
  },
  {
    id: 'sem6-db-04',
    subject: 'Database Management Systems & Indexing',
    topic: 'SQL Execution Plan Analysis',
    difficulty: 'hard',
    question: 'What is the primary difference between a Nested Loop Join and a Hash Join in relational query engines?',
    options: [
      'Nested Loop creates an in-memory hash table of the inner table; Hash Join iterates line by line',
      'Hash Join builds an in-memory hash table for the smaller table and probes with the larger table; Nested Loop scans the outer table and probes the inner table (optimal when inner table is indexed)',
      'Hash Join requires both inputs to be pre-sorted on join keys; Nested Loop works on unsorted streams',
      'Nested Loop only works for equality joins (`=`); Hash Join supports range comparisons (`<`, `>`)'
    ],
    correctIndex: 1,
    explanation: 'Hash Join hashes the smaller relation in memory using join key hashes and streams the larger relation once. Nested Loop loops over rows of the outer relation and looks up matching rows in the inner relation (extremely fast if inner relation has a B-tree index, but O(N*M) without an index).'
  },
  {
    id: 'sem6-os-01',
    subject: 'Operating Systems & Concurrency',
    topic: 'Virtual Memory & Page Fault Handling',
    difficulty: 'medium',
    question: 'When a CPU attempts to access a virtual memory address whose corresponding page table entry has the `Valid-Invalid` bit set to `0`, what hardware event occurs?',
    options: [
      'A General Protection Fault crashes the process immediately',
      'The CPU raises a Page Fault interrupt (trap to OS kernel mode) to fetch the missing page frame from secondary swap storage',
      'The Memory Management Unit (MMU) automatically zeroes out the RAM block and restarts instruction',
      'The Translation Lookaside Buffer (TLB) forces a dirty cache write-back'
    ],
    correctIndex: 1,
    explanation: 'A bit of 0 indicates the page is not resident in physical RAM. The MMU raises a Page Fault exception, transitioning CPU control to the OS kernel trap handler, which finds the block in swap space, allocates a free frame, loads the disk page into RAM, updates the page table bit to 1, and resumes the instruction.'
  },
  {
    id: 'sem6-os-02',
    subject: 'Operating Systems & Concurrency',
    topic: 'Deadlock Necessary Conditions',
    difficulty: 'medium',
    question: 'Which of the following is NOT one of Coffman\'s four necessary and sufficient conditions for a system deadlock?',
    options: [
      'Mutual Exclusion',
      'Hold and Wait',
      'Preemptive Resource Reallocation',
      'Circular Wait'
    ],
    correctIndex: 2,
    explanation: 'The four Coffman conditions are: (1) Mutual Exclusion, (2) Hold and Wait, (3) No Preemption (resources cannot be forcibly taken away), and (4) Circular Wait. Preemptive reallocation is a technique used to PREVENT or break deadlock, not a condition that causes it.'
  },
  {
    id: 'sem6-os-03',
    subject: 'Operating Systems & Concurrency',
    topic: 'Thread Synchronization & Mutex',
    difficulty: 'hard',
    question: 'What is the key functional difference between a Spinlock and a Mutex in OS kernel and systems development?',
    options: [
      'A Spinlock allows multiple readers; a Mutex is strictly single-threaded',
      'A thread waiting for a Spinlock actively polls in a tight CPU loop without context switching; a Mutex causes the waiting thread to yield the CPU and be put into a sleep/blocked queue by the scheduler',
      'A Spinlock can only be used in user space; Mutexes can only exist in kernel mode',
      'A Mutex causes busy-waiting on multi-core processors'
    ],
    correctIndex: 1,
    explanation: 'Spinlocks keep the core busy (`busy-waiting`) and avoid thread context-switch latency, making them ideal for very short critical sections (e.g. interrupt handlers). Mutexes put the calling thread to sleep, yielding CPU time to other processes, which is preferred for long-duration locks.'
  },
  {
    id: 'sem6-os-04',
    subject: 'Operating Systems & Concurrency',
    topic: 'Process Scheduling Algorithms',
    difficulty: 'medium',
    question: 'In Round-Robin CPU scheduling, what occurs if the time quantum allocated to processes is configured to be arbitrarily large (approaching infinity)?',
    options: [
      'The algorithm degrades to First-Come, First-Served (FCFS)',
      'The system achieves optimal Shortest Job First (SJF) throughput',
      'Starvation occurs for I/O-bound processes exclusively',
      'Thrashing occurs due to rapid context switching'
    ],
    correctIndex: 0,
    explanation: 'If the time slice is larger than the longest process burst time, no process is ever preempted mid-burst, meaning processes run to completion in the exact order they arrive in the ready queue—which is the exact definition of FCFS.'
  },
  {
    id: 'sem6-cn-01',
    subject: 'Computer Networks & Security',
    topic: 'TCP 3-Way Handshake & Teardown',
    difficulty: 'medium',
    question: 'During a graceful TCP connection termination, why does the initiating client remain in the `TIME_WAIT` state for 2 MSL (Maximum Segment Lifetime)?',
    options: [
      'To verify DNS reverse records before recycling the socket',
      'To allow any lingering or duplicate packets traversing the network to die out and ensure the final ACK was received by the server',
      'To calculate the final congestion window size for future sessions',
      'To release the ephemeral port back to the OS immediately'
    ],
    correctIndex: 1,
    explanation: 'TIME_WAIT prevents duplicate delayed segments from a previous connection from being misinterpreted as valid data in a newly opened connection on the same socket pair. It also ensures the server receives the client\'s final ACK; if lost, the server retransmits FIN, which the client can still respond to while in TIME_WAIT.'
  },
  {
    id: 'sem6-cn-02',
    subject: 'Computer Networks & Security',
    topic: 'TCP Flow Control vs Congestion Control',
    difficulty: 'hard',
    question: 'How do TCP Flow Control and TCP Congestion Control differ in what they protect?',
    options: [
      'Flow Control protects intermediate network routers; Congestion Control protects the receiving client buffer',
      'Flow Control prevents the sender from overwhelming the receiver\'s buffer (using Receive Window `rwnd`); Congestion Control prevents the sender from overwhelming network pipe capacity (using Congestion Window `cwnd`)',
      'Flow Control uses slow start; Congestion Control uses zero window probes',
      'They are identical algorithms operating on different OSI layers'
    ],
    correctIndex: 1,
    explanation: 'Flow Control is end-to-end between sender and receiver (`rwnd` advertised in TCP headers). Congestion Control is sender-to-network to prevent intermediate routers and links from becoming congested (`cwnd` calculated via algorithms like Reno, Cubic, or BBR). Actual transmission rate is min(cwnd, rwnd).'
  },
  {
    id: 'sem6-cn-03',
    subject: 'Computer Networks & Security',
    topic: 'HTTP/1.1 vs HTTP/2 Protocol Multiplexing',
    difficulty: 'medium',
    question: 'What is the primary architectural enhancement in HTTP/2 that solves HTTP/1.1 Head-of-Line (HoL) blocking at the application layer?',
    options: [
      'Switching from TCP to UDP datagrams',
      'Binary framing and bi-directional multiplexing of multiple concurrent request/response streams over a single TCP connection',
      'Replacing TLS encryption with uncompressed headers',
      'Mandatory client-side local caching on all GET requests'
    ],
    correctIndex: 1,
    explanation: 'In HTTP/1.1, pipelining required responses to arrive in exact request order over a connection. HTTP/2 introduces a binary framing layer where requests and responses are split into interleaved frames tagged with stream IDs, allowing hundreds of requests to fly simultaneously over a single TCP socket without blocking each other at the HTTP layer.'
  },
  {
    id: 'sem6-cn-04',
    subject: 'Computer Networks & Security',
    topic: 'Subnetting & CIDR Address Calculations',
    difficulty: 'easy',
    question: 'For an IPv4 subnet configured with prefix `/27`, how many usable host IP addresses are available for allocation to machines?',
    options: [
      '32',
      '30',
      '28',
      '62'
    ],
    correctIndex: 1,
    explanation: 'A /27 subnet leaves 32 - 27 = 5 host bits. Total IP addresses = 2^5 = 32. Subtracting 2 reserved addresses (the network address all 0s and the broadcast address all 1s) yields exactly 30 usable host addresses.'
  }
];

// Fallback questions for Sem 3 / 4
export const CURATED_SEM4_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'sem4-dsa-01',
    subject: 'Data Structures & Algorithms',
    topic: 'Asymptotic Analysis & Trees',
    difficulty: 'medium',
    question: 'What is the worst-case time complexity of searching for an element in a binary search tree (BST) that is completely unbalanced (skewed)?',
    options: ['O(log N)', 'O(N)', 'O(N log N)', 'O(1)'],
    correctIndex: 1,
    explanation: 'In a degenerate or skewed BST, each node has only one child, transforming the tree into a linked list of length N. Searching requires inspecting every element sequentially, leading to O(N) worst-case time complexity.'
  },
  {
    id: 'sem4-dsa-02',
    subject: 'Data Structures & Algorithms',
    topic: 'Graph Search & Shortest Path',
    difficulty: 'medium',
    question: 'Dijkstra\'s algorithm fails to compute the correct shortest path on a weighted directed graph if:',
    options: ['The graph contains cycles', 'The graph contains negative edge weights', 'The graph is disconnected', 'The graph has more than 10,000 vertices'],
    correctIndex: 1,
    explanation: 'Dijkstra assumes that adding an edge to an existing path always increases or maintains its total weight (greedy property). With negative weights, a path that seemed longer earlier might become shorter later, violating the invariant. Bellman-Ford or SPFA is required for graphs with negative weights.'
  },
  {
    id: 'sem4-oop-01',
    subject: 'Object-Oriented Programming',
    topic: 'Polymorphism & Virtual Methods',
    difficulty: 'medium',
    question: 'In C++ and Java, what mechanism enables runtime (dynamic) method dispatch when a base class reference invokes an overridden method on a derived class object?',
    options: ['Direct inline compilation', 'VTable (Virtual Method Table) and vptr pointer lookup at runtime', 'Type casting to void pointer', 'Thread-local storage cache'],
    correctIndex: 1,
    explanation: 'Classes with virtual methods maintain a VTable containing function pointers to the most-derived implementations. Each instance has an invisible `vptr` pointing to this table, allowing dynamic resolution at runtime rather than compile-time.'
  },
  {
    id: 'sem4-oop-02',
    subject: 'Object-Oriented Programming',
    topic: 'Design Principles (SOLID)',
    difficulty: 'easy',
    question: 'The Liskov Substitution Principle (LSP) in SOLID design states that:',
    options: [
      'Classes should have only one reason to change',
      'Objects of a superclass should be replaceable with objects of a subclass without altering the correctness of the program',
      'High-level modules should not depend on low-level modules; both should depend on abstractions',
      'Many client-specific interfaces are better than one general-purpose interface'
    ],
    correctIndex: 1,
    explanation: 'LSP guarantees that derived classes extend base classes without violating base class invariants, pre-conditions, or post-conditions.'
  }
];

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (window as any).__GEMINI_API_KEY__;
  if (!apiKey) return null;
  try {
    return new GoogleGenAI({ apiKey });
  } catch (e) {
    console.warn('Failed to initialize GoogleGenAI client for assessment:', e);
    return null;
  }
}

/**
 * Generates technical assessment questions for a specific semester curriculum.
 * Uses Gemini API if active, otherwise loads curated curriculum questions.
 */
export async function getSemesterAssessmentQuestions(
  semester: string = 'Semester 6',
  department: string = 'Computer Science & Engineering'
): Promise<AssessmentQuestion[]> {
  const subjects = SEMESTER_SUBJECT_CONFIGS[semester] || SEMESTER_SUBJECT_CONFIGS['Semester 6'];
  const subjectNames = subjects.map(s => s.name).join(', ');

  const ai = getGeminiClient();
  if (ai) {
    try {
      const prompt = `You are an expert Technical Assessment Director at SRM Institute of Science and Technology.
Generate 10 technical multiple-choice assessment questions for a student in "${semester}" of "${department}".
The 3 core curriculum subjects are: ${subjectNames}.

Distribution:
- Generate 3 to 4 questions per subject.
- Cover real technical topics: code snippets, execution behavior, systems internals, indexing, protocol mechanics, and algorithmic trade-offs.
- Difficulty should be a blend of medium and hard, suitable for Super Dream campus placements.

Strict JSON Output format:
[
  {
    "id": "q-1",
    "subject": "${subjects[0].name}",
    "topic": "Indexing mechanics",
    "difficulty": "medium",
    "question": "What is the primary consequence...",
    "codeSnippet": "optional code snippet or query if relevant",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 1,
    "explanation": "Detailed explanation of why this option is correct and why others are incorrect."
  }
]
Return ONLY raw JSON with no Markdown backticks or enclosing prose.`;

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

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 8) {
        return parsed.map((item, index) => ({
          id: item.id || `ai-q-${index + 1}`,
          subject: item.subject || subjects[index % subjects.length].name,
          topic: item.topic || 'Core Concept',
          difficulty: item.difficulty || 'medium',
          question: item.question,
          codeSnippet: item.codeSnippet || undefined,
          options: item.options,
          correctIndex: item.correctIndex ?? 0,
          explanation: item.explanation || 'Verified conceptual answer.',
        }));
      }
    } catch (err) {
      console.warn('Gemini dynamic question generation failed, using curated fallback:', err);
    }
  }

  // Curated Fallbacks based on semester
  if (semester === 'Semester 3' || semester === 'Semester 4') {
    return CURATED_SEM4_QUESTIONS;
  }

  // Default to Semester 6 comprehensive suite
  return CURATED_SEM6_QUESTIONS;
}

/**
 * Calculates grade and detailed breakdown for submitted assessment.
 */
export function evaluateSemesterAssessment(
  questions: AssessmentQuestion[],
  answers: Record<string, number>,
  timeSpentSeconds: number
): SemesterAssessmentResult {
  let correctCount = 0;
  const subjectMap: Record<string, { total: number; correct: number }> = {};

  questions.forEach(q => {
    if (!subjectMap[q.subject]) {
      subjectMap[q.subject] = { total: 0, correct: 0 };
    }
    subjectMap[q.subject].total += 1;

    const selected = answers[q.id];
    if (selected !== undefined && selected === q.correctIndex) {
      correctCount += 1;
      subjectMap[q.subject].correct += 1;
    }
  });

  const percentageScore = Math.round((correctCount / Math.max(1, questions.length)) * 100);

  const subjectScores = Object.entries(subjectMap).map(([subject, stats]) => ({
    subject,
    total: stats.total,
    correct: stats.correct,
    percentage: Math.round((stats.correct / Math.max(1, stats.total)) * 100),
  }));

  return {
    totalQuestions: questions.length,
    correctAnswers: correctCount,
    percentageScore,
    timeSpentSeconds,
    subjectScores,
    answers,
    reviewedQuestions: questions,
    completedAt: new Date().toISOString(),
  };
}
