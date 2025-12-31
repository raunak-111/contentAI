import { Router } from 'express';
import * as publishController from '../controllers/publishController.js';
import { objectIdValidation, validate } from '../middleware/validation.js';

const router = Router();

// POST /api/publish/:id - Publish single content
router.post('/:id', objectIdValidation, validate, publishController.publishContent);

// POST /api/publish/bulk - Bulk publish
router.post('/bulk', publishController.bulkPublish);

export default router;
