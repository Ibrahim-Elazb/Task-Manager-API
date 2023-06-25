const Joi=require("joi")

const newDepartmentSchema={
    body:Joi.object({
        name: Joi.string().required().messages({
            'any.required': 'Department Name is required.',
        })
    })
}

const editDepartmentSchema = {
    body: Joi.object({
        name: Joi.string().required().messages({
            'any.required': 'Department Name is required.',
        })
    }),
    params:Joi.object({
        id:Joi.string().pattern(/^[a-fA-F0-9]{24}$/).required()
    })
}

const deleteDepartmentSchema = {
    params:Joi.object({
        id:Joi.string().pattern(/^[a-fA-F0-9]{24}$/).required()
    })
}

const getDepartmentByIdSchema = {
    params:Joi.object({
        id:Joi.string().pattern(/^[a-fA-F0-9]{24}$/).required()
    })
}

module.exports={
    newDepartmentSchema,
    editDepartmentSchema,
    deleteDepartmentSchema,
    getDepartmentByIdSchema
}