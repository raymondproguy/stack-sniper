import { Request, Response } from "express";
import { DeepSeekService } from '../services/deepseek.js';
import { logInfo, logError } from '../utils/logger.js';

const deepseek = new DeepSeekService();

function cleanAIResponse(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold**
    .replace(/\*(.*?)\*/g, '$1')     // Remove *italic*  
    .replace(/`(.*?)`/g, '$1')       // Remove `code`
    .replace(/```[\s\S]*?```/g, '')  // Remove code blocks
    .replace(/#+\s*/g, '')           // Remove headers
    .replace(/\n\s*\n/g, '\n\n')     // Clean up line breaks
    .trim();
}

export async function debugController(req: Request, res: Response) {
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
    
    res.json({
      success: true,
      error: error,
      solution: solution,
      source: 'DeepSeek AI'
    });
    
  } catch (error:any) {
    logError(`AI Debug failed: ${error.message}`, 'AIController');
    res.status(500).json({
      success: false,
      error: 'AI service unavailable'
    });
  }
}

export async function reviewController(req: Request, res:Response) {
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
    
    res.json({
      success: true,
      review: review,
      source: 'DeepSeek AI'
    });
    
  } catch (error:any) {
    logError(`AI Review failed: ${error.message}`, 'AIController');
    res.status(500).json({
      success: false,
      error: 'AI service unavailable'
    });
  }
}

export async function rewriteController(req: Request, res:Response) {
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
    
    res.json({
      success: true,
      original: code,
      rewritten: rewritten,
      source: 'DeepSeek AI'
    });
    
  } catch (error:any) {
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
        
        // Validate input
        if (!concept) {
            return res.status(400).json({
                success: false,
                error: 'Concept parameter is required'
            });
        }

        if (concept.length < 2) {
            return res.status(400).json({
                success: false,
                error: 'Concept must be at least 2 characters long'
            });
        }

        logInfo(`AI Explain: ${concept}`, 'AIController');
        
        const explanation = await deepseek.explainConcept(concept);
        
        res.json({
            success: true,
            concept: concept,
            explanation: explanation,
            source: 'DeepSeek AI'
        });
        
    } catch (error:any) {
        logError(`AI Explain failed: ${error.message}`, 'AIController');
        res.status(500).json({
            success: false,
            error: 'AI service unavailable'
        });
    }
}
