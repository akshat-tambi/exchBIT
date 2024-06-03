import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "22kb" }));
app.use(express.urlencoded({ limit: "22kb" }));
app.use(express.static("public"));
app.use(cookieParser());

import productsRouter from "./Routes/products.routes.js"; 
app.use("/api/v1/products", productsRouter);

import userRoute from "../src/Routes/userRoute.js"
app.use("/api/v1/users",userRoute)


export { app };
