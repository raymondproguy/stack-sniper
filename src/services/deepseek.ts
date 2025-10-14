import axios from 'axios';
import { logInfo, logError, logSuccess } from '../utils/logger.js';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';

export class DeepSeekService {
  async query(prompt, context = '') {
    try {
      logInfo('Sending request to DeepSeek API...', 'DeepSeekService');
      
      if (!DEEPSEEK_API_KEY) {
        throw new Error('DeepSeek API key not configured');
      }

      const response = await axios.post(
        DEEPSEEK_URL,
        {
          model: 'deepseek-chat', // Official DeepSeek model
          messages: [
            {
              role: 'system',
              content: 'You are an expert programming assistant. Provide clear, concise, and helpful responses.'
            },
            {
              role: 'user',
              content: `${context} ${prompt}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.3,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      logSuccess('DeepSeek API response successful', 'DeepSeekService');
      return response.data.choices[0].message.content;
      
    } catch (error) {
      logError(`DeepSeek API Error: ${error.response?.data?.message || error.message}`, 'DeepSeekService');
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
