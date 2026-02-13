/**
 * Wraps an async controller function to forward errors to next().
 */
const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export default catchAsync;
