import Joi from 'joi';

// ==================== Auth Schemas ====================

export const registerSchema = Joi.object({
    name: Joi.string().trim().min(2).max(50).required()
        .messages({
            'string.min': 'Name must be at least 2 characters',
            'string.max': 'Name must not exceed 50 characters',
            'any.required': 'Name is required'
        }),
    email: Joi.string().trim().lowercase().email().required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
    password: Joi.string().min(6).max(128).required()
        .messages({
            'string.min': 'Password must be at least 6 characters',
            'any.required': 'Password is required'
        })
});

export const loginSchema = Joi.object({
    email: Joi.string().trim().lowercase().email().required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
    password: Joi.string().required()
        .messages({
            'any.required': 'Password is required'
        })
});

// ==================== Scan Schemas ====================

export const scanSchema = Joi.object({
    itemName: Joi.string().trim().min(1).max(200).required()
        .messages({
            'any.required': 'Item name is required',
            'string.max': 'Item name must not exceed 200 characters'
        }),
    category: Joi.string().valid('recyclable', 'organic', 'hazardous', 'general').required()
        .messages({
            'any.only': 'Category must be one of: recyclable, organic, hazardous, general',
            'any.required': 'Category is required'
        }),
    confidence: Joi.number().min(0).max(100).optional(),
    disposalMethod: Joi.string().max(2000).allow('').optional(),
    tips: Joi.array().items(Joi.string().max(500)).max(10).optional(),
    imageUrl: Joi.string().max(5000000).allow('').optional()
});

// ==================== Challenge Schemas ====================

export const challengeUpdateSchema = Joi.object({
    category: Joi.string().valid('recyclable', 'organic', 'hazardous', 'any').required()
        .messages({
            'any.only': 'Category must be one of: recyclable, organic, hazardous, any',
            'any.required': 'Category is required'
        })
});

export const challengeClaimSchema = Joi.object({
    challengeId: Joi.string().trim().required()
        .messages({
            'any.required': 'Challenge ID is required'
        })
});
