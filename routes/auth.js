const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, logout } = require('../controllers/authController');

// Validation middleware
const registerValidation = [
    body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

const loginValidation = [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
];

// Routes
router.get('/register', (req, res) => {
    res.render('auth/register', { errors: [], username: '', email: '' });
});

router.post('/register', registerValidation, register);

router.get('/login', (req, res) => {
    res.render('auth/login', { errors: [], email: '' });
});

router.post('/login', loginValidation, login);

router.get('/logout', logout);

module.exports = router; 