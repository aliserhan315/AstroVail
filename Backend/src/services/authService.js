import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { signJwt } from '../lib/jwt.js';

function issue(user) {
  const accessToken = signJwt({ sub: user._id.toString(), email: user.email });
  return {
    accessToken,
    user: {
      id: user._id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    },
  };
}

export const AuthService = {
  async register({ email, password, displayName }) {
    const exists = await User.findOne({ email });
    if (exists) throw new Error('Email already in use');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, displayName });
    return issue(user);
  },

  async login({ email, password }) {
    const user = await User.findOne({ email });
    if (!user || !user.passwordHash) throw new Error('Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new Error('Invalid credentials');

    return issue(user);
  },

  async me(userId) {
    const user = await User.findById(userId).select('_id email displayName avatarUrl createdAt');
    if (!user) throw new Error('User not found');
    return { id: user._id, email: user.email, displayName: user.displayName, avatarUrl: user.avatarUrl, createdAt: user.createdAt };
  },
};
