// src/services/TopicRelevanceFilter.ts
// HOEOS: Topic Relevance Filter - Categorizes sources by academic field

export interface TopicAnalysis {
  field: string;
  score: number;
  isRelevant: boolean;
  matchedKeywords: string[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export class TopicRelevanceFilter {
  // Engineering-specific keywords for this project
  private static readonly ENGINEERING_KEYWORDS = [
    'microcontroller', 'embedded', 'LDR', 'light dependent resistor',
    'relay', 'transistor', 'darlington', 'veroboard', 'breadboard',
    'Arduino', 'ATmega', 'PIC', 'firmware', 'C programming',
    'sensor', 'actuator', 'IoT', 'Internet of Things',
    'smart lighting', 'automatic lighting', 'dark activated',
    'street light', 'control system', 'electronics',
    'circuit', 'soldering', 'voltage regulator', 'power supply',
    'lighting load', 'electromagnetic relay', 'switching',
    'energy conservation', 'bill of engineering measurement',
    'Computer Engineering', 'Electrical Engineering',
    'embedded systems', 'programming', 'algorithm', 'flowchart',
    'integrated circuit', 'PCB', 'Vero board', 'breadboard',
    'oscilloscope', 'multimeter', 'soldering iron', 'resistor',
    'capacitor', 'diode', 'LED', 'transformer', 'bridge rectifier'
  ];

  private static readonly FIELD_KEYWORDS: Record<string, { keywords: string[], weight: number }> = {
    engineering: {
      keywords: [
        'microcontroller', 'embedded', 'circuit', 'sensor', 'relay',
        'transistor', 'arduino', 'firmware', 'iot', 'electronics',
        'automatic', 'control', 'lighting', 'power', 'voltage',
        'engineering', 'electrical', 'computer', 'programming'
      ],
      weight: 1.0
    },
    agriculture: {
      keywords: [
        'fermentation', 'cattle', 'silage', 'animal', 'crop',
        'soil', 'farming', 'livestock', 'dairy', 'pasture',
        'veterinary', 'ruminant', 'digestibility', 'feed',
        'agricultural', 'farm', 'cow', 'cereal', 'silage'
      ],
      weight: 0.8
    },
    medical: {
      keywords: [
        'patient', 'clinical', 'diagnosis', 'treatment', 'hospital',
        'disease', 'drug', 'therapy', 'surgery', 'healthcare',
        'medical', 'health', 'clinical', 'pharmaceutical'
      ],
      weight: 0.7
    },
    humanities: {
      keywords: [
        'literature', 'culture', 'language', 'history', 'philosophy',
        'society', 'religion', 'anthropology', 'linguistics',
        'humanities', 'social', 'political', 'economic'
      ],
      weight: 0.6
    },
    physical_sciences: {
      keywords: [
        'physics', 'chemistry', 'biology', 'mathematics', 'statistics',
        'science', 'experimental', 'laboratory', 'analysis'
      ],
      weight: 0.7
    }
  };

  private static readonly SIMILARITY_THRESHOLD = 0.25; // 25% keyword overlap minimum

  static analyzeTopic(studentText: string, sourceTitle: string, sourceAbstract?: string): TopicAnalysis {
    const combinedText = `${studentText.toLowerCase()} ${sourceTitle.toLowerCase()} ${(sourceAbstract || '').toLowerCase()}`;
    
    let bestMatch: { field: string; score: number; matchedKeywords: string[] } = {
      field: 'unknown',
      score: 0,
      matchedKeywords: []
    };

    for (const [field, data] of Object.entries(this.FIELD_KEYWORDS)) {
      const matchedKeywords: string[] = [];
      let matches = 0;
      let totalKeywords = data.keywords.length;

      for (const keyword of data.keywords) {
        if (combinedText.includes(keyword.toLowerCase())) {
          matches++;
          matchedKeywords.push(keyword);
        }
      }

      const rawScore = matches / totalKeywords;
      const weightedScore = rawScore * data.weight;
      
      if (weightedScore > bestMatch.score) {
        bestMatch = {
          field,
          score: weightedScore,
          matchedKeywords
        };
      }
    }

    const isRelevant = bestMatch.score >= this.SIMILARITY_THRESHOLD;
    
    let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    if (bestMatch.score > 0.6) confidence = 'HIGH';
    else if (bestMatch.score > 0.35) confidence = 'MEDIUM';
    else confidence = 'LOW';

    return {
      field: bestMatch.field,
      score: Math.round(bestMatch.score * 100),
      isRelevant,
      matchedKeywords: bestMatch.matchedKeywords.slice(0, 10),
      confidence
    };
  }

  static isEngineeringRelevant(text: string): { isEngineering: boolean; matches: string[]; count: number } {
    const textLower = text.toLowerCase();
    const matchedKeywords: string[] = [];
    
    for (const keyword of this.ENGINEERING_KEYWORDS) {
      if (textLower.includes(keyword.toLowerCase())) {
        matchedKeywords.push(keyword);
      }
    }
    
    return {
      isEngineering: matchedKeywords.length >= 2,
      matches: matchedKeywords.slice(0, 15),
      count: matchedKeywords.length
    };
  }

  static getFieldConfidence(studentText: string, sourceTitle: string): { field: string; confidence: number; explanation: string } {
    const analysis = this.analyzeTopic(studentText, sourceTitle);
    const engCheck = this.isEngineeringRelevant(studentText);
    
    if (analysis.field === 'engineering' && analysis.score > 50) {
      return {
        field: 'engineering',
        confidence: analysis.score,
        explanation: `Strong engineering relevance (${analysis.score}%). Matched: ${analysis.matchedKeywords.slice(0, 5).join(', ')}`
      };
    } else if (analysis.field === 'agriculture' && analysis.score > 30) {
      return {
        field: 'agriculture',
        confidence: analysis.score,
        explanation: `Agriculture source detected. Student text may not be relevant.`
      };
    } else if (analysis.field === 'unknown') {
      return {
        field: 'unknown',
        confidence: 0,
        explanation: 'Could not determine field. Manual review recommended.'
      };
    }
    
    return {
      field: analysis.field,
      confidence: analysis.score,
      explanation: `${analysis.field} source with ${analysis.score}% relevance`
    };
  }
}
