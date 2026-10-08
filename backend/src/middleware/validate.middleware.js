/**
 * Zod Validation Middleware Factory
 * Creates Express middleware that validates req.body, req.query, or req.params
 * against a Zod schema before the request reaches the controller.
 *
 * Usage:
 *   import { validate } from './middleware/validate.middleware.js';
 *   import { registerSchema } from './validators/auth.validator.js';
 *   router.post('/register', validate(registerSchema), registerController);
 */

import { ValidationError } from "../utils/AppError.js";

/**
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {'body' | 'query' | 'params'} source - Which part of req to validate
 */
export const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details = result.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      console.error("[ZOD VALIDATION FAILED]", JSON.stringify(details, null, 2));
      throw new ValidationError("Validation failed", details);
    }

    // Replace raw input with validated + transformed data
    req.validatedBody = result.data;
    next();
  };
};
