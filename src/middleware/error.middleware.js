const globalErrorHandler = async (err, req, res, next) => {
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