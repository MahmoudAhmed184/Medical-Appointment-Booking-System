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

router.use(auth, authorize(ROLES.ADMIN));

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.patch('/:id/approve', approveUser);
router.patch('/:id/block', blockUser);
router.delete('/:id', deleteUser);

export default router;
