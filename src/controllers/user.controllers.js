import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateAccessAndRefreshToken } from "../service/token.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
    findExistedUser, createUser, getUser, findUserByEmail, userDeleteById,
    userUpdateById, userFindByIdAndUpdateRefreshToken, findUserById, addUserAddress, checkUserAddress,
    findExistedUserAddress
} from "../model/user.model.js";

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

    const userAddInDb = await createUser(lowerFirstName, lowerLastName, lowerEmail, phone, encryptedPassword, lowerGender)

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
        firstName: loggedUser.firstName,
        lastName: loggedUser.lastName,
        email: loggedUser.email,
        phone: loggedUser.phone,
        gender: loggedUser.gender,
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
const refreshAccessToken = asyncHandler(async (req, res) => {

    const token = req.cookies.refreshToken || req.body.refreshToken

    if (!token) {
        throw new ApiError(401, "Unauthorized access")
    }

    const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)

    const user = await findUserById(decodedToken._id)

    if (!user) {
        throw new ApiError(404, "Invalid refresh token")
    }

    if (!token && !user.refreshToken) {
        throw new ApiError(401, "Refresh token expired or used")
    }
    console.log(user.user_id, user.email)
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user.user_id, user.email)

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(201, { accessToken, refreshToken }, "New refresh token generated")
        )
})
const editUser = asyncHandler(async (req, res) => {

    const { user_id, firstName, lastName, email, phone, gender } = req.body

    console.log({ user_id, firstName, lastName, email, phone, gender })

    const lowerFirstName = firstName.toLowerCase()
    const lowerLastName = lastName.toLowerCase()
    const lowerEmail = email.toLowerCase()
    const lowerGender = gender.toLowerCase()

    if (!user_id) {
        throw new ApiError(400, "Id is required")
    }

    if ([lowerFirstName, lowerLastName, lowerEmail, phone, lowerGender].some((fields) => !fields || fields.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    await userUpdateById(lowerFirstName, lowerLastName, lowerEmail, phone, lowerGender, user_id)

    const user = await getUser(user_id)
    console.log(user, "Edited user")

    return res
        .status(201)
        .json(new ApiResponse(201, user, "User edited successfully"))
})
const deleteUser = asyncHandler(async (req, res) => {
    const { user_id } = req.body

    if (!user_id) {
        throw new ApiError(400, "User id is required")
    }

    await userDeleteById(user_id)

    return res
        .status(201)
        .json(new ApiResponse(201, {}, "User delete"))
})
const userAddressDetails = asyncHandler(async (req, res) => {
    const { fullName, pincode, state, city, address, country } = req.body

    const user_id = req.user.user_id
    const lowerFullName = fullName.toLowerCase()
    const lowerState = state.toLowerCase()
    const lowerCity = city.toLowerCase()
    const lowerAddress = address.toLowerCase()
    const lowerCountry = country.toLowerCase()

    if ([lowerFullName, pincode, lowerState, lowerCity, lowerAddress, lowerCountry].some((fields) => !fields || fields.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    await findExistedUserAddress(user_id)
    await addUserAddress(user_id, lowerFullName, pincode, lowerState, lowerCity, lowerAddress, lowerCountry)
    const response = await checkUserAddress(user_id)
    console.log(response, "USer address")
    return res
        .status(201)
        .json(new ApiResponse(201, response, "Address added"))
})
export {
    registerUser, loginUser, logoutUser, refreshAccessToken, editUser, deleteUser, userAddressDetails
}