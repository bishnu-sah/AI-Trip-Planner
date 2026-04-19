const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Post = require('../models/Post');

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.redirect('/auth/login');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            res.clearCookie('token');
            return res.redirect('/auth/login');
        }

        req.user = user;
        next();
    } catch (error) {
        console.error(error);
        res.clearCookie('token');
        res.redirect('/auth/login');
    }
};

const restrictToOwner = async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to perform this action' });
        }

        next();
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = { authMiddleware, restrictToOwner }; 