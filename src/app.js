import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
const app = express()

app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "16lb" }))
app.use(express.urlencoded({ limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())




export { app }