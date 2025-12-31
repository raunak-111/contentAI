import { Router } from 'express';
import * as aiController from '../controllers/aiController.js';
import { headlineValidation, validate } from '../middleware/validation.js';
import { aiLimiter } from '../middleware/rateLimiter.js';
import { body } from 'express-validator';

const router = Router();

// Apply AI rate limiter to all routes
router.use(aiLimiter);

// POST /api/ai/headlines - Generate headline suggestions
router.post('/headlines', headlineValidation, validate, aiController.generateHeadlines);

// POST /api/ai/rewrite - Rewrite content
router.post('/rewrite', [
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('targetTone').optional().isIn(['professional', 'educational', 'urgent', 'playful', 'inspirational', 'neutral']),
  body('platform').optional().isIn(['twitter', 'linkedin', 'instagram', 'facebook', 'blog'])
], validate, aiController.rewriteContent);

// POST /api/ai/explain-timing - Explain why times perform better
router.post('/explain-timing', aiController.explainTiming);

// POST /api/ai/classify-tone - Classify content tone
router.post('/classify-tone', [
  body('content').trim().notEmpty().withMessage('Content is required')
], validate, aiController.classifyTone);

// GET /api/ai/usage - Get AI usage statistics
router.get('/usage', aiController.getUsageStats);

export default router;
