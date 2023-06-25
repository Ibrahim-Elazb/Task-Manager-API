//Hint: Error Handling of any of these Function in function which will call them

const User = require("../../../models/User.model");
const bcrypt = require("bcrypt")

// Function to add a new user
async function addUser(userData) {
    try {
        // Create the new user object
        const newUser = new User({
            firstName: userData.firstName,
            lastName: userData.lastName,
            emailAddress: userData.emailAddress,
            phone:userData.phone,
            password: userData.password,
            role: userData.role,
            image: userData.image,
            department: userData.department,
        });

        // Save the new user to the database
        const savedUser = await newUser.save();
        return savedUser;
    } catch (error) {
        // Handle insertion error if email is already exist
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email === 1) {
            throw new Error('Email already exists');
        }
        throw error;
    }
}

// Function to update user information by ID
async function updateUser(userId, updateData) {
    try{
        //get data before update
        const currentUser = await User.findByIdAndUpdate(userId, updateData);
        return currentUser;
    } catch (error) {
        // Handle insertion error if email is already exist
        if (error.code === 11000 && error.keyPattern && error.keyPattern.email === 1) {
            throw new Error('Email already exists');
        }
        throw error;
    }
}

// Function to change user password by email
async function changePassword(email, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await User.findOneAndUpdate({ email }, { password: hashedPassword }, { new: true });
    return updatedUser;
}

// Function to delete user by ID
async function deleteUser(userId) {
    const deletedUser = await User.findByIdAndRemove(userId);
    return deletedUser;
}

// Function to select user By ID
async function getUserByID(userId) {
    const user = await User.findById(userId);
    return user;
}

// Function to select all users
async function getAllUsers() {
    const users = await User.find();
    return users;
}

// Function to select users of a specific department
async function getUsersByDepartment(departmentId) {
    const users = await User.find({ department: departmentId });
    return users;
}

module.exports = {
    addUser,
    updateUser,
    changePassword,
    deleteUser,
    getUserByID,
    getUsersByDepartment,
    getAllUsers,
};
