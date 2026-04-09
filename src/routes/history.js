import express from 'express';
import { protect } from '../middleware/auth.js';
import { getHistory, getMigrationBySlug, deleteMigration } from '../controllers/historyController.js';

const router = express.Router();

router.get('/', protect, getHistory);
router.delete('/:slug', protect, deleteMigration);
router.get('/:slug', getMigrationBySlug);

export default router;
