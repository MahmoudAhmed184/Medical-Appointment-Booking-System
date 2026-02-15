import ApiError from '../utils/ApiError.js';

const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const details = error.details.map((detail) => ({
                field: detail.path.join('.'),
                message: detail.message.replace(/"/g, ''),
            }));

            throw new ApiError(400, 'Validation failed', details);
        }

        next();
    };
};

export default validate;
