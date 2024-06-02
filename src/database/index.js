import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDb=async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`DB connected successfully,`)
    } catch (error) {
        console.error("there is error in connecting the database",error);
    }
}

export default connectDb;