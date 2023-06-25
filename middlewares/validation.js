const HttpError = require("../utils/HTTPError");
const deleteFile = require("../utils/deleteFile");

const validation = (validationSchema) => {
    return (request, response, next) => {
        const dataSources = ["body", "params", "query","file","files","headers"];
        const validationErrors = [];
        dataSources.forEach(source => {
            if (validationSchema[source]) {
                const validationResult=validationSchema[source].validate(request[source],{abortEarly:false});
                if(validationResult.error?.details){
                    validationResult.error.details.forEach(item=>{
                        validationErrors.push(item.message)
                    })
                }
            }
        })

        /* -----------------  Alternative Solution --------------------- */
        // for (const source in validationSchema) {
        //     const validationResult = validationSchema[source].validate(request[source], { abortEarly: false });
        //     if (validationResult.error?.details) {
        //         validationResult.error.details.forEach(item => {
        //             validationErrors.push(item.message)
        //         })
        //     }
        // }

        if(validationErrors.length>0){
            next(new HttpError(400,JSON.stringify(validationErrors)));
        }else{
            next();
        }
    }
}


module.exports = validation;