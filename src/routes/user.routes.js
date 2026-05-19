import { Router } from "express"
import {
    loginUser, logoutUser, registerUser, editUser, deleteUser,
    refreshAccessToken, userAddressDetails,
} from "../controllers/user.controllers.js";
import { verifyUserWithToken } from "../middleware/auth.middleware.js";

const router = Router()


router.route("/register-user").post(registerUser)
router.route("/login-user").post(loginUser)
router.route("/logout-user").post(verifyUserWithToken, logoutUser)
router.route("/edit-user").put(verifyUserWithToken, editUser)
router.route("/delete-user").delete(verifyUserWithToken, deleteUser)
router.route("/refresh-token").get(refreshAccessToken)
router.route("/user-address").post(verifyUserWithToken, userAddressDetails)

export default router