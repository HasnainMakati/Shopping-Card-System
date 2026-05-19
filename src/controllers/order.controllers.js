import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
    createOrder, getOrderById,
    getOrderByUserId, orderStatusUpdate, addOrder,
    responseAllCompleteOrders, billDetailing, createBill, getBill,
    updateOldOrder
} from "../model/order.model.js";
import { generateInvoiceID, generateOrderID } from "../service/bill.js";
import { getCartItemByProductId, deleteCartItem } from "../model/cart.model.js";
import { getUserAddress } from "../model/user.model.js";


const orderItems = asyncHandler(async (req, res) => {

    const { productIds } = req.body
    const user_id = req.user.user_id

    if (!productIds) {
        throw new ApiError(404, "Product id is required")
    }

    await updateOldOrder(user_id, 'unpaid')

    // await updateOldOrder(user_id, 'unpaid')
    console.log(user_id, "Running")
    const idArray = Array.isArray(productIds) ? productIds : [productIds];
    const placeHolder = idArray.map(() => '?').join(',')

    console.log(idArray, placeHolder, 'ko')

    const cartItem = await getCartItemByProductId(placeHolder, idArray)

    let amount = 0
    let totalOrderProduct = 0
    let productDetails = []

    for (const item of cartItem) {

        const itemPrice = Number(item.snapshot_price)

        const orders = await createOrder(user_id, item.productId, itemPrice, 'unpaid')
        const orderItems = await getOrderById(orders.insertId)

        await addOrder(
            user_id, orderItems[0].order_id, item.productId, item.quantity, item.snapshot_name, itemPrice, item.productImageUrl)
        totalOrderProduct += 1
        amount += itemPrice
        productDetails.push({ productId: item.productId, productPrice: itemPrice })

    }
    await deleteCartItem(placeHolder, idArray)

    const response = {
        totalAmount: Number(amount.toFixed(2)) + 40,
        totalOrderProduct,
        productDetails
    }
    console.log(response, "Check out")
    return res
        .status(201)
        .json(new ApiResponse(201, response, "Order check successfully"))

})
const orderPaymentProcess = asyncHandler(async (req, res) => {

    let { userOrderAmount } = req.body
    let user_id = req.user.user_id
    let calculatedAmount = 0
    let idArray = []
    let orderId = ''
    let invoiceId = ''

    if (!userOrderAmount) {
        throw new ApiError(400, "Amount are required ")
    }

    await getUserAddress(user_id)

    const bill = await billDetailing(user_id)
    const orderProducts = await getOrderByUserId(user_id, 'unpaid')
    console.log(bill, 'BIll')

    for (let item of orderProducts) {
        if (item.payment_status === 'paid') {
            throw new ApiError(400, "Payment already paid")
        }
        idArray.push(Array.isArray(item.order_id) ? item.order_id : [item.order_id]);
        calculatedAmount += Number(item.total_amount)
    }

    calculatedAmount += 40
    console.log(userOrderAmount, calculatedAmount)
    if (Number(userOrderAmount) !== calculatedAmount) {
        console.log('amount false')
        throw new ApiError(404, "Amount is not correct or enough")
    }

    const placeHolder = idArray.map(() => '?').join(',');
    await orderStatusUpdate("shipped", "paid", "cash", idArray, placeHolder)

    for (let b of bill) {
        orderId = generateOrderID()
        invoiceId = generateInvoiceID()
        // productList.push({
        //     productName: b.snapshot_name,
        //     productQty: b.quantity,
        //     productPrice: b.snapshot_price,
        //     seller_address: b.seller_address
        // })

        const createOrderBill = await createBill(
            user_id,
            orderId,
            invoiceId,
            b.productId,
            b.total_amount,
            // JSON.stringify(productList),
            b.buyer_address,
            b.seller_address,
            b.buyer_city
        )
    }
    return res
        .status(201)
        .json(new ApiResponse(201, { orderId, invoiceId, status: "Delivered" }, "Payment successfully"))
})
const getCompletedOrder = asyncHandler(async (req, res) => {
    const user_id = req.user.user_id
    const allOrders = await responseAllCompleteOrders(user_id)
    return res
        .status(201)
        .json(
            new ApiResponse(201, allOrders, "All orders fetched")
        )
})
const orderBill = asyncHandler(async (req, res) => {
    const { orderId, invoiceId } = req.body

    if (!orderId || !invoiceId) {
        throw new ApiError(400, "orderId or invoiceId are required")
    }

    const bill = await getBill(orderId, invoiceId)
    console.log(bill, "Order bill")
    return res
        .status(201)
        .json(new ApiResponse(201, bill, "Bill created"))
})
export {
    orderItems, orderPaymentProcess, getCompletedOrder, orderBill
}