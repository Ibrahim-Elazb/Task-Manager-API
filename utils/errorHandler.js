const HTTPError = require("./HTTPError")

const errorHandler = (statusCode = 500, message = 'error occurred on server',next)=>{
    const handledErrors = new HTTPError(statusCode, message)
    next(handledErrors)
}

module.exports = errorHandler