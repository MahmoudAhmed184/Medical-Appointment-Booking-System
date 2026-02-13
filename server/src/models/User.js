import mongoose from 'mongoose';
import { ROLES } from '../utils/constants.js';

const userSchema = new mongoose.Schema(
    // TODO: Implement user schema
);

// TODO: Pre-save hook for password hashing (bcrypt)
// TODO: Instance method: comparePassword()

const User = mongoose.model('User', userSchema);

export default User;
