const fs=require("fs")

const deleteFile =(filePath)=>{  
    fs.unlink(filePath, (error) => {
        if (error) {
            console.log("Error occurred during file delete: " + error)
        } else {
            console.log(`file "${filePath}" is deleted`)
        }
    })
} 

module.exports = deleteFile