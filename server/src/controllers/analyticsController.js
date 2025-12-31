import { analyticsService } from '../services/index.js';

// GET /api/analytics/overview
export const getOverview = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const overview = await analyticsService.getOverview(startDate, endDate);
    
    res.json({
      success: true,
      data: overview
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/heatmap
export const getHeatmap = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const heatmap = await analyticsService.getHeatmap(startDate, endDate);
    
    res.json({
      success: true,
      data: heatmap
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/timeseries
export const getTimeSeries = async (req, res, next) => {
  try {
    const { startDate, endDate, granularity = 'day' } = req.query;
    const timeSeries = await analyticsService.getTimeSeries(startDate, endDate, granularity);
    
    res.json({
      success: true,
      data: timeSeries
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/top-posts
export const getTopPosts = async (req, res, next) => {
  try {
    const { limit = 10, startDate, endDate } = req.query;
    const topPosts = await analyticsService.getTopPosts(parseInt(limit), startDate, endDate);
    
    res.json({
      success: true,
      data: topPosts
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/best-slots
export const getBestSlots = async (req, res, next) => {
  try {
    const { limit = 5, startDate, endDate } = req.query;
    const bestSlots = await analyticsService.getBestSlots(parseInt(limit), startDate, endDate);
    
    res.json({
      success: true,
      data: bestSlots
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/analytics/platforms
export const getPlatformBreakdown = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const platforms = await analyticsService.getPlatformBreakdown(startDate, endDate);
    
    res.json({
      success: true,
      data: platforms
    });
  } catch (error) {
    next(error);
  }
};
