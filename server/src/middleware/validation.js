import { validationResult, body, param, query } from 'express-validator';

// Validation result handler
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(e => ({ field: e.path, message: e.msg }))
    });
  }
  next();
};

// Post validation rules
export const postValidation = [
  body('content')
    .trim()
    .notEmpty().withMessage('Content is required')
    .isLength({ max: 5000 }).withMessage('Content must be less than 5000 characters'),
  body('platform')
    .trim()
    .notEmpty().withMessage('Platform is required')
    .isIn(['twitter', 'linkedin', 'instagram', 'facebook', 'blog'])
    .withMessage('Invalid platform'),
  body('publishedAt')
    .optional()
    .isISO8601().withMessage('Invalid date format'),
  body('metrics.likes').optional().isInt({ min: 0 }).withMessage('Likes must be a positive number'),
  body('metrics.comments').optional().isInt({ min: 0 }).withMessage('Comments must be a positive number'),
  body('metrics.shares').optional().isInt({ min: 0 }).withMessage('Shares must be a positive number'),
  body('metrics.clicks').optional().isInt({ min: 0 }).withMessage('Clicks must be a positive number'),
  body('metrics.impressions').optional().isInt({ min: 1 }).withMessage('Impressions must be at least 1')
];

// Scheduled content validation rules
export const scheduledContentValidation = [
  body('content')
    .trim()
    .notEmpty().withMessage('Content is required')
    .isLength({ max: 5000 }).withMessage('Content must be less than 5000 characters'),
  body('headline')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Headline must be less than 500 characters'),
  body('platform')
    .trim()
    .notEmpty().withMessage('Platform is required')
    .isIn(['twitter', 'linkedin', 'instagram', 'facebook', 'blog'])
    .withMessage('Invalid platform'),
  body('scheduledAt')
    .notEmpty().withMessage('Scheduled time is required')
    .isISO8601().withMessage('Invalid date format'),
  body('status')
    .optional()
    .isIn(['draft', 'scheduled', 'published', 'failed'])
    .withMessage('Invalid status')
];

// AI headline generation validation
export const headlineValidation = [
  body('content')
    .trim()
    .notEmpty().withMessage('Content is required')
    .isLength({ max: 5000 }).withMessage('Content must be less than 5000 characters'),
  body('platform')
    .optional()
    .isIn(['twitter', 'linkedin', 'instagram', 'facebook', 'blog'])
    .withMessage('Invalid platform'),
  body('tone')
    .optional()
    .isIn(['professional', 'educational', 'urgent', 'playful', 'inspirational', 'neutral'])
    .withMessage('Invalid tone'),
  body('count')
    .optional()
    .isInt({ min: 1, max: 10 }).withMessage('Count must be between 1 and 10')
];

// MongoDB ObjectId validation
export const objectIdValidation = [
  param('id')
    .isMongoId().withMessage('Invalid ID format')
];

// Date range validation for analytics
export const dateRangeValidation = [
  query('startDate')
    .optional()
    .isISO8601().withMessage('Invalid start date format'),
  query('endDate')
    .optional()
    .isISO8601().withMessage('Invalid end date format')
];
