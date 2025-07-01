const Joi = require("joi");

class addLinksValidation {
    /**
     * Returns the registration validation schema.
     * @returns {Joi.ObjectSchema}
     */
    static add() {
        return Joi.object({
            linkTitle: Joi.string()
                .min(2)
                .max(50)
                .required()
                .messages({
                    "string.empty": "Link title is required",
                    "string.min": "Link title must be at least 2 characters long",
                    "string.max": "Link title must be at most 50 characters long",
                }),
            linkUrl: Joi.string()
                .required()
                .messages({
                    "string.empty": "Link URL is required",
                }),
            linkLogo: Joi.string()
                .required()
                .messages({
                    "string.empty": "Link logo URL is required",
                }),
            type: Joi.string()
                .valid("social", "non_social")
                .required()
                .messages({
                    "any.only": 'Type must be either "social" or "non_social"',
                }),
        });
    }

    /**
     * Returns the update validation schema.
     * @returns {Joi.ObjectSchema}
     */
    static update() {
        return Joi.object({
            _id: Joi.string()
            .required()
            .messages({
                "string.empty": "ID is required",
            }),
            linkTitle: Joi.string()
            .min(2)
            .max(50)
            .optional()
            .messages({
                "string.min": "Link title must be at least 2 characters long",
                "string.max": "Link title must be at most 50 characters long",
            }),
            linkUrl: Joi.string()
            .optional()
            .messages({
                "string.empty": "Link URL cannot be empty",
            }),
            linkLogo: Joi.string()
            .optional()
            .messages({
                "string.empty": "Link logo URL cannot be empty",
            }),
            type: Joi.string()
            .valid("social", "non_social")
            .required()
            .messages({
                "any.only": 'Type must be either "social" or "non_social"',
            }),
        });
    }
    /**
     * Validate user link data.
     * @param {Object} data - The user input data.
     * @returns {Object} - Validation result.
     */
    static validateAddLinks(data) {
        return addLinksValidation.add().validate(data, { abortEarly: false });
    }
    /**
     * Validate user link update data.
     * @param {Object} data - The user input data.
     * @returns {Object} - Validation result.
     */
    static validateUpdateLinks(data) {
        return addLinksValidation.update().validate(data, { abortEarly: false });
    }

}

module.exports = addLinksValidation;
