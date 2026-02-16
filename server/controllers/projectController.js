import Project from '../models/Project.js';

// @desc    Get all projects for a user
// @route   GET /api/projects
// @access  Private
export const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({ userId: req.user.id }).sort('-createdAt');
        res.status(200).json({ success: true, count: projects.length, data: projects });
    } catch (err) {
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

        let project;
        if (req.body.id) {
            project = await Project.findById(req.body.id);
            if (project) {
                // Update
                project = await Project.findByIdAndUpdate(req.body.id, req.body, {
                    new: true,
                    runValidators: true
                });
            }
        }

        if (!project) {
            // Create
            project = await Project.create(req.body);
        }

        res.status(201).json({ success: true, data: project });
    } catch (err) {
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
            { $match: { userId: req.user._id } },
            {
                $group: {
                    _id: null,
                    totalTokens: { $sum: '$usage.totalTokens' },
                    totalCost: { $sum: '$usage.estimatedCost' },
                    totalImages: { $sum: { $size: '$stages.finalImages' } },
                    projectCount: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: stats[0] || { totalTokens: 0, totalCost: 0, totalImages: 0, projectCount: 0 }
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
