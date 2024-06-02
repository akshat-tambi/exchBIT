import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import productsRouter from "./Routes/products.routes.js"; 

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "22kb" }));
app.use(express.urlencoded({ limit: "22kb" }));
app.use(express.static("public"));
app.use(cookieParser());

app.use("/api/products", productsRouter);

export { app };
