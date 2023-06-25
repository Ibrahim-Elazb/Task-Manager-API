const HTTPError = require("../../../utils/HTTPError");
const path = require("path")
const deleteFile = require("../../../utils/deleteFile");
const errorHandler = require("../../../utils/errorHandler");

const {
    addCommentToTask,
    updateCommentOfTask,
    deleteCommentOfTask,
    selectCommentsForTask
} = require("./Comment.DAO");
const rootPath = require("../../../utils/rootPath");

const addNewComment_ctrl = async (request, response, next) => {
    try {
        const taskId=request.params.taskId;
        const commentData = request.body;

        let commentFiles = []
        if (request.files?.length > 0) commentFiles = request.files?.map(file => file.filename)

        const createdComment = await addCommentToTask(
            taskId,
            commentData.text,
            commentFiles||[],
            request.userInfo.id,
        )

        if (!createdComment) throw new HTTPError(400, "Unbale to create New Comment");

        response.status(201).json({ message: "Comment added successfully" })
    } catch (error) {
        errorHandler(error.statusCode || 500, error.message || "Error Occurred on server ", next)
    }
}


const deleteComment_ctrl = async (request, response, next) => {
    try {
        const {taskId,commentId} = request.params;

        const deletedComment = await deleteCommentOfTask(
            taskId, 
            commentId, 
            { isAdmin: request.userInfo.role === "admin", userId: request.userInfo.id }
        )

        if (!deletedComment) throw new HTTPError(400, "Unable to delete Comment");

        response.status(201).json({ message: "Comment deleted successfully" })
    } catch (error) {
        errorHandler(error.statusCode || 500, error.message || "Error Occurred on server ", next)
    }
}


const getComments_ctrl = async (request, response, next) => {
    try {
        const { taskId } = request.params;
        const { page }=request.query;

        const deletedComment = await selectCommentsForTask({
            taskId, page
        })

        if (!deletedComment) throw new HTTPError(400, "Unable to delete Comment");

        response.status(201).json({ message: "Comment added successfully" })
    } catch (error) {
        errorHandler(error.statusCode || 500, error.message || "Error Occurred on server ", next)
    }
}


module.exports={
    addNewComment_ctrl,
    deleteComment_ctrl,
    getComments_ctrl
}