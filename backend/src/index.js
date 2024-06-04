import dotenv from "dotenv";
import express from "express";
import connectDb from "./database/index.js";
import { app } from "./app.js";
dotenv.config({
    path:"./.env"
})

connectDb()
.then(()=>{
    app.on("error",(err)=>{
        console.log("error in runnign port",err);
        throw err;
    })
   app.listen(process.env.PORT||8000,()=>{
    console.log(`app is listening on Port :${process.env.PORT||8000}`);
   })
}).catch((err)=>{
    console.error("MongoDB Connection failed")
});

