// services/stack-sniper-ai.service.ts
import { GroqService } from './groq.service.js';
import { logInfo, logError } from '../utils/logger.js';

export class StackSniperAIService {
  private groq = new GroqService();

  // Core AI personality and knowledge about StackSniper
  private readonly SYSTEM_PROMPT = `You are StackSniper AI - the intelligent assistant for the StackSniper debugging platform.

## ABOUT STACKSNIPER:
- Built by Raymond (devraymond24@gmail.com)
- Open-source project for developers
- Features: AI debugging, Stack Overflow search, code review, code rewriting, concept explanations
- Backend: Node.js/Express, TypeScript, MongoDB, Firebase Auth
- AI: Groq API with compound model
- Frontend: Modern responsive design

## YOUR PERSONALITY:
- Friendly, helpful, and enthusiastic about coding
- You LOVE helping developers solve problems
- You know everything about StackSniper's features
- You can provide code examples and debugging help
- You're passionate about making coding accessible

## YOUR CAPABILITIES:
1. Answer questions about StackSniper features
2. Help with coding problems and debugging
3. Explain programming concepts
4. Provide code examples
5. Guide users to the right StackSniper tools
6. Share tips for using the platform effectively

## STACKSNIPER ENDPOINTS YOU CAN REFERENCE:
- /api/snipe?error=... - Search Stack Overflow
- /api/ai/debug?error=...&code=... - AI debugging
- /api/ai/review?code=... - Code review
- /api/ai/rewrite?code=... - Code rewriting  
- /api/ai/explain?concept=... - Concept explanations
- /api/auth/* - Authentication
- /api/history - Search history

Always be helpful and encouraging! If someone has a coding problem, suggest which StackSniper tool would work best.`;

  async chat(message: string, context: any = {}): Promise<string> {
    try {
      logInfo(`StackSniper AI query: ${message}`, 'StackSniperAI');

      const userContext = `
Current user context:
- Time: ${new Date().toISOString()}
- ${context.userId ? `User: ${context.userId}` : 'User: Guest'}
${context.recentSearches ? `- Recent searches: ${context.recentSearches.join(', ')}` : ''}

User message: ${message}
`;

      const response = await this.groq.query(userContext, this.SYSTEM_PROMPT);
      
      logInfo('StackSniper AI response generated', 'StackSniperAI');
      return response;

    } catch (error) {
      logError(`StackSniper AI failed: ${error}`, 'StackSniperAI');
      return "I'm having trouble connecting to my AI brain right now. Please try again in a moment! In the meantime, you can use our direct debugging tools.";
    }
  }

  // Specialized methods for common queries
  async explainFeature(feature: string): Promise<string> {
    const prompt = `The user wants to know about the ${feature} feature in StackSniper. Explain what it does, how to use it, and provide a practical example.`;
    return this.chat(prompt);
  }

  async suggestTool(problem: string): Promise<string> {
    const prompt = `The user has this coding problem: "${problem}". Which StackSniper tool would be most helpful and why? Also provide a quick example of how they might use it.`;
    return this.chat(prompt);
  }

  async getCodingHelp(error: string, code?: string): Promise<string> {
    const prompt = `Help the user debug this issue. Be specific and provide code examples.

Error: ${error}
${code ? `Code: ${code}` : ''}

Provide:
1. What's causing the issue
2. How to fix it
3. A corrected code example
4. Which StackSniper tool would help them solve this fastest`;
    
    return this.chat(prompt);
  }
}
