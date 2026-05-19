import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {
    createProduct, getProduct, responseAllProducts, responseAllDataWithFilter, isProductExists,
} from "../model/product.model.js";


const addProduct = asyncHandler(async (req, res) => {
    const { productType, productName, productDetails, productPrice, productAddress } = req.body

    const lowerProductType = productType.toLowerCase()
    const user_id = req.user.user_id

    if ([lowerProductType, productName, productDetails, productPrice, productAddress].some((fields) => !fields || fields.trim() === "")) {
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

    const productAddInDb = await createProduct(user_id, productType, productName, productDetails, productPrice, productImageDone, productAddress)

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

export {
    addProduct, getAllProducts, getAllProductByFilter
}