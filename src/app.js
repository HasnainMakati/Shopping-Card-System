import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import Razorpay from "razorpay";
import { globalErrorHandler } from "./middleware/error.middleware.js";
import userRouter from "./routes/user.routes.js";
import productRouter from "./routes/product.routes.js";
import cartRouter from "./routes/cart.routes.js";
import orderRouter from "./routes/order.routes.js";
import adminRouter from "./routes/admin.routes.js";

const app = express();

const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.RAZOR_API_KEY;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || process.env.RAZOR_API_SECRET;

export const razorpayInstance =
    razorpayKeyId && razorpayKeySecret
        ? new Razorpay({
            key_id: razorpayKeyId,
            key_secret: razorpayKeySecret,
        })
        : null;

const allowedOrigins = [
    process.env.CORS_ORIGIN,
    process.env.CORS_ORIGIN_OTHERS,
].filter(Boolean);

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    }),
);

// app.get("/", (req, res) => {
//     res.send("🚀 Backend is running successfully");
// });

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// http://localhost:4000/api/v1/shops/user

app.use("/api/v1/shops/users", userRouter);
app.use("/api/v1/shops/products", productRouter);
app.use("/api/v1/shops/carts", cartRouter);
app.use("/api/v1/shops/orders", orderRouter);
app.use("/api/v1/shops/admin", adminRouter);

app.use(globalErrorHandler);
export { app };
