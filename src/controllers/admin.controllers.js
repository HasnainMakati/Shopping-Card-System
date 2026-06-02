import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import {
    allBill, allInVoice, allOrders, allProducts, allUser, findAdmin
} from "../model/admin.model.js";
import {
    createProduct, getProduct, isProductExists, updateProduct, productFindById, deleteProduct,
} from "../model/product.model.js";
import { userAccountStatusUpdate, userDeleteById } from "../model/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const addProduct = asyncHandler(async (req, res) => {

    const user_id = req.user.user_id

    const { productType, productName, productDetails, productPrice, productAddress, stock } = req.body

    const lowerProductType = productType.toLowerCase()

    if ([lowerProductType, productName, productDetails, productPrice, productAddress].some((fields) => !fields || fields.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    if (!stock) {
        throw new ApiError(400, "Stock are required !")
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

    const productAddInDb = await createProduct(user_id, productType, productName, productDetails, productPrice, stock, productAddress, productImageDone)

    const product = await getProduct(productAddInDb.insertId)
    console.log(product, "PRODUCT CREATED")

    return res
        .status(201)
        .json(
            new ApiResponse(201, product, "Product successfully added")
        )
})
const editProduct = asyncHandler(async (req, res) => {
    const { productId, productType, productName, productDetails, productPrice, productAddress } = req.body
    const stock = req.body.stock
    const lowerProductType = productType.toLowerCase()

    if ([lowerProductType, productName, productDetails, productAddress].some((fields) => !fields || fields.trim() === "") || !productPrice) {
        throw new ApiError(400, "All fields are required")
    }

    if (!stock) {
        throw new ApiError(400, "Stock are required")
    }
    await productFindById(productId)
    const productImageLocalPath = req.file?.path;

    if (!productImageLocalPath) {
        throw new ApiError(400, "Image are required")
    }

    const productImageDone = await uploadOnCloudinary(productImageLocalPath)

    if (!productImageDone) {
        throw new ApiError(400, "Image upload failed")
    }
    console.log(productImageDone, "Url")

    await updateProduct(productId, productType, productName, productDetails, productPrice, stock, productAddress, productImageDone)

    const product = await getProduct(productId)
    console.log(product, "PRODUCT UPDATED")

    return res
        .status(201)
        .json(
            new ApiResponse(201, product, "Product updated")
        )
})
const removeProduct = asyncHandler(async (req, res) => {
    const { productId } = req.body

    if (!productId) {
        throw new ApiError(400, "ProductId is required")
    }

    await deleteProduct(productId)
    console.log(productId, 'Del')
    return res
        .status(201)
        .json(new ApiResponse(201, "Product deleted"))
})
const setUserAccountBlock = asyncHandler(async (req, res) => {

    const { user_id, ac_status } = req.body
    console.log({ user_id, ac_status })
    const adminId = req.user.user_id

    await findAdmin(adminId)

    if (!user_id || !ac_status) {
        throw new ApiError(400, "user_id or ac_status is required")
    }

    const setStatus = ac_status === 'block' ?
        await userAccountStatusUpdate(user_id, 'block') :
        await userAccountStatusUpdate(user_id, 'active')

    console.log(setStatus)
    return res
        .status(201)
        .json(new ApiResponse(201, `User ${user_id} is ${setStatus.ac_status}`))
})
const deleteUser = asyncHandler(async (req, res) => {
    const { user_id } = req.body
    const adminId = req.user.user_id
    console.log({ adminId, user_id })
    await findAdmin(adminId)

    if (!user_id) {
        throw new ApiError(400, "User id is required")
    }

    await userDeleteById(user_id)

    return res
        .status(201)
        .json(new ApiResponse(201, {}, `User ${user_id} is deleted`))
})
const getAllUser = asyncHandler(async (req, res) => {
    const users = await allUser()
    console.log('AU')
    return res
        .status(201)
        .json(
            new ApiResponse(201, users, "All users fetched")
        )
})
const getAllProducts = asyncHandler(async (req, res) => {
    const products = await allProducts()
    console.log('AP')
    return res
        .status(201)
        .json(new ApiResponse(201, products, "All products fetched"))
})
const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await allOrders()
    console.log('AO')
    return res
        .status(201)
        .json(
            new ApiResponse(201, orders, "All orders fetched")
        )
})
const getAllInVoice = asyncHandler(async (req, res) => {
    const inVoicesData = await allInVoice()
    return res
        .status(201)
        .json(new ApiResponse(201, inVoicesData, "All inVoice are fetched"))

})
const getAllBill = asyncHandler(async (req, res) => {
    const { orderId } = req.body

    if (!orderId) {
        throw new ApiError(400, "orderId is required")
    }
    const bill = await allBill(orderId)
    console.log('AB')
    return res
        .status(201)
        .json(
            new ApiResponse(201, bill, "All bill fetched")
        )
})
// const getAllOrders = asyncHandler(async (req, res) => {
//     const orders = await allOrders()
//     return res
//         .status(201)
//         .json(
//             new ApiResponse(201, orders, "All orders fetched")
//         )
// })
// const getAllOrders = asyncHandler(async (req, res) => {
//     const orders = await allOrders()
//     return res
//         .status(201)
//         .json(
//             new ApiResponse(201, orders, "All orders fetched")
//         )
// })
export { addProduct, editProduct, removeProduct, setUserAccountBlock, deleteUser, getAllUser, getAllProducts, getAllOrders, getAllInVoice, getAllBill }