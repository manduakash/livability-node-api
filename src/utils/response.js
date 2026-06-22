/**
 * Shared response shape used across the API. Mirrors the conventions used
 * in the existing Node/Express HR-payroll codebase so controllers stay
 * consistent project-wide.
 */
export const response = {
  success(res, message, data = null, statusCode = 200) {
    return res.status(statusCode).json({
      status: true,
      message,
      data,
    });
  },

  error(res, message, statusCode = 500, data = null) {
    return res.status(statusCode).json({
      status: false,
      message,
      data,
    });
  },
};
