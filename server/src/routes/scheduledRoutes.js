import { Router } from 'express';
import * as scheduledController from '../controllers/scheduledController.js';
import { scheduledContentValidation, objectIdValidation, validate } from '../middleware/validation.js';

const router = Router();

// GET /api/scheduled - Get all scheduled content
router.get('/', scheduledController.getScheduledContent);

// GET /api/scheduled/calendar - Get events for calendar
router.get('/calendar', scheduledController.getCalendarEvents);

// GET /api/scheduled/:id - Get single scheduled item
router.get('/:id', objectIdValidation, validate, scheduledController.getScheduledItem);

// POST /api/scheduled - Create scheduled content
router.post('/', scheduledContentValidation, validate, scheduledController.createScheduledContent);

// PUT /api/scheduled/:id - Update scheduled content
router.put('/:id', objectIdValidation, validate, scheduledController.updateScheduledContent);

// POST /api/scheduled/:id/undo-reschedule - Undo last reschedule
router.post('/:id/undo-reschedule', objectIdValidation, validate, scheduledController.undoReschedule);

// POST /api/scheduled/:id/apply-suggestion - Apply AI suggestion
router.post('/:id/apply-suggestion', objectIdValidation, validate, scheduledController.applySuggestion);

// DELETE /api/scheduled/:id - Delete scheduled content
router.delete('/:id', objectIdValidation, validate, scheduledController.deleteScheduledContent);

export default router;
