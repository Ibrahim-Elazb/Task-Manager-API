const HTTPError=require("../../../utils/HTTPError");
const path=require("path")
const deleteFile = require("../../../utils/deleteFile");
const errorHandler = require("../../../utils/errorHandler");

const {
    addTask,
    isTaskDependenciesCompleted,
    updateTask,
    deleteTask,
    getAllTasks,
    getAllTasksSortedByCreatedAt,
    getAllTasksSortedByDueDate,
    getTaskById,
    searchForTasks
}=require("./Task.DAO");
const rootPath = require("../../../utils/rootPath");


const addNewTask_ctrl = async (request, response, next) => {
    try {
        const taskData = request.body;
        /*{title: "",description: "",dueDate: "",priority: "",status: "",dependency: [],comments: [],files: [],parentTask: "",subtasks: [],assignedUsers: [],createdBy: "",labels: []}*/

        if (taskData?.assignedUsers?.length>0&&request.userInfo?.role==="user")
            throw new HTTPError(403,"only Managers and admin can assign tasks")

        let taskFiles=[]
        if(request.files?.length>0)taskFiles=request.files?.map(file=>file.filename)

        // taskData.status = 'In Progress';
        // if (taskData.dependency?.length>0){
        //     const creatorTasks=await getMyAllTasks(taskData.createdBy)
        //     const allDependenciesPartOfHisTasks = taskData.dependency.every(
        //         dependencyId => creatorTasks.some(task => task._id === dependencyId)
        //         );
        //     if(!allDependenciesPartOfHisTasks) throw new HTTPError(400,"invalid Dependencies")

        //     // Check if status of objects with matching ids is "completed"
        //     const dependenciesCompleted = taskData.dependency.every(
        //         dependencyId => creatorTasks.find(task => task._id === dependencyId)?.status === "Completed");
        //     if(!dependenciesCompleted){
        //         taskData.status = 'To Do'
        //     }else{
        //         taskData.status = 'In Progress';
        //     }
        // }
        taskData.status = await isTaskDependenciesCompleted(taskData.waitingTasks) ? 'In Progress' : 'To Do'

        const createdTask = await addTask({ 
        title: taskData.title,
        description: taskData.description, 
        dueDate: new Date(taskData.dueDate),
        priority: taskData.priority, 
        status: taskData.status, 
        waitingTasks: taskData.waitingTasks, 
        files: taskFiles, 
        parentTask: taskData.parentTask, 
        assignedUsers: taskData.assignedUsers, 
        createdBy: request.userInfo.id, 
        labels: taskData.labels })

        if (!createdTask) throw new HTTPError(400, "Unbale to create New Task");

        response.status(201).json({ message: " New Task created successfully" })
    } catch (error) {
            errorHandler(error.statusCode||500,error.message||"Error Occurred on server ",next)
    }
}

const editTask_ctrl = async (request, response, next) => {
    try {
        const taskId=request.params.id;
        const taskData = request.body;
        /*{title: "",description: "",dueDate: "",priority: "",status: "",dependency: [],comments: [],files: [],parentTask: "",subtasks: [],assignedUsers: [],createdBy: "",labels: []}*/

        if (taskData.assignedUsers?.length > 0 && request.userInfo?.role === "user")
            throw new HTTPError(403, "only Managers and admin can assign tasks")

        taskData.status = await isTaskDependenciesCompleted(taskData.waitingTasks) ? 'In Progress' : 'To Do'
        
        let taskFiles = []
        if (request.files?.length > 0) taskFiles = request.files?.map(file => file.filename)
        taskFiles = [...taskFiles, ...(taskData.remainingFiles||[])]

        const { currentTask, updatedTask } = await updateTask(taskId,{
            title: taskData.title,
            description: taskData.description,
            dueDate: taskData.dueDate,
            priority: taskData.priority,
            status: taskData.status,
            waitingTasks: taskData.waitingTasks||[], //If it's not sent remove the exist ones
            files: taskFiles||[],
            parentTask: taskData.parentTask || null,
            assignedUsers: taskData.assignedUsers||[],
            labels: taskData.labels||[]
        }, { isAdmin: request.userInfo.role === "admin", userId:request.userInfo.id })

        if (!updatedTask) throw new HTTPError(400, "Unable to update This Task");

        //reomve files not exist in updated version of task
        currentTask.files.forEach(file=>{
            if(!updatedTask.files.includes(file))
                deleteFile(path.join(rootPath, "public", "upload", "files", file))
        })

        response.status(201).json({ message: " Task Updated successfully" })
    } catch (error) {
        errorHandler(error.statusCode || 500, error.message || "Error Occurred on server ",next)
    }
}

const deleteTask_ctrl = async (request, response, next) => {
    try {
        const taskId=request.params.id;
        const recursively = request.query.recursively||false;

        const filesOfDeletedTasks = await deleteTask(taskId, recursively,{ isAdmin: request.userInfo.role === "admin", userId:request.userInfo.id })

        if (!filesOfDeletedTasks) throw new HTTPError(400, "Unable to delete This Task");
        if (filesOfDeletedTasks?.length>0){
            filesOfDeletedTasks?.forEach(file=>deleteFile(path.join(rootPath,"public","upload","files",file)))
        }

        response.status(201).json({ message: " Task deleted successfully" })
    } catch (error) {
        errorHandler(error.statusCode || 500, error.message || "Error Occurred on server ",next)
    }
}

const getTaskById_ctrl = async (request, response, next) => {
    try{
        const id=request.params.id;
        const foundTask = await getTaskById(id, { isAdmin: request.userInfo.role === "admin", userId: request.userInfo.id })
        if(!foundTask) throw new HTTPError(400,"Not Found Task")
            // Replace image value in createdBy field
            if (foundTask.createdBy && foundTask.createdBy.image) {
                foundTask.createdBy.image = `${request.protocol}://${request.hostname}:${process.env.PORT}/upload/images/${foundTask.createdBy.image}`;
            } else {
                foundTask.createdBy.image = `${request.protocol}://${request.hostname}:${process.env.PORT}/upload/images/not-found-profile-image.jpeg`;
            }

            // Replace image value in assignedUsers field
            foundTask.assignedUsers.forEach((user) => {
                if (user.image) {
                    user.image = `${request.protocol}://${request.hostname}:${process.env.PORT}/upload/images/${user.image}`;
                } else {
                    user.image = `${request.protocol}://${request.hostname}:${process.env.PORT}/upload/images/not-found-profile-image.jpeg`;
                }
            });

            foundTask.files.forEach((file) => {
                return { fileName: file, url: `${request.protocol}://${request.hostname}:${process.env.PORT}/upload/files/${file}`}
            });

        foundTask.comments.forEach((comment) => {
            comment.files?.forEach((file) => {
                return { fileName: file, url: `${request.protocol}://${request.hostname}:${process.env.PORT}/upload/files/${file}` }
            })

            if (comment.writtenBy?.image) {
                comment.writtenBy.image = `${request.protocol}://${request.hostname}:${process.env.PORT}/upload/images/${comment.writtenBy.image}`;
            } else {
                comment.writtenBy.image = `${request.protocol}://${request.hostname}:${process.env.PORT}/upload/images/not-found-profile-image.jpeg`;
            }
        });

        response.status(200).json(foundTask)
    } catch (error) {
        errorHandler(error.statusCode || 500, error.message || "Error Occurred on server ", next)
    }
}

const getTasks_ctrl = async (request, response, next)=>{
try{
    const { sort="", ascending=true,page=1 }=request.query
    let result;
    if(sort==="due-date"){
        result=await getAllTasksSortedByDueDate({ isAdmin: request.userInfo.role === "admin", userId: request.userInfo.id },page,ascending)
    } else if (sort === "created-at") {
        result = await getAllTasksSortedByCreatedAt({ isAdmin: request.userInfo.role === "admin", userId: request.userInfo.id }, page, ascending)
    }else{
        result = await getAllTasks({ isAdmin: request.userInfo.role === "admin", userId: request.userInfo.id }, page, ascending)
    }
    result.tasks.forEach(task => {
        if (task.files.length>0)
            task.files=task.files.map(file => `${request.protocol}://${request.hostname}:${process.env.PORT}/upload/files/${file}`)
        })

    response.status(200).json({ tasks:result.tasks, totalPages:result.totalPages })
} catch (error) {
    errorHandler(error.statusCode || 500, error.message || "Error Occurred on server ", next)
}
}

const searchTasks_ctrl = async (request, response, next)=>{
try{
    const query=request.query
    const result = await searchForTasks(query, { isAdmin: request.userInfo.role === "admin", userId: request.userInfo.id })
    result.tasks.forEach(task => {
        if (task.files.length>0)
            task.files=task.files.map(file => `${request.protocol}://${request.hostname}:${process.env.PORT}/upload/files/${file}`)
        })

    response.status(200).json({ tasks:result.tasks, totalPages:result.totalPages })
} catch (error) {
    errorHandler(error.statusCode || 500, error.message || "Error Occurred on server ", next)
}
}

module.exports={
    addNewTask_ctrl,
    editTask_ctrl,
    deleteTask_ctrl,
    getTasks_ctrl,
    searchTasks_ctrl,
    getTaskById_ctrl
}