import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import { globalErrorHandler } from "./middleware/error.middleware.js";
import shopsRouter from "./routes/shopping.routes.js"
const app = express()

app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded())
app.use(express.static("public"))
app.use(cookieParser())

app.use("/api/v1/shops", shopsRouter)      // http://localhost:4000/api/v1/shops/user

app.use(globalErrorHandler)
export { app }