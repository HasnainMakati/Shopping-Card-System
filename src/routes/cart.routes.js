import { Router } from "express"
import {
    productAddToCart, getAllCartItems, deleteCartItems
} from "../controllers/cart.controllers.js";
const router = Router()
import { verifyUserWithToken } from "../middleware/auth.middleware.js";

router.route("/add-product-to-cart").post(verifyUserWithToken, productAddToCart)
router.route("/delete-cart-item/:id").delete(verifyUserWithToken, deleteCartItems)
router.route("/all-cart-item").get(verifyUserWithToken, getAllCartItems)

export default router