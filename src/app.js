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
import googleRoutes from "./routes/user.routes.js"
import session from "express-session";
// import passport from "./config/google.config.js";
// import { Strategy as googleStrategy } from "passport-google-oauth2";
const app = express();

/**
 * @Project_Routes
 */
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

app.use(
  cors({
    origin: [process.env.CORS_ORIGIN,process.env.CORS_ORIGIN_DEV, process.env.CORS_ORIGIN_ADMIN],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use("/api/v1/shops/auth", googleRoutes);

/**
 * @RazorPay_Config
 */
const razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.RAZOR_API_KEY;
const razorpayKeySecret =
  process.env.RAZORPAY_KEY_SECRET || process.env.RAZOR_API_SECRET;

export const razorpayInstance =
  razorpayKeyId && razorpayKeySecret
    ? new Razorpay({ key_id: razorpayKeyId, key_secret: razorpayKeySecret })
    : null;

app.use("/api/v1/shops/users", userRouter);
app.use("/api/v1/shops/products", productRouter);
app.use("/api/v1/shops/carts", cartRouter);
app.use("/api/v1/shops/orders", orderRouter);
app.use("/api/v1/shops/admin", adminRouter);

app.use(globalErrorHandler);
export { app };



/**
 * @Google_Passport_Configuration
 */
// app.use(
//     session({
//         secret: process.env.SESSION_SECRET,
//         resave: false,
//         saveUninitialized: false,
//         cookie: { secure: false },
//     }),
// );

// app.use(passport.initialize());
// app.use(passport.session());