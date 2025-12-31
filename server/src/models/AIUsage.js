import mongoose from 'mongoose';

const aiUsageSchema = new mongoose.Schema({
  // Date for daily aggregation
  date: {
    type: Date,
    required: true,
    index: true
  },
  // Operation type
  operationType: {
    type: String,
    enum: ['headlines', 'rewrite', 'timing_insight', 'tone_classification'],
    required: true
  },
  // Model used
  model: {
    type: String,
    required: true
  },
  // Token counts
  promptTokens: { type: Number, default: 0 },
  completionTokens: { type: Number, default: 0 },
  totalTokens: { type: Number, default: 0 },
  // Request count
  requestCount: { type: Number, default: 0 },
  // Cache hit count
  cacheHits: { type: Number, default: 0 },
  // Estimated cost (in USD cents)
  estimatedCost: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Compound index for daily aggregation
aiUsageSchema.index({ date: 1, operationType: 1, model: 1 }, { unique: true });

// Static method to track usage
aiUsageSchema.statics.trackUsage = async function(operationType, model, usage, cached = false) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Estimate cost (GPT-3.5-turbo pricing as of 2024)
  let costPer1kInput = 0.0005; // $0.0005 per 1K input tokens
  let costPer1kOutput = 0.0015; // $0.0015 per 1K output tokens
  
  if (model.includes('gpt-4')) {
    costPer1kInput = 0.03;
    costPer1kOutput = 0.06;
  }
  
  const estimatedCost = cached ? 0 : (
    (usage.promptTokens / 1000 * costPer1kInput) +
    (usage.completionTokens / 1000 * costPer1kOutput)
  ) * 100; // Convert to cents
  
  await this.findOneAndUpdate(
    { date: today, operationType, model },
    {
      $inc: {
        promptTokens: cached ? 0 : usage.promptTokens,
        completionTokens: cached ? 0 : usage.completionTokens,
        totalTokens: cached ? 0 : usage.totalTokens,
        requestCount: 1,
        cacheHits: cached ? 1 : 0,
        estimatedCost
      }
    },
    { upsert: true }
  );
};

const AIUsage = mongoose.model('AIUsage', aiUsageSchema);

export default AIUsage;
