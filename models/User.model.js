// User Model
const mongoose = require('mongoose');
const Department = require("./Department.model")

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    emailAddress: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        enum: ['user', 'manager', 'admin'],
        default: 'user'
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    image: {
        type: String,
    },
    confirmEmail: {
        type: Boolean,
        default: false
    },
    resetPasswordCode: {
        type: String,
        default: ""
    }
});

//check if entered department ID for user is exist in department collection
userSchema.pre('validate', async function (next) {
    const departmentExists = await Department.exists({ _id: this.department });
    if (!departmentExists) {
        this.invalidate('Invalid Department ID', 'Invalid Department ID(s)');
    }

    next();
});

// Pre-save hook
userSchema.pre('save', function (next) {
    this.firstName = this.firstName.toLowerCase();
    this.lastName = this.lastName.toLowerCase();
    this.emailAddress = this.emailAddress.toLowerCase();
    this.role = this.role.toLowerCase();
    next();
});

// Pre-update hook
userSchema.pre('findOneAndUpdate', function (next) {
    if (this._update.firstName) this._update.firstName = this._update.firstName.toLowerCase();
    if (this._update.lastName) this._update.lastName = this._update.lastName.toLowerCase();
    if (this._update.emailAddress) this._update.emailAddress = this._update.emailAddress.toLowerCase();
    if (this._update.role) this._update.role = this._update.role.toLowerCase();
    next();
})

userSchema.pre('validate', async function (next) {

    if (this.department) {
        const departmentExists = await Department.exists({ _id: this.department });

        if (!departmentExists) {
            this.invalidate('Invalid Department ID', 'User Department do not exist');
        }
    }

    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
