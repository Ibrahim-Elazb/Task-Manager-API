//-----------------------------  Department Router and its controller handlers  -----------------------------
const departmentRouter = require("express").Router();
const {
    addNewDepartment,
    editDepartment,
    deleteDepartment,
    getDepartmentById,
    getDepartments
} = require("./Controllers/Department.controllers");

//--------------------------------  Authorization and Validation MiddleWares  --------------------------------
const { isAuthorized, roles } = require("../../middlewares/authentication")
const validation = require("../../middlewares/validation")
const {
    newDepartmentSchema,
    editDepartmentSchema,
    deleteDepartmentSchema,
    getDepartmentByIdSchema
} = require("./Department.validation_schema")


//--------------------------------------------------  Routes  -------------------------------------------------
//New Department
departmentRouter.post("/new",
    isAuthorized([roles.admin]),
    validation(newDepartmentSchema),
    addNewDepartment)

//Edit Department
departmentRouter.patch("/edit/:id",
    isAuthorized([roles.admin]),
    validation(editDepartmentSchema),
    editDepartment)

//Delete Department
departmentRouter.delete("/delete/:id",
    isAuthorized([roles.admin]),
    validation(deleteDepartmentSchema),
    deleteDepartment)

//Get Department Information
departmentRouter.get("/:id",
    isAuthorized([roles.user, roles.manager, roles.admin]),
    validation(getDepartmentByIdSchema),
    getDepartmentById)

//Get All Departments Information
departmentRouter.get("/",
    isAuthorized([roles.user, roles.manager, roles.admin]),
    getDepartments)


module.exports = departmentRouter;