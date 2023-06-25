const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const HttpError = require("../../../utils/HTTPError");
const {htmlEmailConfirmationMsg,sendEmail} = require("../../../services/SendEmail");
const { getUserByEmail, setEmailConfirm, getUserByID, changePassword, setResetPasswordCode } = require("./Auth.DAO");


const login = async (request, response, next) => {
    try {
        const { emailAddress, password } = request.body;
        const foundUser = await getUserByEmail(emailAddress);

        if (!foundUser) throw new HttpError(400, "Email or password is wrong");
        if (!foundUser.confirmEmail) //Need Mail Confirmation After Registeration and Before Login
            throw new HttpError(400, "Please, Confirm Your Email by the link which we sent to your email")

        const isMatched = await bcrypt.compare(password, foundUser.password)
        if (!isMatched) throw new HttpError(400, "Email or password is wrong")
        const token = jwt.sign({
            id: foundUser._id,
            name: `${foundUser.firstName} ${foundUser.lastName}`,
            email: foundUser.emailAddress,
            role: foundUser.role
        }, process.env.LOGIN_TOKEN_SECRET || "<Enter the Token Secret key>", { expiresIn: "24h" })
        response.status(200).json({
            id: foundUser._id,
            name: `${foundUser.firstName} ${foundUser.lastName}`,
            email: foundUser.emailAddress,
            role: foundUser.role,
            image: `${request.protocol}://${request.hostname}:${process.env.PORT}/public/upload/images/${foundUser.image || "not-found-profile-image.jpeg"}`,
            token
        });
    } catch (error) {
        console.log(error)
        next(new HttpError(error.statusCode || 500, error.message || "System Problem, Please try later"))
    }
}

const emailConfirm = async (request, response, next) => {
    const {token} = request.params;
    try {
        const tokenPayload = await jwt.verify(token, process.env.CONFIRM_EMAIL_TOKEN_SECRET || "<Enter Confirm Email Token Secret>");
        const result = await setEmailConfirm(tokenPayload.id)
        if (result) {
            response.status(201).json({ message: "Email Confirmed" })
        } else {
            next(new HttpError(400, "Invalid Email Confirmation Link"))
        }

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            expiredTokenHandler(token,request)
            response.status(200).json({ message: "this email confirmation link is expired, another confirmation link will be sent to your email" })
        } else {
            console.log(error)
            // next(new HttpError(400, "Invalid Email Confirmation Link"))
            next(new HttpError(error.statusCode || 500, error.message || "System Problem, Please try later"))
        }
    }
}

const expiredTokenHandler = async (token, request) => {
    try {
        const tokenPayload = jwt.verify(token, process.env.CONFIRM_EMAIL_TOKEN_SECRET || "<Enter Confirm Email Token Secret>", { ignoreExpiration: true });
        const foundUser = await getUserByID(tokenPayload.id)
        if (foundUser?.confirmEmail)
            throw new HttpError(400, "You account email is already confirmed");
        const newToken = jwt.sign({ id: tokenPayload.id, userName: tokenPayload.name, email: tokenPayload.email },
            process.env.CONFIRM_EMAIL_TOKEN_SECRET || "<Enter Confirm Email Token Secret>", { expiresIn: "1h" })
        const confirmationURL = `${request.protocol}://${request.hostname}:${process.env.PORT}/api/v1/auth/confirm-email/${newToken}`
        const message = htmlEmailConfirmationMsg(
            {
                user_name: `${foundUser?.firstName} ${foundUser?.lastName}`,
                verification_URL: confirmationURL,
                host_name: request.hostname,
                msg_header: "Email Confirmation",
                msg_textContent: `Thank you for registering on our website <span style="font-weight:bold;font-size:1.1rem;">${request.hostname}</span>. To complete your registration, please click the button below to verify your email address:`,
                msg_hint: ` <p>If you did not register on our website, please ignore this email.</p>`
            })

        //"ibrahimElazb2010@gmail.com" will be replaced by createdUser.emailAddress
        await sendEmail("ibrahimElazb2010@gmail.com", `Confirmation Email from ${request.hostname}`, message)
    } catch (error) {
        console.log(error)
        throw new HttpError(error.statusCode || 500, error.message || "System Problem, Please try later")
    }
}

const resetPassword = async (request, response, next) => {
    const { emailAddress, password, resetCode } = request.body;
    try {
        const foundUser = await getUserByEmail(emailAddress);
        if (!foundUser) {
            throw new HttpError(400, "This email isn't exist")
        }

        if (foundUser.resetPasswordCode === resetCode) {
            const hashedPassword = await bcrypt.hash(password, +process.env.HASH_SALT||12);
            await changePassword(emailAddress,hashedPassword)
            response.status(201).json({ message: "password updated successfully" })
        } else {
            next(new HttpError(400, "Invalid Password Reset Code"))
        }
    } catch (error) {
        next(new HttpError(error.statusCode || 500, error.message || "An Error Occured On server"))
    }
}

const forgetPassword = async (request, response, next) => {
    const { emailAddress } = request.body;
    try {
        const foundUser = await getUserByEmail(emailAddress)
        if (foundUser) {
            const resetCode = Math.floor(100000 + Math.random() * 900000); //generate random reset code

            await sendEmail("ibrahimElazb2010@gmail.com", "Reset Password Code", `<h2>This is the reset password code: ${resetCode}</h2>`)

            await setResetPasswordCode(emailAddress,resetCode)

            response.status(201).json({ message: "Reset Code is sent to Your email" })
        } else {
            next(new HttpError(400, "This Email isn't exist"))
        }
    } catch (error) {
        console.log(error)
        next(new HttpError(error.statusCode || 500, error.message || "System Problem, Please try later"))
    }
}


module.exports={
    login,
    emailConfirm,
    resetPassword,
    forgetPassword
}