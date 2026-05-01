import jwt from "jsonwebtoken";
import { db } from "../db";

const createAccessToken = (user) => {
    return jwt.sign(
        {
            _id: user.id,
            email: user.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

const createRefreshToken = (user) => {
    return jwt.sign(
        {
            _id: user.id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

const generateAccessAndRefreshToken = async (user) => {
    try {

        const accessToken = await createAccessToken(user)
        const refreshToken = await createRefreshToken(user)

        const [result] = await db.query('UPDATE users set refresh_token = ? WHERE user_id = ?', [refreshToken, user.id])

        if (result.affectedRows === 0) {
            throw new ApiError(500, "Database error",
                [{
                    error: "Server error",
                    issues: "Refresh token update failed"
                }])

        }

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Token generate failed",
            [{
                error: "Server error",
                issues: "Some thing went wrong while we generate access and refresh token"
            }])
    }
}

export { generateAccessAndRefreshToken }