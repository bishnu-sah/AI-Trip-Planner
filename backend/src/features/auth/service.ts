import { IAuthService } from '../../domain/interfaces/services';
import { User } from '../../domain/models';
import { UserModel } from '../../infra/dao/UserDAO';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '30d';

export class AuthService implements IAuthService {
  async register(username: string, email: string, password: string): Promise<User> {
    // Check if user already exists
    const existingUser = await UserModel.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create new user
    const user = new UserModel({
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

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    // Find user
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, {
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

  async getUserById(userId: string): Promise<User | null> {
    const user = await UserModel.findById(userId);
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

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (data.username) user.username = data.username;
    if (data.email) user.email = data.email;
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

