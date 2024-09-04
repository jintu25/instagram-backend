import express, { urlencoded } from "express"
import cookieParser from 'cookie-parser';
import cors from "cors"
import dotenv from "dotenv"
import connectDB from "./utils/db.js";
import userRouter from "./routes/user.route.js"
dotenv.config({})
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.send("backend server is running...")
})
// middleware 
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(urlencoded({ extended: true }));
const corsOption = {
    origin: "http://localhost:5173",
    credentials: true
}
app.use(cors(corsOption))

app.use("/api/v1/user", userRouter) // userRouter import from usercontroller


app.listen(PORT, () => {
    connectDB()
    console.log(`Server is Running Port: ${PORT}`)
})