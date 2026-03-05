import User from '../models/User.js';
import Project from '../models/Project.js';

// @desc    Get all users with their summary stats
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');

        // Aggregate project stats for each user
        const usersWithStats = await Promise.all(users.map(async (user) => {
            const stats = await Project.aggregate([
                { $match: { userId: user._id } },
                {
                    $group: {
                        _id: null,
                        totalTokens: { $sum: '$usage.totalTokens' },
                        totalCost: { $sum: '$usage.estimatedCost' },
                        projectCount: { $sum: 1 }
                    }
                }
            ]);

            return {
                ...user.toObject(),
                stats: stats[0] || { totalTokens: 0, totalCost: 0, projectCount: 0 }
            };
        }));

        res.status(200).json({ success: true, count: users.length, data: usersWithStats });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Get global platform metrics
// @route   GET /api/admin/metrics
// @access  Private/Admin
export const getGlobalMetrics = async (req, res) => {
    try {
        const globalStats = await Project.aggregate([
            {
                $group: {
                    _id: null,
                    totalTokens: { $sum: '$usage.totalTokens' },
                    totalCost: { $sum: '$usage.estimatedCost' },
                    totalImages: { $sum: { $size: '$stages.finalImages' } },
                    totalProjects: { $sum: 1 }
                }
            }
        ]);

        const userCount = await User.countDocuments();

        res.status(200).json({
            success: true,
            data: {
                ...(globalStats[0] || { totalTokens: 0, totalCost: 0, totalImages: 0, totalProjects: 0 }),
                totalUsers: userCount
            }
        });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// @desc    Update user (e.g., change role)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            returnDocument: 'after',
            runValidators: true
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ success: true, data: user });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
