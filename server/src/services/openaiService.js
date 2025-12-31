import openai from '../config/openai.js';
import { AICache, AIUsage } from '../models/index.js';

class OpenAIService {
  constructor() {
    this.defaultModel = 'gpt-3.5-turbo';
    this.insightModel = 'gpt-3.5-turbo';
  }

  /**
   * Generate headline suggestions for content
   */
  async generateHeadlines(content, options = {}) {
    const { 
      platform = 'general', 
      tone = 'professional', 
      count = 5,
      maxLength = 100 
    } = options;

    const prompt = `You are a social media expert. Generate ${count} compelling headlines/subject lines for the following content.

Content: "${content.substring(0, 1000)}"

Platform: ${platform}
Desired tone: ${tone}
Maximum length: ${maxLength} characters per headline

Requirements:
- Make headlines click-worthy but not clickbait
- Include emotional triggers where appropriate
- Optimize for the specific platform
- Vary the styles (question, statement, how-to, etc.)

Respond in JSON format only:
{
  "headlines": [
    {
      "text": "headline text",
      "score": 85,
      "reasoning": "brief explanation of why this works"
    }
  ]
}`;

    const promptHash = AICache.generateHash(prompt, { platform, tone, count });
    const ttl = parseInt(process.env.AI_CACHE_TTL_HEADLINES) || 3600;

    const result = await AICache.getOrSet(
      promptHash,
      'headlines',
      async () => {
        const completion = await openai.chat.completions.create({
          model: this.defaultModel,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 1000,
          response_format: { type: 'json_object' }
        });

        const response = JSON.parse(completion.choices[0].message.content);
        return {
          response,
          usage: completion.usage,
          model: this.defaultModel
        };
      },
      ttl
    );

    // Track usage
    await AIUsage.trackUsage('headlines', this.defaultModel, result.usage || {}, result.cached);

    return {
      headlines: result.data.headlines || [],
      cached: result.cached
    };
  }

  /**
   * Rewrite content with specified tone/style
   */
  async rewriteContent(content, options = {}) {
    const { 
      targetTone = 'professional',
      referenceStyle = '',
      platform = 'general'
    } = options;

    const prompt = `You are an expert content writer. Rewrite the following content.

Original content: "${content.substring(0, 2000)}"

Target tone: ${targetTone}
Platform: ${platform}
${referenceStyle ? `Reference style: "${referenceStyle.substring(0, 500)}"` : ''}

Requirements:
- Maintain the core message
- Improve clarity and engagement
- Optimize for the specified platform
- Apply the target tone consistently

Respond in JSON format only:
{
  "rewritten": "the rewritten content",
  "changes": ["list of key changes made"],
  "toneAnalysis": {
    "original": "detected original tone",
    "applied": "applied tone"
  }
}`;

    const promptHash = AICache.generateHash(prompt, { targetTone, platform });
    const ttl = parseInt(process.env.AI_CACHE_TTL_HEADLINES) || 3600;

    const result = await AICache.getOrSet(
      promptHash,
      'rewrite',
      async () => {
        const completion = await openai.chat.completions.create({
          model: this.defaultModel,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.6,
          max_tokens: 2000,
          response_format: { type: 'json_object' }
        });

        const response = JSON.parse(completion.choices[0].message.content);
        return {
          response,
          usage: completion.usage,
          model: this.defaultModel
        };
      },
      ttl
    );

    await AIUsage.trackUsage('rewrite', this.defaultModel, result.usage || {}, result.cached);

    return {
      ...result.data,
      cached: result.cached
    };
  }

  /**
   * Explain why certain time slots perform better
   */
  async explainTimingPerformance(analyticsData) {
    const prompt = `You are a social media analytics expert. Explain why these time slots perform better based on the engagement data.

Top performing time slots:
${JSON.stringify(analyticsData.bestSlots, null, 2)}

Heatmap summary (engagement by day/hour):
${JSON.stringify(analyticsData.heatmapSummary, null, 2)}

Platform: ${analyticsData.platform || 'multiple platforms'}
Date range: ${analyticsData.dateRange || 'last 3 months'}

Provide:
1. A clear explanation of the patterns you see
2. Why these specific times likely perform better
3. Actionable recommendations

Respond in JSON format only:
{
  "summary": "2-3 sentence high-level summary",
  "patterns": ["list of observed patterns"],
  "explanations": [
    {
      "slot": "e.g., Tuesday 10 AM",
      "reason": "why this slot works"
    }
  ],
  "recommendations": ["actionable recommendations"],
  "confidenceLevel": "high/medium/low"
}`;

    const promptHash = AICache.generateHash(prompt, analyticsData);
    const ttl = parseInt(process.env.AI_CACHE_TTL_INSIGHTS) || 86400;

    const result = await AICache.getOrSet(
      promptHash,
      'timing_insight',
      async () => {
        const completion = await openai.chat.completions.create({
          model: this.insightModel,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 1500,
          response_format: { type: 'json_object' }
        });

        const response = JSON.parse(completion.choices[0].message.content);
        return {
          response,
          usage: completion.usage,
          model: this.insightModel
        };
      },
      ttl
    );

    await AIUsage.trackUsage('timing_insight', this.insightModel, result.usage || {}, result.cached);

    return {
      ...result.data,
      cached: result.cached
    };
  }

  /**
   * Classify content tone
   */
  async classifyTone(content) {
    const prompt = `Analyze the tone of the following content.

Content: "${content.substring(0, 1000)}"

Classify into one of: professional, educational, urgent, playful, inspirational, neutral

Respond in JSON format only:
{
  "primaryTone": "the main tone",
  "secondaryTone": "secondary tone if applicable or null",
  "confidence": 85,
  "toneBreakdown": {
    "professional": 30,
    "educational": 10,
    "urgent": 5,
    "playful": 40,
    "inspirational": 10,
    "neutral": 5
  },
  "reasoning": "brief explanation"
}`;

    const promptHash = AICache.generateHash(prompt);
    const ttl = parseInt(process.env.AI_CACHE_TTL_INSIGHTS) || 86400;

    const result = await AICache.getOrSet(
      promptHash,
      'tone_classification',
      async () => {
        const completion = await openai.chat.completions.create({
          model: this.defaultModel,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
          max_tokens: 500,
          response_format: { type: 'json_object' }
        });

        const response = JSON.parse(completion.choices[0].message.content);
        return {
          response,
          usage: completion.usage,
          model: this.defaultModel
        };
      },
      ttl
    );

    await AIUsage.trackUsage('tone_classification', this.defaultModel, result.usage || {}, result.cached);

    return {
      ...result.data,
      cached: result.cached
    };
  }

  /**
   * Get AI usage statistics
   */
  async getUsageStats(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const stats = await AIUsage.aggregate([
      { $match: { date: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalRequests: { $sum: '$requestCount' },
          totalCacheHits: { $sum: '$cacheHits' },
          totalTokens: { $sum: '$totalTokens' },
          totalCost: { $sum: '$estimatedCost' }
        }
      }
    ]);

    const dailyStats = await AIUsage.aggregate([
      { $match: { date: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          requests: { $sum: '$requestCount' },
          tokens: { $sum: '$totalTokens' },
          cost: { $sum: '$estimatedCost' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const summary = stats[0] || {
      totalRequests: 0,
      totalCacheHits: 0,
      totalTokens: 0,
      totalCost: 0
    };

    return {
      summary: {
        ...summary,
        cacheHitRate: summary.totalRequests > 0 
          ? Math.round((summary.totalCacheHits / summary.totalRequests) * 100) 
          : 0,
        totalCostUSD: (summary.totalCost / 100).toFixed(4)
      },
      daily: dailyStats.map(d => ({
        date: d._id,
        requests: d.requests,
        tokens: d.tokens,
        costUSD: (d.cost / 100).toFixed(4)
      }))
    };
  }
}

export default new OpenAIService();

