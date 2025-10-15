import { DeepSeekService } from '../services/deepseek.js';
import { logInfo, logError } from '../utils/logger.js';

const deepseek = new DeepSeekService();

// Cleanup function
function cleanAIResponse(text) {
  return text
    .replace(/\*\*/g, '')           // Remove **bold**
    .replace(/\*/g, '')             // Remove *italic*  
    .replace(/`/g, '')              // Remove `code`
    .replace(/#{1,6}\s?/g, '')      // Remove headers
    .replace(/\n{3,}/g, '\n\n')     // Limit consecutive newlines
    .trim();
}

export async function debugController(req, res) {
    try {
        const { error, code } = req.query;
        
        if (!error) {
            return res.status(400).json({
                success: false,
                error: 'Error parameter is required'
            });
        }

        logInfo(`AI Debug: ${error}`, 'AIController');
        
        const solution = await deepseek.debugError(error, code);
        const cleanSolution = cleanAIResponse(solution);
        
        res.json({
            success: true,
            error: error,
            solution: cleanSolution,
            source: 'DeepSeek AI'
        });
        
    } catch (error) {
        logError(`AI Debug failed: ${error.message}`, 'AIController');
        res.status(500).json({
            success: false,
            error: 'AI service unavailable'
        });
    }
}

export async function reviewController(req, res) {
    try {
        const { code } = req.query;
        
        if (!code) {
            return res.status(400).json({
                success: false,
                error: 'Code parameter is required'
            });
        }

        logInfo('AI Code Review', 'AIController');
        
        const review = await deepseek.reviewCode(code);
        const cleanReview = cleanAIResponse(review);
        
        res.json({
            success: true,
            review: cleanReview,
            source: 'DeepSeek AI'
        });
        
    } catch (error) {
        logError(`AI Review failed: ${error.message}`, 'AIController');
        res.status(500).json({
            success: false,
            error: 'AI service unavailable'
        });
    }
}

export async function rewriteController(req, res) {
    try {
        const { code, instructions } = req.query;
        
        if (!code) {
            return res.status(400).json({
                success: false,
                error: 'Code parameter is required'
            });
        }

        logInfo('AI Code Rewrite', 'AIController');
        
        const rewritten = await deepseek.rewriteCode(code, instructions);
        const cleanRewritten = cleanAIResponse(rewritten);
        
        res.json({
            success: true,
            original: code,
            rewritten: cleanRewritten,
            source: 'DeepSeek AI'
        });
        
    } catch (error) {
        logError(`AI Rewrite failed: ${error.message}`, 'AIController');
        res.status(500).json({
            success: false,
            error: 'AI service unavailable'
        });
    }
}

export async function explainController(req, res) {
    try {
        const { concept } = req.query;
        
        if (!concept) {
            return res.status(400).json({
                success: false,
                error: 'Concept parameter is required'
            });
        }

        logInfo(`AI Explain: ${concept}`, 'AIController');
        
        const explanation = await deepseek.explainConcept(concept);
        const cleanExplanation = cleanAIResponse(explanation);
        
        res.json({
            success: true,
            concept: concept,
            explanation: cleanExplanation,
            source: 'DeepSeek AI'
        });
        
    } catch (error) {
        logError(`AI Explain failed: ${error.message}`, 'AIController');
        res.status(500).json({
            success: false,
            error: 'AI service unavailable'
        });
    }
}
