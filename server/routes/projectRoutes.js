import express from 'express';
import {
    getProjects,
    getProject,
    saveProject,
    deleteProject,
    getUserStats,
    getGallery,
    proxyImage
} from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All project routes are protected

router.route('/')
    .get(getProjects)
    .post(saveProject);

router.get('/gallery', getGallery);
router.get('/stats', getUserStats);
router.get('/proxy-image', proxyImage);

router.route('/:id')
    .get(getProject)
    .delete(deleteProject);

export default router;
