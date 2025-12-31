import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
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
  publishedAt: {
    type: Date,
    required: true,
    index: true
  },
  metrics: {
    likes: { type: Number, default: 0, min: 0 },
    comments: { type: Number, default: 0, min: 0 },
    shares: { type: Number, default: 0, min: 0 },
    clicks: { type: Number, default: 0, min: 0 },
    impressions: { type: Number, default: 1, min: 1 }
  },
  // Computed normalized engagement score
  engagementScore: {
    type: Number,
    default: 0,
    index: true
  },
  // Time-decay weighted score (updated periodically)
  weightedScore: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  tone: {
    type: String,
    enum: ['professional', 'educational', 'urgent', 'playful', 'inspirational', 'neutral'],
    default: 'neutral'
  }
}, {
  timestamps: true
});

// Calculate engagement score before saving
postSchema.pre('save', function(next) {
  const { likes, comments, shares, clicks, impressions } = this.metrics;
  
  // Weighted engagement calculation (normalized by impressions)
  const totalEngagement = (likes * 1) + (comments * 2) + (shares * 3) + (clicks * 1.5);
  this.engagementScore = impressions > 0 ? (totalEngagement / impressions) * 100 : 0;
  
  // Time-decay weighting (posts in last 30 days get higher weight)
  const ageInDays = (Date.now() - new Date(this.publishedAt).getTime()) / (1000 * 60 * 60 * 24);
  const decayFactor = Math.exp(-ageInDays / 30); // 30-day half-life
  this.weightedScore = this.engagementScore * decayFactor;
  
  next();
});

// Indexes for analytics queries
postSchema.index({ publishedAt: 1, platform: 1 });
postSchema.index({ 'metrics.impressions': -1 });
postSchema.index({ weightedScore: -1 });

const Post = mongoose.model('Post', postSchema);

export default Post;
