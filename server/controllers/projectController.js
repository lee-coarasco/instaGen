import Project from '../models/Project.js';
import mongoose from 'mongoose';
import { storageService } from '../utils/storageService.js';

/**
 * Helper to process and upload any base64 images to Cloud Storage
 */
const processProjectImages = async (projectData) => {
    if (!projectData.stages?.finalImages) return projectData;

    try {
        const folder = `projects/${projectData.id || new mongoose.Types.ObjectId()}`;

        // 1. Process Main Images
        for (const img of projectData.stages.finalImages) {
            // Only upload if it's a base64 string (starts with data: or is very long)
            if (img.url && (img.url.startsWith('data:') || img.url.length > 500)) {
                console.log(`☁️ Uploading slide ${img.slideIndex} to cloud storage...`);
                img.url = await storageService.uploadBase64Image(img.url, folder);
            }

            // 2. Process Generation History
            if (img.generationHistory) {
                for (const hist of img.generationHistory) {
                    if (hist.url && (hist.url.startsWith('data:') || hist.url.length > 500)) {
                        hist.url = await storageService.uploadBase64Image(hist.url, `${folder}/history`);
                    }
                }
            }
        }
        return projectData;
    } catch (error) {
        console.error('❌ Cloud Storage Failure:', error.message);
        // Strict policy: Do not fall back to database storage for images
        throw new Error(`Critical: Cloud storage upload failed (${error.message}). Please check Firebase bucket configuration.`);
    }
};

// @desc    Get all projects for a user
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const projects = await Project.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    title: 1,
                    niche: 1,
                    postType: 1,
                    updatedAt: 1,
                    createdAt: 1,
                    status: 1,
                    usage: 1,
                    brandName: 1,
                    firstImage: { $arrayElemAt: ['$stages.finalImages', 0] },
                    slides: '$stages.content.slides'
                }
            },
            {
                $project: {
                    title: 1,
                    niche: 1,
                    postType: 1,
                    updatedAt: 1,
                    createdAt: 1,
                    status: 1,
                    usage: 1,
                    brandName: 1,
                    'stages.finalImages': {
                        $cond: {
                            if: { $ne: ['$firstImage', null] },
                            then: [{
                                url: '$firstImage.url',
                                prompt: '$firstImage.prompt',
                                slideIndex: '$firstImage.slideIndex',
                                status: '$firstImage.status',
                                displayCaption: {
                                    $let: {
                                        vars: {
                                            slide: {
                                                $arrayElemAt: [
                                                    {
                                                        $filter: {
                                                            input: { $ifNull: ['$slides', []] },
                                                            as: 's',
                                                            cond: { $eq: [{ $toInt: '$$s.slide_number' }, { $add: [{ $toInt: '$firstImage.slideIndex' }, 1] }] }
                                                        }
                                                    },
                                                    0
                                                ]
                                            }
                                        },
                                        in: {
                                            $ifNull: [
                                                '$firstImage.displayCaption',
                                                '$$slide.heading',
                                                '$$slide.subtext',
                                                '$$slide.text',
                                                '$firstImage.prompt'
                                            ]
                                        }
                                    }
                                }
                            }],
                            else: []
                        }
                    }
                }
            }
        ]);

        const total = await Project.countDocuments({ userId: req.user.id });

        res.status(200).json({
            success: true,
            count: projects.length,
            total,
            pagination: {
                page,
                limit,
                pages: Math.ceil(total / limit)
            },
            data: projects
        });
    } catch (err) {
        console.error('Get projects error:', err);
        res.status(400).json({ success: false, message: err.message });
    }
};

/**
 * @desc    Get all images across all projects for Gallery (with pagination)
 * @route   GET /api/projects/gallery
 * @access  Private
 */
export const getGallery = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 24;
        const skip = (page - 1) * limit;

        const gallery = await Project.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
            { $sort: { createdAt: -1 } }, // Index-backed sort first
            { $unwind: '$stages.finalImages' },
            {
                $project: {
                    _id: 0,
                    projectId: '$_id',
                    projectName: { $ifNull: ['$title', '$userIdea', '$brandName', '$niche', 'Untitled'] },
                    url: '$stages.finalImages.url',
                    technicalPrompt: '$stages.finalImages.prompt',
                    slideIndex: '$stages.finalImages.slideIndex',
                    displayCaption: '$stages.finalImages.displayCaption',
                    status: '$stages.finalImages.status',
                    createdAt: 1,
                    // Try to find the original slide content for this image
                    slideDetails: {
                        $arrayElemAt: [
                            {
                                $filter: {
                                    input: { $ifNull: ['$stages.content.slides', []] },
                                    as: 'slide',
                                    cond: { $eq: [{ $toInt: '$$slide.slide_number' }, { $add: [{ $toInt: '$stages.finalImages.slideIndex' }, 1] }] }
                                }
                            },
                            0
                        ]
                    }
                }
            },
            {
                $project: {
                    projectId: 1,
                    projectName: 1,
                    url: 1,
                    technicalPrompt: 1,
                    slideIndex: 1,
                    status: 1,
                    createdAt: 1,
                    // Set displayCaption to heading if exists, else fallback
                    displayCaption: {
                        $ifNull: [
                            '$displayCaption',
                            '$slideDetails.heading',
                            '$slideDetails.subtext',
                            '$slideDetails.text',
                            '$technicalPrompt'
                        ]
                    }
                }
            },
            { $sort: { createdAt: -1, slideIndex: 1 } }, // Fine-grained sort after unwind
            { $skip: skip },
            { $limit: limit }
        ]);

        // For total count in gallery (total images)
        const totalImagesStats = await Project.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
            { $project: { imageCount: { $size: { $ifNull: ['$stages.finalImages', []] } } } },
            { $group: { _id: null, total: { $sum: '$imageCount' } } }
        ]);

        const total = totalImagesStats[0]?.total || 0;

        res.status(200).json({
            success: true,
            count: gallery.length,
            total,
            pagination: {
                page,
                limit,
                pages: Math.ceil(total / limit)
            },
            data: gallery
        });
    } catch (err) {
        console.error('Get gallery error:', err);
        res.status(400).json({ message: err.message });
    }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
export const getProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Make sure user owns project
        if (project.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        res.status(200).json({ success: true, data: project });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Create new project or update existing one (Save stage)
// @route   POST /api/projects
// @access  Private
export const saveProject = async (req, res) => {
    try {
        req.body.userId = req.user.id;
        req.body.updatedAt = new Date();

        // ☁️ PROCESS CLOUD STORAGE
        // Before saving to DB, upload any base64 images to Google Cloud
        await processProjectImages(req.body);

        // Prevent MongoDB 16MB document limit crash (RangeError [ERR_OUT_OF_RANGE])
        if (req.body.stages?.finalImages) {
            const jsonString = JSON.stringify(req.body);
            const estimatedSize = jsonString.length;

            // If we're over 14MB, we need to be extremely aggressive
            if (estimatedSize > 14 * 1024 * 1024) {
                console.warn('⚠️ Project data critically large, purging all historical images to stay under 16MB limit...');
                req.body.stages.finalImages.forEach(img => {
                    if (img.generationHistory && img.generationHistory.length > 0) {
                        // Keep only metadata for history, remove the heavy base64 URLs
                        img.generationHistory = img.generationHistory.map(h => ({
                            prompt: h.prompt,
                            generatedAt: h.generatedAt,
                            url: "[Historical image purged to save space]"
                        }));
                    }
                });
            }
        }

        let project;
        // Only look for existing project if id is present and not null
        if (req.body.id && mongoose.isValidObjectId(req.body.id)) {
            project = await Project.findById(req.body.id);
            if (project) {
                // Update existing project
                project = await Project.findByIdAndUpdate(req.body.id, req.body, {
                    returnDocument: 'after', // Fixes deprecation warning
                    runValidators: false
                });
            }
        }

        if (!project) {
            // Create new project
            project = await Project.create(req.body);
        }

        res.status(201).json({ success: true, data: project });
    } catch (err) {
        console.error('Save project error:', err);
        res.status(400).json({ message: err.message });
    }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
export const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Make sure user owns project
        if (project.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await project.deleteOne();

        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Get overall stats for user
// @route   GET /api/projects/stats
// @access  Private
export const getUserStats = async (req, res) => {
    try {
        const stats = await Project.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(req.user.id) } },
            {
                $group: {
                    _id: null,
                    totalTokens: { $sum: { $ifNull: ['$usage.totalTokens', 0] } },
                    totalCost: { $sum: { $ifNull: ['$usage.estimatedCost', 0] } },
                    totalImages: {
                        $sum: {
                            $cond: {
                                if: { $isArray: '$stages.finalImages' },
                                then: { $size: '$stages.finalImages' },
                                else: 0
                            }
                        }
                    },
                    projectCount: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: stats[0] || { totalTokens: 0, totalCost: 0, totalImages: 0, projectCount: 0 }
        });
    } catch (err) {
        console.error('getUserStats error:', err);
        res.status(400).json({ success: false, message: err.message });
    }
};
/**
 * @desc    Proxy an image URL to bypass CORS for downloads/ZIP
 * @route   GET /api/projects/proxy-image
 * @access  Private
 */
export const proxyImage = async (req, res) => {
    try {
        const { url } = req.query;
        if (!url) return res.status(400).json({ message: 'URL is required' });

        // Security: Ensure it's a storage.googleapis.com URL to prevent open proxying
        if (!url.includes('storage.googleapis.com')) {
            return res.status(403).json({ message: 'Only cloud storage URLs are allowed' });
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch from storage: ${response.statusText}`);

        const contentType = response.headers.get('content-type');
        res.setHeader('Content-Type', contentType || 'image/png');

        // Pipe the response body to our response
        const arrayBuffer = await response.arrayBuffer();
        res.send(Buffer.from(arrayBuffer));
    } catch (err) {
        console.error('Proxy Image Error:', err);
        res.status(500).json({ message: 'Failed to proxy image' });
    }
};
