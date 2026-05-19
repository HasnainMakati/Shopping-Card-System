import { Router } from "express"
import {
    orderItems, orderPaymentProcess, getCompletedOrder,
    orderBill
} from "../controllers/order.controllers.js";
import { verifyUserWithToken } from "../middleware/auth.middleware.js";

const router = Router()

router.route("/order-items").post(verifyUserWithToken, orderItems)
router.route("/order-payment").post(verifyUserWithToken, orderPaymentProcess)
router.route("/complete-order").get(verifyUserWithToken, getCompletedOrder)
router.route("/order-bill").post(verifyUserWithToken, orderBill)


export default router