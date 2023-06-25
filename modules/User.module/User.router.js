const path = require("path")
const rootPath = require("../../utils/rootPath")

//------------------------------  User Router and its controller handlers  ------------------------------
const userRouter = require("express").Router();
const {
    registeration,
    editUserInfo,
    changeUserRole,
    deleteUserInfo,
    getUserInfo,
    getUsersOfDepartment,
    getAllUsersInfo
} = require("./Controllers/User.controllers");

//------------------------------  Authorization and Validation MiddleWares  ------------------------------
const { isAuthorized, roles } = require("../../middlewares/authentication")
const validation = require("../../middlewares/validation")
const {
    newUserSchema,
    editUserSchema,
    editUserRoleSchema,
    deleteUserSchema,
    getUserByIdSchema,
    getUserByDepartmentSchema
} = require("./User.validation_schema")

// ------------------------------  For profile image Upload Handling Using Multer  ------------------------------
const uploadFiles = require("../../services/multer_file-upload")
const userImagesPath = path.join(rootPath, "public", "upload", "images")
const userImagesValidTypes = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp']
const userImageUploadHandling = uploadFiles(userImagesPath, userImagesValidTypes).single("image")//MiddleWare

//--------------------------------------------------  Routes  ---------------------------------------------------
//New User
userRouter.post("/new",
    userImageUploadHandling,
    validation(newUserSchema),
    registeration);

//edit User Info
userRouter.patch("/edit/:id",
    isAuthorized([roles.user, roles.manager, roles.admin]),
    userImageUploadHandling,
    validation(editUserSchema),
    editUserInfo)

//change User role
userRouter.put("/edit-role/:id",
    isAuthorized([roles.admin]),
    validation(editUserRoleSchema),
    changeUserRole)

// Delete User Account
userRouter.delete("/delete/:id",
    isAuthorized([roles.user, roles.manager, roles.admin]),
    validation(deleteUserSchema),
    deleteUserInfo)

// Get information of all users of department
userRouter.get("/department/:department_id",
    isAuthorized([roles.manager, roles.admin]),
    validation(getUserByDepartmentSchema),
    getUsersOfDepartment)

// get information of specific user
userRouter.get("/:id",
    isAuthorized([roles.user, roles.manager, roles.admin]),
    validation(getUserByIdSchema),
    getUserInfo)

// get Information of All System Users
userRouter.get("/",
    isAuthorized([roles.admin]),
    getAllUsersInfo)

module.exports = userRouter;