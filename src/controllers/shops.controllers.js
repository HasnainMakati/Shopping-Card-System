import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateAccessAndRefreshToken } from "../service/token.js";
import bcrypt from "bcrypt";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {
    findExistedUser, createUser, getUser, findUserByEmail, userDeleteById, userUpdateById, userFindByIdAndUpdateRefreshToken,
    createProduct, getProduct, responseAllProducts, responseAllDataWithFilter, isProductExists, productFindById,
    createCart, createCartItemsTemp, getCartItemsById, getAllCartItemResponse,
    findUserById
} from "../model/query.model.js";
import jwt from "jsonwebtoken";

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
    console.log(user, "Edited")

    return res
        .status(201)
        .json(new ApiResponse(201, user, "User edited successfully"))
})
const deleteUser = asyncHandler(async (req, res) => {
    const user_id = req.params.user_id
    console.log(req.params)
    if (!user_id) {
        throw new ApiError(400, "User id is required")
    }

    await userDeleteById(user_id)

    return res
        .status(201)
        .json(new ApiResponse(201, {}, "User delete"))
})

// <========================== Products ============================>
const addProduct = asyncHandler(async (req, res) => {
    const { productType, productName, productDetails, productPrice } = req.body

    const lowerProductType = productType.toLowerCase()
    const user_id = req.user.user_id

    if ([lowerProductType, productName, productDetails, productPrice].some((fields) => !fields || fields.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    await isProductExists(productName)

    const productImageLocalPath = req.file?.path;

    if (!productImageLocalPath) {
        throw new ApiError(400, "Image are required")
    }

    const productImageDone = await uploadOnCloudinary(productImageLocalPath)

    if (!productImageDone) {
        throw new ApiError(400, "Image upload failed")
    }
    // console.log(productImageDone, "Url")

    const productAddInDb = await createProduct(user_id, productType, productName, productDetails, productPrice, productImageDone)

    const product = await getProduct(productAddInDb.insertId)
    console.log(product, "PRODUCT CREATED")

    return res
        .status(201)
        .json(
            new ApiResponse(201, product, "Product successfully added")
        )
})
const getAllProducts = asyncHandler(async (req, res) => {
    const allProducts = await responseAllProducts()
    return res
        .status(201)
        .json(
            new ApiResponse(201, allProducts, "All products fetched")
        )
})
const getAllProductByFilter = asyncHandler(async (req, res) => {

    const { productType } = req.query

    if (!productType) {
        throw new ApiError(400, "Products name required")
    }

    const response = await responseAllDataWithFilter(productType)

    if (!response) {
        throw new ApiError(404, "Invalid products name", ["Products not existed", "Enter valid products"])
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, response, `${productType} data fetched successfully`)
        )
})

// <========================== Cart ============================>
const productAddToCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body
    const user_id = req.user.user_id
    console.log(quantity, "quantity")
    if (!productId || !quantity) {
        throw new ApiError(400, "All fields are required", ['Check productId or quantity are not missing'])
    }

    const product = await productFindById(productId)
    console.log(product, "PRODUCT")

    await createCart(user_id, productId, quantity)
    const cartItemData = await createCartItemsTemp(user_id, productId, quantity, product.productName, product.productPrice, product.productImageUrl)

    const response = await getCartItemsById(cartItemData.insertId)

    return res
        .status(201)
        .json(
            new ApiResponse(201, response, "Product add to cart")
        )
})
const getAllCartItems = asyncHandler(async (req, res) => {
    const allCartItems = await getAllCartItemResponse()
    return res
        .status(201)
        .json(
            new ApiResponse(201, allCartItems, "All cart products fetched")
        )
})


export {
    registerUser, loginUser, logoutUser, editUser, deleteUser,
    addProduct, getAllProducts, getAllProductByFilter, productAddToCart, getAllCartItems, refreshAccessToken
}   