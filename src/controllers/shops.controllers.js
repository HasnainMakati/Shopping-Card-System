import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateAccessAndRefreshToken } from "../service/token.js";
import bcrypt from "bcrypt";
import { findExistedUser, addUser, getUser, findUserByEmail, userFindByIdAndUpdateRefreshToken } from "../model/query.model.js";

const registerUser = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, phone, password, gender } = req.body

    const lowerFirstName = firstName.toLowerCase()
    const lowerLastName = lastName.toLowerCase()
    const lowerEmail = email.toLowerCase()
    const lowerGender = gender.toLowerCase()

    if ([lowerFirstName, lowerLastName, lowerEmail, phone, password, lowerGender].some((fields) => !fields || fields.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    await findExistedUser(phone, email)

    const encryptedPassword = await bcrypt.hash(password, 10)

    const userAddInDb = await addUser(lowerFirstName, lowerLastName, lowerEmail, phone, encryptedPassword, lowerGender)

    const user = await getUser(userAddInDb.insertId)
    console.log(user, "USER CREATED")

    return res
        .status(201)
        .json(
            new ApiResponse(201, user, "User created Successfully")
        )
})
const loginUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body
    const lowerEmail = email.toLowerCase()

    if (!lowerEmail || !password) {
        throw new ApiError(400, "All fields are required ")
    }

    const findUser = await findUserByEmail(lowerEmail)

    const isPasswordCorrect = await bcrypt.compare(password, findUser.password)

    if (!isPasswordCorrect) {
        throw new ApiError(404, "Invalid password")
    }

    console.log({ email, password }, "LOGIN USER")
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(findUser.user_id, findUser.lowerEmail)

    const loggedUser = await getUser(findUser.user_id)

    const loginResponse = {
        user_id: loggedUser.user_id,
        name: loggedUser.lastName,
        email: loggedUser.email,
        accessToken,
        refreshToken
    }
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, loginResponse, "User logged successfully"))
})
const logoutUser = asyncHandler(async (req, res) => {

    const user_id = req.user.user_id;
    const emptyToken = "";

    await userFindByIdAndUpdateRefreshToken(user_id, emptyToken)

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(201)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(201, {}, "User logged out")
        )
})
