const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let details = err.details || null;

    if (err.name === 'ValidationError' && err.errors) {
        statusCode = 400;
        message = 'Validation failed';
        details = Object.keys(err.errors).map((field) => ({
            field,
            message: err.errors[field].message,
        }));
    }

    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue)[0];
        message = `Duplicate value for ${field}`;
        details = [{ field, message: `${field} is already registered` }];
    }

    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token has expired';
    }

    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', err);
    }

    res.status(statusCode).json({
        success: false,
        error: {
            code: statusCode,
            message,
            ...(details && { details }),
        },
    });
};

export default errorHandler;