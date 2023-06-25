const mongoose  = require("mongoose");


const DB_ConnectionHandler=async ()=>{

    // Event listeners for successful connection and connection error
    mongoose.connection.on('connected', () => {
        console.log('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
        console.error('Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
        console.log('Mongoose disconnected from MongoDB');
    });

    process.on('SIGINT', () => {
        mongoose.connection.close(() => {
            console.log('Mongoose connection closed');
            process.exit(0);
        });
    });

    return mongoose.connect(`${process.env.DB_SERVER_URL}/${process.env.DB_NAME}`)
}

module.exports = DB_ConnectionHandler

