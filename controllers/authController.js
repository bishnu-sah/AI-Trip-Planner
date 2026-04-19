const User = require('../models/User');
const { generateToken } = require('../config/jwt');
const { validationResult } = require('express-validator');

const register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('auth/register', {
                errors: errors.array(),
                username: req.body.username || '',
                email: req.body.email || ''
            });
        }

        const { username, email, password } = req.body;

        // Check if user already exists
        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) {
            return res.render('auth/register', {
                errors: [{ msg: 'User already exists' }],
                username: req.body.username || '',
                email: req.body.email || ''
            });
        }

        // Create new user
        user = new User({
            username,
            email,
            password
        });

        await user.save();

        // Generate token
        const token = generateToken(user._id);

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.render('auth/register', {
            errors: [{ msg: 'Server error' }],
            username: req.body.username || '',
            email: req.body.email || ''
        });
    }
};

const login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render('auth/login', {
                errors: errors.array(),
                email: req.body.email || ''
            });
        }

        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.render('auth/login', {
                errors: [{ msg: 'Invalid credentials' }],
                email: req.body.email || ''
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.render('auth/login', {
                errors: [{ msg: 'Invalid credentials' }],
                email: req.body.email || ''
            });
        }

        // Generate token
        const token = generateToken(user._id);

        // Set cookie
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });

        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.render('auth/login', {
            errors: [{ msg: 'Server error' }],
            email: req.body.email || ''
        });
    }
};

const logout = (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
};

module.exports = {
    register,
    login,
    logout
}; 