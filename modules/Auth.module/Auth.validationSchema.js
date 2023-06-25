const Joi = require("joi")

const loginSchema = {
    body: Joi.object({
        emailAddress: Joi.string().email().required().messages({
            'any.required': 'Email address is required.',
            'string.email': 'Email address must be a valid email.',
        }),
        password: Joi.string().required().messages({
            //You can add pattern to check password against specific pattern
            //.pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/))
            'any.required': 'Password is required.',
        }),
    })
}

const forgetPasswordSchema = {
    body: Joi.object({
        emailAddress: Joi.string().email().required().messages({
            'any.required': 'Email address is required.',
            'string.email': 'Email address must be a valid email.',
        })
    })
}

const resetPasswordSchema = {
    body: Joi.object({
        emailAddress: Joi.string().email().required().messages({
            'any.required': 'Email address is required.',
            'string.email': 'Email address must be a valid email.',
        }),
        password: Joi.string().required().messages({
            //You can add pattern to check password against specific pattern
            //.pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/))
            'any.required': 'Password is required.',
            "string.empty": "You must enter password",
        }),
        confirm_password: Joi.string().valid(Joi.ref("password")).required().messages({
            "any.required": "You must enter Confirm Password",
            "string.empty": "You must enter Confirm password",
            "any.only": "password and confirm password should be the same"
        }),
        resetCode: Joi.number().max(999999).required().messages({
            "any.required": "You must enter reset Code",
            "number.base": "You must enter reset Code",
            "number.max": "Invalid Reset Code"
        })
    })
}




module.exports={
    loginSchema,
    forgetPasswordSchema,
    resetPasswordSchema
}