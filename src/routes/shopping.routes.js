import { Router } from "express"
import { loginUser, logoutUser, registerUser } from "../controllers/shops.controllers.js";
import { verifyUserWithToken } from "../middleware/auth.middleware.js";

const router = Router()

router.route("/register-user").post(registerUser)
router.route("/login-user").post(loginUser)
router.route("/logout-user").post(verifyUserWithToken, logoutUser)

export default router