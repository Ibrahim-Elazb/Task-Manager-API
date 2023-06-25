const Joi = require('joi');

const newTaskSchema = {
    body: Joi.object({
        title: Joi.string().required().messages({
            'any.required': 'Title is required.',
            'string.empty': 'Title cannot be empty.',
        }),
        description: Joi.string().required().messages({
            'any.required': 'Description is required.',
            'string.empty': 'Description cannot be empty.',
        }),
        dueDate: Joi.date().iso().required().messages({
            'any.required': 'Due date is required.',
            'date.base': 'Due date must be a valid date in ISO format.',
        }),
        priority: Joi.string()
            .valid('high', 'medium', 'low')
            .required()
            .insensitive()
            .messages({
                'any.required': 'Priority is required.',
                'any.only': 'Priority must be one of "High", "Medium", or "Low".',
            }),
        waitingTasks: Joi.array()
            .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
            .messages({
                'any.required': 'Waiting tasks are required.',
                'array.base': 'Waiting tasks must be an array.',
                'string.pattern.base': 'Each waiting task must be a valid ID.',
            }),
        files: Joi.array()
            .items(Joi.string().required())
            .messages({
                'array.base': 'Files must be an array.',
                'string.empty': 'File path cannot be empty.',
            }),
        parentTask: Joi.string().allow('').messages({
            'string.empty': 'Parent task must be a valid ID or empty.',
        }),
        assignedUsers: Joi.array()
            .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
            .messages({
                'any.required': 'Assigned users are required.',
                'array.base': 'Assigned users must be an array.',
                'string.pattern.base': 'Each assigned user must be a valid ID.',
            }),
        labels: Joi.array()
            .items(Joi.string())
            .messages({
                'any.required': 'Labels are required.',
                'array.base': 'Labels must be an array.',
                'string.pattern.base': 'Each label must be a valid ID.',
            }),
    })
};


const editTaskSchema = {
    body: Joi.object({
        title: Joi.string().required().messages({
            'any.required': 'Title is required.',
            'string.empty': 'Title cannot be empty.',
        }),
        description: Joi.string().required().messages({
            'any.required': 'Description is required.',
            'string.empty': 'Description cannot be empty.',
        }),
        dueDate: Joi.date().iso().required().messages({
            'any.required': 'Due date is required.',
            'date.base': 'Due date must be a valid date in ISO format.',
        }),
        priority: Joi.string()
            .valid('high', 'medium', 'low')
            .required()
            .insensitive()
            .messages({
                'any.required': 'Priority is required.',
                'any.only': 'Priority must be one of "High", "Medium", or "Low".',
            }),
        waitingTasks: Joi.array()
            .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
            .messages({
                'any.required': 'Waiting tasks are required.',
                'array.base': 'Waiting tasks must be an array.',
                'string.pattern.base': 'Each waiting task must be a valid ID.',
            }),
        remainingFiles: Joi.array()
            .items(Joi.string().required())
            .messages({
                'array.base': 'Remaining Files must be an array.',
                'string.empty': 'Remaining Files path cannot be empty.',
            }),
        files: Joi.array()
            .items(Joi.string().required())
            .messages({
                'array.base': 'Files must be an array.',
                'string.empty': 'File path cannot be empty.',
            }),
        parentTask: Joi.string().allow('').messages({
            'string.empty': 'Parent task must be a valid ID or empty.',
        }),
        assignedUsers: Joi.array()
            .items(Joi.string().regex(/^[0-9a-fA-F]{24}$/))
            .messages({
                'any.required': 'Assigned users are required.',
                'array.base': 'Assigned users must be an array.',
                'string.pattern.base': 'Each assigned user must be a valid ID.',
            }),
        labels: Joi.array()
            .items(Joi.string())
            .messages({
                'any.required': 'Labels are required.',
                'array.base': 'Labels must be an array.',
                'string.pattern.base': 'Each label must be a valid ID.',
            }),
    }),
    params: Joi.object({
        id: Joi.string().pattern(/^[a-fA-F0-9]{24}$/).required().messages({
            'string.pattern.base': 'ID must be a valid hexadecimal string of length 24',
            'any.required': 'ID is required',
        })
    })
};

const deleteTaskSchema = {
    params: Joi.object({
        id: Joi.string().pattern(/^[a-fA-F0-9]{24}$/).required().messages({
            'string.pattern.base': 'ID must be a valid hexadecimal string of length 24',
            'any.required': 'ID is required',
        })
    }),
    query: Joi.object({
        recursively: Joi.boolean().required().messages({
            'boolean.base': 'Recursively field must be a boolean value',
            'any.required': 'Recursively field is required',
        }),
    }),
}

const getTaskByIdSchema = {
    params: Joi.object({
        id: Joi.string().pattern(/^[a-fA-F0-9]{24}$/).required().messages({
            'string.pattern.base': 'ID must be a valid hexadecimal string of length 24',
            'any.required': 'ID is required',
        })
    }),
}

const searchForTasksSchema = {
    body: Joi.object({
        title: Joi.string().messages({
            'string.empty': 'Title must not be empty.',
        }),
        description: Joi.string().messages({
            'string.empty': 'Description must not be empty.',
        }),
        status: Joi.string().valid('to do', 'in progress', 'completed').insensitive().messages({
            'any.only': 'Status must be one of "To Do", "In Progress", or "Completed".',
        }),
        priority: Joi.string().valid('high', 'medium', 'low').insensitive().messages({
            'any.only': 'Priority must be one of "High", "Medium", or "Low".',
        }),
        labels: Joi.array().items(Joi.string()).messages({
            'array.base': 'Labels must be an array.',
        }),
        dueDate_from: Joi.date().iso().messages({
            'date.format': 'Due date from must be a valid ISO date format (YYYY-MM-DD).',
        }),
        dueDate_to: Joi.date().iso().messages({
            'date.format': 'Due date to must be a valid ISO date format (YYYY-MM-DD).',
        }),
        createdAt_from: Joi.date().iso().messages({
            'date.format': 'Created date from must be a valid ISO date format (YYYY-MM-DD).',
        }),
        createdAt_to: Joi.date().iso().messages({
            'date.format': 'Created date to must be a valid ISO date format (YYYY-MM-DD).',
        }),
        sort: Joi.string().valid('due-date', 'created-at', '').messages({
            'any.only': 'Sort must be one of "due-date", "created-at", or empty string.',
        }),
        ascending: Joi.boolean().messages({
            'boolean.base': 'Ascending must be a boolean value.',
        }),
        page: Joi.number().integer().positive().messages({
            'number.base': 'Page must be a valid number.',
            'number.integer': 'Page must be an integer.',
            'number.positive': 'Page must be a positive number.',
        }),
    })
}

const getTasksSchema = {
    body: Joi.object({
        sort: Joi.string().valid('due-date', 'created-at', ''),
        ascending: Joi.boolean(),
        page: Joi.number().integer().positive()
    })
}

module.exports = {
    newTaskSchema,
    editTaskSchema,
    deleteTaskSchema,
    getTaskByIdSchema,
    getTasksSchema,
    searchForTasksSchema
}