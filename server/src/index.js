import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import connectDB from './config/database.js';
import { errorHandler, notFound, apiLimiter } from './middleware/index.js';
import {
  analyticsRoutes,
  aiRoutes,
  postsRoutes,
  scheduledRoutes,
  publishRoutes,
  exportRoutes
} from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api', apiLimiter);

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Content Scheduler API is running!',
    version: '1.0.0'
  });
});


// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/scheduled', scheduledRoutes);
app.use('/api/publish', publishRoutes);
app.use('/api/export', exportRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════════════════╗
║   Content Scheduler API Server                        ║
╠═══════════════════════════════════════════════════════╣
║   🚀 Server running on port ${PORT}                   ║
║   📊 Environment: ${process.env.NODE_ENV?.padEnd(20)} ║
║   🔗 Health: http://localhost:${PORT}/health          ║
╚═══════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
