import { ApiError } from "../utils/ApiError.js";
import { db } from "../db/index.js";

const allProducts = async () => {
    const [rows] = await db.query("SELECT productName,productImageUrl,productPrice,productType,stock FROM products");

    if (rows.length === 0) {
        throw new ApiError(403, "No products")
    }
    return rows
}
const allOrders = async () => {
    const [rows] = await db.query("SELECT * FROM orders");

    if (rows.length === 0) {
        throw new ApiError(403, "No Orders")
    }
    return rows
}
const allBill = async (orderId) => {
    const [rows] = await db.query(
        `SELECT * FROM order_bill WHERE orderId = ?`,
        [orderId]
    );
    console.log(rows)
    if (!rows || rows.length === 0) {
        throw new ApiError(404, "There are no bills in the list", ["allBill"]);
    }

    return rows;
}
const allUser = async () => {
    const [rows] = await db.query(`select 
    u.user_id, u.firstName,u.lastName,u.email,u.ac_status,u.role,created_at,
    COUNT(ob.order_item_id) as total_orders,SUM(ob.totalPrice) as total_price
    from users as u inner join order_bill as ob on u.user_id=ob.user_id group by u.user_id`);

    if (rows.length === 0) {
        throw new ApiError(403, "No User")
    }
    return rows
}
const allInVoice = async () => {
    const [rows] = await db.query(`
    SELECT u.user_id,u.firstName,
    ob.bill_id,ob.orderId,ob.totalPrice,ob.bill_date,o.payment_status 
    FROM users AS u INNER JOIN order_bill AS ob ON u.user_id=ob.user_id 
    INNER JOIN orders AS o ON o.user_id = ob.user_id WHERE o.payment_status=? GROUP BY ob.bill_id`, ['paid']);

    if (rows.length === 0) {
        throw new ApiError(403, "No Invoice")
    }
    return rows
}
const findAdmin = async (adminId) => {
    const [rows] = await db.query(`SELECT user_id,firstName FROM users WHERE user_id=? AND role=?`, [adminId, 'admin'])

    if (rows.length === 0) {
        throw new ApiError(401, "Only Admin can access users information or data")
    }
}



export {
    allProducts, allOrders, allUser, allInVoice, allBill, findAdmin,
}
