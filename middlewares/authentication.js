const HTTPError = require("../utils/HTTPError");
const jwt = require("jsonwebtoken");
const errorHandler = require("../utils/errorHandler");
const roles = { user:'user', manager:'manager', admin:'admin' }

const isAuthorized = (authorizedRoles) => {

    return (request, response, next) => {
        try{
            const authToken = request.headers['authorization'];
            const token = authToken?.split(" ")[1]||null;
            if (!authToken || !authToken?.startsWith("Bearer ") || !token) 
                throw new HTTPError(401, "Please, Login !!");
            jwt.verify(token, process.env.LOGIN_TOKEN_SECRET||"", (error, userInfo) => {
                if (error) {
                    throw new HTTPError(401, "invalid token");
                }
            request.userInfo = userInfo;

            if (!authorizedRoles.includes(userInfo?.role))
                throw new HTTPError(403, "You don't have authority to do this action");
            next()       
            })
        }catch(error){
            errorHandler(error.statusCode||500,error.message||"server error occurred",next)
        }
    }
}

module.exports = { isAuthorized, roles };