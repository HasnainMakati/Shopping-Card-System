import { ApiError } from "../utils/ApiError.js";
import { db } from "../db/index.js";

const createCart = async (user_id, productId, quantity) => {
    const [result] = await db.query(`
    INSERT INTO carts (user_id, productId,quantity) VALUES (?,?,?)`, [user_id, productId, quantity])

    if (result.affectedRows === 0) {
        throw new ApiError(404, "Database inserted data error", ["Crete cart"])
    }

    return result
}
const createCartItemsTemp = async (user_id, productId, quantity, snapshot_name, snapshot_price, productImageUrl) => {
    const [result] = await db.query(`
    INSERT INTO cart_item (user_id, productId, quantity, snapshot_name, snapshot_price,productImageUrl)
    VALUES (?,?,?,?,?,?)`, [user_id, productId, quantity, snapshot_name, snapshot_price * quantity, productImageUrl])

    if (result.affectedRows === 0) {
        throw new ApiError(404, "Database inserted data error", ["cart_item"])
    }

    return result
}
const getAllCartItemResponse = async () => {
    const [rows] = await db.query
        (`SELECT productId,cart_item_id,snapshot_name,productImageUrl,quantity, snapshot_price FROM cart_item`)

    if (rows.length === 0) {
        throw new ApiError(404, "Cart items is empty")
    }
    return rows
}
const cartItemDeleteById = async (cart_item_id) => {
    const [result] = await db.query(`DELETE FROM cart_item WHERE cart_item_id = ?`, [cart_item_id])

    if (result.affectedRows === 0) {
        throw new ApiError(404, "There is no id with the cart item you have delete")
    }
    return { message: "Delete" }
}
const findExistedCartItem = async (productId) => {

    const [rows] = await db.query("SELECT productId FROM cart_item WHERE productId=?", [productId]);

    if (rows.length > 0) {
        throw new ApiError(401, "The product you entered already exist",)
    }
}
const getCartItemById = async (user_id) => {
    const [rows] = await db.query
        (`SELECT productId, quantity, productImageUrl, snapshot_name, snapshot_price FROM cart_item WHERE user_id =?`, [user_id])

    if (rows.length === 0) {
        throw new ApiError(404, "Cart items is empty")
    }
    return rows
}
const getCartItemByProductId = async (placeHolder, idArray) => {
    const [rows] = await db.query
        (`SELECT productId, quantity, productImageUrl, snapshot_name, snapshot_price FROM cart_item WHERE productId IN (${placeHolder})`, idArray)
    if (rows.length === 0) {
        throw new ApiError(404, "There is no productId with the cart item you have enter", ["getCartItemByProductId"])
    }
    return rows
}
const deleteCartItem = async (placeHolder, idArray) => {
    const [result] = await db.query(`DELETE FROM cart_item WHERE productId IN (${placeHolder})`, idArray)

    if (result.affectedRows === 0) {
        throw new ApiError(404, "There is no user with the name you have delete")
    }
    return { message: "Delete" }
}
const productFindById = async (productId) => {
    const [rows] = await db.query(`
    SELECT productId,productName,productPrice,productImageUrl,seller_address FROM products WHERE productId = ?`, [productId])
    // SELECT productId,productName,productPrice,productImageUrl,seller_address FROM products WHERE productId = ? AND user_id`, [productId, user_id])

    if (rows.length === 0) {
        throw new ApiError(404, "There is no product with the id you have enter")
    }
    return rows[0]
}
export {
    createCart, createCartItemsTemp, getAllCartItemResponse, cartItemDeleteById, findExistedCartItem,
    getCartItemById, getCartItemByProductId, deleteCartItem, productFindById
}