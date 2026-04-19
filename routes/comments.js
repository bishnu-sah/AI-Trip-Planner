const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const Comment = require('../models/Comment');
const Post = require('../models/Post');

router.post('/:postId', authMiddleware, async (req, res) => {
    try {
        const { content } = req.body;
        const post = await Post.findById(req.params.postId);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = new Comment({
            content,
            author: req.user._id,
            post: post._id
        });

        await comment.save();
        post.comments.push(comment._id);
        await post.save();

        res.redirect(`/posts/${post._id}`);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        
        if (!comment || comment.author.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const post = await Post.findById(comment.post);
        post.comments = post.comments.filter(id => id.toString() !== comment._id.toString());
        
        await post.save();
        await comment.remove();

        res.redirect(`/posts/${post._id}`);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/:id/like', authMiddleware, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const hasLiked = comment.likes.includes(req.user._id);
        if (hasLiked) {
            comment.likes = comment.likes.filter(id => id.toString() !== req.user._id.toString());
        } else {
            comment.likes.push(req.user._id);
        }

        await comment.save();
        res.json({ likes: comment.likes.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 