import { ApiError } from "../utils/ApiError.js"
import { db } from "../db/index.js"

const findUserByToken = async (user_id) => {

    const [rows] = await db.query("SELECT user_id,email FROM users WHERE user_id = ?", [user_id])
    if (rows.length === 0) {
        throw new ApiError(401, "Decoded token id is not found",)
    }
    return rows[0]
}
const findUserByEmail = async (email) => {

    const [rows] = await db.query("SELECT user_id,email,password FROM users WHERE email = ?", [email])
    if (rows.length === 0) {
        throw new ApiError(401, "No user exists with this email address",)
    }
    return rows[0]
}
const findUserById = async (user_id) => {
    const [rows] = await db.query("SELECT user_id,email,password,refreshToken FROM users WHERE user_id = ?", [user_id])
    if (rows.length === 0) {
        throw new ApiError(401, "No user exists with this email address",)
    }
    return rows[0]
}
const findExistedUser = async (phone, email) => {

    const [rows] = await db.query("SELECT user_id,email FROM users WHERE phone = ? OR email = ?", [phone, email])
    if (rows.length > 0) {
        throw new ApiError(401, "The email or phone number you entered already exist",)
    }
}
const createUser = async (firstName, lastName, email, phone, encryptedPassword, gender) => {
    const [result] = await db.query(`
    INSERT INTO users (firstName, lastName, email, phone, password, gender)
    VALUES (?, ?, ?,?,?,?)`, [firstName, lastName, email, phone, encryptedPassword, gender])

    if (result.affectedRows === 0) {
        throw new ApiError(404, "Database inserted data error")
    }

    return result
}
const getUser = async (user_id) => {
    const [rows] = await db.query(
        "SELECT user_id,firstName,lastName,email,phone,gender FROM users WHERE user_id = ?",
        [user_id]
    );

    if (rows.length === 0) {
        throw new ApiError(404, "User not exists in database",)
    }
    return rows[0];
}
const userUpdateById = async (firstName, lastName, email, phone, gender, user_id) => {
    const [result] = await db.query(`
    UPDATE users SET firstName=?,lastName=?,email=?,phone=?,gender=? WHERE user_id = ?`, [firstName, lastName, email, phone, gender, user_id])
    if (result.affectedRows === 0) {
        throw new ApiError(404, "There is no user with the name you have submitted")
    }
    return result
}
const userFindByIdAndUpdateRefreshToken = async (user_id, emptyToken) => {
    const [result] = await db.query(`
    UPDATE users SET refreshToken=? WHERE user_id = ?`, [emptyToken, user_id])

    if (result.affectedRows === 0) {
        throw new ApiError(404, "There is no user with the id you have enter")
    }
    return result
}
const userDeleteById = async (user_id) => {
    const [result] = await db.query('DELETE FROM users WHERE user_id = ?', [user_id])

    if (result.affectedRows === 0) {
        throw new ApiError(404, "There is no user with the name you have delete")
    }
    return { message: "Delete" }
}
// <============================== Products ==================================>

const createProduct = async (user_id, productType, productName, productDetails, productPrice, productImageUrl) => {
    const [result] = await db.query(`
    INSERT INTO products (user_id, productType, productName, productDetails, productPrice, productImageUrl)
    VALUES (?, ?,?,?,?,?)`, [user_id, productType, productName, productDetails, productPrice, productImageUrl])

    if (result.affectedRows === 0) {
        throw new ApiError(404, "Database inserted data error")
    }

    return result
}
const getProduct = async (productId) => {
    const [rows] = await db.query(
        `SELECT user_id,productId, productType, productName, productDetails, productPrice, productImageUrl
        FROM products WHERE productId = ?`, [productId]);

    if (rows.length === 0) {
        throw new ApiError(404, "Products not exists in database",)
    }
    return rows[0];
}
const responseAllProducts = async () => {
    const [rows] = await db.query(`SELECT * FROM products`);

    if (rows.length === 0) {
        throw new ApiError(404, "No any products exists in database",)
    }
    return rows;
}
const responseAllDataWithFilter = async (productType) => {
    const [rows] = await db.query(`SELECT * FROM products WHERE productType = ?`, [productType]);

    if (rows.length === 0) {
        throw new ApiError(404, "No any products exists in database",)
    }
    return rows;
}
const isProductExists = async (productName) => {
    const [rows] = await db.query("SELECT productName FROM products WHERE productName = ?", [productName])
    if (rows.length > 0) {
        throw new ApiError(401, "The product you entered already exist",)
    }
}
const productFindById = async (productId) => {
    const [rows] = await db.query(`
    SELECT productId,productName,productPrice,productImageUrl FROM products WHERE productId = ?`, [productId])

    if (rows.length === 0) {
        throw new ApiError(404, "There is no product with the id you have enter")
    }
    return rows[0]
}
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
const getCartItemsById = async (cart_item_id) => {
    const [rows] = await db.query(`
        SELECT cart_item_id,snapshot_name,snapshot_price,quantity,
        productImageUrl FROM cart_item WHERE cart_item_id =?`, [cart_item_id])

    if (rows.length === 0) {
        throw new ApiError(404, "Cart items is empty")
    }
    return rows[0]
}
const getAllCartItemResponse = async () => {
    const [rows] = await db.query
        (`SELECT cart_item_id,snapshot_name,productImageUrl,quantity, snapshot_price FROM cart_item`)

    if (rows.length === 0) {
        throw new ApiError(404, "Cart items is empty")
    }
    return rows
}
export {
    findUserByToken, findExistedUser, findUserByEmail, findUserById,
    createUser, getUser, userUpdateById, userDeleteById, userFindByIdAndUpdateRefreshToken,
    createProduct, getProduct, responseAllProducts, responseAllDataWithFilter, isProductExists,
    productFindById, createCart, createCartItemsTemp, getCartItemsById, getAllCartItemResponse
}