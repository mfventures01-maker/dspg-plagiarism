// src/services/SupervisorReviewWorkflow.ts
// HOEOS: Phase 3 - Supervisor Review Workflow with Gated Verifiable Proofs

export enum ReviewStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REQUIRES_REVISION = 'REQUIRES_REVISION'
}

export interface Supervisor {
  id: string;
  name: string;
  email: string;
  department: string;
  title: string;
  signature: string;
  verificationHash: string;
}

export interface ReviewTask {
  id: string;
  studentName: string;
  matricNumber: string;
  projectTitle: string;
  documentHash: string;
  submissionDate: string;
  similarityScore: number;
  adjustedScore: number;
  scoreBand: string;
  status: ReviewStatus;
  assignedTo: string; // Supervisor ID
  comments: ReviewComment[];
  timeline: ReviewTimeline[];
  proof: ReviewProof | null;
  department: string;
  level: string;
}

export interface ReviewComment {
  id: string;
  author: string;
  timestamp: string;
  content: string;
  type: 'QUESTION' | 'CORRECTION' | 'APPROVAL' | 'REJECTION';
}

export interface ReviewTimeline {
  timestamp: string;
  action: string;
  actor: string;
  details: string;
}

export interface ReviewProof {
  id: string;
  taskId: string;
  status: ReviewStatus;
  timestamp: string;
  supervisorSignature: string;
  verifier: string;
}

export class SupervisorReviewWorkflow {
  private static instance: SupervisorReviewWorkflow;
  private tasks: ReviewTask[] = [];
  private supervisors: Supervisor[] = [];
  private reviewProofs: ReviewProof[] = [];

  private crypto: Crypto;
  private encoder: TextEncoder;

  constructor() {
    this.crypto = crypto || require('crypto').webcrypto;
    this.encoder = new TextEncoder();
    
    // Initialize with default supervisor
    this.supervisors.push({
      id: 'SUP_001',
      name: 'Dr. Abugewa',
      email: 'abugewa@dspg.edu.ng',
      department: 'Computer Engineering',
      title: 'Dr.',
      signature: 'Dr. Abugewa',
      verificationHash: this.generateVerificationHash('Dr. Abugewa')
    });
  }

  static getInstance(): SupervisorReviewWorkflow {
    if (!SupervisorReviewWorkflow.instance) {
      SupervisorReviewWorkflow.instance = new SupervisorReviewWorkflow();
    }
    return SupervisorReviewWorkflow.instance;
  }

  private generateVerificationHash(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }

  // 📝 Create review task
  createReviewTask(
    studentName: string,
    matricNumber: string,
    projectTitle: string,
    documentHash: string,
    similarityScore: number,
    adjustedScore: number,
    scoreBand: string,
    supervisorId: string = 'SUP_001',
    department: string = 'Computer Engineering',
    level: string = 'HND 2'
  ): ReviewTask {
    const task: ReviewTask = {
      id: `REV-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      studentName,
      matricNumber,
      projectTitle,
      documentHash,
      submissionDate: new Date().toISOString(),
      similarityScore,
      adjustedScore,
      scoreBand,
      status: ReviewStatus.PENDING,
      assignedTo: supervisorId,
      comments: [],
      timeline: [{
        timestamp: new Date().toISOString(),
        action: 'TASK_CREATED',
        actor: 'SYSTEM',
        details: `Review task created for ${studentName} (${matricNumber})`
      }],
      proof: null,
      department,
      level
    };

    this.tasks.push(task);
    return task;
  }

  // 🔐 Generate review proof
  async generateReviewProof(
    taskId: string,
    status: ReviewStatus,
    supervisorSignature: string
  ): Promise<ReviewProof> {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    const verifierData = `${taskId}-${status}-${supervisorSignature}-${Date.now()}`;
    const verifierBuffer = await this.crypto.subtle.digest(
      'SHA-256',
      this.encoder.encode(verifierData)
    );
    const verifierArray = Array.from(new Uint8Array(verifierBuffer));
    const verifier = verifierArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const proof: ReviewProof = {
      id: `REVPRF-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      taskId,
      status,
      timestamp: new Date().toISOString(),
      supervisorSignature,
      verifier
    };

    this.reviewProofs.push(proof);
    task.proof = proof;
    task.status = status;

    // Update timeline
    task.timeline.push({
      timestamp: new Date().toISOString(),
      action: `STATUS_CHANGED_TO_${status}`,
      actor: supervisorSignature,
      details: `Task status changed to ${status}`
    });

    return proof;
  }

  // ✅ Approve task
  async approveTask(taskId: string, supervisorId: string, comment?: string): Promise<{ task: ReviewTask; proof: ReviewProof }> {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    const supervisor = this.supervisors.find(s => s.id === supervisorId);
    if (!supervisor) throw new Error(`Supervisor ${supervisorId} not found`);

    const proof = await this.generateReviewProof(taskId, ReviewStatus.APPROVED, supervisor.signature);

    if (comment) {
      task.comments.push({
        id: `COMMENT-${Date.now()}`,
        author: supervisor.name,
        timestamp: new Date().toISOString(),
        content: comment,
        type: 'APPROVAL'
      });
    }

    return { task, proof };
  }

  // ❌ Reject task
  async rejectTask(taskId: string, supervisorId: string, reason: string): Promise<{ task: ReviewTask; proof: ReviewProof }> {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    const supervisor = this.supervisors.find(s => s.id === supervisorId);
    if (!supervisor) throw new Error(`Supervisor ${supervisorId} not found`);

    const proof = await this.generateReviewProof(taskId, ReviewStatus.REJECTED, supervisor.signature);

    task.comments.push({
      id: `COMMENT-${Date.now()}`,
      author: supervisor.name,
      timestamp: new Date().toISOString(),
      content: reason,
      type: 'REJECTION'
    });

    return { task, proof };
  }

  // 🔄 Request revision
  async requestRevision(taskId: string, supervisorId: string, feedback: string): Promise<{ task: ReviewTask; proof: ReviewProof }> {
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) throw new Error(`Task ${taskId} not found`);

    const supervisor = this.supervisors.find(s => s.id === supervisorId);
    if (!supervisor) throw new Error(`Supervisor ${supervisorId} not found`);

    const proof = await this.generateReviewProof(taskId, ReviewStatus.REQUIRES_REVISION, supervisor.signature);

    task.comments.push({
      id: `COMMENT-${Date.now()}`,
      author: supervisor.name,
      timestamp: new Date().toISOString(),
      content: feedback,
      type: 'CORRECTION'
    });

    return { task, proof };
  }

  // 📋 Get task by ID
  getTask(taskId: string): ReviewTask | undefined {
    return this.tasks.find(t => t.id === taskId);
  }

  // 📋 Get tasks by supervisor
  getTasksBySupervisor(supervisorId: string): ReviewTask[] {
    return this.tasks.filter(t => t.assignedTo === supervisorId);
  }

  // 📋 Get tasks by status
  getTasksByStatus(status: ReviewStatus): ReviewTask[] {
    return this.tasks.filter(t => t.status === status);
  }

  // 📊 Get task statistics
  getTaskStatistics(): {
    total: number;
    pending: number;
    underReview: number;
    approved: number;
    rejected: number;
    requiresRevision: number;
    byDepartment: Record<string, number>;
    averageTurnaroundTime: string;
  } {
    const stats = {
      total: this.tasks.length,
      pending: 0,
      underReview: 0,
      approved: 0,
      rejected: 0,
      requiresRevision: 0,
      byDepartment: {} as Record<string, number>,
      averageTurnaroundTime: 'N/A'
    };

    let totalTime = 0;
    let completedTasks = 0;

    for (const task of this.tasks) {
      switch (task.status) {
        case ReviewStatus.PENDING: stats.pending++; break;
        case ReviewStatus.UNDER_REVIEW: stats.underReview++; break;
        case ReviewStatus.APPROVED: stats.approved++; completedTasks++; break;
        case ReviewStatus.REJECTED: stats.rejected++; completedTasks++; break;
        case ReviewStatus.REQUIRES_REVISION: stats.requiresRevision++; break;
      }

      stats.byDepartment[task.department] = (stats.byDepartment[task.department] || 0) + 1;

      // Calculate turnaround time for completed tasks
      if (task.status === ReviewStatus.APPROVED || task.status === ReviewStatus.REJECTED) {
        const start = new Date(task.submissionDate).getTime();
        const end = new Date(task.timeline[task.timeline.length - 1].timestamp).getTime();
        totalTime += (end - start) / (1000 * 60 * 60); // Hours
      }
    }

    if (completedTasks > 0) {
      const avgHours = Math.round(totalTime / completedTasks);
      stats.averageTurnaroundTime = `${avgHours}h`;
    }

    return stats;
  }

  // ✅ Verify review proof
  verifyReviewProof(proof: ReviewProof): { valid: boolean; message: string } {
    const exists = this.reviewProofs.some(p => p.id === proof.id);
    if (!exists) {
      return { valid: false, message: 'Proof not found in registry' };
    }

    if (!proof.verifier || proof.verifier.length !== 64) {
      return { valid: false, message: 'Invalid verifier signature' };
    }

    return { valid: true, message: 'Review proof verified successfully' };
  }
}
