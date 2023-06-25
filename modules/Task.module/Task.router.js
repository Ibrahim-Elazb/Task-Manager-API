const path = require("path")
const rootPath = require("../../utils/rootPath")

const taskRouter=require("express").Router();
const {
    addNewTask_ctrl,
    editTask_ctrl,
    deleteTask_ctrl,
    getTasks_ctrl,
    searchTasks_ctrl,
    getTaskById_ctrl
} = require("./Controllers/Task.controllers");

// //------------------------------  Authorization and Validation MiddleWares  ------------------------------
const { isAuthorized, roles } = require("../../middlewares/authentication")
const validation = require("../../middlewares/validation")
const {
    newTaskSchema,
    editTaskSchema,
    deleteTaskSchema,
    getTaskByIdSchema,
    getTasksSchema,
    searchForTasksSchema
} = require("./Task.validation_schema")

// // ------------------------------  For profile image Upload Handling Using Multer  ------------------------------
const uploadFiles = require("../../services/multer_file-upload");
const taskFilesPath = path.join(rootPath, "public", "upload", "files")
const taskFilesValidTypes = []
const taskFilesUploadHandling = uploadFiles(taskFilesPath, taskFilesValidTypes).array("files", 10);//MiddleWare

//--------------------------------------------------  Routes  ---------------------------------------------------
//New Task
taskRouter.post("/new",
    isAuthorized([roles.user, roles.manager, roles.admin]),
    taskFilesUploadHandling,
    validation(newTaskSchema),
    addNewTask_ctrl)

//Edit Task
taskRouter.patch("/edit/:id",
    isAuthorized([roles.user, roles.manager, roles.admin]),
    taskFilesUploadHandling,
    validation(editTaskSchema),
    editTask_ctrl)

//Delete Task
taskRouter.delete("/delete/:id",
    isAuthorized([roles.user, roles.manager, roles.admin]),
    validation(deleteTaskSchema),
    deleteTask_ctrl)

// Search Tasks
taskRouter.get("/search", 
    isAuthorized([roles.user, roles.manager, roles.admin]),
    validation(searchForTasksSchema),
    searchTasks_ctrl)

// Get Task By ID
taskRouter.get("/:id", 
    isAuthorized([roles.user, roles.manager, roles.admin]),
    validation(getTaskByIdSchema),
    getTaskById_ctrl)

// Get Tasks
taskRouter.get("/", 
    isAuthorized([roles.user, roles.manager, roles.admin]),
    validation(getTasksSchema),
    getTasks_ctrl)



module.exports=taskRouter;