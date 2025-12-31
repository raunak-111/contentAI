import { openaiService, analyticsService } from '../services/index.js';

// POST /api/ai/headlines
export const generateHeadlines = async (req, res, next) => {
  try {
    const { content, platform, tone, count, maxLength } = req.body;
    
    const result = await openaiService.generateHeadlines(content, {
      platform,
      tone,
      count: count || 5,
      maxLength: maxLength || 100
    });
    
    res.json({
      success: true,
      data: result.headlines,
      cached: result.cached
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/ai/rewrite
export const rewriteContent = async (req, res, next) => {
  try {
    const { content, targetTone, referenceStyle, platform } = req.body;
    
    const result = await openaiService.rewriteContent(content, {
      targetTone,
      referenceStyle,
      platform
    });
    
    res.json({
      success: true,
      data: result,
      cached: result.cached
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/ai/explain-timing
export const explainTiming = async (req, res, next) => {
  try {
    const { startDate, endDate, platform } = req.body;
    
    // Get analytics data to explain
    const [bestSlots, heatmapData] = await Promise.all([
      analyticsService.getBestSlots(5, startDate, endDate),
      analyticsService.getHeatmap(startDate, endDate)
    ]);
    
    // Summarize heatmap for the prompt
    const heatmapSummary = heatmapData.data
      .sort((a, b) => b.avgEngagement - a.avgEngagement)
      .slice(0, 10)
      .map(h => `${h.day} ${h.hourFormatted}: ${h.avgEngagement}`);
    
    const result = await openaiService.explainTimingPerformance({
      bestSlots,
      heatmapSummary,
      platform,
      dateRange: startDate && endDate 
        ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
        : 'all time'
    });
    
    res.json({
      success: true,
      data: result,
      cached: result.cached
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/ai/classify-tone
export const classifyTone = async (req, res, next) => {
  try {
    const { content } = req.body;
    
    const result = await openaiService.classifyTone(content);
    
    res.json({
      success: true,
      data: result,
      cached: result.cached
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/ai/usage
export const getUsageStats = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    
    const stats = await openaiService.getUsageStats(parseInt(days));
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};
