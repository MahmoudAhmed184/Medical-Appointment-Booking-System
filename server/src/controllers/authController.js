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

const login = catchAsync(async (req, res) => {
    const result = await authService.login(req.body);

    res.status(200).json({
        success: true,
        data: result,
        message: 'Login successful',
    });
});

export { register, login };