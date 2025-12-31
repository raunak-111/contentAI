import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController.js';
import { dateRangeValidation, validate } from '../middleware/validation.js';

const router = Router();

// GET /api/analytics/overview - Get KPI overview
router.get('/overview', dateRangeValidation, validate, analyticsController.getOverview);

// GET /api/analytics/heatmap - Get day/hour heatmap
router.get('/heatmap', dateRangeValidation, validate, analyticsController.getHeatmap);

// GET /api/analytics/timeseries - Get time-series data
router.get('/timeseries', dateRangeValidation, validate, analyticsController.getTimeSeries);

// GET /api/analytics/top-posts - Get top performing posts
router.get('/top-posts', dateRangeValidation, validate, analyticsController.getTopPosts);

// GET /api/analytics/best-slots - Get optimal publishing slots
router.get('/best-slots', dateRangeValidation, validate, analyticsController.getBestSlots);

// GET /api/analytics/platforms - Get platform breakdown
router.get('/platforms', dateRangeValidation, validate, analyticsController.getPlatformBreakdown);

export default router;
