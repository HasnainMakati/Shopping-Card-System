import { Router } from "express"
import {
    getAllProducts, getAllProductByFilter,
} from "../controllers/product.controllers.js";
import { verifyUserWithToken } from "../middleware/auth.middleware.js";
const router = Router()


router.route("/all-products").get(verifyUserWithToken, getAllProducts)
router.route("/all-products-by-name").get(verifyUserWithToken, getAllProductByFilter)

export default router