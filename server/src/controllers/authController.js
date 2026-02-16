import catchAsync from '../utils/catchAsync.js';
import * as authService from '../services/authService.js';

const register = catchAsync(async (req, res) => {
    const result = await authService.register(req.body);

    res.status(201).json({
        success: true,
        data: result,
        message: 'Registration successful',
    });
});

const login = catchAsync(async (req, res) => { });

export { register, login };
