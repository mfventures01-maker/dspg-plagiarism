// src/services/ExclusionEngine.ts
// HOEOS: Phrase Exclusion Filter - Removes academic boilerplate text

export interface ExclusionRule {
  pattern: string | RegExp;
  description: string;
  isCaseSensitive?: boolean;
  enabled?: boolean;
}

export class ExclusionEngine {
  private static instance: ExclusionEngine;
  private customRules: ExclusionRule[] = [];
  
  // Common academic boilerplate phrases to exclude
  private static readonly DEFAULT_EXCLUSION_PATTERNS: ExclusionRule[] = [
    // Project Title & Certification
    { pattern: /DESIGN AND CONSTRUCTION OF A/i, description: 'Project title boilerplate', enabled: true },
    { pattern: /DESIGN AND CONSTRUCTION OF AN/i, description: 'Project title boilerplate', enabled: true },
    { pattern: /of the requirements for the award of/i, description: 'HND requirement boilerplate', enabled: true },
    { pattern: /Higher National Diploma \(HND\)/i, description: 'HND boilerplate', enabled: true },
    { pattern: /HND in Computer Engineering/i, description: 'HND program boilerplate', enabled: true },
    
    // Dedication & Acknowledgement
    { pattern: /This project is dedicated to/i, description: 'Dedication boilerplate', enabled: true },
    { pattern: /Almighty God for His grace/i, description: 'Religious dedication', enabled: true },
    { pattern: /during the course of this project work/i, description: 'Acknowledgement boilerplate', enabled: true },
    { pattern: /My sincere appreciation goes to/i, description: 'Acknowledgement boilerplate', enabled: true },
    { pattern: /project supervisor for his\/her invaluable guidance/i, description: 'Supervisor thanks', enabled: true },
    { pattern: /Head of Department and all lecturers/i, description: 'Department thanks', enabled: true },
    { pattern: /technical staff of the.*laboratory/i, description: 'Technical staff thanks', enabled: true },
    { pattern: /immense contribution of my family/i, description: 'Family thanks', enabled: true },
    
    // Abstract & Introduction
    { pattern: /presents the design, construction and testing/i, description: 'Abstract boilerplate', enabled: true },
    { pattern: /This project report documents/i, description: 'Report introduction', enabled: true },
    { pattern: /This project presents/i, description: 'Project introduction', enabled: true },
    { pattern: /The aim of this project is to/i, description: 'Aim statement', enabled: true },
    { pattern: /The specific objectives of this project are/i, description: 'Objectives statement', enabled: true },
    
    // Table of Contents & Headers
    { pattern: /TABLE OF CONTENTS/i, description: 'Table of contents header', enabled: true },
    { pattern: /LIST OF FIGURES/i, description: 'Figure list header', enabled: true },
    { pattern: /LIST OF TABLES/i, description: 'Table list header', enabled: true },
    { pattern: /CHAPTER ONE/i, description: 'Chapter header', enabled: true },
    { pattern: /CHAPTER TWO/i, description: 'Chapter header', enabled: true },
    { pattern: /CHAPTER THREE/i, description: 'Chapter header', enabled: true },
    { pattern: /CHAPTER FOUR/i, description: 'Chapter header', enabled: true },
    { pattern: /CHAPTER FIVE/i, description: 'Chapter header', enabled: true },
    
    // Methodology & Testing
    { pattern: /This chapter presents the design methodology/i, description: 'Methodology chapter intro', enabled: true },
    { pattern: /This chapter presents the various tests/i, description: 'Testing chapter intro', enabled: true },
    { pattern: /The results obtained from.*testing/i, description: 'Testing results intro', enabled: true },
    
    // Conclusion & Recommendations
    { pattern: /This chapter presents the summary, conclusion/i, description: 'Conclusion chapter intro', enabled: true },
    { pattern: /This project set out to/i, description: 'Project summary', enabled: true },
    { pattern: /The project work is a simple, low-cost/i, description: 'Project conclusion', enabled: true },
    { pattern: /Arising from the design, construction/i, description: 'Recommendations intro', enabled: true },
    { pattern: /It is recommended that/i, description: 'Recommendation statement', enabled: true },
    
    // Definitions & Abbreviations
    { pattern: /Light Dependent Resistor \(LDR\)/i, description: 'LDR definition', enabled: true },
    { pattern: /Bill of Engineering Measurement/i, description: 'BEME definition', enabled: true },
    { pattern: /Internet of Things \(IoT\)/i, description: 'IoT definition', enabled: true },
    { pattern: /Passive Infra-Red \(PIR\)/i, description: 'PIR definition', enabled: true },
  ];

  static getInstance(): ExclusionEngine {
    if (!ExclusionEngine.instance) {
      ExclusionEngine.instance = new ExclusionEngine();
    }
    return ExclusionEngine.instance;
  }

  getExclusionPatterns(): ExclusionRule[] {
    return [...ExclusionEngine.DEFAULT_EXCLUSION_PATTERNS, ...this.customRules];
  }

  addCustomRule(rule: ExclusionRule): void {
    this.customRules.push({ ...rule, enabled: true });
  }

  removeCustomRule(description: string): void {
    this.customRules = this.customRules.filter(r => r.description !== description);
  }

  filterText(text: string): string {
    let filtered = text;
    const allRules = this.getExclusionPatterns();
    for (const rule of allRules) {
      if (rule.enabled !== false) {
        if (rule.pattern instanceof RegExp) {
          filtered = filtered.replace(rule.pattern, '');
        } else {
          filtered = filtered.replace(new RegExp(rule.pattern, 'gi'), '');
        }
      }
    }
    return filtered.replace(/\s+/g, ' ').trim();
  }

  isExcluded(text: string): { excluded: boolean; matchedRules: string[] } {
    const matchedRules: string[] = [];
    const allRules = this.getExclusionPatterns();
    for (const rule of allRules) {
      if (rule.enabled !== false) {
        let matched = false;
        if (rule.pattern instanceof RegExp) {
          matched = rule.pattern.test(text);
        } else {
          matched = text.includes(rule.pattern as string);
        }
        if (matched) {
          matchedRules.push(rule.description);
        }
      }
    }
    return {
      excluded: matchedRules.length > 0,
      matchedRules
    };
  }

  getExclusionSummary(text: string): { originalLength: number; filteredLength: number; excludedRules: string[] } {
    const originalLength = text.length;
    const filtered = this.filterText(text);
    const result = this.isExcluded(text);
    return {
      originalLength,
      filteredLength: filtered.length,
      excludedRules: result.matchedRules
    };
  }
}
