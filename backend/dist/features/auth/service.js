"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const UserDAO_1 = require("../../infra/dao/UserDAO");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '30d';
class AuthService {
    async register(username, email, password) {
        // Check if user already exists
        const existingUser = await UserDAO_1.UserModel.findOne({
            $or: [{ email }, { username }]
        });
        if (existingUser) {
            throw new Error('User already exists');
        }
        // Create new user
        const user = new UserDAO_1.UserModel({
            username,
            email,
            password
        });
        await user.save();
        return {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            createdAt: user.createdAt.toISOString()
        };
    }
    async login(email, password) {
        // Find user
        const user = await UserDAO_1.UserModel.findOne({ email });
        if (!user) {
            throw new Error('Invalid credentials');
        }
        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }
        // Generate token
        const token = jsonwebtoken_1.default.sign({ userId: user._id.toString() }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN
        });
        return {
            user: {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                createdAt: user.createdAt.toISOString()
            },
            token
        };
    }
    async getUserById(userId) {
        const user = await UserDAO_1.UserModel.findById(userId);
        if (!user) {
            return null;
        }
        return {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            createdAt: user.createdAt.toISOString()
        };
    }
    async updateProfile(userId, data) {
        const user = await UserDAO_1.UserModel.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        if (data.username)
            user.username = data.username;
        if (data.email)
            user.email = data.email;
        // Password update logic can be added here if needed, keeping it simple for now
        await user.save();
        return {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            createdAt: user.createdAt.toISOString()
        };
    }
}
exports.AuthService = AuthService;
