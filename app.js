require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');

// Import models
const Post = require('./models/Post');
const User = require('./models/User');

// Import routes
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const dashboardRoutes = require('./routes/dashboard');
const commentRoutes = require('./routes/comments');
const { verifyToken } = require('./config/jwt');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medium-clone', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride('_method'));

// Expose logged-in user to templates (for navbar/stateful UI)
app.use(async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            res.locals.user = null;
            return next();
        }

        const decoded = verifyToken(token);
        if (!decoded) {
            res.clearCookie('token');
            res.locals.user = null;
            return next();
        }

        const user = await User.findById(decoded.userId).select('username email profilePicture');
        if (!user) {
            res.clearCookie('token');
            res.locals.user = null;
            return next();
        }

        req.user = user;
        res.locals.user = user;
        return next();
    } catch (error) {
        console.error('User session middleware failed', error);
        res.locals.user = null;
        return next();
    }
});

// Static files - Serve static files from the 'public' directory
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/comments', commentRoutes);

// Home route
app.get('/', async (req, res) => {
    try {
        const posts = await Post.find({ status: 'published' })
            .populate('author')
            .sort({ createdAt: -1 })
            .limit(6);
        res.render('index', { posts });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { error: 'Server error' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 