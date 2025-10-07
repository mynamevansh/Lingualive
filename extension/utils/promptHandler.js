// Unified prompt handler for Chrome's built-in AI and external services

class PromptHandler {
  constructor() {
    this.aiSessions = new Map();
    this.modelCapabilities = {};
    this.fallbackEndpoints = {
      gemini: null,
      openai: null,
      custom: null
    };
  }

  // Initialize and check AI capabilities
  async initialize() {
    await this.checkAICapabilities();
    return this.modelCapabilities;
  }

  // Check what AI capabilities are available
  async checkAICapabilities() {
    this.modelCapabilities = {
      languageModel: false,
      translator: false,
      summarizer: false,
      rewriter: false,
      promptAPI: false
    };

    if ('ai' in window) {
      // Check Language Model API
      try {
        if ('languageModel' in window.ai) {
          const capabilities = await window.ai.languageModel.capabilities();
          this.modelCapabilities.languageModel = capabilities.available === 'readily';
        }
      } catch (error) {
        console.warn('Language model not available:', error);
      }

      // Check Translator API
      try {
        if ('translator' in window.ai) {
          const capabilities = await window.ai.translator.capabilities();
          this.modelCapabilities.translator = capabilities.available === 'readily';
        }
      } catch (error) {
        console.warn('Translator not available:', error);
      }

      // Check Summarizer API
      try {
        if ('summarizer' in window.ai) {
          const capabilities = await window.ai.summarizer.capabilities();
          this.modelCapabilities.summarizer = capabilities.available === 'readily';
        }
      } catch (error) {
        console.warn('Summarizer not available:', error);
      }

      // Check Rewriter API
      try {
        if ('rewriter' in window.ai) {
          const capabilities = await window.ai.rewriter.capabilities();
          this.modelCapabilities.rewriter = capabilities.available === 'readily';
        }
      } catch (error) {
        console.warn('Rewriter not available:', error);
      }

      // Check Prompt API
      try {
        if ('promptAPI' in window.ai) {
          this.modelCapabilities.promptAPI = true;
        }
      } catch (error) {
        console.warn('Prompt API not available:', error);
      }
    }

    return this.modelCapabilities;
  }

  // Create a language model session
  async createLanguageModelSession(options = {}) {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      if (this.modelCapabilities.languageModel && 'languageModel' in window.ai) {
        const session = await window.ai.languageModel.create({
          temperature: options.temperature || 0.7,
          topK: options.topK || 40,
          systemPrompt: options.systemPrompt || 'You are a helpful assistant for language processing tasks.'
        });

        this.aiSessions.set(sessionId, {
          type: 'languageModel',
          session: session,
          createdAt: Date.now(),
          options: options
        });

        return sessionId;
      }
    } catch (error) {
      console.warn('Failed to create language model session:', error);
    }

    // Fallback to external service
    return await this.createFallbackSession(options);
  }

  // Send prompt to AI model
  async sendPrompt(sessionId, prompt, options = {}) {
    const sessionData = this.aiSessions.get(sessionId);
    
    if (sessionData && sessionData.type === 'languageModel') {
      try {
        const response = await sessionData.session.prompt(prompt);
        return {
          response: response,
          source: 'built-in-ai',
          sessionId: sessionId
        };
      } catch (error) {
        console.warn('Built-in AI prompt failed:', error);
      }
    }

    // Fallback to external service
    return await this.sendFallbackPrompt(prompt, options);
  }

  // Stream prompt response
  async streamPrompt(sessionId, prompt, onChunk, options = {}) {
    const sessionData = this.aiSessions.get(sessionId);
    
    if (sessionData && sessionData.type === 'languageModel') {
      try {
        const stream = sessionData.session.promptStreaming(prompt);
        
        for await (const chunk of stream) {
          onChunk(chunk, { source: 'built-in-ai', sessionId });
        }
        
        return { success: true, source: 'built-in-ai' };
      } catch (error) {
        console.warn('Built-in AI streaming failed:', error);
      }
    }

    // Fallback to external streaming
    return await this.streamFallbackPrompt(prompt, onChunk, options);
  }

  // Specialized prompts for different tasks
  async translatePrompt(text, sourceLanguage, targetLanguage) {
    if (this.modelCapabilities.translator) {
      try {
        const translator = await window.ai.translator.create({
          sourceLanguage,
          targetLanguage
        });
        return await translator.translate(text);
      } catch (error) {
        console.warn('Built-in translator failed:', error);
      }
    }

    // Fallback to language model
    const sessionId = await this.createLanguageModelSession({
      systemPrompt: `You are a professional translator. Translate text from ${sourceLanguage} to ${targetLanguage}. Only return the translated text, nothing else.`
    });

    const result = await this.sendPrompt(sessionId, text);
    this.destroySession(sessionId);
    
    return result.response;
  }

  async summarizePrompt(text, options = {}) {
    if (this.modelCapabilities.summarizer) {
      try {
        const summarizer = await window.ai.summarizer.create({
          type: options.type || 'key-points',
          format: options.format || 'markdown',
          length: options.length || 'medium'
        });
        return await summarizer.summarize(text);
      } catch (error) {
        console.warn('Built-in summarizer failed:', error);
      }
    }

    // Fallback to language model
    const sessionId = await this.createLanguageModelSession({
      systemPrompt: `You are an expert at summarizing content. Create ${options.type || 'key-points'} summaries in ${options.format || 'markdown'} format with ${options.length || 'medium'} length.`
    });

    const prompt = `Please summarize the following text:\n\n${text}`;
    const result = await this.sendPrompt(sessionId, prompt);
    this.destroySession(sessionId);
    
    return result.response;
  }

  async proofreadPrompt(text, options = {}) {
    if (this.modelCapabilities.rewriter) {
      try {
        const rewriter = await window.ai.rewriter.create({
          tone: options.tone || 'as-is',
          format: options.format || 'as-is',
          length: options.length || 'as-is'
        });
        return await rewriter.rewrite(text);
      } catch (error) {
        console.warn('Built-in rewriter failed:', error);
      }
    }

    // Fallback to language model
    const sessionId = await this.createLanguageModelSession({
      systemPrompt: 'You are a professional proofreader. Fix grammar, spelling, and improve readability while maintaining the original meaning and tone.'
    });

    const prompt = `Please proofread and correct the following text:\n\n${text}`;
    const result = await this.sendPrompt(sessionId, prompt);
    this.destroySession(sessionId);
    
    return result.response;
  }

  // Custom prompts for meeting assistance
  async extractActionItemsPrompt(meetingText) {
    const sessionId = await this.createLanguageModelSession({
      systemPrompt: 'You are an assistant that extracts action items from meeting transcripts. Return a clear, organized list of tasks, deadlines, and assignees.'
    });

    const prompt = `Extract action items from this meeting transcript:\n\n${meetingText}`;
    const result = await this.sendPrompt(sessionId, prompt);
    this.destroySession(sessionId);
    
    return result.response;
  }

  async generateMeetingNotesPrompt(meetingText) {
    const sessionId = await this.createLanguageModelSession({
      systemPrompt: 'You are an expert meeting note-taker. Create structured, professional meeting notes with key points, decisions, and follow-ups.'
    });

    const prompt = `Generate comprehensive meeting notes from this transcript:\n\n${meetingText}`;
    const result = await this.sendPrompt(sessionId, prompt);
    this.destroySession(sessionId);
    
    return result.response;
  }

  async clarifyContentPrompt(text, context = '') {
    const sessionId = await this.createLanguageModelSession({
      systemPrompt: 'You are a helpful assistant that clarifies and explains content in simple terms.'
    });

    const prompt = `Please clarify and explain this content in simple terms${context ? ` (Context: ${context})` : ''}:\n\n${text}`;
    const result = await this.sendPrompt(sessionId, prompt);
    this.destroySession(sessionId);
    
    return result.response;
  }

  // Fallback to external services
  async createFallbackSession(options = {}) {
    const sessionId = `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.aiSessions.set(sessionId, {
      type: 'fallback',
      options: options,
      createdAt: Date.now()
    });

    return sessionId;
  }

  async sendFallbackPrompt(prompt, options = {}) {
    // Try Gemini API if configured
    if (this.fallbackEndpoints.gemini) {
      try {
        const response = await fetch(this.fallbackEndpoints.gemini, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${options.apiKey || ''}`
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: options.temperature || 0.7,
              maxOutputTokens: options.maxTokens || 1000
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          return {
            response: data.candidates[0]?.content?.parts[0]?.text || 'No response',
            source: 'gemini-api',
            sessionId: null
          };
        }
      } catch (error) {
        console.warn('Gemini API failed:', error);
      }
    }

    // Try local server endpoint
    try {
      const response = await fetch('http://localhost:3001/api/ai/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt,
          options: options
        })
      });

      if (response.ok) {
        const data = await response.json();
        return {
          response: data.response,
          source: 'local-server',
          sessionId: null
        };
      }
    } catch (error) {
      console.warn('Local server AI failed:', error);
    }

    // Ultimate fallback - return prompt with instructions
    return {
      response: `I apologize, but AI processing is not available right now. The original text was: "${prompt}"`,
      source: 'fallback',
      sessionId: null
    };
  }

  async streamFallbackPrompt(prompt, onChunk, options = {}) {
    // For now, just send the full response at once
    const result = await this.sendFallbackPrompt(prompt, options);
    onChunk(result.response, { source: result.source, sessionId: null });
    
    return { success: true, source: result.source };
  }

  // Session management
  destroySession(sessionId) {
    const sessionData = this.aiSessions.get(sessionId);
    
    if (sessionData) {
      if (sessionData.session && typeof sessionData.session.destroy === 'function') {
        sessionData.session.destroy();
      }
      this.aiSessions.delete(sessionId);
    }
  }

  destroyAllSessions() {
    for (const [sessionId] of this.aiSessions) {
      this.destroySession(sessionId);
    }
  }

  // Configuration management
  setFallbackEndpoints(endpoints) {
    this.fallbackEndpoints = { ...this.fallbackEndpoints, ...endpoints };
  }

  getFallbackEndpoints() {
    return { ...this.fallbackEndpoints };
  }

  // Get session information
  getSessionInfo(sessionId) {
    return this.aiSessions.get(sessionId) || null;
  }

  getActiveSessionCount() {
    return this.aiSessions.size;
  }

  // Utility methods
  async testConnection() {
    const capabilities = await this.checkAICapabilities();
    
    return {
      builtInAI: Object.values(capabilities).some(cap => cap),
      capabilities: capabilities,
      fallbackEndpoints: this.fallbackEndpoints,
      timestamp: Date.now()
    };
  }

  async benchmarkPerformance(testPrompt = "Hello, how are you?") {
    const results = {
      builtInAI: null,
      fallback: null
    };

    // Test built-in AI
    if (this.modelCapabilities.languageModel) {
      const start = Date.now();
      try {
        const sessionId = await this.createLanguageModelSession();
        await this.sendPrompt(sessionId, testPrompt);
        this.destroySession(sessionId);
        results.builtInAI = Date.now() - start;
      } catch (error) {
        results.builtInAI = 'error';
      }
    }

    // Test fallback
    const start2 = Date.now();
    try {
      await this.sendFallbackPrompt(testPrompt);
      results.fallback = Date.now() - start2;
    } catch (error) {
      results.fallback = 'error';
    }

    return results;
  }
}

// Export functions for use in content scripts
async function createAISession(options = {}) {
  const handler = new PromptHandler();
  await handler.initialize();
  return await handler.createLanguageModelSession(options);
}

async function sendAIPrompt(sessionId, prompt, options = {}) {
  const handler = new PromptHandler();
  return await handler.sendPrompt(sessionId, prompt, options);
}

async function quickTranslate(text, sourceLanguage, targetLanguage) {
  const handler = new PromptHandler();
  await handler.initialize();
  return await handler.translatePrompt(text, sourceLanguage, targetLanguage);
}

async function quickSummarize(text, options = {}) {
  const handler = new PromptHandler();
  await handler.initialize();
  return await handler.summarizePrompt(text, options);
}

async function quickProofread(text, options = {}) {
  const handler = new PromptHandler();
  await handler.initialize();
  return await handler.proofreadPrompt(text, options);
}

// Make functions available globally for extension use
if (typeof window !== 'undefined') {
  window.LinguaLivePromptHandler = {
    createAISession,
    sendAIPrompt,
    quickTranslate,
    quickSummarize,
    quickProofread,
    PromptHandler
  };
}