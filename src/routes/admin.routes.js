import { Router } from "express"
import {
    addProduct, deleteUser, editProduct, getAllBill, getAllInVoice, getAllOrders, getAllProducts, getAllUser, operationalHighlight, removeProduct,
    setUserAccountBlock, graphData
} from "../controllers/admin.controllers.js";
const router = Router()
import { verifyUserWithToken } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyAdmin } from "../middleware/admin.middleware.js";
import { registerUser } from "../controllers/user.controllers.js";
// import { loginUser } from "../controllers/user.controllers.js";

router.route("/register-user").post(registerUser)
router.route("/add-product").post(verifyUserWithToken, upload.single('productImage'), addProduct)
router.route("/edit-product").put(verifyUserWithToken, upload.single('productImage'), editProduct)
router.route("/delete-product").delete(verifyUserWithToken, removeProduct)
router.route("/set-block").post(verifyUserWithToken, setUserAccountBlock)
router.route("/delete-user").delete(verifyUserWithToken, deleteUser)

router.route("/get-users").get(verifyUserWithToken, getAllUser)
router.route("/get-products").get(verifyUserWithToken, getAllProducts)
router.route("/get-orders").get(verifyUserWithToken, getAllOrders)
router.route("/get-invoice").get(verifyUserWithToken, getAllInVoice)
router.route("/get-bill").post(verifyUserWithToken, getAllBill)
router.route("/get-operational-highlight").get(verifyUserWithToken, operationalHighlight)
router.route("/graph-data").get(verifyUserWithToken, graphData)

export default router
