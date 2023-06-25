const commentRouter = require("express").Router();
const path = require("path")
const rootPath = require("../../utils/rootPath")

const {
    addNewComment_ctrl,
    deleteComment_ctrl,
    getComments_ctrl
} = require("./Controllers/Comment.controllers");
// //------------------------------  Authorization and Validation MiddleWares  ------------------------------
const { isAuthorized, roles } = require("../../middlewares/authentication")
const validation = require("../../middlewares/validation")
const {
    newCommentSchema,
    deleteCommentSchema,
    getCommentsSchema
} = require("./Comment.validation_schema")

// // ------------------------------  For profile image Upload Handling Using Multer  ------------------------------
const uploadFiles = require("../../services/multer_file-upload");
const commentFilesPath = path.join(rootPath, "public", "upload", "files")
const commentFilesValidTypes = []
const commentFilesUploadHandling = uploadFiles(commentFilesPath, commentFilesValidTypes).array("files", 10);//MiddleWare

//--------------------------------------------------  Routes  ---------------------------------------------------
//New Comment
commentRouter.post("/new/:taskId",
    isAuthorized([roles.user, roles.manager, roles.admin]),
    commentFilesUploadHandling,
    validation(newCommentSchema),
    addNewComment_ctrl)

//Delete Comment
commentRouter.delete("/delete/:taskId/:commentId",
    isAuthorized([roles.user, roles.manager, roles.admin]),
    validation(deleteCommentSchema),
    deleteComment_ctrl)

// Get Comments
commentRouter.get("/:taskId/", 
    isAuthorized([roles.user, roles.manager, roles.admin]), 
    validation(getCommentsSchema),
    getComments_ctrl)

    
module.exports = commentRouter;