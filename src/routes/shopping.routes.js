import { Router } from "express"
import {
    loginUser, logoutUser, registerUser, editUser, deleteUser,
    addProduct, getAllProducts, getAllProductByFilter,
    productAddToCart, getAllCartItems, refreshAccessToken
} from "../controllers/shops.controllers.js";
import { verifyUserWithToken } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js"

const router = Router()

router.route("/register-user").post(registerUser)
router.route("/login-user").post(loginUser)
router.route("/logout-user").post(verifyUserWithToken, logoutUser)
router.route("/refresh-token").get(refreshAccessToken)
router.route("/edit-user").put(verifyUserWithToken, editUser)
router.route("/:user_id").delete(verifyUserWithToken, deleteUser)

// <======================= Products ========================>
router.route("/add-product").post(
    verifyUserWithToken,
    upload.single('productImage'),
    addProduct
)
router.route("/all-products").get(verifyUserWithToken, getAllProducts)
router.route("/all-products-by-name").get(verifyUserWithToken, getAllProductByFilter)
router.route("/add-product-to-cart").post(verifyUserWithToken, productAddToCart)
router.route("/get-all-cart-item").get(verifyUserWithToken, getAllCartItems)

export default router