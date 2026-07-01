import { Router } from "express"
import {
    loginUser, logoutUser, registerUser, editUser,
    refreshAccessToken, userAddressDetails, sendOtp, otpVerification, newPassword
} from "../controllers/user.controllers.js";
import { verifyUserWithToken } from "../middleware/auth.middleware.js";

const router = Router()


router.route("/register-user").post(registerUser)
router.route("/login-user").post(loginUser)
router.route("/logout-user").post(verifyUserWithToken, logoutUser)
router.route("/send-otp").post(verifyUserWithToken, sendOtp)
router.route("/check-otp").post(verifyUserWithToken, otpVerification)
router.route("/new-password").post(verifyUserWithToken, newPassword)
router.route("/edit-user").put(verifyUserWithToken, editUser)
router.route("/refresh-token").get(refreshAccessToken)
router.route("/user-address").post(verifyUserWithToken, userAddressDetails)


export default router
