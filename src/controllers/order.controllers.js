import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
    createOrder, getOrderById,
    getOrderByUserId, orderStatusUpdate, addOrderItems,
    responseAllCompleteOrders, billDetailing, createBill, getBill,
    updateOldOrder,
} from "../model/order.model.js";
import { generateInvoiceID, generateOrderID } from "../service/bill.js";
import { getCartItemByProductId, deleteCartItem } from "../model/cart.model.js";
import { checkUserAddress } from "../model/user.model.js";
import { razorpayInstance } from "../app.js";
import crypto from "crypto";


const orderItems = asyncHandler(async (req, res) => {

    const { productIds, method } = req.body
    const user_id = req.user.user_id

    if (!productIds) {
        throw new ApiError(404, "Product id is required")
    }

    // if old orders unpaid , now it`a update to failed 
    await updateOldOrder(user_id, 'unpaid')

    const idArray = Array.isArray(productIds) ? productIds : [productIds];
    const placeHolder = idArray.map(() => '?').join(',')

    // cart item ke product get
    const cartItem = await getCartItemByProductId(placeHolder, idArray)

    let amount = 0
    let totalOrderProduct = 0
    let productDetails = []

    for (const item of cartItem) {

        const itemPrice = Number(item.snapshot_price)

        // create order jisme status and price he
        const orders = await createOrder(user_id, item.productId, itemPrice, 'unpaid')
        const orderItems = await getOrderById(orders.insertId)

        // add details in the order_item jaha sare complete order aayege
        await addOrderItems(user_id, orderItems[0].order_id, item.productId, item.quantity, item.snapshot_name, itemPrice, item.productImageUrl)
        totalOrderProduct += 1
        amount += itemPrice
        productDetails.push({ productId: item.productId, productPrice: itemPrice })

    }
    await deleteCartItem(placeHolder, idArray)

    console.log(amount, "Amount he")

    const options = ({
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
    })

    try {
        const order = await razorpayInstance.orders.create(options)
        console.log(order, "order")

        console.log({ order, totalOrderProduct, productDetails }, "Check out")
        return res
            .status(201)
            .json(new ApiResponse(201, { order, totalOrderProduct, productDetails }, "Order check successfully"))

    } catch (error) {
        throw new ApiError(500, "Razorpay order failed", ["Order creation cancelled"]);
    }



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

    await checkUserAddress(user_id)

    const bill = await billDetailing(user_id)                           // get bill details
    const orderProducts = await getOrderByUserId(user_id, 'unpaid')     // get only unpaid orders
    console.log(bill, 'Bill')

    for (let item of orderProducts) {
        if (item.payment_status === 'paid') {
            throw new ApiError(400, "Payment already paid")
        }
        idArray.push(Array.isArray(item.order_id) ? item.order_id : [item.order_id]);
        calculatedAmount += Number(item.total_amount)
    }

    calculatedAmount += 40                        // Delivery amount 40 add
    console.log(`User: ${userOrderAmount} | Main: ${calculatedAmount}`)

    if (Number(userOrderAmount) !== calculatedAmount) {
        console.log('amount false')
        throw new ApiError(404, "Amount is not correct or enough")
    }

    const placeHolder = idArray.map(() => '?').join(',');
    await orderStatusUpdate("shipped", "paid", "cash", idArray, placeHolder)

    for (let b of bill) {
        orderId = generateOrderID()
        invoiceId = generateInvoiceID()
        await createBill(
            user_id, b.order_item_id, orderId, invoiceId, b.productId, b.seller_address, b.buyer_address, b.buyer_city, b.total_amount, b.snapshot_name
        )
    }
    return res
        .status(201)
        .json(new ApiResponse(201, { status: "Delivered" }, "Payment successfully"))
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
    const { order_item_id } = req.body

    console.log({ order_item_id }, "order bill")

    if (!order_item_id) {
        throw new ApiError(400, "order_item_id are required")
    }

    const bill = await getBill(order_item_id)
    return res
        .status(201)
        .json(new ApiResponse(201, bill, "Bill created"))
})
const verifyPayment = asyncHandler(async (req, res) => {

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body
    const user_id = req.user.user_id
    let idArray = []
    let orderId = ''
    let invoiceId = ''

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        throw new ApiError(400, "All fields are required", ["Check [razorpay_order_id,razorpay_payment_id,razorpay_signature] are not missing"])
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZOR_API_SECRET)
        .update(sign.toString())
        .digest("hex");

    const isAuthenticate = expectedSignature === razorpay_signature;
    console.log("expectedSignature=> ", expectedSignature)
    console.log("razorpay_signature=> ", razorpay_signature)

    if (!isAuthenticate) {
        throw new ApiError(400, "payment verification failed", ["razorpay_signature does not match"])
    }

    await checkUserAddress(user_id)                         // get bill details
    const orderProducts = await getOrderByUserId(user_id, 'unpaid')
    const bill = await billDetailing(user_id)                           // get bill details

    for (let item of orderProducts) {
        if (item.payment_status === 'paid') {
            throw new ApiError(400, "Payment already paid")
        }
        idArray.push(Array.isArray(item.order_id) ? item.order_id : [item.order_id]);
    }


    const placeHolder = idArray.map(() => '?').join(',');
    await orderStatusUpdate("shipped", "paid", "online", idArray, placeHolder);

    for (let b of bill) {
        orderId = generateOrderID()
        invoiceId = generateInvoiceID()
        await createBill(
            user_id, b.order_item_id, orderId, invoiceId, b.productId, b.seller_address, b.buyer_address, b.buyer_city, b.total_amount, b.snapshot_name
        )
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { status: "Paid" }, "Order placed successfully"));

})
export {
    orderItems, orderPaymentProcess, getCompletedOrder, orderBill, verifyPayment
}