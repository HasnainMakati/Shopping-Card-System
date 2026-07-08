import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Products } from "../model/products.model.js";


const getAllProducts = asyncHandler(async (req, res) => {
    const user_id = req.user.user_id
    const allProducts = await Products.findAll()
    
    if (allProducts.length === 0) throw new ApiError(400, "Products not found")
    return res
        .status(201)
        .json(
            new ApiResponse(201, allProducts, "All products fetched")
        )
})
const getAllProductByFilter = asyncHandler(async (req, res) => {

    const { productType } = req.query
    console.log(productType)
    if (!productType) {
        throw new ApiError(400, "Products type required")
    }

    const response = await Products.findAll({ where: { productType }, raw: true })

    if (response.length === 0) {
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