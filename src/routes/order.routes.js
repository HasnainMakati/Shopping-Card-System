import { Router } from "express"
import {
    orderItems, orderPaymentProcess, getCompletedOrder,
    orderBill, verifyPayment,
    createRazorOrder
} from "../controllers/order.controllers.js";
import { verifyUserWithToken } from "../middleware/auth.middleware.js";
import { blockedUser } from "../middleware/blocked.middleware.js";

const router = Router()

router.route("/order-items").post(verifyUserWithToken,blockedUser, orderItems)
router.route("/order-payment").post(verifyUserWithToken,blockedUser, orderPaymentProcess)
router.route("/complete-order").get(verifyUserWithToken,blockedUser, getCompletedOrder)
router.route("/order-bill").post(verifyUserWithToken,blockedUser, orderBill)
router.route("/create-order").post(verifyUserWithToken,blockedUser, createRazorOrder)
router.route("/verify-payment").post(verifyUserWithToken,blockedUser, verifyPayment)


export default router