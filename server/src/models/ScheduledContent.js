import mongoose from 'mongoose';

const scheduledContentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 5000
  },
  headline: {
    type: String,
    trim: true,
    maxlength: 500
  },
  platform: {
    type: String,
    required: true,
    enum: ['twitter', 'linkedin', 'instagram', 'facebook', 'blog'],
    lowercase: true
  },
  scheduledAt: {
    type: Date,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'published', 'failed'],
    default: 'draft',
    index: true
  },
  aiSuggestions: [{
    headline: { type: String, maxlength: 500 },
    score: { type: Number, min: 0, max: 100 },
    reasoning: { type: String, maxlength: 1000 },
    applied: { type: Boolean, default: false },
    generatedAt: { type: Date, default: Date.now }
  }],
  aiTimingInsight: {
    explanation: { type: String, maxlength: 2000 },
    confidenceScore: { type: Number, min: 0, max: 100 },
    generatedAt: { type: Date }
  },
  publishedAt: {
    type: Date
  },
  publishResult: {
    success: Boolean,
    message: String,
    externalId: String
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  // Track original position for undo functionality
  previousScheduledAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
scheduledContentSchema.index({ scheduledAt: 1, status: 1 });
scheduledContentSchema.index({ platform: 1, status: 1 });

const ScheduledContent = mongoose.model('ScheduledContent', scheduledContentSchema);

export default ScheduledContent;
