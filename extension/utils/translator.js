// Translation utilities using Chrome's built-in AI and fallback methods

class TranslationService {
  constructor() {
    this.builtInTranslator = null;
    this.fallbackEndpoint = null;
  }

  // Initialize built-in Chrome AI translator
  async initializeBuiltInTranslator(sourceLanguage, targetLanguage) {
    try {
      if ('ai' in window && 'translator' in window.ai) {
        this.builtInTranslator = await window.ai.translator.create({
          sourceLanguage: sourceLanguage,
          targetLanguage: targetLanguage
        });
        return true;
      }
    } catch (error) {
      console.warn('Built-in AI translator not available:', error);
    }
    return false;
  }

  // Main translation function with fallback options
  async translate(text, sourceLanguage = 'en', targetLanguage = 'es') {
    if (!text || text.trim().length === 0) {
      return '';
    }

    // Try Chrome built-in AI first
    try {
      if (await this.initializeBuiltInTranslator(sourceLanguage, targetLanguage)) {
        return await this.builtInTranslator.translate(text);
      }
    } catch (error) {
      console.warn('Built-in translation failed:', error);
    }

    // Fallback to browser translation API
    try {
      const translation = await this.translateWithBrowserAPI(text, sourceLanguage, targetLanguage);
      if (translation) return translation;
    } catch (error) {
      console.warn('Browser API translation failed:', error);
    }

    // Fallback to external service
    try {
      return await this.translateWithExternalService(text, sourceLanguage, targetLanguage);
    } catch (error) {
      console.warn('External translation failed:', error);
    }

    // Return original text if all methods fail
    return text;
  }

  // Chrome's built-in translation (when available)
  async translateWithBrowserAPI(text, sourceLanguage, targetLanguage) {
    // This would use Chrome's translation API if available
    // Currently this is experimental and not widely available
    if ('translation' in navigator) {
      try {
        const translator = await navigator.translation.createTranslator({
          sourceLanguage,
          targetLanguage
        });
        return await translator.translate(text);
      } catch (error) {
        console.warn('Browser translation API error:', error);
      }
    }
    return null;
  }

  // External translation service (fallback)
  async translateWithExternalService(text, sourceLanguage, targetLanguage) {
    // Use a free translation service as fallback
    try {
      // MyMemory Translation API (free tier available)
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLanguage}|${targetLanguage}`
      );
      
      if (!response.ok) throw new Error('Translation service unavailable');
      
      const data = await response.json();
      
      if (data.responseStatus === 200 && data.responseData) {
        return data.responseData.translatedText;
      }
    } catch (error) {
      console.error('External translation service error:', error);
    }

    // LibreTranslate fallback (if running locally)
    try {
      const response = await fetch('http://localhost:5000/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: sourceLanguage,
          target: targetLanguage,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.translatedText;
      }
    } catch (error) {
      console.warn('LibreTranslate service not available:', error);
    }

    throw new Error('All translation services failed');
  }

  // Batch translation for multiple texts
  async translateBatch(texts, sourceLanguage, targetLanguage) {
    const translations = await Promise.allSettled(
      texts.map(text => this.translate(text, sourceLanguage, targetLanguage))
    );

    return translations.map((result, index) => ({
      original: texts[index],
      translated: result.status === 'fulfilled' ? result.value : texts[index],
      success: result.status === 'fulfilled'
    }));
  }

  // Language detection using built-in AI
  async detectLanguage(text) {
    try {
      if ('ai' in window && 'languageDetector' in window.ai) {
        const detector = await window.ai.languageDetector.create();
        const results = await detector.detect(text);
        return results[0]?.detectedLanguage || 'en';
      }
    } catch (error) {
      console.warn('Built-in language detection failed:', error);
    }

    // Fallback language detection
    return await this.detectLanguageFallback(text);
  }

  // Simple fallback language detection
  async detectLanguageFallback(text) {
    // Basic pattern matching for common languages
    const patterns = {
      'es': /[ñáéíóúü]/i,
      'fr': /[àâäçéèêëïîôöùûüÿ]/i,
      'de': /[äöüß]/i,
      'it': /[àèéìíîòóù]/i,
      'pt': /[ãâêôõç]/i,
      'ru': /[абвгдеёжзийклмнопрстуфхцчшщъыьэюя]/i,
      'ar': /[\u0600-\u06FF]/,
      'zh': /[\u4e00-\u9fff]/,
      'ja': /[\u3040-\u309f\u30a0-\u30ff]/,
      'ko': /[\uac00-\ud7af]/
    };

    for (const [lang, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) {
        return lang;
      }
    }

    return 'en'; // Default to English
  }

  // Get supported languages
  getSupportedLanguages() {
    return {
      'en': 'English',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'it': 'Italian',
      'pt': 'Portuguese',
      'ru': 'Russian',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese (Simplified)',
      'ar': 'Arabic',
      'hi': 'Hindi',
      'tr': 'Turkish',
      'pl': 'Polish',
      'nl': 'Dutch',
      'sv': 'Swedish',
      'da': 'Danish',
      'no': 'Norwegian',
      'fi': 'Finnish',
      'el': 'Greek',
      'he': 'Hebrew',
      'th': 'Thai',
      'vi': 'Vietnamese',
      'uk': 'Ukrainian',
      'cs': 'Czech',
      'hu': 'Hungarian',
      'ro': 'Romanian',
      'bg': 'Bulgarian',
      'hr': 'Croatian',
      'sk': 'Slovak',
      'sl': 'Slovenian'
    };
  }
}

// Export functions for use in content scripts
async function translateWithBuiltInAI(text, sourceLanguage, targetLanguage) {
  const service = new TranslationService();
  return await service.translate(text, sourceLanguage, targetLanguage);
}

async function detectLanguageWithAI(text) {
  const service = new TranslationService();
  return await service.detectLanguage(text);
}

async function batchTranslate(texts, sourceLanguage, targetLanguage) {
  const service = new TranslationService();
  return await service.translateBatch(texts, sourceLanguage, targetLanguage);
}

// Make functions available globally for extension use
if (typeof window !== 'undefined') {
  window.LinguaLiveTranslator = {
    translateWithBuiltInAI,
    detectLanguageWithAI,
    batchTranslate,
    TranslationService
  };
}