import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
    productFindById, createCart, createCartItemsTemp, getAllCartItemResponse,
    cartItemDeleteById, findExistedCartItem, getCartItemById,
} from "../model/cart.model.js";

const productAddToCart = asyncHandler(async (req, res) => {

    const { productId, quantity } = req.body
    const user_id = req.user.user_id

    if (!productId || !quantity) {
        throw new ApiError(400, "All fields are required", ['Check productId or quantity are not missing'])
    }

    const product = await productFindById(productId)
    console.log(product, "productAddToCart")

    await findExistedCartItem(productId)
    await createCart(user_id, productId, quantity)
    await createCartItemsTemp(user_id, productId, quantity, product.productName, product.productPrice, product.productImageUrl)

    const response = await getCartItemById(user_id)

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
const deleteCartItems = asyncHandler(async (req, res) => {

    const cartItem_id = req.params.id
    if (!cartItem_id) {
        throw new ApiError(400, "Cart item id is required")
    }

    await cartItemDeleteById(cartItem_id)

    return res
        .status(201)
        .json(new ApiResponse(201, {}, "Cart item delete"))
})

export {
    productAddToCart, getAllCartItems, deleteCartItems
}