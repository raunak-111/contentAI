import { Router } from 'express';
import * as publishController from '../controllers/publishController.js';

const router = Router();

// GET /api/export/csv - Export to CSV
router.get('/csv', publishController.exportToCSV);

// GET /api/export/json - Export to JSON
router.get('/json', publishController.exportToJSON);

export default router;
