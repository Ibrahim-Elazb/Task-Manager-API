const express = require("express");
const path = require("path");
const fs = require("fs");
require('dotenv').config(); 
const cookieParser = require('cookie-parser'); 
const cors = require('cors');
const session = require('express-session')

const rootPath = require("./utils/rootPath");
const indexRouter = require("./modules/index.router");
const DB_ConnectionHandler = require("./config/database");
const { default: mongoose } = require("mongoose");

const app = express();

app.use(cors())
app.use(express.json())
app.use(cookieParser())
app.use(session({
    secret: process.env.SESSION_SECRET_KEY||"<Enter your secret key>",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // Cookie expiration time in milliseconds
        // secure: true, // Set the secure flag to true for HTTPS only
        sameSite: 'strict' // Restrict the cookie to the same site
    }
}));

// -----------------------------------------   Requesting Static Files   --------------------------------------------------
app.use(express.static(path.join(rootPath, 'public')))
app.use('/public', express.static(path.join(rootPath, 'public')))

// -----------------------------------------   Routing Operations   -------------------------------------------------------
app.use("/api/v1/", indexRouter) //API Main Routing

// app.use("/", PagesRouter) //To handle Pages Requests

// -------------------------------------  Start DB Connection and HTTP Server   -------------------------------------------
const StartServer=async()=>{
    try{
        const connectionResult=await DB_ConnectionHandler(); //Start DB Connection
        console.log(("Database connected to DB Host: " + connectionResult.connection.host))
        app.listen(process.env.PORT, () => { //Start App Server
            console.log(`Server is listening on port ${process.env.PORT}...`)
        })
    }catch(error){
        console.log(("Error in details: " + error))
    }
}

StartServer();
