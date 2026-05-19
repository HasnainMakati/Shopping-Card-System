import { ApiError } from "../utils/ApiError.js";
import { db } from "../db/index.js";


const createProduct = async (user_id, productType, productName, productDetails, productPrice, productImageUrl, productAddress) => {
    const [result] = await db.query(`
    INSERT INTO products (user_id, productType, productName, productDetails, productPrice, productImageUrl,seller_address)
    VALUES (?, ?,?,?,?,?,?)`, [user_id, productType, productName, productDetails, productPrice, productImageUrl, productAddress])

    if (result.affectedRows === 0) {
        throw new ApiError(404, "Database inserted data error")
    }

    return result
}
const getProduct = async (productId) => {
    const [rows] = await db.query(
        `SELECT user_id,productId, productType, productName, productDetails, productPrice, productImageUrl,seller_address
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
    SELECT productId,productName,productPrice,productImageUrl,seller_address FROM products WHERE productId = ?`, [productId])
    // SELECT productId,productName,productPrice,productImageUrl,seller_address FROM products WHERE productId = ? AND user_id`, [productId, user_id])

    if (rows.length === 0) {
        throw new ApiError(404, "There is no product with the id you have enter")
    }
    return rows[0]
}

export {
    createProduct, getProduct, responseAllProducts, responseAllDataWithFilter, isProductExists, productFindById,
}