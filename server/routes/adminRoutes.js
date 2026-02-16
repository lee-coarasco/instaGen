import express from 'express';
import {
    getAllUsers,
    getGlobalMetrics,
    updateUser
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin')); // Only admins can access these routes

router.get('/users', getAllUsers);
router.get('/metrics', getGlobalMetrics);
router.put('/users/:id', updateUser);

export default router;
