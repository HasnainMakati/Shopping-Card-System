import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import razorPay from "razorpay";
import { globalErrorHandler } from "./middleware/error.middleware.js";

import userRouter from "./routes/user.routes.js";
import productRouter from "./routes/product.routes.js";
import cartRouter from "./routes/cart.routes.js";
import orderRouter from "./routes/order.routes.js";

const app = express()

export const razorpayInstance = new razorPay({
    key_id: process.env.RAZOR_API_KEY,
    key_secret: process.env.RAZOR_API_SECRET
})

app.use(cors({
    origin: process.env.CORS_ORIGIN || process.env.CORS_ORIGIN_OTHERS,
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded())
app.use(express.static("public"))
app.use(cookieParser())

// http://localhost:4000/api/v1/shops/user

app.use("/api/v1/shops/users", userRouter)
app.use("/api/v1/shops/products", productRouter)
app.use("/api/v1/shops/carts", cartRouter)
app.use("/api/v1/shops/orders", orderRouter)

app.use(globalErrorHandler)
export { app }
