import { ApiError } from "../utils/ApiError.js";
import { db } from "../db/index.js";

const getOrderById = async (order_id) => {
    const [rows] = await db.query
        (`SELECT order_id, user_id, total_amount FROM orders WHERE order_id =?`, [order_id])

    if (rows.length === 0) {
        throw new ApiError(404, "No order found")
    }
    return rows
}
const createOrder = async (user_id, productId, total_amount, payment_status) => {
    const [result] = await db.query(`
    INSERT INTO orders (user_id, productId,total_amount,payment_status) VALUES (?,?,?,?)`, [user_id, productId, total_amount, payment_status])
    if (result.affectedRows === 0) {
        throw new ApiError(404, "Database inserted data error", ["Crete orders"])
    }
    return result
}
const getOrderByUserId = async (user_id, status) => {
    const [rows] = await db.query
        (`SELECT order_id,productId,total_amount,payment_status FROM orders WHERE user_id=? AND payment_status =?`, [user_id, status])

    if (rows.length === 0) {
        throw new ApiError(404, "No unpaid order found", ["getOrderByUserId"])
    }
    return rows
}
const orderStatusUpdate = async (orderStatus, paymentStatus, paymentType, idArray, placeHolder) => {
    const [result] = await db.query(`
    UPDATE orders SET order_status=?, payment_status=?, payment_method=? WHERE order_id IN (${(placeHolder)})`, [orderStatus, paymentStatus, paymentType, ...idArray])

    if (result.affectedRows === 0) {
        throw new ApiError(404, "Database data update error", ["orderStatusUpdate methods"])
    }
    return result
}
const orderResponse = async () => {
    const [rows] = await db.query(`SELECT * from order_item`)

    if (rows.length === 0) {
        throw new ApiError(404, "order items is empty", ['orderResponse'])
    }
    return rows
}
const billDetailing = async (user_id) => {
    const [rows] = await db.query(`
    SELECT oi.order_item_id,oi.snapshot_name,oi.snapshot_price,oi.quantity,o.total_amount,p.seller_address,p.productId,
    u.address AS buyer_address,u.city AS buyer_city 
    FROM order_item AS oi   
    INNER JOIN products AS p ON oi.productId = p.productId
    INNER JOIN orders AS o ON oi.order_id = o.order_id          
    INNER JOIN user_address AS u ON o.user_id = u.user_id     
    WHERE o.user_id = ? AND o.payment_status=?`, [user_id, 'unpaid'])

    if (rows.length === 0) {
        throw new ApiError(404, "There are no product in cart items", ['cart item is empty', 'add product to cart then orders'])
    }
    return rows
}
const createBill = async (user_id, order_item_id, orderId, invoiceId, productId, seller_address, buyer_address, buyer_city, totalPrice, productName) => {
    const [result] = await db.query(`
    INSERT INTO order_bill (user_id, order_item_id, orderId, invoiceId, productId, seller_address, buyer_address, buyer_city, totalPrice,productName)
    VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [user_id, order_item_id, orderId, invoiceId, productId, seller_address, buyer_address, buyer_city, totalPrice, productName])
    if (result.affectedRows === 0) {
        throw new ApiError(404, "Database inserted data error", ["Crete bill"])
    }
    return result
}
const getBill = async (order_item_id) => {
    const [rows] = await db.query
        (`SELECT * FROM order_bill WHERE order_item_id=?`, [order_item_id])

    if (rows.length === 0) {
        throw new ApiError(404, "There are no bill in the list", ["getBill"])
    }
    return rows[0]
}
const responseAllCompleteOrders = async (user_id) => {
    const [rows] = await db.query(`SELECT * FROM order_item WHERE user_id=?`, [user_id])

    if (rows.length === 0) {
        throw new ApiError(404, "order items is empty")
    }
    return rows
}
const addOrderItems = async (user_id, order_id, productId, quantity, snapshot_name, snapshot_price, productImageUrl) => {
    const [result] = await db.query(`
    INSERT INTO order_item (user_id,order_id, productId, quantity, snapshot_name, snapshot_price, productImageUrl)
    VALUES (?,?,?,?,?,?,?)`, [user_id, order_id, productId, quantity, snapshot_name, snapshot_price, productImageUrl])

    console.log({ user_id, order_id, productId, quantity, snapshot_name, snapshot_price, productImageUrl })
    if (result.affectedRows === 0) {
        throw new ApiError(404, "Database inserted data error", ["Order add"])
    }

    return result
}
const updateOldOrder = async (user_id, status) => {
    const [result] = await db.query(`UPDATE orders SET payment_status=? WHERE user_id=? AND payment_status=?`, ['failed', user_id, status])
    console.log(result, "Update Old order")
    return { message: "updated" }
}


export {
    getOrderById, getOrderByUserId, orderStatusUpdate, orderResponse, billDetailing,
    createBill, getBill, responseAllCompleteOrders, addOrderItems, updateOldOrder, createOrder
}