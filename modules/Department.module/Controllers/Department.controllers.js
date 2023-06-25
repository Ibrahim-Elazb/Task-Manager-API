const DAO_Handlers=require("./Department.DAO")
const errorHandler=require("../../../utils/errorHandler")

const addNewDepartment=async (req,res,next)=>{
    const {name}=req.body;
    try {
        const department =await DAO_Handlers.addDepartment({name})
        res.status(201).json({ department })
    } catch (error) {
        console.log(error);
        errorHandler(error.statusCode || 500, error.message || 'error occurred on server', next)
    }
}

const editDepartment = async (req, res, next) => {
    const {id} = req.params;
    const { name } = req.body;
    try {
        const department = await DAO_Handlers.updateDepartment( id,{name} )
        res.status(201).json({ department })
    } catch (error) {
        console.log(error);
        errorHandler(error.statusCode || 500, error.message || 'error occurred on server', next)
    }
}

const deleteDepartment = async (req, res, next) => {
    const {id} = req.params;
    try {
        const department = await DAO_Handlers.deleteDepartment(id)
        res.status(201).json({ department })
    } catch (error) {
        console.log(error);
        errorHandler(error.statusCode || 500, error.message || 'error occurred on server', next)
    }
}

const getDepartmentById = async (req, res, next) => {
    try {
        const {id}=req.params;
        const department = await DAO_Handlers.getDepartmentById(id);
        res.status(200).json(department )
    } catch (error) {
        console.log(error);
        errorHandler(error.statusCode || 500, error.message || 'error occurred on server', next)
    }
}

const getDepartments = async (req, res, next) => {
    try {
        const departments = await DAO_Handlers.getAllDepartments();
        res.status(200).json({ departments })
    } catch (error) {
        console.log(error);
        errorHandler(error.statusCode || 500, error.message || 'error occurred on server', next)
    }
}

module.exports={
addNewDepartment,
editDepartment,
deleteDepartment,
getDepartmentById,
getDepartments
}