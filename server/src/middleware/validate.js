/**
 * Request validation middleware factory.
 * Validates req.body against a Joi schema.
 * Usage: validate(joiSchema)
 */
const validate = (schema) => {
    return (req, res, next) => {
        // TODO: Implement Joi validation

        next();
    };
};

export default validate;
