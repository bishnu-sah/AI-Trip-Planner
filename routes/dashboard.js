const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const dashboardController = require('../controllers/dashboardController');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Dashboard routes
router.get('/', authMiddleware, dashboardController.getDashboard);
router.post('/profile', authMiddleware, upload.single('profilePicture'), dashboardController.updateProfile);
router.post('/reading-list/:postId', authMiddleware, dashboardController.addToReadingList);
router.delete('/reading-list/:postId', authMiddleware, dashboardController.removeFromReadingList);

module.exports = router; 