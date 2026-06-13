import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { isUserBlock } from "../model/user.model.js";
import { Products } from "../model/products.model.js";
import { Cart_Items } from "../model/cart_item.model.js";
import { Carts } from "../model/carts.model.js";
import { Op, where } from "sequelize";
import { User } from "../model/users.model.js";
import { Address } from "../model/address.model.js";
import { Order_Items } from "../model/order-item.model.js";
import { Orders } from "../model/orders.model.js";

const productAddToCart = asyncHandler(async (req, res) => {

    const { product_id, quantity } = req.body
    console.log({ quantity }, "avi avi")
    const user_id = req.user.user_id
    // await isUserBlock(user_id)

    if (!product_id || !quantity) {
        throw new ApiError(400, "All fields are required", ['Check product_id or quantity are not missing'])
    }

    const product = await Products.findByPk(product_id, { raw: true })

    if (!product || product.productStock === 0) throw new ApiError(500, "Product out of stock or not exist!")

    const existedCartItem = await Cart_Items.findOne({
        where: {
            [Op.and]: [{ user_id }, { product_id }]
        }
    }, { raw: true })

    if (existedCartItem) throw new ApiError(401, "The product you entered already exist in cart items",)

    await Carts.create({ user_id, product_id, quantity })

    const createCartItems = await Cart_Items.create({
        itemName: product.productName,
        itemImage: product.productImage,
        itemQuantity: 1,
        itemPrice: Number(product.productPrice),
        itemDetails: product.productDetails,
        product_id,
        user_id
    }, { raw: true })

    const response = await Cart_Items.findAll({ where: { user_id }, raw: true })
    console.log(response, "Product Cart")

    if (!response) {
        throw new ApiError(400, "Item add failed")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(201, response, "Product add to cart")
        )
})
const getAllCartItems = asyncHandler(async (req, res) => {
    const user_id = req.user.user_id

    // snapshot_name, quantity, itemPrice, productId, seller_address, buyer_address, buyer_city
    const allCartItems = await Cart_Items.findAll({
        where: { user_id }
    })
    return res
        .status(201)
        .json(
            new ApiResponse(201, allCartItems, "All cart products fetched")
        )
})
const deleteCartItems = asyncHandler(async (req, res) => {

    const cartItem_id = req.params.id
    const user_id = req.user.user_id
    // await isUserBlock(user_id)

    if (!cartItem_id) {
        throw new ApiError(400, "Cart item id is required")
    }

    await Cart_Items.destroy({ where: { cart_item_id: cartItem_id } })

    return res
        .status(201)
        .json(new ApiResponse(201, {}, "Cart item delete"))
})

export {
    productAddToCart, getAllCartItems, deleteCartItems
}