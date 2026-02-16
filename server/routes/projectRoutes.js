import express from 'express';
import {
    getProjects,
    getProject,
    saveProject,
    deleteProject,
    getUserStats
} from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All project routes are protected

router.route('/')
    .get(getProjects)
    .post(saveProject);

router.get('/stats', getUserStats);

router.route('/:id')
    .get(getProject)
    .delete(deleteProject);

export default router;
