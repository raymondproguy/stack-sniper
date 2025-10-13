import axios from 'axios';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions';

export class DeepSeekService {
  async query(prompt:any, context = '') {
    try {
      const response = await axios.post(DEEPSEEK_URL, {
        model: 'deepseek-coder',
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
        temperature: 0.3
      }, {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      return response.data.choices[0].message.content;
    } catch (error:any) {
      console.error('DeepSeek API error:', error.response?.data || error.message);
      throw new Error('AI service unavailable');
    }
  }

  async debugError(error:any, codeSnippet = '') {
    const prompt = `Debug this error and provide a solution: ${error}`;
    const context = codeSnippet ? `Here's the relevant code:\n${codeSnippet}\n\n` : '';
    return this.query(prompt, context);
  }

  async reviewCode(code:any) {
    const prompt = `Review this code for best practices, potential issues, and improvements: ${code}`;
    return this.query(prompt);
  }

  async rewriteCode(code:any, instructions = '') {
    const prompt = `Rewrite this code to be more efficient and readable: ${code}`;
    const context = instructions ? `Additional instructions: ${instructions}` : '';
    return this.query(prompt, context);
  }

  async explainConcept(concept:any) {
    const prompt = `Explain this programming concept in simple terms: ${concept}`;
    return this.query(prompt);
  }
}
