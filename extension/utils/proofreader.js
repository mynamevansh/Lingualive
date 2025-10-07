// Proofreading utilities using Chrome's built-in AI and fallback methods

class ProofreadingService {
  constructor() {
    this.builtInProofreader = null;
    this.grammarRules = this.initializeGrammarRules();
  }

  // Initialize Chrome's built-in AI proofreader/rewriter
  async initializeBuiltInProofreader(options = {}) {
    try {
      if ('ai' in window && 'rewriter' in window.ai) {
        const capabilities = await window.ai.rewriter.capabilities();
        
        if (capabilities.available === 'readily') {
          this.builtInProofreader = await window.ai.rewriter.create({
            tone: options.tone || 'as-is',
            format: options.format || 'as-is',
            length: options.length || 'as-is'
          });
          return true;
        }
      }
    } catch (error) {
      console.warn('Built-in AI proofreader not available:', error);
    }
    return false;
  }

  // Main proofreading function
  async proofread(text, options = {}) {
    if (!text || text.trim().length === 0) {
      return { corrected: text, changes: [] };
    }

    // Try Chrome built-in AI first
    try {
      if (await this.initializeBuiltInProofreader(options)) {
        const corrected = await this.builtInProofreader.rewrite(text);
        const changes = this.detectChanges(text, corrected);
        return { corrected, changes, method: 'built-in-ai' };
      }
    } catch (error) {
      console.warn('Built-in proofreading failed:', error);
    }

    // Fallback to rule-based proofreading
    return this.fallbackProofreading(text, options);
  }

  // Real-time grammar checking
  async checkGrammar(text) {
    const result = await this.proofread(text, { focus: 'grammar' });
    
    return {
      hasErrors: result.changes.length > 0,
      errorCount: result.changes.length,
      suggestions: result.changes,
      correctedText: result.corrected
    };
  }

  // Check spelling specifically
  async checkSpelling(text) {
    const words = text.split(/\s+/);
    const corrections = [];

    for (let i = 0; i < words.length; i++) {
      const word = words[i].replace(/[^\w]/g, ''); // Remove punctuation
      if (word.length > 2) {
        const suggestion = await this.getSpellingSuggestion(word);
        if (suggestion && suggestion !== word.toLowerCase()) {
          corrections.push({
            original: word,
            suggestion: suggestion,
            position: i,
            type: 'spelling'
          });
        }
      }
    }

    return corrections;
  }

  // Get spelling suggestion for a word
  async getSpellingSuggestion(word) {
    // Try built-in spell check if available
    if ('ai' in window && 'spellChecker' in window.ai) {
      try {
        const checker = await window.ai.spellChecker.create();
        const suggestions = await checker.suggest(word);
        return suggestions[0] || word;
      } catch (error) {
        console.warn('Built-in spell checker failed:', error);
      }
    }

    // Fallback to basic dictionary check
    return this.basicSpellCheck(word);
  }

  // Basic spell checking against common words
  basicSpellCheck(word) {
    const commonWords = new Set([
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for',
      'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his',
      'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my',
      'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if',
      'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like',
      'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year',
      'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then',
      'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back',
      'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
      'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most',
      'us', 'is', 'was', 'are', 'been', 'has', 'had', 'were', 'said', 'each',
      'which', 'their', 'said', 'each', 'many', 'where', 'much', 'those', 'very',
      'here', 'should', 'through', 'long', 'still', 'its', 'before', 'life',
      'too', 'old', 'any', 'same', 'tell', 'boy', 'follow', 'came', 'want',
      'show', 'also', 'around', 'farm', 'three', 'small', 'set', 'put', 'end',
      'why', 'again', 'turn', 'every', 'start', 'might', 'close', 'something',
      'seem', 'next', 'hard', 'open', 'example', 'begin', 'life', 'always',
      'those', 'both', 'paper', 'together', 'got', 'group', 'often', 'run'
    ]);

    const lowerWord = word.toLowerCase();
    
    if (commonWords.has(lowerWord)) {
      return lowerWord;
    }

    // Check for simple corrections
    return this.suggestSimpleCorrection(lowerWord);
  }

  // Suggest simple corrections for misspelled words
  suggestSimpleCorrection(word) {
    const corrections = {
      'recieve': 'receive',
      'seperate': 'separate',
      'definately': 'definitely',
      'occured': 'occurred',
      'neccessary': 'necessary',
      'accomodate': 'accommodate',
      'beleive': 'believe',
      'acheive': 'achieve',
      'loose': 'lose',
      'there': 'their',
      'your': 'you\'re',
      'its': 'it\'s',
      'affect': 'effect',
      'accept': 'except',
      'alot': 'a lot',
      'untill': 'until',
      'wierd': 'weird',
      'freind': 'friend',
      'greatful': 'grateful'
    };

    return corrections[word] || word;
  }

  // Fallback rule-based proofreading
  fallbackProofreading(text, options = {}) {
    let corrected = text;
    const changes = [];

    // Apply grammar rules
    for (const rule of this.grammarRules) {
      const matches = corrected.match(rule.pattern);
      if (matches) {
        matches.forEach(match => {
          const replacement = rule.replacement(match);
          if (replacement !== match) {
            changes.push({
              original: match,
              corrected: replacement,
              type: rule.type,
              description: rule.description,
              position: corrected.indexOf(match)
            });
            corrected = corrected.replace(match, replacement);
          }
        });
      }
    }

    return { corrected, changes, method: 'rule-based' };
  }

  // Initialize grammar rules
  initializeGrammarRules() {
    return [
      {
        pattern: /\bi\s+/gi,
        replacement: (match) => match.replace(/\bi\s+/gi, 'I '),
        type: 'capitalization',
        description: 'Capitalize "I"'
      },
      {
        pattern: /\.\s+[a-z]/g,
        replacement: (match) => match.toUpperCase(),
        type: 'capitalization',
        description: 'Capitalize after period'
      },
      {
        pattern: /\s+/g,
        replacement: () => ' ',
        type: 'spacing',
        description: 'Fix multiple spaces'
      },
      {
        pattern: /\s+([,.!?;:])/g,
        replacement: (match, punct) => punct,
        type: 'punctuation',
        description: 'Remove space before punctuation'
      },
      {
        pattern: /([.!?])\s*([A-Z])/g,
        replacement: (match, punct, letter) => `${punct} ${letter}`,
        type: 'spacing',
        description: 'Add space after sentence punctuation'
      },
      {
        pattern: /\b(their|there|they're)\b/gi,
        replacement: (match) => {
          // Simple context-based correction (this is basic)
          return match; // Would need more sophisticated analysis
        },
        type: 'word-choice',
        description: 'Check their/there/they\'re usage'
      },
      {
        pattern: /\b(your|you're)\b/gi,
        replacement: (match) => {
          // Simple context-based correction
          return match; // Would need more sophisticated analysis
        },
        type: 'word-choice',
        description: 'Check your/you\'re usage'
      },
      {
        pattern: /\b(its|it's)\b/gi,
        replacement: (match) => {
          // Simple context-based correction
          return match; // Would need more sophisticated analysis
        },
        type: 'word-choice',
        description: 'Check its/it\'s usage'
      }
    ];
  }

  // Detect changes between original and corrected text
  detectChanges(original, corrected) {
    const changes = [];
    
    if (original === corrected) {
      return changes;
    }

    // Simple diff detection
    const originalWords = original.split(' ');
    const correctedWords = corrected.split(' ');

    let i = 0, j = 0;
    while (i < originalWords.length || j < correctedWords.length) {
      if (i >= originalWords.length) {
        // Addition
        changes.push({
          type: 'addition',
          text: correctedWords[j],
          position: j
        });
        j++;
      } else if (j >= correctedWords.length) {
        // Deletion
        changes.push({
          type: 'deletion',
          text: originalWords[i],
          position: i
        });
        i++;
      } else if (originalWords[i] === correctedWords[j]) {
        // No change
        i++;
        j++;
      } else {
        // Substitution
        changes.push({
          type: 'substitution',
          original: originalWords[i],
          corrected: correctedWords[j],
          position: i
        });
        i++;
        j++;
      }
    }

    return changes;
  }

  // Analyze text quality
  analyzeText(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    
    return {
      wordCount: words.length,
      sentenceCount: sentences.length,
      averageWordsPerSentence: sentences.length > 0 ? words.length / sentences.length : 0,
      averageWordLength: words.length > 0 ? 
        words.reduce((sum, word) => sum + word.replace(/[^\w]/g, '').length, 0) / words.length : 0,
      readabilityScore: this.calculateReadabilityScore(text),
      complexity: this.analyzeComplexity(sentences)
    };
  }

  // Simple readability score calculation (Flesch-like)
  calculateReadabilityScore(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const syllables = words.reduce((sum, word) => sum + this.countSyllables(word), 0);

    if (sentences.length === 0 || words.length === 0) return 0;

    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;

    // Simplified Flesch Reading Ease formula
    return Math.max(0, 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord));
  }

  // Count syllables in a word (approximation)
  countSyllables(word) {
    const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
    if (cleanWord.length <= 3) return 1;

    const vowelGroups = cleanWord.match(/[aeiouy]+/g);
    let syllables = vowelGroups ? vowelGroups.length : 1;

    // Adjust for silent 'e'
    if (cleanWord.endsWith('e')) syllables--;
    
    return Math.max(1, syllables);
  }

  // Analyze text complexity
  analyzeComplexity(sentences) {
    const complexWords = sentences.reduce((count, sentence) => {
      const words = sentence.split(/\s+/);
      return count + words.filter(word => 
        word.replace(/[^\w]/g, '').length > 6 || this.countSyllables(word) > 2
      ).length;
    }, 0);

    const totalWords = sentences.reduce((count, sentence) => 
      count + sentence.split(/\s+/).length, 0
    );

    return {
      complexWordRatio: totalWords > 0 ? complexWords / totalWords : 0,
      avgSentenceLength: totalWords / sentences.length,
      complexity: complexWords / totalWords > 0.3 ? 'high' : 
                  complexWords / totalWords > 0.15 ? 'medium' : 'low'
    };
  }
}

// Export functions for use in content scripts
async function proofreadWithBuiltInAI(text, options = {}) {
  const service = new ProofreadingService();
  return await service.proofread(text, options);
}

async function checkGrammarWithAI(text) {
  const service = new ProofreadingService();
  return await service.checkGrammar(text);
}

async function analyzeTextQuality(text) {
  const service = new ProofreadingService();
  return service.analyzeText(text);
}

// Make functions available globally for extension use
if (typeof window !== 'undefined') {
  window.LinguaLiveProofreader = {
    proofreadWithBuiltInAI,
    checkGrammarWithAI,
    analyzeTextQuality,
    ProofreadingService
  };
}