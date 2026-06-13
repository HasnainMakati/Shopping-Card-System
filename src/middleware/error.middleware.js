const globalErrorHandler = async (err, req, res, next) => {

    // Sequelize Error
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {

        const shortError = err.errors.map(e => e.message);

        return res.status(400).json({
            success: false,
            message: "Validation Error",
            errors: shortError
        });
    }

    // Normal Error
    const statusCode = err.statusCode || 500;

    return res
        .status(statusCode)
        .json({
            success: false,
            data: null,
            message: err.message || "Internal server error",
            errors: err.errors || []
        })
}

export { globalErrorHandler }