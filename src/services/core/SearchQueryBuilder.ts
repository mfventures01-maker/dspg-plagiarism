/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * SearchQueryBuilder - Extracts optimized search queries from document text
 * 
 * Features:
 * - Noun phrase extraction
 * - Domain-specific term weighting
 * - Stopword removal
 * - Multi-word phrase preservation
 * - Query length limiting
 * - No AI or semantic inference (deterministic)
 */
export class SearchQueryBuilder {
  // Common academic stopwords
  private readonly stopWords = new Set([
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 
    'her', 'was', 'one', 'our', 'out', 'has', 'his', 'how', 'its', 'let', 
    'put', 'say', 'she', 'too', 'use', 'who', 'any', 'big', 'did', 'get', 
    'off', 'own', 'see', 'set', 'way', 'why', 'yes', 'about', 'after', 
    'again', 'below', 'could', 'every', 'first', 'found', 'great', 'house', 
    'large', 'learn', 'might', 'never', 'other', 'place', 'plant', 'point', 
    'right', 'small', 'sound', 'spell', 'still', 'study', 'such', 'take', 
    'tell', 'their', 'there', 'these', 'thing', 'think', 'three', 'want', 
    'well', 'went', 'where', 'which', 'world', 'would', 'also', 'within', 
    'without', 'through', 'during', 'between', 'among', 'upon', 'toward', 
    'under', 'over', 'above', 'below', 'behind', 'beside', 'beyond', 
    'despite', 'except', 'throughout', 'towards', 'underneath', 'unless', 
    'until', 'whenever', 'wherever', 'whereas', 'whereby', 'wherein'
  ]);

  // Domain-specific terms that should be boosted
  private readonly domainBoostWords = new Set([
    // AI & ML
    'machine learning', 'artificial intelligence', 'deep learning', 'neural network',
    'data science', 'big data', 'analytics', 'algorithm', 'model', 'prediction',
    'classification', 'regression', 'clustering', 'optimization', 'ensemble',
    'random forest', 'support vector', 'gradient boosting', 'lightgbm', 'xgboost',
    // Health & Disease
    'lassa fever', 'malaria', 'typhoid', 'ebola', 'disease', 'healthcare',
    'diagnosis', 'detection', 'screening', 'outbreak', 'epidemiology',
    // Agriculture
    'agriculture', 'sustainable', 'development', 'climate', 'environment',
    'crop yield', 'precision agriculture', 'smart farming', 'irrigation',
    // General Academic
    'research', 'study', 'analysis', 'comparison', 'evaluation', 'assessment',
    'methodology', 'approach', 'framework', 'system', 'technology'
  ]);

  /**
   * Builds an optimized search query from document text using:
   * - Noun phrase extraction (key terms)
   * - Domain-specific term weighting
   * - Removal of stopwords and common filler words
   * - Preservation of meaningful multi-word phrases
   */
  public buildQuery(documentText: string): string {
    console.log(`[SearchQueryBuilder] 📄 Input text length: ${documentText.length}`);
    
    if (!documentText || documentText.trim().length === 0) {
      throw new Error('Document text cannot be empty');
    }

    // Step 1: Extract key phrases using simple rules
    const phrases = this.extractKeyPhrases(documentText);
    
    // Step 2: Score and rank terms by importance
    const rankedTerms = this.rankTerms(phrases);
    
    // Step 3: Build query from top terms
    const query = this.buildQueryString(rankedTerms);
    
    console.log(`[SearchQueryBuilder] 🔍 Optimized query: "${query}"`);
    return query;
  }

  /**
   * Extract key phrases from document text using heuristics
   */
  private extractKeyPhrases(text: string): string[] {
    console.log(`[SearchQueryBuilder] 📊 Extracting key phrases...`);
    
    const phrases: string[] = [];
    
    // Pattern 1: "this paper presents X" etc.
    const pattern1 = /(?:this\s+)?(?:paper|study|research|work|article)\s+(?:presents|proposes|examines|investigates|analyzes|explores|introduces|describes|develops)\s+([^,.;:]{5,40})/gi;
    let match = pattern1.exec(text);
    while (match) {
      if (match[1]) {
        phrases.push(this.cleanPhrase(match[1].trim()));
      }
      match = pattern1.exec(text);
    }
    
    // Pattern 2: "the aim/objective is to X"
    const pattern2 = /(?:the\s+)?(?:aim|goal|objective|purpose)\s+(?:of\s+)?(?:this\s+)?(?:paper|study|research)\s+is\s+to\s+([^,.;:]{5,40})/gi;
    match = pattern2.exec(text);
    while (match) {
      if (match[1]) {
        phrases.push(this.cleanPhrase(match[1].trim()));
      }
      match = pattern2.exec(text);
    }
    
    // Pattern 3: "keywords: X, Y, Z"
    const pattern3 = /(?:key\s+)?(?:words|topics|concepts|terms)[:]\s*([^,.;]{10,50})/gi;
    match = pattern3.exec(text);
    while (match) {
      if (match[1]) {
        // Split keywords by commas or spaces
        const keywords = match[1].split(/[,;]\s*/);
        for (const kw of keywords) {
          const cleaned = this.cleanPhrase(kw.trim());
          if (cleaned.length > 3) {
            phrases.push(cleaned);
          }
        }
      }
      match = pattern3.exec(text);
    }
    
    // Pattern 4: Multi-word proper nouns (capitalized phrases)
    const pattern4 = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,4})/g;
    match = pattern4.exec(text);
    while (match) {
      if (match[1] && match[1].split(' ').length >= 2) {
        phrases.push(this.cleanPhrase(match[1].trim()));
      }
      match = pattern4.exec(text);
    }
    
    // Pattern 5: Common academic phrases
    const pattern5 = /(?:the\s+)?(?:use|application|implementation|development)\s+of\s+([^,.;:]{5,30})/gi;
    match = pattern5.exec(text);
    while (match) {
      if (match[1]) {
        phrases.push(this.cleanPhrase(match[1].trim()));
      }
      match = pattern5.exec(text);
    }
    
    // Pattern 6: "X for Y" phrases (e.g., "machine learning for detection")
    const pattern6 = /([a-z]+(?:\s+[a-z]+){1,4})\s+for\s+([a-z]+(?:\s+[a-z]+){1,4})/gi;
    match = pattern6.exec(text);
    while (match) {
      if (match[1] && match[2]) {
        const combined = `${this.cleanPhrase(match[1])} ${this.cleanPhrase(match[2])}`;
        if (combined.length > 5) {
          phrases.push(combined);
        }
        phrases.push(this.cleanPhrase(match[1]));
        phrases.push(this.cleanPhrase(match[2]));
      }
      match = pattern6.exec(text);
    }
    
    // Fallback: extract noun phrases using simple heuristics
    if (phrases.length === 0) {
      console.log(`[SearchQueryBuilder] ⚠️ No phrases found, using fallback extraction`);
      const fallbackPhrases = this.extractNounPhrases(text);
      phrases.push(...fallbackPhrases);
    }
    
    // Remove duplicates while preserving order
    const uniquePhrases = this.removeDuplicates(phrases);
    console.log(`[SearchQueryBuilder] 📊 Found ${uniquePhrases.length} unique phrases`);
    
    return uniquePhrases;
  }

  /**
   * Clean a phrase by removing non-alphanumeric characters
   */
  private cleanPhrase(phrase: string): string {
    return phrase.replace(/[^a-zA-Z0-9\s-]/g, '').trim();
  }

  /**
   * Remove duplicates from array while preserving order
   */
  private removeDuplicates(arr: string[]): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const item of arr) {
      const lower = item.toLowerCase();
      if (!seen.has(lower) && item.length > 0) {
        seen.add(lower);
        result.push(item);
      }
    }
    return result;
  }

  /**
   * Extract noun phrases using simple heuristics
   */
  private extractNounPhrases(text: string): string[] {
    console.log(`[SearchQueryBuilder] 📊 Extracting noun phrases...`);
    
    const words = text.split(/\s+/);
    const nounPhrases: string[] = [];
    let currentPhrase: string[] = [];
    let phraseLength = 0;
    
    for (const word of words) {
      const cleanWord = word.replace(/[^a-zA-Z-]/g, '');
      if (cleanWord.length < 3 || this.stopWords.has(cleanWord.toLowerCase())) {
        if (currentPhrase.length >= 2) {
          nounPhrases.push(currentPhrase.join(' '));
        }
        currentPhrase = [];
        phraseLength = 0;
      } else {
        currentPhrase.push(cleanWord);
        phraseLength += cleanWord.length + 1;
        if (phraseLength > 50 || currentPhrase.length >= 5) {
          if (currentPhrase.length >= 2) {
            nounPhrases.push(currentPhrase.join(' '));
          }
          currentPhrase = [];
          phraseLength = 0;
        }
      }
    }
    
    if (currentPhrase.length >= 2) {
      nounPhrases.push(currentPhrase.join(' '));
    }
    
    return this.removeDuplicates(nounPhrases);
  }

  /**
   * Rank terms by importance
   */
  private rankTerms(phrases: string[]): Map<string, number> {
    console.log(`[SearchQueryBuilder] 📊 Ranking ${phrases.length} terms...`);
    
    const termScores = new Map<string, number>();
    
    for (const phrase of phrases) {
      let score = 10;
      const lowerPhrase = phrase.toLowerCase();
      const wordCount = phrase.split(' ').length;
      
      // Boost known academic/domain terms
      for (const boostWord of this.domainBoostWords) {
        if (lowerPhrase.includes(boostWord)) {
          score += 30;
          break;
        }
      }
      
      // Boost longer phrases (more specific)
      if (wordCount >= 2 && wordCount <= 4) {
        score += wordCount * 5;
      }
      
      // Penalize extremely long phrases
      if (wordCount > 6 || phrase.length > 60) {
        score -= 10;
      }
      
      // Boost phrases that appear multiple times
      const count = phrases.filter(p => p.toLowerCase() === lowerPhrase).length;
      if (count > 1) {
        score += count * 10;
      }
      
      // Boost capitalized phrases (likely proper nouns)
      if (/^[A-Z]/.test(phrase)) {
        score += 15;
      }
      
      termScores.set(phrase, Math.max(1, score));
    }
    
    return termScores;
  }

  /**
   * Build query string from ranked terms
   */
  private buildQueryString(rankedTerms: Map<string, number>): string {
    console.log(`[SearchQueryBuilder] 📊 Building query string...`);
    
    // Sort terms by score (descending)
    const sortedTerms = Array.from(rankedTerms.entries())
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);
    
    if (sortedTerms.length === 0) {
      return 'research';
    }
    
    // Take top 5 unique terms
    const selectedTerms: string[] = [];
    const seen = new Set<string>();
    
    for (const term of sortedTerms) {
      const lowerTerm = term.toLowerCase();
      if (!seen.has(lowerTerm)) {
        selectedTerms.push(term);
        seen.add(lowerTerm);
        if (selectedTerms.length >= 5) {
          break;
        }
      }
    }
    
    // Build query string
    let query = selectedTerms.join(' ');
    
    // Fallback if no meaningful terms
    if (query.length < 5) {
      const fallbackTerms = sortedTerms
        .filter(t => t.length > 3)
        .slice(0, 5)
        .join(' ');
      query = fallbackTerms || 'research';
    }
    
    // Limit query length to 100 characters
    if (query.length > 100) {
      const words = query.split(' ');
      let result = '';
      let length = 0;
      for (const word of words) {
        if (length + word.length + 1 > 100) break;
        if (result) result += ' ';
        result += word;
        length += word.length + 1;
      }
      query = result || words[0] || 'research';
    }
    
    return query;
  }
}