import { ScheduledContent } from '../models/index.js';

// Helper function to convert objects to CSV
function objectsToCSV(data, fields) {
  const header = fields.join(',');
  const rows = data.map(obj => 
    fields.map(field => {
      let value = obj[field] ?? '';
      // Escape quotes and wrap in quotes if contains comma or newline
      if (typeof value === 'string') {
        value = value.replace(/"/g, '""');
        if (value.includes(',') || value.includes('\n') || value.includes('"')) {
          value = `"${value}"`;
        }
      }
      return value;
    }).join(',')
  );
  return [header, ...rows].join('\n');
}

// POST /api/publish/:id
export const publishContent = async (req, res, next) => {
  try {
    const item = await ScheduledContent.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Scheduled content not found'
      });
    }
    
    if (item.status === 'published') {
      return res.status(400).json({
        success: false,
        error: 'Content already published'
      });
    }
    
    // Simulate publishing (mock API)
    const mockPublishResult = await simulatePublish(item);
    
    // Update status
    item.status = mockPublishResult.success ? 'published' : 'failed';
    item.publishedAt = mockPublishResult.success ? new Date() : null;
    item.publishResult = mockPublishResult;
    
    await item.save();
    
    res.json({
      success: true,
      data: item,
      publishResult: mockPublishResult
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/publish/bulk
export const bulkPublish = async (req, res, next) => {
  try {
    const { ids } = req.body;
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'IDs array is required'
      });
    }
    
    const results = [];
    
    for (const id of ids) {
      const item = await ScheduledContent.findById(id);
      
      if (!item || item.status === 'published') {
        results.push({ id, success: false, reason: 'Not found or already published' });
        continue;
      }
      
      const mockPublishResult = await simulatePublish(item);
      
      item.status = mockPublishResult.success ? 'published' : 'failed';
      item.publishedAt = mockPublishResult.success ? new Date() : null;
      item.publishResult = mockPublishResult;
      
      await item.save();
      
      results.push({ id, ...mockPublishResult });
    }
    
    res.json({
      success: true,
      data: results,
      summary: {
        total: ids.length,
        published: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/export/csv
export const exportToCSV = async (req, res, next) => {
  try {
    const { status, platform, startDate, endDate } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (platform) filter.platform = platform.toLowerCase();
    if (startDate || endDate) {
      filter.scheduledAt = {};
      if (startDate) filter.scheduledAt.$gte = new Date(startDate);
      if (endDate) filter.scheduledAt.$lte = new Date(endDate);
    }
    
    const items = await ScheduledContent.find(filter)
      .sort({ scheduledAt: 1 })
      .lean();
    
    if (items.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No content found for export'
      });
    }
    
    // Prepare data for CSV
    const csvData = items.map(item => ({
      id: item._id.toString(),
      content: item.content,
      headline: item.headline || '',
      platform: item.platform,
      scheduledAt: item.scheduledAt.toISOString(),
      status: item.status,
      publishedAt: item.publishedAt ? item.publishedAt.toISOString() : '',
      tags: item.tags ? item.tags.join(', ') : '',
      createdAt: item.createdAt.toISOString()
    }));
    
    const fields = ['id', 'content', 'headline', 'platform', 'scheduledAt', 'status', 'publishedAt', 'tags', 'createdAt'];
    const csv = objectsToCSV(csvData, fields);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=scheduled-content-${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
};

// GET /api/export/json
export const exportToJSON = async (req, res, next) => {
  try {
    const { status, platform, startDate, endDate } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (platform) filter.platform = platform.toLowerCase();
    if (startDate || endDate) {
      filter.scheduledAt = {};
      if (startDate) filter.scheduledAt.$gte = new Date(startDate);
      if (endDate) filter.scheduledAt.$lte = new Date(endDate);
    }
    
    const items = await ScheduledContent.find(filter)
      .sort({ scheduledAt: 1 })
      .lean();
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=scheduled-content-${Date.now()}.json`);
    res.json({
      exportedAt: new Date().toISOString(),
      count: items.length,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/webhook/simulate
export const simulateWebhook = async (req, res, next) => {
  try {
    const { id, event } = req.body;
    
    const item = await ScheduledContent.findById(id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Content not found'
      });
    }
    
    // Simulate webhook payload
    const webhookPayload = {
      event: event || 'content.published',
      timestamp: new Date().toISOString(),
      data: {
        id: item._id,
        content: item.content,
        headline: item.headline,
        platform: item.platform,
        scheduledAt: item.scheduledAt,
        status: item.status,
        publishedAt: item.publishedAt
      }
    };
    
    // In production, this would POST to a configured webhook URL
    console.log('Webhook simulated:', webhookPayload);
    
    res.json({
      success: true,
      message: 'Webhook simulated successfully',
      payload: webhookPayload
    });
  } catch (error) {
    next(error);
  }
};

// Mock publish function
async function simulatePublish(item) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 95% success rate simulation
  const success = Math.random() > 0.05;
  
  return {
    success,
    message: success 
      ? `Successfully published to ${item.platform}`
      : 'Failed to connect to platform API',
    externalId: success ? `ext_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : null,
    platform: item.platform,
    timestamp: new Date().toISOString()
  };
}
