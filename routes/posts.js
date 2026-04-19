const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const Post = require('../models/Post');

// Configure multer for post images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Routes
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find({ status: 'published' })
            .populate('author')
            .sort({ createdAt: -1 });
        res.render('posts/index', { posts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/new', authMiddleware, (req, res) => {
    res.render('posts/new');
});

router.post('/', authMiddleware, upload.single('coverImage'), async (req, res) => {
    try {
        const { title, content, tags } = req.body;
        const post = new Post({
            title,
            content,
            author: req.user._id,
            coverImage: req.file ? `/uploads/${req.file.filename}` : null,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : []
        });
        await post.save();
        res.redirect(`/posts/${post._id}`);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author')
            .populate({
                path: 'comments',
                populate: { path: 'author' }
            });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.render('posts/show', { post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/:id/edit', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post || post.author.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.render('posts/edit', { post });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.put('/:id', authMiddleware, upload.single('coverImage'), async (req, res) => {
    try {
        const { title, content, tags } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post || post.author.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        post.title = title;
        post.content = content;
        post.tags = tags ? tags.split(',').map(tag => tag.trim()) : [];
        if (req.file) {
            post.coverImage = `/uploads/${req.file.filename}`;
        }
        
        await post.save();
        res.redirect(`/posts/${post._id}`);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post || post.author.toString() !== req.user._id.toString()) {
            return res.status(404).json({ message: 'Post not found' });
        }
        await post.remove();
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/:id/like', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        const hasLiked = post.likes.includes(req.user._id);
        if (hasLiked) {
            post.likes = post.likes.filter(id => id.toString() !== req.user._id.toString());
        } else {
            post.likes.push(req.user._id);
        }
        
        await post.save();
        res.json({ likes: post.likes.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/:id/clap', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        
        post.claps += 1;
        await post.save();
        res.json({ claps: post.claps });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 