import express from 'express';
import auth from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import { ROLES } from '../utils/constants.js';
import {
    getAllUsers,
    getUserById,
    approveUser,
    blockUser,
    deleteUser,
} from '../controllers/userController.js';

const router = express.Router();

// All routes require admin authentication
router.use(auth, authorize(ROLES.ADMIN));

// GET    /api/users
router.get('/', getAllUsers);

// GET    /api/users/:id
router.get('/:id', getUserById);

// PATCH  /api/users/:id/approve
router.patch('/:id/approve', approveUser);

// PATCH  /api/users/:id/block
router.patch('/:id/block', blockUser);

// DELETE /api/users/:id
router.delete('/:id', deleteUser);

export default router;
