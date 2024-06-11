import dotenv from "dotenv";
import express from "express";
import connectDb from "./database/index.js";
import { app } from "./app.js";
import { wss } from './websocket.js';
import http from 'http';

dotenv.config({
    path: "./.env"
});

const server = http.createServer(app);

connectDb()
.then(() => {
    server.on("error", (err) => {
        console.log("error in running port", err);
        throw err;
    });

    server.on('upgrade', (request, socket, head) => {
        wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
        });
    });

    server.listen(process.env.PORT || 8000, () => {
        console.log(`app is listening on Port :${process.env.PORT || 8000}`);
    });
})
.catch((err) => {
    console.error("MongoDB Connection failed");
});
