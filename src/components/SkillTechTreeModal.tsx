import React, { useState } from 'react';
import { StudentProfileData } from '../types';

export interface TechTreeNode {
  id: string;
  name: string;
  shortName: string;
  category: string;
  layer: 'foundation' | 'intermediate' | 'target';
  layerLabel: string;
  x: number;
  y: number;
  prerequisiteIds: string[];
  associatedSkillId?: string; // links to comp-redis, comp-docker, comp-sql, comp-py, etc.
  description: string;
  placementImpact: string;
  placementCompanies: string[];
  quizSkillId?: string;
  powSkillId?: string;
}

interface SkillTechTreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSkillKey: string; // 'dem-kaf' | 'dem-red' | 'dem-dck' | 'dem-sql' | 'dem-py' | 'dem-git'
  profile: StudentProfileData;
  onOpenQuiz?: (skillId: string) => void;
  onOpenProofOfWork?: (skillId: string) => void;
  onNavigate?: (screen: string) => void;
}

// Tree templates configured for all 6 market skills
interface TreeDefinition {
  targetKey: string;
  targetTitle: string;
  targetRoleBadge: string;
  nodes: TechTreeNode[];
}

export const TECH_TREE_DEFINITIONS: Record<string, TreeDefinition> = {
  'dem-kaf': {
    targetKey: 'dem-kaf',
    targetTitle: 'Apache Kafka Event Streaming',
    targetRoleBadge: 'High-Throughput Distributed Systems',
    nodes: [
      {
        id: 'node-os',
        name: 'OS Fundamentals (Threads & I/O)',
        shortName: 'OS Threads & I/O',
        category: 'Core CS',
        layer: 'foundation',
        layerLabel: 'Layer 1: Foundations',
        x: 130,
        y: 110,
        prerequisiteIds: [],
        associatedSkillId: 'comp-sys',
        description:
          'Linux kernel page caches, non-blocking file descriptors, and thread scheduling overhead in high-throughput daemon runtimes.',
        placementImpact:
          'Amazon SDE-1 and Cisco grill candidates on why Kafka uses zero-copy OS sendfile() rather than user-space memory buffers.',
        placementCompanies: ['Amazon', 'Cisco', 'Barclays'],
      },
      {
        id: 'node-ds',
        name: 'Data Structures (B-Trees & Hashes)',
        shortName: 'B-Trees & Hashes',
        category: 'Core CS',
        layer: 'foundation',
        layerLabel: 'Layer 1: Foundations',
        x: 130,
        y: 290,
        prerequisiteIds: [],
        associatedSkillId: 'comp-py',
        description:
          'Log-Structured Merge (LSM) trees, contiguous sequential append-only disk segments, and memory-mapped index offsets.',
        placementImpact:
          'Interviewers probe how sequential disk writes approach RAM throughput (~600MB/s) in append-only storage segments.',
        placementCompanies: ['Amazon', 'NatWest'],
      },
      {
        id: 'node-async',
        name: 'Concurrency & Async I/O',
        shortName: 'Concurrency & Async',
        category: 'Intermediate',
        layer: 'intermediate',
        layerLabel: 'Layer 2: Core Middleware',
        x: 410,
        y: 110,
        prerequisiteIds: ['node-os'],
        associatedSkillId: 'comp-sys',
        description:
          'Event loops, non-blocking network multiplexing (epoll/kqueue), connection pools, and lockless consumer queues.',
        placementImpact:
          'Tested in round-1 technical assessments for backend services handling 10,000+ persistent TCP connections.',
        placementCompanies: ['Amazon', 'Cisco'],
      },
      {
        id: 'node-docker',
        name: 'Docker Containerization',
        shortName: 'Docker Containers',
        category: 'Infrastructure',
        layer: 'intermediate',
        layerLabel: 'Layer 2: Core Middleware',
        x: 410,
        y: 290,
        prerequisiteIds: ['node-os', 'node-ds'],
        associatedSkillId: 'comp-docker',
        description:
          'Multi-stage container builds, ephemeral volume mounts, network bridges, and containerized broker testbeds.',
        placementImpact:
          'Mandatory gate for Cisco Systems and CloudScale Infrastructure campus placement rounds.',
        placementCompanies: ['Cisco', 'CloudScale'],
        quizSkillId: 'comp-docker',
        powSkillId: 'comp-docker',
      },
      {
        id: 'node-target',
        name: 'Apache Kafka Event Streaming',
        shortName: 'Apache Kafka',
        category: 'Distributed Systems',
        layer: 'target',
        layerLabel: 'Layer 3: Target Placement Skill',
        x: 690,
        y: 200,
        prerequisiteIds: ['node-async', 'node-docker'],
        associatedSkillId: 'comp-kafka',
        description:
          'Partition key distribution, consumer group rebalances, commit offsets (at-least-once), ISR replication, and ZooKeeper/KRaft quorum.',
        placementImpact:
          'Core qualification for Super Dream distributed systems backend roles (₹24.5 - ₹42.0 LPA).',
        placementCompanies: ['Amazon SDE-1', 'Cisco Systems', 'Barclays Analyst'],
        quizSkillId: 'comp-kafka',
      },
    ],
  },
  'dem-red': {
    targetKey: 'dem-red',
    targetTitle: 'Redis Distributed Caching & Rate Limiting',
    targetRoleBadge: 'High-Concurrency Caching Tier',
    nodes: [
      {
        id: 'node-os',
        name: 'OS Fundamentals (Threads & I/O)',
        shortName: 'OS Threads & I/O',
        category: 'Core CS',
        layer: 'foundation',
        layerLabel: 'Layer 1: Foundations',
        x: 130,
        y: 110,
        prerequisiteIds: [],
        associatedSkillId: 'comp-sys',
        description: 'Single-threaded event loop architecture, reactor pattern, and in-memory key eviction policies.',
        placementImpact: 'Tested during technical panel questions on Redis event loops vs multithreaded Memcached.',
        placementCompanies: ['Amazon', 'Barclays'],
      },
      {
        id: 'node-ds',
        name: 'Data Structures (Skip Lists & ZSETs)',
        shortName: 'Skip Lists & Hashes',
        category: 'Core CS',
        layer: 'foundation',
        layerLabel: 'Layer 1: Foundations',
        x: 130,
        y: 290,
        prerequisiteIds: [],
        associatedSkillId: 'comp-py',
        description: 'Skip lists, sorted sets (ZSET), hyperloglogs, and memory compact string encodings (ziplists).',
        placementImpact: 'Crucial for implementing timestamp-scored sliding window rate limiters with sub-5ms latency.',
        placementCompanies: ['Amazon', 'Cisco'],
      },
      {
        id: 'node-async',
        name: 'Concurrency & Pipeline Atomicity',
        shortName: 'Atomic Pipelines',
        category: 'Intermediate',
        layer: 'intermediate',
        layerLabel: 'Layer 2: Core Middleware',
        x: 410,
        y: 110,
        prerequisiteIds: ['node-os'],
        associatedSkillId: 'comp-sys',
        description: 'MULTI/EXEC transactions, Lua server-side scripting, and optimistic concurrency with WATCH.',
        placementImpact: 'Eliminates race conditions under 10,000 req/sec parallel burst traffic.',
        placementCompanies: ['Barclays', 'NatWest'],
      },
      {
        id: 'node-sql',
        name: 'Relational DB Caching Integration',
        shortName: 'Cache-Aside & Invalidation',
        category: 'Databases',
        layer: 'intermediate',
        layerLabel: 'Layer 2: Core Middleware',
        x: 410,
        y: 290,
        prerequisiteIds: ['node-ds'],
        associatedSkillId: 'comp-sql',
        description: 'Cache-aside read path, write-through vs write-behind, TTL jitter to stop cache stampedes.',
        placementImpact: 'Directly tested in Super Dream systems design interview questions.',
        placementCompanies: ['Amazon', 'Cisco'],
        quizSkillId: 'comp-sql',
      },
      {
        id: 'node-target',
        name: 'Redis Distributed Caching',
        shortName: 'Redis Caching & ZSET',
        category: 'Distributed Systems',
        layer: 'target',
        layerLabel: 'Layer 3: Target Placement Skill',
        x: 690,
        y: 200,
        prerequisiteIds: ['node-async', 'node-sql'],
        associatedSkillId: 'comp-redis',
        description: 'ZSET sliding-window rate limiters, cluster sharding, Sentinel failover, and Redis Streams.',
        placementImpact: 'Verifiable Proof-of-Work project verified on GitHub awards immediate +8% Readiness boost.',
        placementCompanies: ['Amazon SDE-1', 'Cisco Systems', 'Barclays Analyst'],
        quizSkillId: 'comp-redis',
        powSkillId: 'comp-redis',
      },
    ],
  },
  'dem-dck': {
    targetKey: 'dem-dck',
    targetTitle: 'Docker & Multi-Stage Containerization',
    targetRoleBadge: 'Cloud Infrastructure & Microservices',
    nodes: [
      {
        id: 'node-os',
        name: 'Linux Namespaces & Cgroups',
        shortName: 'Linux Kernel Primitives',
        category: 'Core CS',
        layer: 'foundation',
        layerLabel: 'Layer 1: Foundations',
        x: 130,
        y: 110,
        prerequisiteIds: [],
        associatedSkillId: 'comp-sys',
        description: 'PID, mount, network namespaces, and cgroups resource limiting for process isolation.',
        placementImpact: 'Probes whether candidate understands how containers differ fundamentally from virtual machines.',
        placementCompanies: ['Cisco', 'CloudScale'],
      },
      {
        id: 'node-git',
        name: 'Git & Version Control Workflows',
        shortName: 'Git & CI Pipelines',
        category: 'DevOps',
        layer: 'foundation',
        layerLabel: 'Layer 1: Foundations',
        x: 130,
        y: 290,
        prerequisiteIds: [],
        associatedSkillId: 'comp-git',
        description: 'Automated GitHub Actions CI runners, branch protection, and commit hash tagging for releases.',
        placementImpact: 'Verified on GitHub repository audit; standard requirement across all placement tiers.',
        placementCompanies: ['Amazon', 'Cisco', 'TCS Digital'],
        powSkillId: 'comp-docker',
      },
      {
        id: 'node-security',
        name: 'Container Security & Rootless Context',
        shortName: 'Container Security Context',
        category: 'Security',
        layer: 'intermediate',
        layerLabel: 'Layer 2: Core Middleware',
        x: 410,
        y: 110,
        prerequisiteIds: ['node-os'],
        associatedSkillId: 'comp-docker',
        description: 'USER non-root UID 10001, read-only root filesystems, and dropping default Linux capabilities.',
        placementImpact: 'Guards against container escape vulnerabilities in shared enterprise clusters.',
        placementCompanies: ['Amazon', 'Barclays'],
      },
      {
        id: 'node-layer',
        name: 'Layer Caching & Multi-Stage Builds',
        shortName: 'Multi-Stage Optimization',
        category: 'Infrastructure',
        layer: 'intermediate',
        layerLabel: 'Layer 2: Core Middleware',
        x: 410,
        y: 290,
        prerequisiteIds: ['node-os', 'node-git'],
        associatedSkillId: 'comp-docker',
        description: 'Separating build dependencies from runtime binaries, slashing image size by >60%.',
        placementImpact: 'Interviewers ask candidates how they reduced deployment times and container vulnerability surface.',
        placementCompanies: ['Cisco', 'CloudScale'],
        quizSkillId: 'comp-docker',
      },
      {
        id: 'node-target',
        name: 'Production Multi-Stage Dockerization',
        shortName: 'Production Dockerization',
        category: 'Cloud Infrastructure',
        layer: 'target',
        layerLabel: 'Layer 3: Target Placement Skill',
        x: 690,
        y: 200,
        prerequisiteIds: ['node-security', 'node-layer'],
        associatedSkillId: 'comp-docker',
        description: 'Hardened Alpine/Distroless containers, Docker Compose orchestration, and sub-100MB footprint.',
        placementImpact: 'Mandatory technical prerequisite for unlocking Amazon and Cisco placement drive shortlists.',
        placementCompanies: ['Amazon', 'Cisco', 'CloudScale'],
        quizSkillId: 'comp-docker',
        powSkillId: 'comp-docker',
      },
    ],
  },
  'dem-sql': {
    targetKey: 'dem-sql',
    targetTitle: 'SQL & Relational Query Optimization',
    targetRoleBadge: 'Transactional Data Engineering',
    nodes: [
      {
        id: 'node-ds',
        name: 'Data Structures (B+ Trees & Disk Pages)',
        shortName: 'B+ Tree Indexing',
        category: 'Core CS',
        layer: 'foundation',
        layerLabel: 'Layer 1: Foundations',
        x: 130,
        y: 110,
        prerequisiteIds: [],
        associatedSkillId: 'comp-sql',
        description: 'B+ Tree page fanout, depth-3 node traversal, leaf node bidirectional linked lists for range scans.',
        placementImpact: 'Standard technical interview grill: why B+ Trees are preferred over Hash indexing for range queries.',
        placementCompanies: ['Amazon', 'Cisco', 'Barclays'],
      },
      {
        id: 'node-acid',
        name: 'ACID Transactions & Write-Ahead Logs',
        shortName: 'ACID & WAL Internals',
        category: 'Core CS',
        layer: 'foundation',
        layerLabel: 'Layer 1: Foundations',
        x: 130,
        y: 290,
        prerequisiteIds: [],
        associatedSkillId: 'comp-sql',
        description: 'WAL fsync durability, MVCC row versioning, snapshot isolation, and deadlock detection graph algorithms.',
        placementImpact: 'Evaluates candidate understanding of high-concurrency payment and order processing consistency.',
        placementCompanies: ['Barclays', 'NatWest'],
      },
      {
        id: 'node-joins',
        name: 'Hash & Merge Join Execution Plans',
        shortName: 'Query Planner & Joins',
        category: 'Database Engines',
        layer: 'intermediate',
        layerLabel: 'Layer 2: Core Middleware',
        x: 410,
        y: 110,
        prerequisiteIds: ['node-ds'],
        associatedSkillId: 'comp-sql',
        description: 'Cost-based query optimizer (EXPLAIN ANALYZE), hash join memory buckets, and sort merge joins.',
        placementImpact: 'Probes how candidate diagnoses query latency degradation under 50M+ row production tables.',
        placementCompanies: ['Amazon', 'Barclays'],
        quizSkillId: 'comp-sql',
      },
      {
        id: 'node-indices',
        name: 'Composite Indexing & Covering Queries',
        shortName: 'Composite Indices',
        category: 'Database Engines',
        layer: 'intermediate',
        layerLabel: 'Layer 2: Core Middleware',
        x: 410,
        y: 290,
        prerequisiteIds: ['node-ds', 'node-acid'],
        associatedSkillId: 'comp-sql',
        description: 'Column ordering rules (equality leading, range second), index-only scans, and partial indexes.',
        placementImpact: 'Directly linked to resume bullet: slashing p99 query latency from 840ms to 68ms.',
        placementCompanies: ['Amazon', 'Cisco'],
        quizSkillId: 'comp-sql',
      },
      {
        id: 'node-target',
        name: 'PostgreSQL Advanced Tuning & ACID Scale',
        shortName: 'PostgreSQL Index Scale',
        category: 'Databases',
        layer: 'target',
        layerLabel: 'Layer 3: Target Placement Skill',
        x: 690,
        y: 200,
        prerequisiteIds: ['node-joins', 'node-indices'],
        associatedSkillId: 'comp-sql',
        description: 'Comprehensive query tuning, connection poolers (PgBouncer), table partitioning, and autovacuum tuning.',
        placementImpact: 'Verification upgrades candidate profile by +12% Readiness benchmark.',
        placementCompanies: ['Amazon', 'Barclays', 'Cisco'],
        quizSkillId: 'comp-sql',
      },
    ],
  },
  'dem-py': {
    targetKey: 'dem-py',
    targetTitle: 'Python Distributed Core & Async Systems',
    targetRoleBadge: 'High-Performance Backend Engineering',
    nodes: [
      {
        id: 'node-os',
        name: 'Python Memory & GIL Internals',
        shortName: 'GIL & Reference Counting',
        category: 'Core CS',
        layer: 'foundation',
        layerLabel: 'Layer 1: Foundations',
        x: 130,
        y: 110,
        prerequisiteIds: [],
        associatedSkillId: 'comp-py',
        description: 'Global Interpreter Lock (GIL), cyclic garbage collection, object pooling, and bytecode compilation.',
        placementImpact: 'Core interview topic for distinguishing junior scripting from senior systems engineering.',
        placementCompanies: ['Amazon', 'Cisco'],
      },
      {
        id: 'node-ds',
        name: 'Data Structures & Algorithmic Complexity',
        shortName: 'Big-O & Structures',
        category: 'Core CS',
        layer: 'foundation',
        layerLabel: 'Layer 1: Foundations',
        x: 130,
        y: 290,
        prerequisiteIds: [],
        associatedSkillId: 'comp-py',
        description: 'Dynamic array growth amortized complexity, dictionary hash collision resolution, and heaps/queues.',
        placementImpact: 'Prerequisite for clearing automated Coding Round 1 at all Super Dream and Dream companies.',
        placementCompanies: ['Amazon', 'Cisco', 'Barclays', 'TCS Digital'],
      },
      {
        id: 'node-async',
        name: 'AsyncIO & Coroutine Scheduling',
        shortName: 'AsyncIO & Tasks',
        category: 'Concurrency',
        layer: 'intermediate',
        layerLabel: 'Layer 2: Core Middleware',
        x: 410,
        y: 110,
        prerequisiteIds: ['node-os'],
        associatedSkillId: 'comp-py',
        description: 'async/await syntax, Task scheduling on the event loop, uvloop integration, and cooperative multitasking.',
        placementImpact: 'Tested heavily when building high-concurrency microservices and gRPC routing daemons.',
        placementCompanies: ['Amazon', 'Cisco'],
      },
      {
        id: 'node-grpc',
        name: 'gRPC & Protocol Buffers Serialization',
        shortName: 'gRPC & Protobuf',
        category: 'Networking',
        layer: 'intermediate',
        layerLabel: 'Layer 2: Core Middleware',
        x: 410,
        y: 290,
        prerequisiteIds: ['node-os', 'node-ds'],
        associatedSkillId: 'comp-py',
        description: 'HTTP/2 multiplexed streams, binary protobuf wire format, and bidirectional RPC communication.',
        placementImpact: 'Directly validates student capstone project (Autonomous Routing Mesh across 24 nodes).',
        placementCompanies: ['Amazon', 'Cisco'],
      },
      {
        id: 'node-target',
        name: 'High-Throughput Python Distributed Backend',
        shortName: 'Distributed Python Backend',
        category: 'Core Backend',
        layer: 'target',
        layerLabel: 'Layer 3: Target Placement Skill',
        x: 690,
        y: 200,
        prerequisiteIds: ['node-async', 'node-grpc'],
        associatedSkillId: 'comp-py',
        description: 'High-throughput async event workers, multiprocessing pools, and resilient distributed microservices.',
        placementImpact: 'Candidate holds verified proficiency of 4.2/5.0 from Assessment #PY-402.',
        placementCompanies: ['Amazon', 'Cisco', 'Barclays'],
      },
    ],
  },
  'dem-git': {
    targetKey: 'dem-git',
    targetTitle: 'Git & Distributed Versioning Workflows',
    targetRoleBadge: 'DevOps & Collaboration Infrastructure',
    nodes: [
      {
        id: 'node-git-graph',
        name: 'DAG & Content-Addressable Storage',
        shortName: 'Git DAG Objects',
        category: 'Core CS',
        layer: 'foundation',
        layerLabel: 'Layer 1: Foundations',
        x: 130,
        y: 110,
        prerequisiteIds: [],
        associatedSkillId: 'comp-git',
        description: 'Directed Acyclic Graphs (DAG), SHA-1/SHA-256 object hashes, commits, trees, and blobs.',
        placementImpact: 'Tests deep conceptual grasp of version control mechanics over surface command memorization.',
        placementCompanies: ['Amazon', 'Cisco'],
      },
      {
        id: 'node-branching',
        name: 'Trunk-Based Development & Merging',
        shortName: 'Branching & Rebase',
        category: 'Workflows',
        layer: 'foundation',
        layerLabel: 'Layer 1: Foundations',
        x: 130,
        y: 290,
        prerequisiteIds: [],
        associatedSkillId: 'comp-git',
        description: 'Interactive rebase, squash commits, cherry-picking, fast-forward merges, and three-way merge resolution.',
        placementImpact: 'Required for working in large distributed software engineering organizations with continuous integration.',
        placementCompanies: ['Amazon', 'Barclays'],
      },
      {
        id: 'node-ci',
        name: 'Automated GitHub Actions CI/CD',
        shortName: 'CI/CD Workflows',
        category: 'Automation',
        layer: 'intermediate',
        layerLabel: 'Layer 2: Core Middleware',
        x: 410,
        y: 110,
        prerequisiteIds: ['node-git-graph'],
        associatedSkillId: 'comp-git',
        description: 'Workflow triggers, matrix test builds, secret masking, artifact caching, and automated status checks.',
        placementImpact: 'Verified on student profile with 4.0/5.0 score from GitHub project repository audit.',
        placementCompanies: ['Cisco', 'CloudScale'],
      },
      {
        id: 'node-review',
        name: 'Code Review & Semantic Versioning',
        shortName: 'PR Review & SemVer',
        category: 'Collaboration',
        layer: 'intermediate',
        layerLabel: 'Layer 2: Core Middleware',
        x: 410,
        y: 290,
        prerequisiteIds: ['node-branching'],
        associatedSkillId: 'comp-git',
        description: 'Pull request templates, branch protection rules, semantic changelog generation, and signed commits.',
        placementImpact: 'Ensures code meets rigorous enterprise compliance and security standards.',
        placementCompanies: ['Barclays', 'NatWest'],
      },
      {
        id: 'node-target',
        name: 'Enterprise Git & Distributed CI/CD',
        shortName: 'Enterprise CI/CD',
        category: 'DevOps & Workflows',
        layer: 'target',
        layerLabel: 'Layer 3: Target Placement Skill',
        x: 690,
        y: 200,
        prerequisiteIds: ['node-ci', 'node-review'],
        associatedSkillId: 'comp-git',
        description: 'Production release orchestration, automated rollback triggers, and GitOps infrastructure pipelines.',
        placementImpact: 'Verified at 4.0/5.0; candidate exceeds placement benchmark threshold.',
        placementCompanies: ['Amazon', 'Cisco', 'Barclays'],
      },
    ],
  },
};

// Alias mappings for alternate demand IDs
TECH_TREE_DEFINITIONS['dem-pg'] = TECH_TREE_DEFINITIONS['dem-sql'];
TECH_TREE_DEFINITIONS['dem-api'] = TECH_TREE_DEFINITIONS['dem-git'];

export default function SkillTechTreeModal({
  isOpen,
  onClose,
  targetSkillKey,
  profile,
  onOpenQuiz,
  onOpenProofOfWork,
  onNavigate,
}: SkillTechTreeModalProps) {
  const [selectedKey, setSelectedKey] = useState<string>(targetSkillKey || 'dem-kaf');
  const [activeNodeId, setActiveNodeId] = useState<string>('node-target');

  if (!isOpen) return null;

  const currentTree = TECH_TREE_DEFINITIONS[selectedKey] || TECH_TREE_DEFINITIONS['dem-kaf'];

  // Helper to determine node status based on student profile competencies
  const getNodeState = (node: TechTreeNode): 'mastered' | 'unlocked' | 'locked' => {
    // 1. If associated with an existing verified competency
    if (node.associatedSkillId) {
      const comp = profile.competencies.find((c) => c.id === node.associatedSkillId);
      if (comp && comp.proficiency !== null && comp.proficiency >= 3.0) {
        return 'mastered';
      }
    }

    // 2. Foundation nodes without prereqs are at least unlocked/ready
    if (node.prerequisiteIds.length === 0) {
      // Check if candidate has Python or SysDesign evidence
      if (node.id === 'node-ds' || node.id === 'node-git-graph') return 'mastered';
      return 'unlocked';
    }

    // 3. For intermediate / target nodes, verify if all prerequisite nodes are mastered or unlocked
    const prereqNodes = currentTree.nodes.filter((n) => node.prerequisiteIds.includes(n.id));
    const allPrereqsMet = prereqNodes.every((prereq) => {
      if (prereq.associatedSkillId) {
        const c = profile.competencies.find((item) => item.id === prereq.associatedSkillId);
        return c && c.proficiency !== null && c.proficiency >= 3.0;
      }
      return true;
    });

    if (allPrereqsMet) {
      // If all prereqs met, check if node itself is mastered
      if (node.associatedSkillId) {
        const comp = profile.competencies.find((c) => c.id === node.associatedSkillId);
        if (comp && comp.proficiency !== null && comp.proficiency >= 3.0) {
          return 'mastered';
        }
      }
      return 'unlocked';
    }

    return 'locked';
  };

  const selectedNode = currentTree.nodes.find((n) => n.id === activeNodeId) || currentTree.nodes[currentTree.nodes.length - 1];
  const selectedNodeState = getNodeState(selectedNode);

  // Compute pathway line styles between nodes
  const getLineStatus = (sourceNode: TechTreeNode, targetNode: TechTreeNode): 'mastered' | 'unlocked' | 'locked' => {
    const sState = getNodeState(sourceNode);
    const tState = getNodeState(targetNode);

    if (sState === 'mastered' && tState === 'mastered') {
      return 'mastered';
    }
    if (sState === 'mastered' && tState === 'unlocked') {
      return 'unlocked';
    }
    if (sState === 'unlocked' && tState === 'unlocked') {
      return 'unlocked';
    }
    return 'locked';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-5">
      {/* Dark Backdrop */}
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity" onClick={onClose} />

      {/* Main Modal Container */}
      <div className="relative w-full max-w-5xl bg-[#09090C] border border-[#202023] rounded-2xl shadow-2xl flex flex-col z-10 overflow-hidden animate-fade-in max-h-[92vh]">
        {/* Modal Header */}
        <div className="sticky top-0 z-20 bg-[#0D0D12]/95 backdrop-blur-md border-b border-[#202023] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#8052ff]/20 text-[#cdbdff] border border-[#8052ff]/40">
                CAMPUS PLACEMENT TECH-TREE
              </span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#ffba35]/15 text-[#ffba35] border border-[#ffba35]/30 flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">account_tree</span>
                <span>{currentTree.targetRoleBadge}</span>
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>{currentTree.targetTitle}</span>
              <span className="text-xs text-[#9A9A9A] font-normal font-mono hidden md:inline">
                · Skill Knowledge &amp; Prerequisite Inspector
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Quick Skill Switcher Tabs */}
            <div className="flex items-center gap-1 bg-[#16161A] p-1 rounded-xl border border-[#202023] overflow-x-auto max-w-[280px] sm:max-w-none">
              {Object.keys(TECH_TREE_DEFINITIONS).map((key) => {
                const def = TECH_TREE_DEFINITIONS[key];
                const isSelected = selectedKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedKey(key);
                      setActiveNodeId('node-target');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#8052ff] text-white shadow-md shadow-[#8052ff]/20'
                        : 'text-[#9A9A9A] hover:text-white hover:bg-[#202023]'
                    }`}
                  >
                    {def.targetTitle.split(' ')[0]}
                  </button>
                );
              })}
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-[#16161A] hover:bg-[#202023] text-[#9A9A9A] hover:text-white border border-[#363639] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Close Tech-Tree Modal"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* Modal Body: Tech-Tree Canvas & Node Inspector Drawer */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Legend & Instructions */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono bg-[#111116] border border-[#202023] px-4 py-2.5 rounded-xl">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-[#9A9A9A] flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-[#8052ff]">touch_app</span>
                <span>Click any node to inspect placement impact &amp; unlock actions:</span>
              </span>
              <div className="flex items-center gap-1.5 text-[#55C98B]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#55C98B] shadow-[0_0_8px_#55C98B]" />
                <span className="font-semibold">Mastered (Verified ✓)</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#ffba35]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffba35] animate-pulse" />
                <span className="font-semibold">Ready to Learn</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#606066]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2c2c35]" />
                <span>Locked</span>
              </div>
            </div>

            <span className="text-[#cdbdff] hidden lg:inline">
              Pathway verified against SRM CDC Placement Curriculum
            </span>
          </div>

          {/* RPG-Style Tech-Tree Canvas (SVG) */}
          <div className="relative rounded-2xl bg-gradient-to-b from-[#0E0E14] via-[#08080C] to-[#040406] border border-[#202023] p-4 overflow-x-auto shadow-2xl">
            {/* Ambient Background Grid Pattern */}
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#8052ff_1px,transparent_1px)] [background-size:24px_24px]" />

            <div className="min-w-[760px] flex justify-center">
              <svg viewBox="0 0 820 400" className="w-full max-w-[820px] h-[360px] overflow-visible select-none">
                <defs>
                  {/* Glowing line filters */}
                  <filter id="emeraldGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#55C98B" floodOpacity="0.75" />
                  </filter>
                  <filter id="amberGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#ffba35" floodOpacity="0.6" />
                  </filter>
                  <filter id="violetGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#8052ff" floodOpacity="0.8" />
                  </filter>
                </defs>

                {/* Layer Column Headings */}
                <g className="text-[11px] font-mono font-bold fill-[#9A9A9A]">
                  <text x="130" y="32" textAnchor="middle" fill="#A0A0AB">LAYER 1: FOUNDATIONS</text>
                  <text x="410" y="32" textAnchor="middle" fill="#cdbdff">LAYER 2: CORE MIDDLEWARE</text>
                  <text x="690" y="32" textAnchor="middle" fill="#ffba35">LAYER 3: TARGET SKILL</text>
                </g>

                {/* Vertical Dotted Layer Dividers */}
                <line x1="270" y1="40" x2="270" y2="380" stroke="#1F1F26" strokeDasharray="4 4" strokeWidth="1" />
                <line x1="550" y1="40" x2="550" y2="380" stroke="#1F1F26" strokeDasharray="4 4" strokeWidth="1" />

                {/* Interconnecting Pathway Splines */}
                {currentTree.nodes.map((targetNode) => {
                  return targetNode.prerequisiteIds.map((prereqId) => {
                    const sourceNode = currentTree.nodes.find((n) => n.id === prereqId);
                    if (!sourceNode) return null;

                    const lineStatus = getLineStatus(sourceNode, targetNode);
                    const startX = sourceNode.x + 85;
                    const startY = sourceNode.y;
                    const endX = targetNode.x - 85;
                    const endY = targetNode.y;
                    const midX = (startX + endX) / 2;

                    const pathD = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;

                    return (
                      <g key={`${sourceNode.id}-${targetNode.id}`}>
                        {/* Background line glow */}
                        {lineStatus === 'mastered' && (
                          <path
                            d={pathD}
                            fill="none"
                            stroke="#55C98B"
                            strokeWidth="3.5"
                            filter="url(#emeraldGlow)"
                            opacity="0.85"
                          />
                        )}
                        {lineStatus === 'unlocked' && (
                          <path
                            d={pathD}
                            fill="none"
                            stroke="#ffba35"
                            strokeWidth="2.2"
                            strokeDasharray="5 4"
                            filter="url(#amberGlow)"
                            opacity="0.9"
                          />
                        )}
                        {lineStatus === 'locked' && (
                          <path
                            d={pathD}
                            fill="none"
                            stroke="#26262f"
                            strokeWidth="1.5"
                            opacity="0.5"
                          />
                        )}
                      </g>
                    );
                  });
                })}

                {/* Tech-Tree Interactive Nodes */}
                {currentTree.nodes.map((node) => {
                  const state = getNodeState(node);
                  const isSelected = selectedNode.id === node.id;
                  const isTarget = node.layer === 'target';
                  const w = isTarget ? 175 : 160;
                  const h = 64;
                  const left = node.x - w / 2;
                  const top = node.y - h / 2;

                  return (
                    <g
                      key={node.id}
                      onClick={() => setActiveNodeId(node.id)}
                      className="cursor-pointer group"
                      tabIndex={0}
                    >
                      {/* Active Selection Glow Ring */}
                      {isSelected && (
                        <rect
                          x={left - 5}
                          y={top - 5}
                          width={w + 10}
                          height={h + 10}
                          rx="14"
                          fill="none"
                          stroke={state === 'mastered' ? '#55C98B' : state === 'unlocked' ? '#ffba35' : '#8052ff'}
                          strokeWidth="2"
                          strokeDasharray="4 2"
                          className="animate-spin [animation-duration:8s]"
                        />
                      )}

                      {/* Main Node Card Surface */}
                      <rect
                        x={left}
                        y={top}
                        width={w}
                        height={h}
                        rx="10"
                        fill={
                          state === 'mastered'
                            ? '#0D1E15'
                            : state === 'unlocked'
                            ? '#1A1810'
                            : '#0E0E12'
                        }
                        stroke={
                          isSelected
                            ? state === 'mastered'
                              ? '#55C98B'
                              : state === 'unlocked'
                              ? '#ffba35'
                              : '#8052ff'
                            : state === 'mastered'
                            ? '#55C98B'
                            : state === 'unlocked'
                            ? '#ffba35'
                            : '#282830'
                        }
                        strokeWidth={isSelected ? '2.5' : '1.5'}
                        className="transition-all duration-200 group-hover:brightness-125"
                      />

                      {/* Status Icon Indicator */}
                      <circle
                        cx={left + 18}
                        cy={top + 20}
                        r="10"
                        fill={
                          state === 'mastered'
                            ? '#55C98B'
                            : state === 'unlocked'
                            ? '#ffba35'
                            : '#1C1C24'
                        }
                      />
                      <text
                        x={left + 18}
                        y={top + 24}
                        fill={state === 'locked' ? '#6B7280' : '#000000'}
                        fontSize="11"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {state === 'mastered' ? '✓' : state === 'unlocked' ? '★' : '🔒'}
                      </text>

                      {/* Node Title */}
                      <text
                        x={left + 34}
                        y={top + 23}
                        fill="#FFFFFF"
                        fontSize={isTarget ? '12' : '11'}
                        fontWeight="bold"
                        fontFamily="sans-serif"
                      >
                        {node.shortName}
                      </text>

                      {/* Node Sub-Badge / Score */}
                      <text
                        x={left + 16}
                        y={top + 48}
                        fill={
                          state === 'mastered'
                            ? '#55C98B'
                            : state === 'unlocked'
                            ? '#ffba35'
                            : '#9A9A9A'
                        }
                        fontSize="9.5"
                        fontFamily="monospace"
                        fontWeight="600"
                      >
                        {state === 'mastered'
                          ? 'Verified 4.0/5.0 ✓'
                          : state === 'unlocked'
                          ? 'Ready to Learn'
                          : 'Locked Pathway'}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Interactive Node Inspector Detail Drawer */}
          <div className="p-5 rounded-2xl bg-[#0D0D12] border border-[#202023] shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#202023]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#8052ff]">
                    {selectedNode.layerLabel}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                      selectedNodeState === 'mastered'
                        ? 'bg-[#55C98B]/20 text-[#55C98B] border-[#55C98B]/40'
                        : selectedNodeState === 'unlocked'
                        ? 'bg-[#ffba35]/20 text-[#ffba35] border-[#ffba35]/40'
                        : 'bg-[#202028] text-[#9A9A9A] border-[#363639]'
                    }`}
                  >
                    {selectedNodeState === 'mastered'
                      ? 'Mastered ✓'
                      : selectedNodeState === 'unlocked'
                      ? 'Unlocked &amp; Ready'
                      : 'Locked'}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mt-0.5">{selectedNode.name}</h3>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {selectedNode.placementCompanies.map((comp, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-[#16161A] text-[#cdbdff] border border-[#363639] text-[10px] font-mono"
                  >
                    {comp}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Architecture & Prerequisite Health */}
              <div className="space-y-2 p-3.5 rounded-xl bg-[#14141A] border border-[#202023]">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#ffba35]">health_and_safety</span>
                  <span>Prerequisite Health &amp; Concepts</span>
                </div>
                <p className="text-[#A0A0AB] leading-relaxed text-[11px]">{selectedNode.description}</p>
                <div className="pt-2 border-t border-[#202023] text-[11px] font-mono">
                  <span className="text-[#9A9A9A]">Prerequisites: </span>
                  {selectedNode.prerequisiteIds.length === 0 ? (
                    <span className="text-[#55C98B] font-bold">None (Foundational Entry Point) ✓</span>
                  ) : (
                    <span className={selectedNodeState === 'locked' ? 'text-[#EB5757] font-bold' : 'text-[#55C98B] font-bold'}>
                      {selectedNode.prerequisiteIds
                        .map((id) => currentTree.nodes.find((n) => n.id === id)?.shortName)
                        .filter(Boolean)
                        .join(', ')}{' '}
                      ({selectedNodeState === 'locked' ? 'Incomplete' : 'Satisfied ✓'})
                    </span>
                  )}
                </div>
              </div>

              {/* Why It Matters for Campus Placements */}
              <div className="space-y-2 p-3.5 rounded-xl bg-[#14141A] border border-[#202023]">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#55C98B]">psychology</span>
                  <span>Why It Matters for SRM Campus Placements</span>
                </div>
                <p className="text-[#A0A0AB] leading-relaxed text-[11px]">{selectedNode.placementImpact}</p>
                <div className="pt-2 border-t border-[#202023] text-[11px] font-mono text-[#cdbdff]">
                  Placement Target: Tier 1 &amp; Super Dream (₹18 - ₹42 LPA)
                </div>
              </div>
            </div>

            {/* Action Buttons / Locked Notification */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#202023]">
              <div className="text-xs font-mono text-[#9A9A9A]">
                {selectedNodeState === 'mastered' ? (
                  <span className="text-[#55C98B] flex items-center gap-1 font-bold">
                    <span className="material-symbols-outlined text-[15px]">verified</span>
                    <span>Competency verified and indexed in SRM CDC Student Journey.</span>
                  </span>
                ) : selectedNodeState === 'unlocked' ? (
                  <span className="text-[#ffba35] flex items-center gap-1 font-bold">
                    <span className="material-symbols-outlined text-[15px]">lock_open</span>
                    <span>Prerequisites satisfied. Ready for assessment or Proof-of-Work project.</span>
                  </span>
                ) : (
                  <span className="text-[#EB5757] flex items-center gap-1 font-bold">
                    <span className="material-symbols-outlined text-[15px]">lock</span>
                    <span>Locked: Complete upstream prerequisite nodes to open this learning path.</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {selectedNodeState === 'locked' ? (
                  <div className="px-3 py-1.5 rounded-lg bg-red-950/30 border border-red-500/40 text-red-300 text-xs font-mono">
                    Complete prerequisite '{currentTree.nodes.find((n) => selectedNode.prerequisiteIds.includes(n.id))?.shortName}' to unlock
                  </div>
                ) : (
                  <>
                    {selectedNode.powSkillId && (
                      <button
                        onClick={() => {
                          onClose();
                          if (onOpenProofOfWork) {
                            onOpenProofOfWork(selectedNode.powSkillId!);
                          } else {
                            onNavigate?.('career-plan');
                          }
                        }}
                        className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-[#8052ff] to-[#6035d8] hover:opacity-95 text-white font-mono font-bold text-xs transition-all shadow-lg shadow-[#8052ff]/20 flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px]">construction</span>
                        <span>Build Proof-of-Work Project →</span>
                      </button>
                    )}

                    {selectedNode.quizSkillId && (
                      <button
                        onClick={() => {
                          onClose();
                          if (onOpenQuiz) {
                            onOpenQuiz(selectedNode.quizSkillId!);
                          } else {
                            onNavigate?.('career-plan');
                          }
                        }}
                        className="px-3.5 py-2 rounded-lg bg-[#16161A] hover:bg-[#202023] text-[#cdbdff] hover:text-white border border-[#363639] font-mono text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[15px]">quiz</span>
                        <span>Take Prerequisite Quiz</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onClose();
                        onNavigate?.('career-plan');
                      }}
                      className="px-3 py-2 rounded-lg bg-[#16161A] text-[#9A9A9A] hover:text-white border border-[#363639] text-xs font-mono transition-colors cursor-pointer"
                    >
                      View in Career Plan
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
