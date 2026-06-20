const validateRequest = (validator, source = "body") => (req, res, next) => {
    const errors = validator(req[source] || {}, req);

    if (Array.isArray(errors) && errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: errors[0],
            errors
        });
    }

    next();
};

module.exports = validateRequest;
