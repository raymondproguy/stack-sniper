// services/groq.service.ts
import axios from 'axios';
import { logInfo, logError, logSuccess } from '../utils/logger.js';

const GROQ_API_KEY = process.env.GROQ_API_KEY || "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";
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'groq/compound';

export class GroqService {
  async query(prompt: string, context: string = '') {
    try {
      logInfo('Sending request to Groq...', 'GroqService');

      const response = await axios.post(
        GROQ_URL,
        {
          model: MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are StackSniper AI - an expert programming assistant specializing in debugging, code review, and programming concepts. Provide clear, concise, and actionable responses. Use plain text with clear formatting but avoid markdown code blocks.'
            },
            {
              role: 'user',
              content: `${context}${prompt}`
            }
          ],
          max_tokens: 2000,
          temperature: 0.1
        },
        {
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      logSuccess('Groq response successful', 'GroqService');
      return response.data.choices[0].message.content;

    } catch (error: any) {
      logError(`Groq API Error: ${error.response?.data?.error?.message || error.message}`, 'GroqService');
      throw new Error('AI service unavailable');
    }
  }

  async debugError(error: string, codeSnippet: string = '') {
    const prompt = `Debug this error and provide a practical solution:

ERROR: ${error}
${codeSnippet ? `CODE:\n${codeSnippet}` : ''}

Please provide:
1. Root cause analysis
2. Step-by-step solution
3. Fixed code example (if applicable)
4. Prevention tips`;

    return this.query(prompt);
  }

  async reviewCode(code: string) {
    const prompt = `Review this code for bugs, best practices, and improvements:

CODE:
${code}

Provide structured feedback on:
- Critical issues
- Code quality improvements
- Performance suggestions
- Best practices`;

    return this.query(prompt);
  }

  async rewriteCode(code: string, instructions: string = '') {
    const prompt = `Rewrite this code to be more efficient, readable, and maintainable:

ORIGINAL CODE:
${code}
${instructions ? `INSTRUCTIONS: ${instructions}` : ''}

Provide the rewritten code with explanations of improvements.`;

    return this.query(prompt);
  }

  async explainConcept(concept: string) {
    const prompt = `Explain this programming concept clearly and practically:

CONCEPT: ${concept}

Provide:
- Clear definition
- Practical examples
- Common use cases
- Best practices`;

    return this.query(prompt);
  }
}
