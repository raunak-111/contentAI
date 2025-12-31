import { ScheduledContent } from '../models/index.js';

// GET /api/scheduled
export const getScheduledContent = async (req, res, next) => {
  try {
    const { 
      status, 
      platform, 
      startDate, 
      endDate,
      page = 1,
      limit = 50
    } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (platform) filter.platform = platform.toLowerCase();
    if (startDate || endDate) {
      filter.scheduledAt = {};
      if (startDate) filter.scheduledAt.$gte = new Date(startDate);
      if (endDate) filter.scheduledAt.$lte = new Date(endDate);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [items, total] = await Promise.all([
      ScheduledContent.find(filter)
        .sort({ scheduledAt: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      ScheduledContent.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      data: items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/scheduled/calendar
export const getCalendarEvents = async (req, res, next) => {
  try {
    const { start, end } = req.query;
    
    const filter = {
      scheduledAt: {
        $gte: new Date(start),
        $lte: new Date(end)
      }
    };
    
    const items = await ScheduledContent.find(filter)
      .sort({ scheduledAt: 1 })
      .select('content headline platform scheduledAt status')
      .lean();
    
    // Transform to FullCalendar event format
    const events = items.map(item => ({
      id: item._id.toString(),
      title: item.headline || item.content.substring(0, 50) + '...',
      start: item.scheduledAt,
      extendedProps: {
        content: item.content,
        platform: item.platform,
        status: item.status
      },
      backgroundColor: getStatusColor(item.status),
      borderColor: getStatusColor(item.status)
    }));
    
    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/scheduled/:id
export const getScheduledItem = async (req, res, next) => {
  try {
    const item = await ScheduledContent.findById(req.params.id).lean();
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Scheduled content not found'
      });
    }
    
    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/scheduled
export const createScheduledContent = async (req, res, next) => {
  try {
    const { content, headline, platform, scheduledAt, status = 'draft', tags } = req.body;
    
    const item = await ScheduledContent.create({
      content,
      headline,
      platform: platform.toLowerCase(),
      scheduledAt: new Date(scheduledAt),
      status,
      tags
    });
    
    res.status(201).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/scheduled/:id
export const updateScheduledContent = async (req, res, next) => {
  try {
    const { content, headline, platform, scheduledAt, status, tags, aiSuggestions } = req.body;
    
    const item = await ScheduledContent.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Scheduled content not found'
      });
    }
    
    // Store previous scheduled time for undo
    if (scheduledAt && new Date(scheduledAt).getTime() !== item.scheduledAt.getTime()) {
      item.previousScheduledAt = item.scheduledAt;
    }
    
    if (content !== undefined) item.content = content;
    if (headline !== undefined) item.headline = headline;
    if (platform !== undefined) item.platform = platform.toLowerCase();
    if (scheduledAt !== undefined) item.scheduledAt = new Date(scheduledAt);
    if (status !== undefined) item.status = status;
    if (tags !== undefined) item.tags = tags;
    if (aiSuggestions !== undefined) item.aiSuggestions = aiSuggestions;
    
    await item.save();
    
    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/scheduled/:id/undo-reschedule
export const undoReschedule = async (req, res, next) => {
  try {
    const item = await ScheduledContent.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Scheduled content not found'
      });
    }
    
    if (!item.previousScheduledAt) {
      return res.status(400).json({
        success: false,
        error: 'No previous schedule to restore'
      });
    }
    
    // Swap current and previous
    const currentSchedule = item.scheduledAt;
    item.scheduledAt = item.previousScheduledAt;
    item.previousScheduledAt = currentSchedule;
    
    await item.save();
    
    res.json({
      success: true,
      data: item,
      message: 'Schedule restored to previous time'
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/scheduled/:id
export const deleteScheduledContent = async (req, res, next) => {
  try {
    const item = await ScheduledContent.findByIdAndDelete(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Scheduled content not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Scheduled content deleted'
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/scheduled/:id/apply-suggestion
export const applySuggestion = async (req, res, next) => {
  try {
    const { suggestionIndex } = req.body;
    
    const item = await ScheduledContent.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Scheduled content not found'
      });
    }
    
    if (!item.aiSuggestions || !item.aiSuggestions[suggestionIndex]) {
      return res.status(400).json({
        success: false,
        error: 'Invalid suggestion index'
      });
    }
    
    // Apply the suggested headline
    item.headline = item.aiSuggestions[suggestionIndex].headline;
    item.aiSuggestions[suggestionIndex].applied = true;
    
    await item.save();
    
    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// Helper function
function getStatusColor(status) {
  const colors = {
    draft: '#6B7280',      // gray
    scheduled: '#3B82F6',  // blue
    published: '#10B981',  // green
    failed: '#EF4444'      // red
  };
  return colors[status] || colors.draft;
}
