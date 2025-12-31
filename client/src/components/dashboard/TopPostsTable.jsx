import { ThumbsUp, MessageCircle, Share2, MousePointer, Eye } from 'lucide-react';

const platformColors = {
  twitter: '#1DA1F2',
  linkedin: '#0A66C2', 
  instagram: '#E4405F',
  facebook: '#1877F2',
  blog: '#FF6B6B'
};

export default function TopPostsTable({ posts, loading = false }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array(5).fill(null).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="skeleton h-16 w-16 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div 
        className="flex items-center justify-center py-12"
        style={{ color: 'var(--text-muted)' }}
      >
        No posts found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            <th 
              className="text-left py-3 px-2 text-sm font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Content
            </th>
            <th 
              className="text-left py-3 px-2 text-sm font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Platform
            </th>
            <th 
              className="text-left py-3 px-2 text-sm font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Engagement
            </th>
            <th 
              className="text-left py-3 px-2 text-sm font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Metrics
            </th>
            <th 
              className="text-left py-3 px-2 text-sm font-medium"
              style={{ color: 'var(--text-secondary)' }}
            >
              Published
            </th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post, index) => (
            <tr 
              key={post._id || index}
              className="group hover:bg-[var(--surface)] transition-colors"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              {/* Content */}
              <td className="py-3 px-2">
                <div className="max-w-xs">
                  {post.headline && (
                    <p 
                      className="font-medium text-sm mb-1 line-clamp-1"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {post.headline}
                    </p>
                  )}
                  <p 
                    className="text-sm line-clamp-2"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {post.content}
                  </p>
                </div>
              </td>

              {/* Platform */}
              <td className="py-3 px-2">
                <span 
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize"
                  style={{ 
                    background: `${platformColors[post.platform]}15`,
                    color: platformColors[post.platform]
                  }}
                >
                  {post.platform}
                </span>
              </td>

              {/* Engagement Score */}
              <td className="py-3 px-2">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-12 h-2 rounded-full overflow-hidden"
                    style={{ background: 'var(--surface)' }}
                  >
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: `${Math.min(post.engagementScore * 10, 100)}%`,
                        background: 'linear-gradient(90deg, var(--primary), var(--secondary))'
                      }}
                    />
                  </div>
                  <span 
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {post.engagementScore?.toFixed(1)}
                  </span>
                </div>
              </td>

              {/* Metrics */}
              <td className="py-3 px-2">
                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span className="flex items-center gap-1" title="Likes">
                    <ThumbsUp className="w-3 h-3" />
                    {post.metrics?.likes?.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1" title="Comments">
                    <MessageCircle className="w-3 h-3" />
                    {post.metrics?.comments?.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1" title="Shares">
                    <Share2 className="w-3 h-3" />
                    {post.metrics?.shares?.toLocaleString()}
                  </span>
                </div>
              </td>

              {/* Date */}
              <td className="py-3 px-2">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
