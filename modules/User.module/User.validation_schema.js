const Joi = require("joi")

const newUserSchema = {
    body: Joi.object({
        firstName: Joi.string().required().messages({
            'any.required': 'First name is required.',
        }),
        lastName: Joi.string().required().messages({
            'any.required': 'Last name is required.',
        }),
        emailAddress: Joi.string().email().required().messages({
            'any.required': 'Email address is required.',
            'string.email': 'Email address must be a valid email.',
        }),
        phone: Joi.number().required().messages({ //
            'any.required': 'Phone number is required.',
            'number.base': 'Phone number must be a number.',
        }),
        password: Joi.string().required().messages({ 
            //You can add pattern to check password against specific pattern
            //.pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/))
            'any.required': 'Password is required.',
        }),
        confirm_password: Joi.string().valid(Joi.ref("password")).required().messages({
            "any.required": "You must enter Confirm Password",
            "string.empty": "You must enter Confirm password",
            "any.only": "password and confirm password should be the same"
        }),
        department: Joi.string().required().messages({
            'any.required': 'Department is required.',
        }),
    })
}

const editUserSchema = {
    body: Joi.object({
        firstName: Joi.string().required().messages({
            'any.required': 'First name is required.',
        }),
        lastName: Joi.string().required().messages({
            'any.required': 'Last name is required.',
        }),
        emailAddress: Joi.string().email().required().messages({
            'any.required': 'Email address is required.',
            'string.email': 'Email address must be a valid email.',
        }),
        phone: Joi.number().required().messages({ //
            'any.required': 'Phone number is required.',
            'number.base': 'Phone number must be a number.',
        }),
        department: Joi.string().required().messages({
            'any.required': 'Department is required.',
        }),
    }),
    params: Joi.object({
        id: Joi.string().pattern(/^[a-fA-F0-9]{24}$/).required()
    })
}

const editUserRoleSchema = {
    body: Joi.object({
        role: Joi.string()
            .valid('user', 'manager', 'admin')
            .required()
            .insensitive()
            .messages({
                'any.required': 'Role is required.',
                'any.only': 'Role must be one of "user", "manager", or "admin".',
            })
    }),
    params: Joi.object({
        id: Joi.string().pattern(/^[a-fA-F0-9]{24}$/).required()
    })
}

const deleteUserSchema = {
    params: Joi.object({
        id: Joi.string().pattern(/^[a-fA-F0-9]{24}$/).required()
    })
}

const getUserByIdSchema = {
    params: Joi.object({
        id: Joi.string().pattern(/^[a-fA-F0-9]{24}$/).required()
    })
}

const getUserByDepartmentSchema = {
    params: Joi.object({
        department_id: Joi.string().pattern(/^[a-fA-F0-9]{24}$/).required()
    })
}


module.exports={
    newUserSchema,
    editUserSchema,
    editUserRoleSchema,
    deleteUserSchema,
    getUserByIdSchema,
    getUserByDepartmentSchema
}