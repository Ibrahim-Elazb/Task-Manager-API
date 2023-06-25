const Joi = require('joi');

const newCommentSchema = {
    body: Joi.object({
        text: Joi.string().required().messages({
            'any.required': 'Comment text is required.',
            'string.empty': 'Comment text must not be empty.',
        }),
    }),
    params: Joi.object({
        taskId: Joi.string().pattern(/^[a-fA-F0-9]{24}$/).required().messages({
            'string.pattern.base': 'ID must be a valid hexadecimal string of length 24',
            'any.required': 'ID is required',
        })
    }),
}

const getCommentsSchema = {
    params: Joi.object({
        taskId: Joi.string().pattern(/^[a-fA-F0-9]{24}$/).required().messages({
            'string.pattern.base': 'ID must be a valid hexadecimal string of length 24',
            'any.required': 'ID is required',
        })
    }),
    query: Joi.object({
        page: Joi.number().min(1).required().messages({
            'number.base': 'Page should be number',
            'any.required': 'Page is required',
        })
    }),
}

const deleteCommentSchema = {
    params: Joi.object({
        taskId: Joi.string().pattern(/^[a-fA-F0-9]{24}$/).required().messages({
            'string.pattern.base': 'ID must be a valid hexadecimal string of length 24',
            'any.required': 'ID is required',
        }),
        commentId: Joi.string().pattern(/^[a-fA-F0-9]{24}$/).required().messages({
            'string.pattern.base': 'ID must be a valid hexadecimal string of length 24',
            'any.required': 'ID is required',
        }),
    }),
}

module.exports = {
    newCommentSchema,
    deleteCommentSchema,
    getCommentsSchema
}