import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
    responseAllProducts, responseAllDataWithFilter
} from "../model/product.model.js";


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
    getAllProducts, getAllProductByFilter
}