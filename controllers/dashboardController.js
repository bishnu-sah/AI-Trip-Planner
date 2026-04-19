const User = require('../models/User');
const Post = require('../models/Post');

// Get dashboard
exports.getDashboard = async (req, res) => {
    try {
        // Get user with populated posts and reading list
        const user = await User.findById(req.user._id)
            .populate({
                path: 'posts',
                options: { sort: { createdAt: -1 } }
            })
            .populate({
                path: 'readingList',
                populate: {
                    path: 'author',
                    select: 'username profilePicture'
                },
                options: { sort: { createdAt: -1 } }
            })
            .populate('followers', 'username profilePicture')
            .populate('following', 'username profilePicture');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.render('dashboard', { 
            user: {
                ...user.toObject(),
                posts: user.posts || [],
                readingList: user.readingList || [],
                followers: user.followers || [],
                following: user.following || []
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard:', error);
        res.status(500).json({ message: 'Error fetching dashboard' });
    }
};

// Update profile
exports.updateProfile = async (req, res) => {
    try {
        const { bio } = req.body;
        const profilePicture = req.file ? req.file.path : undefined;

        const updateData = {};
        if (bio) updateData.bio = bio;
        if (profilePicture) updateData.profilePicture = profilePicture;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateData,
            { new: true }
        );

        res.redirect('/dashboard');
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ message: 'Error updating profile' });
    }
};

// Add to reading list
exports.addToReadingList = async (req, res) => {
    try {
        const { postId } = req.params;
        const user = await User.findById(req.user._id);

        if (!user.readingList.includes(postId)) {
            user.readingList.push(postId);
            await user.save();
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error adding to reading list:', error);
        res.status(500).json({ message: 'Error adding to reading list' });
    }
};

// Remove from reading list
exports.removeFromReadingList = async (req, res) => {
    try {
        const { postId } = req.params;
        const user = await User.findById(req.user._id);

        user.readingList = user.readingList.filter(id => id.toString() !== postId);
        await user.save();

        res.json({ success: true });
    } catch (error) {
        console.error('Error removing from reading list:', error);
        res.status(500).json({ message: 'Error removing from reading list' });
    }
}; 