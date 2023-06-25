const path=require("path")
const rootPath = require("../../../utils/rootPath")
const deleteFile = require("../../../utils/deleteFile");
const HTTPError = require("../../../utils/HTTPError");
const Task = require(`${rootPath}/models/Task.model`);

// Function to add a new comment to a task
async function addCommentToTask(taskId, text, files, writtenBy) {

    try {
        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            {
                $push: {
                    comments: {
                        text,
                        files,
                        writtenBy
                    }
                }
            },
            { new: true }
        );

        return updatedTask;
    } catch (error) {
        throw error;
    }
}

// Function to update a comment by ID for a specific task
async function updateCommentOfTask(taskId, commentId, updateData) {
    try {
        // Find the task by its ID
        const task = await Task.findById(taskId);

        // Find the comment by its ID within the task's comments array
        const comment = task.comments.id(commentId);

        if (!comment) {
            throw new Error('Comment not found');
        }

        comment.files.forEach(fileName => {
            deleteFile(path.join(rootPath,"public","upload","files",fileName))
        });

        // Update the comment with the provided data
        comment.set(updateData);

        // Save the updated task
        await task.save();

        return comment;
    } catch (error) {
        throw error;
    }
}

// Function to delete a comment by ID for a specific task
async function deleteCommentOfTask(taskId, commentId, { isAdmin, userId=null }) {
    try {
        const task = await Task.findById(taskId);
        const foundComment = task.comments.find(comment=>comment._id==commentId);

        if (!foundComment) {
            throw new Error('Comment not found');
        }

        //If you aren't admin && it's not created by this userID
        if (!isAdmin && foundComment.writtenBy != userId) {
            throw new HTTPError(403, "You are not authorized to delete this Comment.");
        }

        foundComment.files.forEach(fileName => {
            deleteFile(path.join(rootPath, "public", "upload", "files", fileName))
        });

        task.comments = task.comments.filter(comment=>comment._id!=foundComment._id)
        const updatedTask = await task.save();

        // const updatedTask = await Task.findByIdAndUpdate(
        //     taskId,
        //     {
        //         $pull: {
        //             comments: {
        //                 _id: commentId
        //             }
        //         }
        //     },
        //     { new: true }
        // );

        return updatedTask
    } catch (error) {
        throw error;
    }
}

// Function to sekect comments of Task
async function selectCommentsForTask(taskId,pageNumber) {
    const pageSize=5;
    try {
        // Find the task by its ID and populate the comments field, sorted by the 'at' field in ascending order
        const task = await Task.findById(taskId)
            .populate({
                path: "comments",
                options: {
                    sort: { createdAt: 1 },
                    skip: (pageNumber - 1) * pageSize,
                    limit: pageSize,
                },
            });

        return task.comments;
    } catch (error) {
        throw error;
    }
}


module.exports = {
    addCommentToTask,
    updateCommentOfTask,
    deleteCommentOfTask,
    selectCommentsForTask
};
