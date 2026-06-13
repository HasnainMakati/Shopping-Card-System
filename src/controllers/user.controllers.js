import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../model/users.model.js";
import { Op, where } from "sequelize";
import { Address } from "../model/address.model.js";
import { Products } from "../model/products.model.js";

const generateAccessAndRefreshToken = async (user_id) => {
    try {
        const user = await User.findByPk(user_id)

        const accessToken = await user.createAccessToken()
        const refreshToken = await user.createRefreshToken()

        user.refreshToken = refreshToken
        await user.save();
        // console.log(accessToken, refreshToken, "token")


        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Token generate failed",
            [{
                error: "Server error",
                issues: "Some thing went wrong while we generate access and refresh token"
            }])
    }
}
const checkUserTest = asyncHandler(async (req, res) => {
    const user = await User.findByPk(3, {
        attributes: {
            exclude: ['password', 'refreshToken']
        }
    })
    console.log(user.user_id)
    return res.json(user)
})
const registerUser = asyncHandler(async (req, res) => {
    console.log(req.body, "BODY")
    const { firstName, lastName, email, phone, password, gender, role } = req.body

    if ([firstName, lastName, email, phone, password, gender, role].some((fields) => !fields || fields.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        where: {
            [Op.or]: [{ email }, { phone }]
        }
    })

    if (existedUser) {
        throw new ApiError(400, "User already existed")
    }

    // const encryptedPassword = await bcrypt.hash(password, 10)

    let lowerRole = 'user';
    if (role === process.env.ROLE_SECRET_KEY) {
        lowerRole = process.env.ROLE_SECRET_KEY;
    }

    const createUser = await User.create({ firstName, lastName, email, phone, password, gender, role: lowerRole })

    let user_id = createUser.user_id

    const user = await User.findByPk(user_id, {
        attributes: {
            exclude: ['password', 'refreshToken', 'ac_status']
        }
    })
    console.log(user.dataValues, `${lowerRole} CREATED`)

    return res
        .status(201)
        .json(
            new ApiResponse(201, user.dataValues, `${lowerRole} created Successfully`)
        )
})
const loginUser = asyncHandler(async (req, res) => {
    const { email, password, role } = req.body
    if (!email || !password || !role) {
        throw new ApiError(400, "All fields are required ")
    }

    const findUser = await User.findOne({
        where: { [Op.and]: [{ email }, { role }] }
    })

    if (!findUser) {
        throw new ApiError(400, "Invalid data", ["There are no user that you enter email and role"])
    }

    const isPasswordCorrect = await bcrypt.compare(password, findUser.password)

    if (!isPasswordCorrect) {
        throw new ApiError(404, "Invalid password")
    }
    console.log(isPasswordCorrect, "pass")
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(findUser.user_id)

    const loggedUser = await User.findOne({
        where: {
            [Op.and]: [{ user_id: findUser.user_id }, { role: findUser.role }]
        }
    })

    console.log({ email, password, role }, "LOGIN")
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
            new ApiResponse(200, loginResponse, `${findUser.role} logged successfully`))
})
const logoutUser = asyncHandler(async (req, res) => {

    const user_id = req.user.user_id;
    await User.update({ refreshToken: "" }, { where: { user_id: user_id } })

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(201)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(201, {}, `User ${user_id} logged out`)
        )
})
const refreshAccessToken = asyncHandler(async (req, res) => {

    const token = req.cookies.refreshToken || req.body.refreshToken

    if (!token) {
        throw new ApiError(401, "Unauthorized access")
    }

    const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findByPk(decodedToken._id)

    if (!user) {
        throw new ApiError(404, "Invalid refresh token")
    }

    if (!token !== !user.refreshToken) {
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

    if (!user_id) {
        throw new ApiError(400, "Id is required")
    }

    if ([firstName, lastName, email, phone, gender].some((fields) => !fields || fields.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const a = await User.update(
        { firstName, lastName, email, phone, gender },
        {
            where: { user_id }, raw: true,
            raw: true
        }
    )

    console.log(a, "edit hua")
    const user = await User.findByPk(user_id, {
        attributes: {
            exclude: ['refreshToken', 'password']
        }, raw: true
    })
    console.log(user, "Edited user")

    return res
        .status(201)
        .json(new ApiResponse(201, user, "User edited successfully"))
})
const userAddressDetails = asyncHandler(async (req, res) => {
    const { fullName, pincode, state, city, address, country } = req.body

    if ([fullName, pincode, state, city, address, country].some((fields) => !fields || fields.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    const user_id = req.user.user_id

    const existedAddress = await Address.findOne({
        where: { user_id },
        attributes: ["user_id"],
        raw: true
    })

    if (existedAddress) {
        throw new ApiError(400, "You already enter address")
    }

    const city_state = city.concat("-", state)

    const createAddress = await Address.create({ fullName, address, city_state, country, pincode, user_id })

    const response = await Address.findByPk(createAddress.dataValues.id, { raw: true })
    // console.log(response, "USer address")
    return res
        .status(201)
        .json(new ApiResponse(201, response, "Address added"))
})

export {
    registerUser, loginUser, logoutUser, refreshAccessToken, editUser, userAddressDetails, checkUserTest
}
