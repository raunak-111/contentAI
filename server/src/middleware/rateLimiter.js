import rateLimit from 'express-rate-limit';

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// AI-specific rate limiter (stricter)
export const aiLimiter = rateLimit({
  windowMs: parseInt(process.env.AI_RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute default
  max: parseInt(process.env.AI_RATE_LIMIT_MAX_REQUESTS) || 10, // 10 requests per minute
  message: {
    success: false,
    error: 'Too many AI requests. Please wait a moment before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
