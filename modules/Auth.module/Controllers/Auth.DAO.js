const user=require("../../../models/User.model");

const getUserByEmail = async (emailAddress) => {
    try {
        const foundUser = await user.findOne({ emailAddress })
        return foundUser;
    } catch (error) {
        console.log(error)
        throw error;
    }
}

const setEmailConfirm = async (id) => {
    try {
        const result = await user.findByIdAndUpdate(id, { confirmEmail: true }, { new: true })
        return result;
    } catch (error) {
        console.log(error)
        throw error
    }
}

async function getUserByID(userId) {
    const foundUser = await user.findById(userId);
    return foundUser;
}

const changePassword = async (emailAddress, hashedPassword) => {
    const updatedUser = await user.findOneAndUpdate({ emailAddress }, { password: hashedPassword, resetPasswordCode: "" })
    return updatedUser;
}

const setResetPasswordCode = async (emailAddress, resetCode) => {
    const updatedUser = await user.findOneAndUpdate({ emailAddress }, { resetPasswordCode: resetCode })
    return updatedUser;
}


module.exports={
    getUserByEmail,
    setEmailConfirm,
    getUserByID,
    changePassword,
    setResetPasswordCode
}
