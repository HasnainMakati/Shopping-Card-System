import { Router } from "express"
import {
    addProduct, getAllProducts, getAllProductByFilter,
} from "../controllers/product.controllers.js";
import { verifyUserWithToken } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
const router = Router()

router.route("/add-product").post(
    verifyUserWithToken,
    upload.single('productImage'),
    addProduct
)
router.route("/all-products").get(verifyUserWithToken, getAllProducts)
router.route("/all-products-by-name").get(verifyUserWithToken, getAllProductByFilter)

export default router