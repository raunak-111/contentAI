import 'dotenv/config';
import mongoose from 'mongoose';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { Post } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing posts
    await Post.deleteMany({});
    console.log('🗑️  Cleared existing posts');

    // Load sample posts from JSON
    const samplePostsPath = join(__dirname, 'samplePosts.json');
    const samplePosts = JSON.parse(readFileSync(samplePostsPath, 'utf-8'));

    // Insert sample posts
    const posts = samplePosts.map(post => ({
      ...post,
      publishedAt: new Date(post.publishedAt)
    }));

    const result = await Post.insertMany(posts);
    console.log(`📊 Inserted ${result.length} sample posts`);

    // Display some stats
    const stats = await Post.aggregate([
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          avgEngagement: { $avg: '$engagementScore' },
          platforms: { $addToSet: '$platform' }
        }
      }
    ]);

    if (stats.length > 0) {
      console.log('\n📈 Database Stats:');
      console.log(`   Total Posts: ${stats[0].totalPosts}`);
      console.log(`   Avg Engagement Score: ${stats[0].avgEngagement.toFixed(2)}`);
      console.log(`   Platforms: ${stats[0].platforms.join(', ')}`);
    }

    console.log('\n✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
