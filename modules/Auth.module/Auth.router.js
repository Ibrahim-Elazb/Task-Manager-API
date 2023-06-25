//------------------------------  Authorization Router and its controller handlers  -----------------------------
const AuthRouter = require("express").Router()
const { emailConfirm, login, resetPassword, forgetPassword } = require("./Controllers/Auth.controllers")

//------------------------------------------  Validation MiddleWares  -------------------------------------------
const validation = require("../../middlewares/validation")
const {
    loginSchema,
    forgetPasswordSchema,
    resetPasswordSchema } = require("./Auth.validationSchema")

//--------------------------------------------------  Routes  ---------------------------------------------------
//Login
AuthRouter.post("/login", validation(loginSchema), login)

//Email Confirm
AuthRouter.get("/confirm-email/:token", emailConfirm)

//Forget Password
AuthRouter.patch("/forget-password", validation(forgetPasswordSchema), forgetPassword)

//Reset Password
AuthRouter.patch("/reset-password", validation(resetPasswordSchema), resetPassword)

module.exports = AuthRouter