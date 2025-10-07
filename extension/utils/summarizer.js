// Summarization utilities using Chrome's built-in AI and fallback methods

class SummarizerService {
  constructor() {
    this.builtInSummarizer = null;
    this.conversationHistory = [];
    this.keyPoints = [];
    this.sessionStartTime = Date.now();
  }

  // Initialize Chrome's built-in AI summarizer
  async initializeBuiltInSummarizer(options = {}) {
    try {
      if ('ai' in window && 'summarizer' in window.ai) {
        const capabilities = await window.ai.summarizer.capabilities();
        
        if (capabilities.available === 'readily') {
          this.builtInSummarizer = await window.ai.summarizer.create({
            type: options.type || 'key-points',
            format: options.format || 'markdown',
            length: options.length || 'medium'
          });
          return true;
        }
      }
    } catch (error) {
      console.warn('Built-in AI summarizer not available:', error);
    }
    return false;
  }

  // Main summarization function
  async summarize(text, options = {}) {
    if (!text || text.trim().length === 0) {
      return '';
    }

    // Add to conversation history
    this.addToHistory(text);

    // Try Chrome built-in AI first
    try {
      if (await this.initializeBuiltInSummarizer(options)) {
        return await this.builtInSummarizer.summarize(text);
      }
    } catch (error) {
      console.warn('Built-in summarization failed:', error);
    }

    // Fallback to local processing
    return this.fallbackSummarization(text, options);
  }

  // Generate real-time meeting notes
  async generateRealTimeNotes(text) {
    const timestamp = new Date().toLocaleTimeString();
    
    // Extract key points from the text
    const keyPoint = await this.extractKeyPoint(text);
    
    if (keyPoint && keyPoint.length > 10) {
      this.keyPoints.push({
        time: timestamp,
        content: keyPoint,
        type: 'note'
      });
      
      return `[${timestamp}] ${keyPoint}`;
    }
    
    return null;
  }

  // Extract key point from text using AI or patterns
  async extractKeyPoint(text) {
    // Try built-in AI first
    try {
      if (await this.initializeBuiltInSummarizer({ type: 'key-points', length: 'short' })) {
        const summary = await this.builtInSummarizer.summarize(text);
        return this.cleanKeyPoint(summary);
      }
    } catch (error) {
      console.warn('AI key point extraction failed:', error);
    }

    // Fallback to pattern-based extraction
    return this.extractKeyPointFallback(text);
  }

  // Pattern-based key point extraction
  extractKeyPointFallback(text) {
    // Common meeting phrases that indicate important points
    const importantPatterns = [
      /(?:we need to|should|must|will|going to|planning to|decided to)\s+([^.!?]+)/gi,
      /(?:action item|todo|task|assignment)[\s:]*([^.!?]+)/gi,
      /(?:deadline|due date|by)\s+([^.!?]+)/gi,
      /(?:problem|issue|concern|challenge)[\s:]*([^.!?]+)/gi,
      /(?:solution|resolution|fix|approach)[\s:]*([^.!?]+)/gi,
      /(?:important|critical|urgent|priority)[\s:]*([^.!?]+)/gi
    ];

    for (const pattern of importantPatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        return this.cleanKeyPoint(matches[0]);
      }
    }

    // If no patterns match, check for questions
    const questionMatch = text.match(/[?]([^?]+[?])/);
    if (questionMatch) {
      return `Question: ${this.cleanKeyPoint(questionMatch[0])}`;
    }

    // Extract first meaningful sentence
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    if (sentences.length > 0) {
      return this.cleanKeyPoint(sentences[0]);
    }

    return null;
  }

  // Clean and format key points
  cleanKeyPoint(text) {
    return text
      .trim()
      .replace(/^\W+/, '') // Remove leading non-word characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .substring(0, 150) // Limit length
      .trim();
  }

  // Generate comprehensive meeting summary
  async generateMeetingSummary() {
    const duration = Date.now() - this.sessionStartTime;
    const durationMinutes = Math.round(duration / 60000);

    const summary = {
      sessionId: `session_${this.sessionStartTime}`,
      startTime: new Date(this.sessionStartTime).toISOString(),
      duration: `${durationMinutes} minutes`,
      keyPoints: this.keyPoints,
      totalMessages: this.conversationHistory.length,
      wordCount: this.conversationHistory.reduce((sum, msg) => sum + msg.split(' ').length, 0)
    };

    // Try to generate AI summary of the entire conversation
    try {
      if (this.conversationHistory.length > 0) {
        const fullText = this.conversationHistory.join(' ');
        
        if (await this.initializeBuiltInSummarizer({ type: 'tl;dr', length: 'long' })) {
          summary.aiSummary = await this.builtInSummarizer.summarize(fullText);
        } else {
          summary.aiSummary = this.fallbackSummarization(fullText, { type: 'overview' });
        }
      }
    } catch (error) {
      console.warn('Failed to generate AI summary:', error);
      summary.aiSummary = 'Summary generation failed, but key points are available above.';
    }

    return summary;
  }

  // Fallback summarization for when AI is not available
  fallbackSummarization(text, options = {}) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    if (sentences.length <= 2) {
      return text; // Too short to summarize
    }

    // Simple extractive summarization
    const scoredSentences = sentences.map(sentence => ({
      text: sentence.trim(),
      score: this.scoreSentence(sentence, sentences)
    }));

    // Sort by score and take top sentences
    const topSentences = scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.max(2, Math.ceil(sentences.length * 0.3)))
      .sort((a, b) => sentences.indexOf(a.text) - sentences.indexOf(b.text));

    return topSentences.map(s => s.text).join('. ') + '.';
  }

  // Score sentences for extractive summarization
  scoreSentence(sentence, allSentences) {
    let score = 0;
    
    // Length penalty (avoid very short or very long sentences)
    const words = sentence.split(' ').length;
    if (words >= 8 && words <= 25) score += 2;
    else if (words >= 5 && words <= 35) score += 1;

    // Important keywords
    const importantWords = [
      'important', 'critical', 'key', 'main', 'primary', 'significant',
      'decision', 'action', 'task', 'deadline', 'issue', 'problem',
      'solution', 'result', 'outcome', 'conclusion', 'summary'
    ];

    importantWords.forEach(word => {
      if (sentence.toLowerCase().includes(word)) score += 1;
    });

    // Position bonus (first and last sentences often important)
    const index = allSentences.indexOf(sentence);
    if (index === 0 || index === allSentences.length - 1) score += 1;

    // Question bonus
    if (sentence.includes('?')) score += 1;

    return score;
  }

  // Add text to conversation history
  addToHistory(text) {
    if (text && text.trim().length > 0) {
      this.conversationHistory.push(text.trim());
      
      // Keep only recent history to manage memory
      if (this.conversationHistory.length > 100) {
        this.conversationHistory = this.conversationHistory.slice(-100);
      }
    }
  }

  // Get conversation statistics
  getStats() {
    return {
      totalMessages: this.conversationHistory.length,
      keyPoints: this.keyPoints.length,
      sessionDuration: Date.now() - this.sessionStartTime,
      averageMessageLength: this.conversationHistory.length > 0 
        ? this.conversationHistory.reduce((sum, msg) => sum + msg.length, 0) / this.conversationHistory.length 
        : 0
    };
  }

  // Clear session data
  reset() {
    this.conversationHistory = [];
    this.keyPoints = [];
    this.sessionStartTime = Date.now();
  }

  // Export meeting data
  exportMeetingData(format = 'json') {
    const data = {
      summary: this.generateMeetingSummary(),
      history: this.conversationHistory,
      keyPoints: this.keyPoints,
      stats: this.getStats(),
      exportedAt: new Date().toISOString()
    };

    switch (format) {
      case 'markdown':
        return this.exportAsMarkdown(data);
      case 'txt':
        return this.exportAsText(data);
      default:
        return JSON.stringify(data, null, 2);
    }
  }

  // Export as Markdown
  exportAsMarkdown(data) {
    let markdown = `# Meeting Summary\n\n`;
    markdown += `**Date:** ${new Date(this.sessionStartTime).toLocaleString()}\n`;
    markdown += `**Duration:** ${Math.round((Date.now() - this.sessionStartTime) / 60000)} minutes\n`;
    markdown += `**Messages:** ${this.conversationHistory.length}\n\n`;

    if (this.keyPoints.length > 0) {
      markdown += `## Key Points\n\n`;
      this.keyPoints.forEach((point, index) => {
        markdown += `${index + 1}. **[${point.time}]** ${point.content}\n`;
      });
      markdown += `\n`;
    }

    if (data.summary?.aiSummary) {
      markdown += `## AI Summary\n\n${data.summary.aiSummary}\n\n`;
    }

    markdown += `## Full Transcript\n\n`;
    this.conversationHistory.forEach((msg, index) => {
      markdown += `**Message ${index + 1}:** ${msg}\n\n`;
    });

    return markdown;
  }

  // Export as plain text
  exportAsText(data) {
    let text = `MEETING SUMMARY\n`;
    text += `================\n\n`;
    text += `Date: ${new Date(this.sessionStartTime).toLocaleString()}\n`;
    text += `Duration: ${Math.round((Date.now() - this.sessionStartTime) / 60000)} minutes\n`;
    text += `Messages: ${this.conversationHistory.length}\n\n`;

    if (this.keyPoints.length > 0) {
      text += `KEY POINTS:\n`;
      this.keyPoints.forEach((point, index) => {
        text += `${index + 1}. [${point.time}] ${point.content}\n`;
      });
      text += `\n`;
    }

    if (data.summary?.aiSummary) {
      text += `AI SUMMARY:\n${data.summary.aiSummary}\n\n`;
    }

    text += `FULL TRANSCRIPT:\n`;
    this.conversationHistory.forEach((msg, index) => {
      text += `Message ${index + 1}: ${msg}\n`;
    });

    return text;
  }
}

// Export functions for use in content scripts
async function generateSummaryWithBuiltInAI(text, options = {}) {
  const service = new SummarizerService();
  return await service.summarize(text, options);
}

async function generateRealTimeNote(text) {
  const service = new SummarizerService();
  return await service.generateRealTimeNotes(text);
}

async function generateMeetingSummary(conversationHistory) {
  const service = new SummarizerService();
  service.conversationHistory = conversationHistory || [];
  return await service.generateMeetingSummary();
}

// Make functions available globally for extension use
if (typeof window !== 'undefined') {
  window.LinguaLiveSummarizer = {
    generateSummaryWithBuiltInAI,
    generateRealTimeNote,
    generateMeetingSummary,
    SummarizerService
  };
}