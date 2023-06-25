const indexRouter=require("express").Router()

const departmentRouter=require("./Department.module/Department.router")
const userRouter=require("./User.module/user.router")
const taskRouter=require("./Task.module/task.router")
const commentRouter=require("./Comment.module/Comment.router")
const AuthRouter = require("./Auth.module/Auth.router")
const deleteFile = require("../utils/deleteFile")

indexRouter.use("/department",departmentRouter)
indexRouter.use("/user",userRouter)
indexRouter.use("/task",taskRouter)
indexRouter.use("/comment",commentRouter)
indexRouter.use("/auth", AuthRouter)

// -------------------------------   Not Found Page function -------------------------------------------------
indexRouter.use("*", pageNotFoundHandler)

function pageNotFoundHandler(req, res, next) {

    res.json({ result: "page Not Found" })

    /* For Template Engines */
    // const language = req.cookies.language || "en";
    // const tagline = language !== "ar" ? "Page Not Found" : "الصفحه غير موجوده"
    // res.status(404).render("pages/404", {
    //     tagline,
    //     language
    // })
}

// -------------------------------   Application Error Handler -------------------------------------------------
indexRouter.use(errorHandler)

function errorHandler(customError, request, response, next) {
    if (request.file?.path) {//if there is file uploaded during this request delete it because this request cause error
        deleteFile(request.file.path)
    }

    if (request.files) {//if there are files uploaded during this request delete them becaue this request cause error
        for (let index = 0; index < request.files.length; index++) {
            if (request.files[index].path) {
                deleteFile(request.files[index].path)
            }
        }
    }

    response.status(customError.statusCode || 400)
        .json({ error_message: customError.message || "Invalid Operation" });
}

module.exports=indexRouter;