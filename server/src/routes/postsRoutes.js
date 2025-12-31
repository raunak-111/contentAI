import { Router } from 'express';
import * as postsController from '../controllers/postsController.js';
import { objectIdValidation, validate } from '../middleware/validation.js';

const router = Router();

// POST /api/posts/import - Import historical posts
router.post('/import', postsController.importPosts);

// GET /api/posts - Get all posts with pagination
router.get('/', postsController.getPosts);

// GET /api/posts/:id - Get single post
router.get('/:id', objectIdValidation, validate, postsController.getPost);

// DELETE /api/posts/:id - Delete single post
router.delete('/:id', objectIdValidation, validate, postsController.deletePost);

// DELETE /api/posts - Clear all posts
router.delete('/', postsController.clearAllPosts);

export default router;
