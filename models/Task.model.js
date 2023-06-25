// Task Model
const mongoose = require('mongoose');
const { commentSchema }=require("./Comment.model")
const User=require("./User.model")

const taskSchema = new mongoose.Schema({
    title: { //title of the task
        type: String,
        required: true
    },
    description: { // description for the task
        type: String,
        required: true
    },
    dueDate: { //deadline of the task
        type: Date,
        required: true
    },
    priority: { //periority of the task
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium'
    },
    waitingForTasks: [{//An array of task IDs that are waiting for the completion of this Task
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        spare:true
    }],
    waitingTasks: [{ //An array of task IDs that this Task is waiting for before it can be executed or completed.
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        default:[]
    }],
    status: { 
        /* status is 'To Do' when the waitingTasks has uncompleted tasks & 'In Progress' when all tasks in its "waitingTasks" are "Completed"*/
        type: String,
        enum: ['To Do', 'In Progress', 'Completed'],
        default: 'To Do'
    },
    comments: [{ 
        type:commentSchema,
        default:[]
    }],//comments to the task
    files: [{
        type: String
        , default:[]
    }],
    parentTask: { //parent task which is complete when all its subtasks are in status "Completed"
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        default: null
    },
    subtasks: [{  // tasks which are the build of this task
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        default:[]
    }],
    assignedUsers: [{//users who this task is assigned to
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default:[]
    }],
    createdBy: { //the user who created the task
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    labels: [{ //labels help in searching for this task
        type: String,
        default:[]
    }],
    createdAt: { //time of creation of the task
        type: Date,
        required: true,
        default: Date.now,
    },
});

//check if entered User ID and Task IDs for this Task is exist in department collection
taskSchema.pre('validate', async function (next) {

    if(this.assignedUsers.length > 0 || this.createdBy){
        const userIds = this.assignedUsers.concat(this.createdBy ? [this.createdBy] : [])
        // const usersExist  = await User.exists({ _id: { $in: userIds } });
        const usersExist = await User.countDocuments({ _id: { $in: userIds } });

        if (userIds.length !== usersExist) {
            this.invalidate('Invalid User ID', 'Assigned user(s) do not exist');
        }
    }

    if (this.waitingForTasks.length > 0 || this.waitingTasks.length > 0 || this.subtasks.length > 0 || this.parentTask){
        // const tasksExist = await Task.exists({ _id: { $in: this.waitingForTasks.concat(this.waitingTasks, this.parentTask ? [this.parentTask]:[], this.subtasks) } });
        console.log("this.waitingForTasks: "+this.waitingForTasks)
        console.log("this.waitingTasks: " +this.waitingTasks)
        console.log("this.subtasks: " +this.subtasks)
        console.log("this.parentTask: " +this.parentTask)

        
        const taskIds = this.waitingForTasks.concat(this.waitingTasks, this.parentTask ? [this.parentTask] : [], this.subtasks);
        const tasksExist = await Task.countDocuments({ _id: { $in: taskIds } });

        if (taskIds.length !== tasksExist) {
            this.invalidate('Invalid Task ID', 'Invalid task ID(s) in waitingForTasks, waitingTasks, parentTask, subtasks');
        }
    }

    next();
});


const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
