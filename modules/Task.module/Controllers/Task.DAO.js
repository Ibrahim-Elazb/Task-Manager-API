const HTTPError = require("../../../utils/HTTPError");

const Task = require("../../../models/Task.model");

// Function to add a new task
async function addTask(taskData) {
    try {
        // Check if the dueDate is before today
        const currentDate = new Date();
        if (taskData.dueDate && taskData.dueDate < currentDate) {
            throw new Error('Due date cannot be before today');
        }


        // Create the new task object
        const newTask = new Task({
            title: taskData.title,
            description: taskData.description,
            dueDate: taskData.dueDate || new Date(),
            priority: taskData.priority,
            status: taskData.status,
            parentTask: taskData.parentTask || null,
            waitingTasks: taskData.waitingTasks || [],
            files: taskData.files || [],
            assignedUsers: taskData.assignedUsers || [],
            createdBy: taskData.createdBy,
            labels: taskData.labels || [],
        });

        // Save the new task to the database
        const savedTask = await newTask.save();
        if (savedTask?.parentTask) {
            const parentTask = await Task.findById(savedTask.parentTask)
            if (parentTask) {
                parentTask.subtasks.push(savedTask._id)
                if (parentTask.status === "Completed") parentTask.status = 'In Progress'
                await parentTask.save()
            }
        }

        if (savedTask?.waitingTasks?.length > 0) {
            await Task.updateMany(
                { _id: { $in: savedTask?.waitingTasks } },
                { $push: { waitingForTasks: savedTask._id } }
            );
        }
        return savedTask;
    } catch (error) {
        throw error;
    }
}

async function isTaskDependenciesCompleted(taskDependencies) {
    // Check if the task has dependencies that are not finished yet
    let dependenciesCompleted = false;
    const dependencyTasks = await Task.find({ _id: { $in: taskDependencies }, status: { $ne: 'Completed' } });
    if (dependencyTasks.length === 0 || dependencyTasks.every(task => task.status === 'Completed')) {
        dependenciesCompleted = true;
    }
    return dependenciesCompleted
}

// Function to update task information by ID
async function updateTask(taskId, updateData, { isAdmin = false, userId = null }) {

    const currentTask = await Task.findById(taskId);
    
    //If There is no task with this ID
    if (!currentTask) {
        throw new HTTPError(404, "Not Found Task");
    }

    //If you aren't admin && it's not created by this userID
    if (!isAdmin && currentTask.createdBy != userId) {
        throw new HTTPError(403, "You are not authorized to edit this task.");
    }

    //If this task will be waiting for task which is waiting for it
    if (updateData?.waitingTasks.length > 0 && updateData?.waitingTasks?.every(item => currentTask.waitingForTasks.includes(item))) {
        throw new HTTPError(400, "This task can't be Waiting for another task and the other task is also Waiting for it (Deadlock Problem)");
    }

    //task can't set parent task which is subtask for this task
    const validParent = await isValidParent(currentTask, updateData?.parentTask);
    if (updateData?.parentTask && updateData?.parentTask != currentTask?.parentTask && !validParent) {
        throw new HTTPError(400, "Invalid Parent that this parent is subtask of this task");
    }

    console.log("updateData.parentTask from DAO: "+updateData.parentTask)

    const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, { new: true });

    //When change the parent Task of this task
    if (updatedTask?.parentTask != currentTask?.parentTask) {
        //old Parent Should remove updated task ID its subtasks after changing parent
        if (currentTask.parentTask) {
            const parentTask = await Task.findById(currentTask.parentTask)
            if (parentTask) {
                parentTask.subtasks = parentTask.subtasks?.filter(item => item !== taskId)
                await parentTask.save()
            }
        }
        //New Parent Should add updated task ID its subtasks after changing parent
        if (updatedTask?.parentTask) {
            const parentTask = await Task.findById(updatedTask.parentTask)
            if (parentTask) {
                parentTask.subtasks.push(updatedTask._id)
                if (parentTask.status === "Completed" && updatedTask.status !== "Completed")
                    parentTask.status = 'In Progress'
                await parentTask.save()
            }
        }
    }

    const removedFromWaitingTasks = currentTask?.waitingTasks?.filter(item => !updatedTask?.waitingTasks?.includes(item)) || [];
    const addedToWaitingTasks = updatedTask?.waitingTasks?.filter(item => !currentTask?.waitingTasks?.includes(item)) || [];

    if (removedFromWaitingTasks?.length > 0) {
        await Task.updateMany(
            { _id: { $in: removedFromWaitingTasks } },
            { $pull: { waitingForTasks: currentTask._id } }
        );
    }

    if (addedToWaitingTasks?.length > 0) {
        await Task.updateMany(
            { _id: { $in: addedToWaitingTasks } },
            { $push: { waitingForTasks: currentTask._id } }
        );
    }

    return { currentTask, updatedTask };
}

async function isValidParent(task, parentId) {

    //if no subtask it will be valid parent
    if (task.subtasks.length === 0) return true

    //if any of subtasks ID is like new parent so it won't be valid parent
    if (task.subtasks.some(subtaskId => {
        return parentId == subtaskId
    })) return false;


    if (task.subtasks.some(async (subtaskId) => {
        const subtaskDetails = await Task.findById(subtaskId)
        return !isValidParent(subtaskDetails, parentId)
    })) return false

    return true;
}

// Function to delete task by ID
async function deleteTask(taskId, recursively = false, { isAdmin = false, userId = null }) {

    let filesOfDeletedTasks = []
    const currentTask = await Task.findById(taskId);
    //If There is no task with this ID
    if (!currentTask) {
        throw new HTTPError(404, "Not Found Task");
    }
    //If you aren't admin && it's not created by this userID
    if (!isAdmin && currentTask.createdBy != userId) {
        throw new HTTPError(403, "You are not authorized to delete this task.");
    }

    const deletedTask = await Task.findByIdAndRemove(taskId);
    if (!deletedTask) throw new HTTPError(400, "Failed To delete Task")

    filesOfDeletedTasks = deletedTask.files || []
    if (recursively) {
        const otherDeletedfiles = await deleteSubtasks(deletedTask.subtasks)
        filesOfDeletedTasks = [...filesOfDeletedTasks, ...otherDeletedfiles]
    } else {
        await Task.updateMany({ _id: { $in: deletedTask.subtasks } }, { parentTask: null })
    }

    //remove from this task from subtasks of its parent
    if (deletedTask?.parentTask) {
        const parentTask = await Task.findByIdAndUpdate(deletedTask.parentTask,
            { $pull: { subtasks: deletedTask._id } })
        const subtasksOfParent = await Task.find({ _id: { $in: parentTask?.subtasks } })
        if (subtasksOfParent.every(task => task.status === "Completed")) parentTask.status = "Completed"
        await parentTask?.save()
        /*
        const parentTask = await Task.findById(deletedTask?.parentTask)
        parentTask.subtasks = parentTask.subtasks?.filter(item => item !== taskId)
        const subtasks = await Task.find({ _id: { $in: parentTask.subtasks }})
        if (subtasks.every(task => task.status === "Completed")) parentTask.status = "Completed"
        await parentTask.save()
        */
    }
    //remove this task from list of "Waiting for" of tasks which are waiting for it
    if (deletedTask?.waitingTasks?.length > 0) {
        await Task.updateMany(
            { _id: { $in: deletedTask?.waitingTasks } },
            { $pull: { waitingForTasks: deletedTask._id } }
        );
    }

    return filesOfDeletedTasks;
}

async function deleteSubtasks(subtasks) {
    let files = []
    if (subtasks.length === 0) return
    subtasks.forEach(async (taskId) => {
        const task = await Task.findById(taskId)
        const subtaskFiles = await deleteSubtasks(task?.subtasks)
        files = files.concat(subtaskFiles)
    })
    const tasksToDelete = await Task.find({ _id: { $in: subtasks } });

    const deleteResult = await Task.deleteMany({ _id: { $in: subtasks } })
    files = tasksToDelete.flatMap(item => item.files)
    return files
}

// Function to search for some of my tasks
async function searchForTasks(
    { title = "", description = "", label = "", status = "", priority = "",
        dueDate_from = new Date("1970-01-01"),
        dueDate_to = new Date("2100-12-31"),
        createdAt_from = new Date("1970-01-01"),
        createdAt_to = new Date(),
        pageNumber = 1, ascending = true },

    { isAdmin = false, userId = null }) {
    try {
        const query = {
            $and: [
                { title: { $regex: new RegExp(title, "i") } },
                { title: { $regex: new RegExp(title, "i") } },
                { description: { $regex: new RegExp(description, "i") } },
                { status: { $regex: new RegExp(status, "i") } },
                { priority: { $regex: new RegExp(priority, "i") } },
                { labels: { $in: [label] } },
                { dueDate: { $gte: dueDate_from } },
                { dueDate: { $lte: dueDate_to } },
                { createdAt: { $gte: createdAt_from } },
                { createdAt: { $lte: createdAt_to } },
            ]
        }

        if (!isAdmin) {
            query.$and.unshift({
                $or: [
                    { assignedUsers: { $in: [userId] } },
                    { createdBy: userId }
                ]
            });
        }

        const pageSize = 10;  // The number of documents per page
        const skipCount = (pageNumber - 1) * pageSize;
        const sortOrder = ascending ? 1 : -1;
        const tasks = await Task.find(query).sort({ dueDate: sortOrder }).skip(skipCount).limit(pageSize);
        // Count the total number of documents
        const totalCount = await Task.countDocuments();
        // Calculate the total number of pages
        const totalPages = Math.ceil(totalCount / pageSize);

        return { tasks, totalPages };
    } catch (error) {
        throw error;
    }
}

// Function to get all tasks sorted by dueDate Deadline in ascending or descending order
async function getAllTasksSortedByDueDate({ isAdmin = false, userId = null }, pageNumber = 1, ascending = true) {
    try {
        const query = {}
        if (!isAdmin) {
            query.$or = [
                { assignedUsers: { $in: [userId] } },
                { createdBy: userId }
            ]
        }
        const pageSize = 10;  // The number of documents per page
        const skipCount = (pageNumber - 1) * pageSize;
        const sortOrder = ascending ? 1 : -1;
        const tasks = await Task.find(query).sort({ dueDate: sortOrder }).skip(skipCount).limit(pageSize);
        // Count the total number of documents
        const totalCount = await Task.countDocuments();
        // Calculate the total number of pages
        const totalPages = Math.ceil(totalCount / pageSize);

        return { tasks, totalPages };
    } catch (error) {
        throw error;
    }
}

// Function to get all tasks sorted by creation time in ascending or descending order
async function getAllTasksSortedByCreatedAt({ isAdmin = false, userId = null }, pageNumber = 1, ascending = true) {
    try {
        const pageSize = 10;  // The number of documents per page
        const skipCount = (pageNumber - 1) * pageSize;
        const sortOrder = ascending ? 1 : -1;
        const query = {}
        if (!isAdmin) {
            query.$or = [
                { assignedUsers: { $in: [userId] } },
                { createdBy: userId }
            ]
        }
        const tasks = await Task.find(query).sort({ createdAt: sortOrder }).skip(skipCount).limit(pageSize);

        // Count the total number of documents
        const totalCount = await Task.countDocuments();
        // Calculate the total number of pages
        const totalPages = Math.ceil(totalCount / pageSize);

        return { tasks, totalPages };
    } catch (error) {
        throw error;
    }
}

// Function to get all tasks
async function getAllTasks({ isAdmin = false, userId = null }, pageNumber = 1, ascending = true) {
    try {
        const pageSize = 10;  // The number of documents per page
        const skipCount = (pageNumber - 1) * pageSize;
        const sortOrder = ascending ? 1 : -1;
        const query = {}
        if (!isAdmin) {
            query.$or = [
                { assignedUsers: { $in: [userId] } },
                { createdBy: userId }
            ]
        }
        const tasks = await Task.find(query).sort({ createdAt: sortOrder }).skip(skipCount).limit(pageSize);;

        // Count the total number of documents
        const totalCount = await Task.countDocuments();
        // Calculate the total number of pages
        const totalPages = Math.ceil(totalCount / pageSize);

        return { tasks, totalPages };
    } catch (error) {
        throw error;
    }
}

// Function to get a task by its ID
async function getTaskById(taskId, { isAdmin = false, userId = null }) {
    try {
        const commentsPageSize = 5;
        const task = await Task.findById(taskId)
            .populate({
                path: "subtasks waitingTasks waitingForTasks",
                select: "title",
            })
            .populate({
                path: "createdBy assignedUsers",
                select: "firstName lastName image",
            })
            .populate({
                path: "comments",
                select: "text files writtenBy",
                populate: {
                    path: "writtenBy",
                    select: "firstName lastName image",
                },
                options: {
                    sort: { createdAt: 1 },
                    skip: 0,
                    limit: commentsPageSize
                    ,
                },
            });

        if (!isAdmin && task?.createdBy._id != userId) {
            throw new HTTPError(403, "You are not authorized to read about this task.");
        }

        return task
    } catch (error) {
        throw error;
    }
}





module.exports = {
    addTask,
    isTaskDependenciesCompleted,
    updateTask,
    deleteTask,
    searchForTasks,
    getAllTasks,
    getAllTasksSortedByCreatedAt,
    getAllTasksSortedByDueDate,
    getTaskById
};
