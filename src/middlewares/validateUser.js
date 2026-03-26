module.exports = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: result.error.issues.map((err) => ({
          path: err.path.join("."),
          message: err.message,
          code: err.code,
        })),
      });
    }

    req.validated = result.data;
    next();
  };
};
