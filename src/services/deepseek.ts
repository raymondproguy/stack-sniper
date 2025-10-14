import axios from 'axios';
import { logInfo, logError, logSuccess } from '../utils/logger.js';

const OPENROUTER_API_KEY = "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";
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'deepseek/deepseek-r1'; // ← FREE CODER MODEL

export class DeepSeekService {
  async query(prompt, context = '') {
    try {
      logInfo('Sending request to OpenRouter...', 'DeepSeekService');

      const response = await axios.post(
        OPENROUTER_URL,
        {
          model: MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are an expert programming assistant specializing in debugging, code review, and programming concepts.  Provide clear, concise responses in PLAIN TEXT only. NO markdown, NO code blocks, NO asterisks, NO backticks, NO bold/italic formatting. Use simple plain text with regular line breaks.'
            },
            {
              role: 'user',
              content: `${context} ${prompt}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:5000',
            'X-Title': 'StackSniper'
          },
          timeout: 30000
        }
      );

      logSuccess('OpenRouter response successful', 'DeepSeekService');
      return response.data.choices[0].message.content;
      
    } catch (error) {
      logError(`OpenRouter API Error: ${error.response?.data?.message || error.message}`, 'DeepSeekService');
      throw new Error('AI service unavailable');
    }
  }

 async debugError(error, codeSnippet = '') {
    const prompt = `Debug this error and provide a solution: ${error}`;
    const context = codeSnippet ? `Here's the relevant code:\n${codeSnippet}\n\n` : '';
    return this.query(prompt, context);
  }

  async reviewCode(code) {
    const prompt = `Review this code for best practices, potential issues, and improvements: ${code}`;
    return this.query(prompt);
  }

  async rewriteCode(code, instructions = '') {
    const prompt = `Rewrite this code to be more efficient and readable: ${code}`;
    const context = instructions ? `Additional instructions: ${instructions}` : '';
    return this.query(prompt, context);
  }

  async explainConcept(concept) {
    const prompt = `Explain this programming concept in simple terms: ${concept}`;
    return this.query(prompt);
  }
}
