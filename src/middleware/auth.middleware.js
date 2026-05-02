import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { findUserByToken } from "../model/query.model.js";


const verifyUserWithToken = asyncHandler(async (req, _, next) => {

    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        console.log(decodedToken)
        const user = await findUserByToken(decodedToken._id)

        req.user = user
        console.log("Auth user", user)

        next()
    } catch (error) {
        throw new ApiError(401, "Token verification failed", [{ error }])
    }
})

export { verifyUserWithToken }