import jwt from "jsonwebtoken";
import { db } from "../db/index.js";

const createAccessToken = (user_id, email) => {
  return jwt.sign(
    {
      _id: user_id,
      email: email
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}

const createRefreshToken = (user_id) => {
  return jwt.sign(
    {
      _id: user_id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}

const generateAccessAndRefreshToken = async (user_id, email) => {
  try {

    const accessToken = await createAccessToken(user_id, email)
    const refreshToken = await createRefreshToken(user_id)

    const [result] = await db.query('UPDATE users set refreshToken = ? WHERE user_id = ?', [refreshToken, user_id])

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

