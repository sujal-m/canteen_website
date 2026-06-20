const formatValidationErrors = (error) => Object.values(error.errors || {}).map((item) => item.message);

const notFound = (req, res, next) => {
    res.status(404);
    next(new Error(`Route not found: ${req.originalUrl}`));
};

const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
    let message = err.message || "Server error.";
    let errors;

    if (err.name === "ValidationError") {
        statusCode = 400;
        message = "Validation failed.";
        errors = formatValidationErrors(err);
    }

    if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid resource id.";
    }

    if (err.code === 11000) {
        statusCode = 409;
        const fields = Object.keys(err.keyValue || {}).join(", ");
        message = fields ? `Duplicate value for ${fields}.` : "Duplicate value.";
    }

    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid token.";
    }

    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Token expired.";
    }

    if (message.startsWith("Route not found:")) {
        message = "Route not found";
    }

    const response = {
        success: false,
        message
    };

    if (errors) response.errors = errors;
    if (process.env.NODE_ENV !== "production") response.stack = err.stack;

    res.status(statusCode).json(response);
};

module.exports = { notFound, errorHandler };
