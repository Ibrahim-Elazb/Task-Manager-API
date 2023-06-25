// @ts-nocheck
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const path = require("path")
const { sendEmail, htmlEmailConfirmationMsg } = require("../../../services/SendEmail");
const HTTPError = require('../../../utils/HTTPError');

const {
    addUser,
    updateUser,
    deleteUser,
    getUserByID,
    getUsersByDepartment,
    getAllUsers,
} = require("./User.DAO");
const deleteFile = require('../../../utils/deleteFile');
const rootPath = require('../../../utils/rootPath');
const errorHandler = require('../../../utils/errorHandler');


const registeration = async (request, response, next) => {
    try {
        const userData = request.body;//{ firstName, lastName, emailAddress, password, phone, role, department }
        const image = request.file?.filename;
        const hashedPassword = await bcrypt.hash(userData.password, +process.env.HASH_SALT || 12);

        if (image) userData.image = image;
        const createdUser = await addUser({
            firstName: userData.firstName.toLowerCase(),
            lastName: userData.lastName.toLowerCase(),
            emailAddress: userData.emailAddress.toLowerCase(),
            password: hashedPassword, 
            phone: userData.phone, 
            role: "user",
            image,
            department: userData.department })
        if (!createdUser) throw new HTTPError(400, "An Error Occured On server");

        const token = jwt.sign({ id: createdUser._id, userName: `${createdUser.firstName} ${createdUser.lastName}`, email: createdUser.emailAddress },
            process.env.CONFIRM_EMAIL_TOKEN_SECRET || "<Enter the Token Secret key>", { expiresIn: "1h" })
        const confirmationURL = `${request.protocol}://${request.hostname}:${process.env.PORT}/api/v1/auth/confirm-email/${token}` // http://localhost:3000/api/v1/

        const message = htmlEmailConfirmationMsg(
            {
                user_name: `${createdUser.firstName} ${createdUser.lastName}`,
                verification_URL: confirmationURL,
                host_name: request.hostname,
                msg_header: "Email Confirmation",
                msg_textContent: `Thank you for registering on our website <span style="font-weight:bold;font-size:1.1rem;">${request.hostname}</span>. To complete your registration, please click the button below to verify your email address:`,
                msg_hint: ` <p>If you did not register on our website, please ignore this email.</p>`
            })

        //"ibrahimElazb2010@gmail.com" will be replaced by createdUser.emailAddress
        await sendEmail("ibrahimElazb2010@gmail.com", `Confirmation Email from ${request.hostname}`, message)
        response.status(201).json({ message: "successful Registeration" })
    } catch (error) {
        if (error.keyValue?.emailAddress || error.code === 11000) {
            next(new HTTPError(400, "Email is already exist"))
        } else {
            errorHandler(error.statusCode || 500, error.message || "An Error Occured On server",next)
        }
    }
}

const editUserInfo = async (request, response, next) => {
    try {
        const { id } = request.params;
        //Authorization
        if (request.userInfo.role !== "admin" && request.userInfo.id!== id)
            throw new HTTPError(403,"You don't have authority to edit this account")

        const userData = request.body;//{ firstName, lastName, emailAddress, phone, role, department }
        const image = request.file?.filename;
        if (image) userData.image = image;

        //get old information
        const currentUser = await updateUser(id, {
            firstName: userData.firstName.toLowerCase(),
            lastName: userData.lastName.toLowerCase(),
            emailAddress: userData.emailAddress.toLowerCase(),
            phone: userData.phone,
            department: userData.department
        })
        if (!currentUser) throw new HTTPError(400, "No User Update Occurred");

        //replace profile image if changed
        if (currentUser.image && userData.image)
            deleteFile(path.join(rootPath, "public", "upload", "images", currentUser.image))

        //if change email send confirmation email
        if (userData.emailAddress && userData.emailAddress !== currentUser.emailAddress) {
            const updatedUser = await updateUser(id, { confirmEmail: false })
            const token = jwt.sign({ id: updatedUser._id, userName: `${updatedUser.firstName} ${updatedUser.lastName}`, email: updatedUser.emailAddress },
                process.env.CONFIRM_EMAIL_TOKEN_SECRET || "<Enter the Token Secret key>", { expiresIn: "1h" })
            const confirmationURL = `${request.protocol}://${request.hostname}:${process.env.PORT}/api/v1/auth/confirm-email/${token}` // http://localhost:3000/api/v1/

            const message = htmlEmailConfirmationMsg(
                {
                    user_name: `${updatedUser.firstName} ${updatedUser.lastName}`,
                    verification_URL: confirmationURL,
                    host_name: request.hostname,
                    msg_header: "Email Confirmation",
                    msg_textContent: `<p>This is confirmation from <span style="font-weight:bold;font-size:1.1rem;">${request.hostname}</span>, That you changed Your Account Email Address from 
                        <span style="font-weight:bold;font-size:1.1rem;">${currentUser.emailAddress}</span> to <span style="font-weight:bold;font-size:1.1rem;">${updatedUser.emailAddress}</span> </p>
                        <p>This is link is valid for only one hour</p>`,
                    msg_hint: ` <p>If you did not update on our website, please contact technical support.</p>`
                })

            //"ibrahimElazb2010@gmail.com" will be replaced by createdUser.emailAddress
            await sendEmail("ibrahimElazb2010@gmail.com", `Confirmation Email from ${request.hostname}`, message)
            return response.status(201).json({ message: "successful Info Update, Please Check your email inbox for confimation Of new Email Address" })
        } else {
            response.status(201).json({ message: "successful Info Update" })
        }

    } catch (error) {
        if (error.keyValue?.emailAddress || error.code === 11000) {
            next(new HTTPError(400, "Email is already exist"))
        } else {
            console.log("Error Occured: ")
            console.log(error)
            next(new HTTPError(500, "An Error Occured On server"))
        }
    }
}

const deleteUserInfo = async (request, response, next) => {
    try {
        const { id } = request.params;

        //Authorization
        if (request.userInfo.role !== "admin" && request.userInfo.id !== id)
            throw new HTTPError(403, "You don't have authority to delete this account")

        //get information of deleted user
        const deletedUser = await deleteUser(id)
        if (!deletedUser) throw new HTTPError(400, "No User Delete Occurred");
        if (deletedUser.image) {
            deleteFile(path.join(rootPath, "public", "upload", "images", deletedUser.image))
        }
        const message = htmlEmailConfirmationMsg(
            {
                user_name: `${deletedUser.firstName} ${deletedUser.lastName}`,
                verification_URL: null,
                host_name: request.hostname,
                msg_header: "Account Removal",
                msg_textContent: `We are sorry For Deleting your account.`,
                msg_hint: ""
            })

        //"ibrahimElazb2010@gmail.com" will be replaced by createdUser.emailAddress
        await sendEmail("ibrahimElazb2010@gmail.com", `Account Removal Email from ${request.hostname}`, message)
        response.status(201).json({ message: "Account Deleted Successfully..." })
    } catch (error) {
        console.log("Error Occured: ")
        console.log(error)
        errorHandler(500, "An Error Occured On server", next)
    }
}

const changeUserRole = async (request, response, next) => {
    try {
        const { id } = request.params;
        const {role} = request.body;

        const currentUser = await updateUser(id, {role:role.toLowerCase()})
        if (!currentUser) throw new HTTPError(400, "No User Update Occurred");

        response.status(201).json({ message: "successful User Role Update" })
    } catch (error) {
            console.log("Error Occured: ")
            console.log(error)
            next(new HTTPError(500, "An Error Occured On server"))
    }
}

const getUserInfo = async (request, response, next) => {
    try {
        const { id } = request.params;

        //Authorization
        if (request.userInfo.role !== "admin" && request.userInfo.id !== id)
            throw new HTTPError(403, "You don't have authority to get information of this account")
        
        const foundUser = await getUserByID(id)
        if (!foundUser) throw new HTTPError(400, "No User Found");
        response.status(200).json({ 
            firstName: foundUser.firstName,
            lastName: foundUser.lastName,
            emailAddress: foundUser.emailAddress,
            phone: foundUser.phone,
            role: foundUser.role,
            department: foundUser.department, 
            image: `${request.protocol}://${request.hostname}:${process.env.PORT}/public/upload/images/${foundUser.image}`, 
        })
    } catch (error) {
        console.log("Error Occured: ")
        console.log(error)
        errorHandler(500, "An Error Occured On server", next)
    }
}

const getUsersOfDepartment = async (request, response, next) => {
    try {
        const { department_id } = request.params;
        let foundUsers = await getUsersByDepartment(department_id)
        foundUsers=foundUsers.map(foundUser=>{
            return {
                firstName: foundUser.firstName,
                lastName: foundUser.lastName,
                emailAddress: foundUser.emailAddress,
                phone: foundUser.phone,
                role: foundUser.role,
                department: foundUser.department,
                image: `${request.protocol}://${request.hostname}:${process.env.PORT}/public/upload/images/${foundUser.image}`, 
            }
        })
        response.status(200).json({users:foundUsers})
    } catch (error) {
        console.log("Error Occured: ")
        console.log(error)
        errorHandler(500, "An Error Occured On server", next)
    }
}

const getAllUsersInfo = async (request, response, next) => {
    try {
        let foundUsers = await getAllUsers()
        foundUsers = foundUsers.map(foundUser => {
            return {
                firstName: foundUser.firstName,
                lastName: foundUser.lastName,
                emailAddress: foundUser.emailAddress,
                phone: foundUser.phone,
                role: foundUser.role,
                department: foundUser.department,
                image: `${request.protocol}://${request.hostname}:${process.env.PORT}/public/upload/images/${foundUser.image}`, 
            }
        })
        response.status(200).json({ users: foundUsers })
    } catch (error) {
        console.log("Error Occured: ")
        console.log(error)
        errorHandler(500, "An Error Occured On server", next)
    }
}


module.exports = {
    registeration,
    editUserInfo,
    deleteUserInfo,
    changeUserRole,
    getUserInfo,
    getUsersOfDepartment,
    getAllUsersInfo
}