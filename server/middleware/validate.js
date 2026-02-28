/**
 * Joi validation middleware factory
 * @param {import('joi').ObjectSchema} schema - Joi schema to validate against
 * @returns {Function} Express middleware
 */
export function validate(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,       // Return all errors, not just the first
            stripUnknown: true,      // Remove unknown fields
            errors: { wrap: { label: '' } }  // Clean error labels
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                error: 'Validation failed',
                details: errors
            });
        }

        // Replace body with validated + sanitized values
        req.body = value;
        next();
    };
}
