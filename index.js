import express, { urlencoded } from "express"
import cookieParser from 'cookie-parser';
import cors from "cors";
import dotenv from "dotenv"
import connectDB from "./utils/db.js";
import userRouter from "./routes/user.route.js"
import postRouter from "./routes/post.route.js"
import messageRouter from "./routes/message.route.js"
import { app, server } from "./socket/socket.js";
dotenv.config({})
const PORT = process.env.PORT || 3000;


// middleware 
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,
};

app.use(cors(corsOptions));

app.options('*', cors(corsOptions));

app.use("/api/v1/user", userRouter)
app.use("/api/v1/post", postRouter)
app.use("/api/v1/message", messageRouter) 

app.get("/", (req, res) => {
    res.send("backend server is running...")
})

server.listen(PORT, () => {
    connectDB()
    console.log(`Server is Running Port: ${PORT}`)
})