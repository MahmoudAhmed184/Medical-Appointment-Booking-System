import express from 'express';
import { register, login } from '../controllers/authController.js';
import validate from '../middleware/validate.js';
import { registerSchema } from '../validations/authValidation.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', login);

export default router;
