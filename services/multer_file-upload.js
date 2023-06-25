const multer = require('multer');
const path = require('path');
const fs = require('fs');
const rootPath = require('../utils/rootPath');

// Define the middleware function
const uploadFiles = (storagePath, acceptedTypes) => {

    // Create the storage configuration (Path & Naming)
    const storage = multer.diskStorage({

        //Configure Destination of Storage
        destination: (req, file, cb) => {
            // Create the destination directory if it doesn't exist
            try {
                if (!storagePath) {
                    storagePath = rootPath+"/public";
                }

                if (!fs.existsSync(storagePath)) {
                    fs.mkdirSync( storagePath, { recursive: true });
                }

                cb(null,  storagePath);
            } catch (error) {
                console.log("error occurred while configuring storage path:\n")
                console.log(error)
                cb(error, path.join(rootPath,"public"))
            }
        },

        //Configure Naming of the File
        filename: (req, file, cb) => {
            try {
                const timestamp = Date.now();
                const originalName = file.originalname;
                const extension = path.extname(originalName);
                const newName = `${timestamp}-${originalName}`;
                console.log(newName)
                cb(null, newName);
            } catch (error) {
                console.log("error occurred while configuring file Naming:\n")
                console.log(error)
                cb(error, file.originalname)
            }
        },
    });

    // Create the multer instance with the storage configuration
    const upload = multer({
        storage: storage,
        fileFilter: (req, file, cb) => {
            const fileExtension = path.extname(file.originalname).toLowerCase();
            if(acceptedTypes && acceptedTypes.length>0){
                // Check if the file extension is accepted
                if (acceptedTypes.includes(fileExtension)) {
                    cb(null, true);
                } else {
                    cb(new Error('Invalid file type'));
                }
            }else{
                cb(null, true);
            }
        },
    });

    // Return the multer middleware
    return upload
};


module.exports = uploadFiles;