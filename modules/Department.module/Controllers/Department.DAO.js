const rootPath = require("../../../utils/rootPath")
const Department = require(`${rootPath}/models/Department.model`);

// Function to add a new department
const addDepartment = async (departmentData) => {
    console.log(departmentData)
    try {
        const department = new Department(departmentData);
        await department.save();
        return department;
    } catch (error) {
        throw new Error('Failed to add department');
    }
};

// Function to update a department
const updateDepartment = async (departmentId, updateData) => {
    try {
        const department = await Department.findByIdAndUpdate(departmentId, updateData, { new: true });
        if (!department) {
            throw new Error('Department not found');
        }
        return department;
    } catch (error) {
        throw new Error('Failed to update department');
    }
};

// Function to delete a department
const deleteDepartment = async (departmentId) => {
    try {
        const department = await Department.findByIdAndDelete(departmentId);
        if (!department) {
            throw new Error('Department not found');
        }
        return department;
    } catch (error) {
        throw new Error('Failed to delete department');
    }
};

// Function to select all departments
const getDepartmentById = async (departmentId) => {
    try {
        const departments = await Department.findById(departmentId);
        return departments;
    } catch (error) {
        throw new Error('Failed to get departments');
    }
};

// Function to select all departments
const getAllDepartments = async () => {
    try {
        const departments = await Department.find();
        return departments;
    } catch (error) {
        throw new Error('Failed to get departments');
    }
};

module.exports = {
    addDepartment,
    updateDepartment,
    deleteDepartment,
    getDepartmentById,
    getAllDepartments,
};
