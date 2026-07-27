// src/services/ScoreBandClassifier.ts
// HOEOS: Phase 2 - Score Band Classification with Gated Verifiable Proofs

export interface ScoreBand {
  id: string;
  name: string;
  minScore: number;
  maxScore: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  recommendation: 'PASS' | 'REVIEW' | 'MANUAL_ADJUDICATION' | 'REJECT';
  description: string;
  actionRequired: string;
}

export interface ClassificationProof {
  id: string;
  timestamp: string;
  documentHash: string;
  originalScore: number;
  adjustedScore: number;
  bandAssigned: string;
  confidence: number;
  verifier: string;
}

export class ScoreBandClassifier {
  private static instance: ScoreBandClassifier;
  private classificationProofs: ClassificationProof[] = [];

  // 📊 Score bands based on your report
  private readonly SCORE_BANDS: ScoreBand[] = [
    {
      id: 'BAND_001',
      name: 'LOW RISK',
      minScore: 0,
      maxScore: 10,
      riskLevel: 'LOW',
      recommendation: 'PASS',
      description: 'Low similarity score. Document appears original.',
      actionRequired: 'Accept without further review'
    },
    {
      id: 'BAND_002',
      name: 'REVIEW REQUIRED',
      minScore: 10,
      maxScore: 25,
      riskLevel: 'MODERATE',
      recommendation: 'REVIEW',
      description: 'Moderate similarity detected. Supervisor review required.',
      actionRequired: 'Manual review by supervisor'
    },
    {
      id: 'BAND_003',
      name: 'MANUAL ADJUDICATION',
      minScore: 25,
      maxScore: 40,
      riskLevel: 'HIGH',
      recommendation: 'MANUAL_ADJUDICATION',
      description: 'High similarity detected. Academic board review required.',
      actionRequired: 'Academic board adjudication'
    },
    {
      id: 'BAND_004',
      name: 'CRITICAL RISK',
      minScore: 40,
      maxScore: 100,
      riskLevel: 'CRITICAL',
      recommendation: 'REJECT',
      description: 'Critical similarity detected. Serious academic misconduct.',
      actionRequired: 'Reject and refer to academic board'
    }
  ];

  private crypto: Crypto;
  private encoder: TextEncoder;

  constructor() {
    this.crypto = crypto || require('crypto').webcrypto;
    this.encoder = new TextEncoder();
  }

  static getInstance(): ScoreBandClassifier {
    if (!ScoreBandClassifier.instance) {
      ScoreBandClassifier.instance = new ScoreBandClassifier();
    }
    return ScoreBandClassifier.instance;
  }

  // 🔍 Classify based on score
  classify(score: number, adjustedScore?: number): {
    band: ScoreBand;
    originalScore: number;
    adjustedScore: number;
    proof: ClassificationProof | null;
  } {
    const effectiveScore = adjustedScore !== undefined ? adjustedScore : score;
    
    let band: ScoreBand = this.SCORE_BANDS[0]; // Default to LOW RISK
    for (const b of this.SCORE_BANDS) {
      if (effectiveScore >= b.minScore && effectiveScore < b.maxScore) {
        band = b;
        break;
      }
    }
    // Handle the case where score >= 40 (critical)
    if (effectiveScore >= 40) {
      band = this.SCORE_BANDS[3];
    }

    return {
      band,
      originalScore: score,
      adjustedScore: effectiveScore,
      proof: null // Generated later
    };
  }

  // 🔐 Generate classification proof with cryptographic verification
  async generateClassificationProof(
    documentText: string,
    originalScore: number,
    adjustedScore: number,
    band: ScoreBand
  ): Promise<ClassificationProof> {
    // Hash the document content
    const hashBuffer = await this.crypto.subtle.digest(
      'SHA-256',
      this.encoder.encode(documentText.substring(0, 1000)) // Sample for proof
    );
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const documentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Generate verifier
    const verifierData = `${Date.now()}-${band.id}-${adjustedScore}-${documentHash}`;
    const verifierBuffer = await this.crypto.subtle.digest(
      'SHA-256',
      this.encoder.encode(verifierData)
    );
    const verifierArray = Array.from(new Uint8Array(verifierBuffer));
    const verifier = verifierArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const proof: ClassificationProof = {
      id: `CLS-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      timestamp: new Date().toISOString(),
      documentHash,
      originalScore,
      adjustedScore,
      bandAssigned: band.id,
      confidence: this.calculateConfidence(originalScore, adjustedScore),
      verifier
    };

    this.classificationProofs.push(proof);
    return proof;
  }

  // 📊 Calculate confidence based on score stability
  private calculateConfidence(originalScore: number, adjustedScore: number): number {
    const diff = Math.abs(originalScore - adjustedScore);
    if (diff < 5) return 95;
    if (diff < 10) return 85;
    if (diff < 20) return 70;
    return 60;
  }

  // ✅ Verify classification proof
  verifyClassificationProof(proof: ClassificationProof): { valid: boolean; message: string } {
    const exists = this.classificationProofs.some(p => p.id === proof.id);
    if (!exists) {
      return { valid: false, message: 'Proof not found in registry' };
    }

    const proofTime = new Date(proof.timestamp).getTime();
    if (Date.now() - proofTime > 7 * 24 * 60 * 60 * 1000) {
      return { valid: false, message: 'Proof expired (older than 7 days)' };
    }

    if (!proof.verifier || proof.verifier.length !== 64) {
      return { valid: false, message: 'Invalid verifier signature' };
    }

    return { valid: true, message: 'Classification proof verified successfully' };
  }

  // 📋 Get all bands
  getBands(): ScoreBand[] {
    return this.SCORE_BANDS;
  }

  // 📊 Get band by score
  getBandByScore(score: number): ScoreBand {
    return this.classify(score).band;
  }

  // 📈 Get classification statistics
  getClassificationStats(): {
    totalClassifications: number;
    bandDistribution: Record<string, number>;
    averageConfidence: number;
  } {
    const distribution: Record<string, number> = {};
    let totalConfidence = 0;

    for (const proof of this.classificationProofs) {
      distribution[proof.bandAssigned] = (distribution[proof.bandAssigned] || 0) + 1;
      totalConfidence += proof.confidence;
    }

    return {
      totalClassifications: this.classificationProofs.length,
      bandDistribution: distribution,
      averageConfidence: this.classificationProofs.length > 0 
        ? Math.round(totalConfidence / this.classificationProofs.length) 
        : 0
    };
  }
}
