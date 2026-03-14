import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementController.js';

const router = express.Router();

router.get('/',        protect, getAnnouncements);
router.post('/',       protect, adminOnly, createAnnouncement);
router.put('/:id',     protect, adminOnly, updateAnnouncement);
router.delete('/:id',  protect, adminOnly, deleteAnnouncement);

export default router;