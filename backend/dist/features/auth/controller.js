"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    register = async (req, res) => {
        try {
            const { username, email, password } = req.body;
            // Validation
            if (!username || !email || !password) {
                res.status(400).json({ error: 'All fields are required' });
                return;
            }
            if (username.length < 3) {
                res.status(400).json({ error: 'Username must be at least 3 characters' });
                return;
            }
            if (password.length < 6) {
                res.status(400).json({ error: 'Password must be at least 6 characters' });
                return;
            }
            const user = await this.authService.register(username, email, password);
            res.status(201).json({ user });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Registration failed';
            if (message === 'User already exists') {
                res.status(409).json({ error: message });
            }
            else {
                res.status(500).json({ error: message });
            }
        }
    };
    login = async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({ error: 'Email and password are required' });
                return;
            }
            const result = await this.authService.login(email, password);
            res.json(result);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Login failed';
            if (message === 'Invalid credentials') {
                res.status(401).json({ error: message });
            }
            else {
                res.status(500).json({ error: message });
            }
        }
    };
    me = async (req, res) => {
        try {
            const userId = req.userId;
            if (!userId) {
                res.status(401).json({ error: 'Not authenticated' });
                return;
            }
            const user = await this.authService.getUserById(userId);
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            res.json({ user });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to get user' });
        }
    };
    updateProfile = async (req, res) => {
        try {
            const userId = req.userId;
            if (!userId) {
                res.status(401).json({ error: 'Not authenticated' });
                return;
            }
            const { username, email } = req.body;
            const updatedUser = await this.authService.updateProfile(userId, { username, email });
            res.json({ user: updatedUser });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update profile';
            res.status(500).json({ error: message });
        }
    };
}
exports.AuthController = AuthController;
