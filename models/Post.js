const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    coverImage: {
        type: String
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'published'
    },
    tags: [{
        type: String,
        trim: true
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    claps: {
        type: Number,
        default: 0
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    readTime: {
        type: Number,
        default: function() {
            const wordsPerMinute = 200;
            const wordCount = this.content.split(/\s+/).length;
            return Math.ceil(wordCount / wordsPerMinute);
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Post', postSchema); 