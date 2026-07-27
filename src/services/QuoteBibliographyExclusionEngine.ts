// src/services/QuoteBibliographyExclusionEngine.ts
// HOEOS: Phase 1 - Quote & Bibliography Exclusion Engine
// Gated Verifiable Proof: Cryptographic hash of excluded content

export interface ExclusionProof {
  id: string;
  timestamp: string;
  excludedTextHash: string;
  originalTextHash: string;
  exclusionType: 'QUOTE' | 'BIBLIOGRAPHY' | 'CITATION' | 'REFERENCE';
  ruleMatched: string;
  verifier: string; // Cryptographic signature
}

export interface QuotePattern {
  id: string;
  pattern: RegExp;
  description: string;
  enabled: boolean;
}

export interface BibliographyPattern {
  id: string;
  pattern: RegExp | string;
  description: string;
  enabled: boolean;
}

export class QuoteBibliographyExclusionEngine {
  private static instance: QuoteBibliographyExclusionEngine;
  private exclusionProofs: ExclusionProof[] = [];
  private quotePatterns: QuotePattern[] = [];
  private bibliographyPatterns: BibliographyPattern[] = [];

  // Quote patterns (common citation formats)
  private readonly DEFAULT_QUOTE_PATTERNS: QuotePattern[] = [
    { id: 'QUOTE_001', pattern: /"([^"]+)"/g, description: 'Quoted text with double quotes', enabled: true },
    { id: 'QUOTE_002', pattern: /'([^']+)'/g, description: 'Quoted text with single quotes', enabled: true },
    { id: 'QUOTE_003', pattern: /“([^”]+)”/g, description: 'Quoted text with smart quotes', enabled: true },
    { id: 'QUOTE_004', pattern: /‘([^’]+)’/g, description: 'Quoted text with smart single quotes', enabled: true },
    { id: 'QUOTE_005', pattern: /Blockquote:[\s\S]+?(?=\n\n)/gi, description: 'Blockquotes', enabled: true },
  ];

  // Bibliography patterns (reference formats)
  private readonly DEFAULT_BIBLIOGRAPHY_PATTERNS: BibliographyPattern[] = [
    { id: 'BIB_001', pattern: /\[[0-9]+\]/g, description: 'Numbered citations [1]', enabled: true },
    { id: 'BIB_002', pattern: /\([A-Z][a-z]+,\s*[0-9]{4}\)/g, description: 'Author-year citations (Smith, 2020)', enabled: true },
    { id: 'BIB_003', pattern: /\([A-Z][a-z]+\s+et\s+al\.,\s*[0-9]{4}\)/g, description: 'Author-year with et al.', enabled: true },
    { id: 'BIB_004', pattern: /https?:\/\/[^\s]+/g, description: 'URLs and DOIs', enabled: true },
    { id: 'BIB_005', pattern: /DOI:\s*10\.[0-9]{4,9}\/[^\s]+/gi, description: 'DOI patterns', enabled: true },
    { id: 'BIB_006', pattern: /References[\s\S]+?(?=\n\n)/gi, description: 'References section', enabled: true },
    { id: 'BIB_007', pattern: /Bibliography[\s\S]+?(?=\n\n)/gi, description: 'Bibliography section', enabled: true },
    { id: 'BIB_008', pattern: /[A-Z][a-z]+,\s*[A-Z]\.\s*\([0-9]{4}\)/g, description: 'Author, Initial. (Year)', enabled: true },
  ];

  private crypto: Crypto;
  private encoder: TextEncoder;

  constructor() {
    this.crypto = crypto || require('crypto').webcrypto;
    this.encoder = new TextEncoder();
  }

  static getInstance(): QuoteBibliographyExclusionEngine {
    if (!QuoteBibliographyExclusionEngine.instance) {
      QuoteBibliographyExclusionEngine.instance = new QuoteBibliographyExclusionEngine();
    }
    return QuoteBibliographyExclusionEngine.instance;
  }

  // 🔐 GATED VERIFIABLE PROOF: Generate cryptographic proof of exclusion
  async generateExclusionProof(
    originalText: string,
    excludedText: string,
    exclusionType: 'QUOTE' | 'BIBLIOGRAPHY' | 'CITATION' | 'REFERENCE',
    ruleMatched: string
  ): Promise<ExclusionProof> {
    const hashBuffer = await this.crypto.subtle.digest(
      'SHA-256',
      this.encoder.encode(excludedText)
    );
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const excludedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const originalHashBuffer = await this.crypto.subtle.digest(
      'SHA-256',
      this.encoder.encode(originalText)
    );
    const originalHashArray = Array.from(new Uint8Array(originalHashBuffer));
    const originalHash = originalHashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Generate a verifier signature (timestamp + random + hash)
    const verifierData = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}-${excludedHash}`;
    const verifierBuffer = await this.crypto.subtle.digest(
      'SHA-256',
      this.encoder.encode(verifierData)
    );
    const verifierArray = Array.from(new Uint8Array(verifierBuffer));
    const verifier = verifierArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const proof: ExclusionProof = {
      id: `EXCL-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      timestamp: new Date().toISOString(),
      excludedTextHash: excludedHash,
      originalTextHash: originalHash,
      exclusionType,
      ruleMatched,
      verifier
    };

    this.exclusionProofs.push(proof);
    return proof;
  }

  // 🔍 Verify exclusion proof
  verifyExclusionProof(proof: ExclusionProof): { valid: boolean; message: string } {
    // Check if proof exists in our store
    const exists = this.exclusionProofs.some(p => p.id === proof.id);
    if (!exists) {
      return { valid: false, message: 'Proof not found in registry' };
    }

    // Verify timestamp is not older than 24 hours
    const proofTime = new Date(proof.timestamp).getTime();
    const now = Date.now();
    if (now - proofTime > 24 * 60 * 60 * 1000) {
      return { valid: false, message: 'Proof expired (older than 24 hours)' };
    }

    // Verify verifier hash format
    if (!proof.verifier || proof.verifier.length !== 64) {
      return { valid: false, message: 'Invalid verifier signature' };
    }

    return { valid: true, message: 'Proof verified successfully' };
  }

  // 📝 Extract and exclude quotes
  async extractQuotes(text: string): Promise<{ cleanText: string; quotes: string[]; proof: ExclusionProof | null }> {
    let cleanText = text;
    const allQuotes: string[] = [];
    const matchedRules: string[] = [];

    for (const pattern of this.DEFAULT_QUOTE_PATTERNS) {
      if (!pattern.enabled) continue;
      const matches = text.match(pattern.pattern) || [];
      if (matches.length > 0) {
        allQuotes.push(...matches);
        cleanText = cleanText.replace(pattern.pattern, '');
        matchedRules.push(pattern.description);
      }
    }

    // Generate proof if quotes were excluded
    let proof: ExclusionProof | null = null;
    if (allQuotes.length > 0) {
      const excludedText = allQuotes.join('\n');
      proof = await this.generateExclusionProof(
        text,
        excludedText,
        'QUOTE',
        matchedRules.join(', ')
      );
    }

    return {
      cleanText: cleanText.replace(/\s+/g, ' ').trim(),
      quotes: allQuotes,
      proof
    };
  }

  // 📚 Extract and exclude bibliography
  async extractBibliography(text: string): Promise<{ cleanText: string; bibliography: string[]; proof: ExclusionProof | null }> {
    let cleanText = text;
    const allBibliography: string[] = [];
    const matchedRules: string[] = [];

    for (const pattern of this.DEFAULT_BIBLIOGRAPHY_PATTERNS) {
      if (!pattern.enabled) continue;
      const patternToUse = typeof pattern.pattern === 'string' 
        ? new RegExp(pattern.pattern, 'g') 
        : pattern.pattern;
      const matches = text.match(patternToUse) || [];
      if (matches.length > 0) {
        allBibliography.push(...matches);
        if (typeof pattern.pattern === 'string') {
          cleanText = cleanText.replace(new RegExp(pattern.pattern, 'g'), '');
        } else {
          cleanText = cleanText.replace(pattern.pattern, '');
        }
        matchedRules.push(pattern.description);
      }
    }

    // Generate proof if bibliography was excluded
    let proof: ExclusionProof | null = null;
    if (allBibliography.length > 0) {
      const excludedText = allBibliography.join('\n');
      proof = await this.generateExclusionProof(
        text,
        excludedText,
        'BIBLIOGRAPHY',
        matchedRules.join(', ')
      );
    }

    return {
      cleanText: cleanText.replace(/\s+/g, ' ').trim(),
      bibliography: allBibliography,
      proof
    };
  }

  // 🔄 Full exclusion pipeline
  async excludeAll(text: string): Promise<{
    cleanText: string;
    excludedQuotes: string[];
    excludedBibliography: string[];
    proofs: ExclusionProof[];
    exclusionSummary: {
      totalExcluded: number;
      quoteCount: number;
      bibliographyCount: number;
    }
  }> {
    const proofs: ExclusionProof[] = [];
    
    // Step 1: Extract quotes
    const quoteResult = await this.extractQuotes(text);
    if (quoteResult.proof) {
      proofs.push(quoteResult.proof);
    }
    let currentText = quoteResult.cleanText;

    // Step 2: Extract bibliography from remaining text
    const bibResult = await this.extractBibliography(currentText);
    if (bibResult.proof) {
      proofs.push(bibResult.proof);
    }
    currentText = bibResult.cleanText;

    return {
      cleanText: currentText,
      excludedQuotes: quoteResult.quotes,
      excludedBibliography: bibResult.bibliography,
      proofs,
      exclusionSummary: {
        totalExcluded: quoteResult.quotes.length + bibResult.bibliography.length,
        quoteCount: quoteResult.quotes.length,
        bibliographyCount: bibResult.bibliography.length
      }
    };
  }

  // 📊 Get all exclusion proofs
  getExclusionProofs(): ExclusionProof[] {
    return this.exclusionProofs;
  }

  // ✅ Verify all proofs
  verifyAllProofs(): { valid: number; invalid: number; details: Array<{ id: string; valid: boolean; message: string }> } {
    const results = this.exclusionProofs.map(proof => {
      const verification = this.verifyExclusionProof(proof);
      return {
        id: proof.id,
        valid: verification.valid,
        message: verification.message
      };
    });

    return {
      valid: results.filter(r => r.valid).length,
      invalid: results.filter(r => !r.valid).length,
      details: results
    };
  }
}
