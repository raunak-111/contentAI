import mongoose from 'mongoose';
import crypto from 'crypto';

const aiCacheSchema = new mongoose.Schema({
  // Hash of the prompt for quick lookup
  promptHash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  // Type of AI operation for cache management
  operationType: {
    type: String,
    enum: ['headlines', 'rewrite', 'timing_insight', 'tone_classification'],
    required: true,
    index: true
  },
  // Original prompt (for debugging, not for lookup)
  promptSummary: {
    type: String,
    maxlength: 500
  },
  // Cached response
  response: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  // Token usage tracking
  usage: {
    promptTokens: { type: Number, default: 0 },
    completionTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 }
  },
  // Model used
  model: {
    type: String,
    default: 'gpt-3.5-turbo'
  },
  // Expiration
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // TTL index
  },
  // Hit count for analytics
  hitCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Static method to generate hash from prompt
aiCacheSchema.statics.generateHash = function(prompt, context = '') {
  const combined = `${prompt}::${JSON.stringify(context)}`;
  return crypto.createHash('sha256').update(combined).digest('hex');
};

// Static method to get or set cache
aiCacheSchema.statics.getOrSet = async function(promptHash, operationType, generator, ttlSeconds = 3600) {
  let cached = await this.findOne({ promptHash });
  
  if (cached && cached.expiresAt > new Date()) {
    // Update hit count
    await this.updateOne({ _id: cached._id }, { $inc: { hitCount: 1 } });
    return { data: cached.response, cached: true, usage: cached.usage };
  }
  
  // Generate new response
  const { response, usage, model } = await generator();
  
  // Cache the result
  await this.findOneAndUpdate(
    { promptHash },
    {
      promptHash,
      operationType,
      response,
      usage,
      model,
      expiresAt: new Date(Date.now() + ttlSeconds * 1000),
      hitCount: 0
    },
    { upsert: true, new: true }
  );
  
  return { data: response, cached: false, usage };
};

const AICache = mongoose.model('AICache', aiCacheSchema);

export default AICache;
