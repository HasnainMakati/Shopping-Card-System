import { Router } from "express"
import {
    loginUser, logoutUser, registerUser, editUser,
    refreshAccessToken, userAddressDetails, sendOtp, otpVerification, newPassword,
    getAddress,
    deleteAddress
} from "../controllers/user.controllers.js";
import { verifyUserWithToken } from "../middleware/auth.middleware.js";
import { blockedUser } from "../middleware/blocked.middleware.js";
import { googleAuth } from "../controllers/user.controllers.js";

const router = Router()


router.route("/register-user").post(registerUser)
router.route("/login-user").post(loginUser)
router.route("/logout-user").post(verifyUserWithToken, logoutUser)
router.route("/send-email").post(sendOtp)
router.post("/google", googleAuth); 
// router.route("/check-otp").post( otpVerification)
router.route("/new-password").put(newPassword)
router.route("/edit-user").put(verifyUserWithToken,blockedUser, editUser)
router.route("/refresh-token").get(refreshAccessToken)
router.route("/user-address").post(verifyUserWithToken,blockedUser, userAddressDetails)
router.route("/get-address").get(verifyUserWithToken, getAddress)
router.route("/delete-address").delete(verifyUserWithToken,blockedUser, deleteAddress)


export default router
