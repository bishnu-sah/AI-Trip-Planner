const User = require('../models/User');
const Post = require('../models/Post');

const getDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('readingList')
            .populate('followers')
            .populate('following');

        const posts = await Post.find({ author: req.user._id })
            .sort({ createdAt: -1 });

        res.render('dashboard', { user, posts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('followers')
            .populate('following');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const posts = await Post.find({ 
            author: user._id,
            status: 'published'
        }).sort({ createdAt: -1 });

        const isFollowing = user.followers.includes(req.user._id);

        res.render('profile', { user, posts, isFollowing });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { bio } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.bio = bio;
        
        if (req.file) {
            user.profilePicture = `/uploads/${req.file.filename}`;
        }

        await user.save();
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const followUser = async (req, res) => {
    try {
        const userToFollow = await User.findById(req.params.id);
        const currentUser = await User.findById(req.user._id);

        if (!userToFollow || !currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if already following
        const isFollowing = currentUser.following.includes(userToFollow._id);
        
        if (isFollowing) {
            currentUser.following = currentUser.following.filter(
                id => id.toString() !== userToFollow._id.toString()
            );
            userToFollow.followers = userToFollow.followers.filter(
                id => id.toString() !== currentUser._id.toString()
            );
        } else {
            currentUser.following.push(userToFollow._id);
            userToFollow.followers.push(currentUser._id);
        }

        await currentUser.save();
        await userToFollow.save();

        res.redirect(`/profile/${userToFollow._id}`);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const addToReadingList = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const user = await User.findById(req.user._id);

        if (!post || !user) {
            return res.status(404).json({ message: 'Post or user not found' });
        }

        const isInReadingList = user.readingList.includes(post._id);
        
        if (isInReadingList) {
            user.readingList = user.readingList.filter(
                id => id.toString() !== post._id.toString()
            );
        } else {
            user.readingList.push(post._id);
        }

        await user.save();
        res.json({ inReadingList: !isInReadingList });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getDashboard,
    getProfile,
    updateProfile,
    followUser,
    addToReadingList
}; 