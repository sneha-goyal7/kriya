/**
 * Standardized API Response Helpers
 * Every API response follows the same shape.
 * Frontend can always rely on { success, data, error, meta }.
 */

/**
 * Success response
 * @param {Object} res - Express response object
 * @param {Object} data - The response payload
 * @param {number} statusCode - HTTP status (default 200)
 * @param {Object} meta - Optional pagination/metadata
 */
export const sendSuccess = (res, data, statusCode = 200, meta = null) => {
  const response = {
    success: true,
    data,
  };
  if (meta) response.meta = meta;
  return res.status(statusCode).json(response);
};

/**
 * Created response (201)
 */
export const sendCreated = (res, data, meta = null) => {
  return sendSuccess(res, data, 201, meta);
};

/**
 * No content response (204)
 */
export const sendNoContent = (res) => {
  return res.status(204).send();
};

/**
 * Paginated response helper
 */
export const sendPaginated = (res, data, { page, limit, total }) => {
  return sendSuccess(res, data, 200, {
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.ceil(total / limit),
  });
};
