import { Post } from '../models/index.js';

// POST /api/posts/import
export const importPosts = async (req, res, next) => {
  try {
    const { posts } = req.body;
    
    if (!Array.isArray(posts) || posts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Posts array is required'
      });
    }
    
    // Validate and prepare posts
    const preparedPosts = posts.map(post => ({
      content: post.content,
      headline: post.headline,
      platform: post.platform?.toLowerCase(),
      publishedAt: new Date(post.publishedAt),
      metrics: {
        likes: post.metrics?.likes || post.likes || 0,
        comments: post.metrics?.comments || post.comments || 0,
        shares: post.metrics?.shares || post.shares || 0,
        clicks: post.metrics?.clicks || post.clicks || 0,
        impressions: post.metrics?.impressions || post.impressions || 1
      },
      tags: post.tags || [],
      tone: post.tone || 'neutral'
    }));
    
    // Insert posts
    const result = await Post.insertMany(preparedPosts, { ordered: false });
    
    res.json({
      success: true,
      message: `Successfully imported ${result.length} posts`,
      data: {
        imported: result.length,
        total: posts.length
      }
    });
  } catch (error) {
    // Handle partial insert errors
    if (error.name === 'BulkWriteError') {
      return res.status(207).json({
        success: true,
        message: `Partially imported posts`,
        data: {
          imported: error.result?.nInserted || 0,
          errors: error.writeErrors?.length || 0
        }
      });
    }
    next(error);
  }
};

// GET /api/posts
export const getPosts = async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      platform, 
      startDate, 
      endDate,
      sortBy = 'publishedAt',
      sortOrder = 'desc'
    } = req.query;
    
    const filter = {};
    if (platform) filter.platform = platform.toLowerCase();
    if (startDate || endDate) {
      filter.publishedAt = {};
      if (startDate) filter.publishedAt.$gte = new Date(startDate);
      if (endDate) filter.publishedAt.$lte = new Date(endDate);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    
    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Post.countDocuments(filter)
    ]);
    
    res.json({
      success: true,
      data: posts,
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

// GET /api/posts/:id
export const getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).lean();
    
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }
    
    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/posts/:id
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/posts - Clear all posts
export const clearAllPosts = async (req, res, next) => {
  try {
    const result = await Post.deleteMany({});
    
    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} posts`
    });
  } catch (error) {
    next(error);
  }
};
