import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateInvoiceID, generateOrderID } from "../service/bill.js";
import { razorpayInstance } from "../app.js";
import crypto from "crypto";
import { Orders } from "../model/orders.model.js";
import { Cart_Items } from "../model/cart_item.model.js";
import { Op, where } from "sequelize";
import { Order_Items } from "../model/order-item.model.js";
import { Address } from "../model/address.model.js";
import { User } from "../model/users.model.js";
import { Products } from "../model/products.model.js";
import { clearLine } from "readline";
import { cloneDeep } from "sequelize/lib/utils";
import { Order_Bill } from "../model/order_bill.model.js";
import { sequelize } from "../db/index.js";
import { raw } from "express";
import moment from 'moment';

const orderItems = asyncHandler(async (req, res) => {

    const { productIds, quantity } = req.body
    console.log(productIds, quantity)

    const user_id = req.user.user_id
    console.log(user_id,"o-item")
    // await isUserBlock(user_id)
    if (!Array.isArray(productIds || !Array.isArray(quantity))) {
        throw new ApiError(400, "All fields are required")
    }

    // if old orders Un-paid , now it`a update to failed 
    const oldOrder = await Orders.update({ payment_status: 'Failed',order_status:'Failed' }, { where: { [Op.and]: [{ user_id }, { payment_status: 'Un-paid' }] } })
    console.log(oldOrder)

    const idArray = Array.isArray(productIds) ? productIds : [productIds];
    const placeHolder = idArray.map(() => '?').join(',')
    // cart item ke product get
    const cartItem = await Cart_Items.findAll({
        where: { [Op.and]: [{ product_id: { [Op.in]: idArray } }, { user_id }] },
        attributes: ['cart_item_id', 'product_id', 'itemName', 'itemImage', 'itemQuantity', 'itemPrice'],
        raw: true
    })
    if (cartItem.length === 0) throw new ApiError(404, "There is no productId with the cart item you have enter",)


    let index = 0
    let addQty;
    let amount = 0
    let totalOrderProduct = 0
    let productDetails = []

    for (let item of cartItem) {
        let newQty = quantity[index]
        let price = Number(item.itemPrice) * newQty

        if (newQty !== 1) {
            console.log('RUN INNER', newQty)
            await Cart_Items.update({
                itemQuantity: Number(newQty),
                itemPrice: Number(price)
            },
                { where: { cart_item_id: item.cart_item_id } })
        }


        console.log(newQty, price, "money")
        const futureData = moment().add(2, 'days').toDate();
        console.log(futureData,"Future Date") 

        const orders = await Orders.create({
            user_id,
            product_id: item.product_id,
            total_amount: Number(price),
            order_status: 'Pending',
            payment_method: 'No-data',
            payment_status: 'Un-paid',
            createdAt:futureData    
        })

        const ordersOrder_id = orders.order_id || orders.id;
        // add details in the order_item jaha sare complete order aayege
        await Order_Items.create({
            user_id,
            order_id: ordersOrder_id,
            product_id: item.product_id,
            itemName: item.itemName,
            itemImage: item.itemImage,
            itemQuantity: newQty,
            itemPrice: price,
            order_status: 'Pending',
            success: 'No-data',
            createdAt:futureData    
        })
        totalOrderProduct += 1
        amount += price
        productDetails.push({ product_id: item.product_id, productPrice: price })

        index++
    }
    // console.log(addQty, 'cartItem')


    const a = await Cart_Items.destroy({
        where: { [Op.and]: [{ product_id: { [Op.in]: idArray } }, { user_id }] }
    })
    console.log(a)
    // await deleteCartItem(placeHolder, idArray)

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
    const user_id = req.user.user_id

    let calculatedAmount = 0
    let idArray = []
    let invoiceId = ''
    
    if (!userOrderAmount)   throw new ApiError(400, "Amount are required ")

    const t = await sequelize.transaction();

    try{
        const checkAddress = await Address.findOne({ where: { user_id }, raw: true,transaction: t })
    if (!checkAddress) throw new ApiError(400, "Address are required ", ["Enter your address"])

    const allCartItems = await Orders.findAll({
    where:{payment_status:'Un-paid',user_id},attributes: ['order_id', 'total_amount', 'payment_status'],
    // raw:true,
    include:[
        {model: User, attributes: ["user_id", "firstName", "lastName", "email", "role"],
        include:[{model:Address, attributes: ["address", "city_state"] }]
        },
        {model: Order_Items, attributes: ["order_item_id", "product_id", "itemName", "itemQuantity", "itemPrice"],
        include:[{
             model: Products, attributes: ["productAddress", "productStock"]
            }]
        }
    ],
    transaction:t
    })

    const cleanOrders = allCartItems.map(order => order.get({ plain: true }));

    const all = allCartItems.map((data) => {
        
        const [orderItem] = data.Order_Items || [];

    return {
        order_id: data.order_id,
        total_amount: data.total_amount,
        payment_status: data.payment_status,
        user_id: data.User?.user_id,
        order_item_id: orderItem?.order_item_id,
        itemName: orderItem?.itemName,
        itemQuantity: orderItem?.itemQuantity,
        itemPrice: orderItem?.itemPrice,
        product_id: orderItem?.product_id,
        seller_address: orderItem?.Product?.productAddress,
        productStock: orderItem?.Product?.productStock,
        buyer_address: data.User?.Address?.address,
        buyer_city_state: data.User?.Address?.city_state
    };
    })

    console.log(all,"All")
    if (all.length === 0) {
        throw new ApiError(403, "No orders in the list")
    }

    for (let { order_id, total_amount, payment_status } of all) {
        console.log({ order_id, total_amount })
        if (payment_status === 'Paid') throw new ApiError(400, "Payment already paid")
        idArray.push(Array.isArray(order_id) ? order_id : [order_id]);
        calculatedAmount += Number(total_amount)
    }

    calculatedAmount += 40               // Delivery amount 40 add
    console.log(`User: ${userOrderAmount} | Main: ${calculatedAmount}`)


    if (Number(userOrderAmount) !== calculatedAmount) {
        console.log('amount false')
        throw new ApiError(404, "Amount is not correct or enough")
    }

    const updateOrdersStatus = await Orders.update({
        order_status: 'Pending',
        payment_status: 'Un-paid',
        payment_method: 'COD'
    }, {
        where: { order_id: { [Op.in]: idArray } },
        transaction: t
    })

    for (let b of all) {
        invoiceId = generateInvoiceID()
        // console.log(b.product_id, 'inside b')
        await Order_Bill.create({
            user_id,
            order_item_id: b.order_item_id,
            invoiceId,
            productName: b.itemName,
            product_id: b.product_id,
            quantity: b.itemQuantity,
            seller_address: b.seller_address,
            buyer_address: b.buyer_address,
            buyer_city_state: b.buyer_city_state,
            totalPrice: Number(b.itemPrice),
        },{transaction:t})
        await Products.update({ productStock: b.productStock - 1 }, { where: { product_id: b.product_id },transaction: t })
        await Order_Items.update({ success: 'True' }, { where: { order_item_id: b.order_item_id },transaction: t })
    }
    console.log('CASH ON DEL DONE');
    await t.commit();
    return res
        .status(201)
        .json(new ApiResponse(201, { status: "Delivered" }, "Payment successfully"))
    }catch(err){
        await t.rollback()
        throw new ApiError(500,"Something went wrong",[err.message])
    }
})
const getCompletedOrder = asyncHandler(async (req, res) => {
    const user_id = req.user.user_id
    // const allOrders = await responseAllCompleteOrders(user_id)

    const allOrders = await Order_Items.findAll({where:{user_id} ,order: [['createdAt', 'DESC']] })
    
    if (!allOrders || allOrders.length === 0) throw new ApiError(404, "No order found")

    return res
        .status(201)
        .json(
            new ApiResponse(201, allOrders, "All orders fetched")
        )
})
const orderBill = asyncHandler(async (req, res) => {
    const { order_item_id } = req.body

    console.log(order_item_id,"OI")
    if (!order_item_id) {
        throw new ApiError(400, "order_item_id are required")
    }

    const bill = await Order_Bill.findOne({ 
        where: { order_item_id },
        include:[{model:User,attributes:["firstName","lastName"]}]
    })
    
    if (!bill || bill.length === 0) throw new ApiError(404, "No bill found")

        let date = String(bill.bill_date)
        bill.dataValues.bill_date = date.slice(0,25)
   

    return res
        .status(201)
        .json(new ApiResponse(201, bill, "Bill data fetched"))
})
const createRazorOrder = asyncHandler(async (req, res) => {

    const { productIds, userAmount, quantity } = req.body
    console.log({ productIds, userAmount, quantity })
    const user_id = req.user.user_id

    if (!productIds || !userAmount) {
        throw new ApiError(404, "Product id is required")
    }
    
    if(userAmount > 500000) throw new ApiError(400,"Razor pay does not provide to orders that amount are above 5-lakh,")

    await Orders.update({ payment_status: 'Failed' }, { where: { [Op.and]: [{ user_id }, { payment_status: 'Un-paid' }] } })
    const idArray = Array.isArray(productIds) ? productIds : [productIds];

    const cartItem = await Cart_Items.findAll({
        where: { [Op.and]: [{ product_id: { [Op.in]: idArray } }, { user_id }] },
        attributes: ["cart_item_id", 'product_id', 'itemName', 'itemImage', 'itemQuantity', 'itemPrice'],
        raw: true
    })

    if (cartItem.length === 0) throw new ApiError(404, "There is no productId with the cart item you have enter",)

    let index = 0;
    let addQty;
    let amount = 0;
    let totalOrderProduct = 0;
    let productDetails = [];

    for (let item of cartItem) {
        let newQty = quantity[index] || 1;
        let price = Number(item.itemPrice)
        let newTotalPrice = price * newQty;

        if (newQty !== 1) {
            console.log('RUN INNER', newQty)
            await Cart_Items.update(
                {
                    itemQuantity: newQty,
                    itemPrice: newTotalPrice
                },
                {
                    where: { cart_item_id: item.cart_item_id }
                }
            );
            console.log(newQty, price, newTotalPrice, "money")
        }

        const futureData = moment().add(2,'days').toDate();

        const orders = await Orders.create({
            user_id,
            product_id: item.product_id,
            total_amount: Number(newTotalPrice),
            order_status: 'Pending',
            payment_method: 'No-data',
            payment_status: 'Un-paid',
            createdAt:futureData
        })
        
        const ordersOrder_id = orders.order_id || orders.id;
        // add details in the order_item jaha sare complete order aayege
        await Order_Items.create({
            user_id,
            order_id: ordersOrder_id,
            product_id: item.product_id,
            itemName: item.itemName,
            itemImage: item.itemImage,
            itemQuantity: newQty,
            itemPrice: newTotalPrice,
            order_status: 'Pending',
            success: 'No-data',
            createdAt:futureData
        })
        totalOrderProduct += 1
        amount += newTotalPrice
        productDetails.push({ product_id: item.product_id, productPrice: newTotalPrice })

        index++
    }

    amount += 40
    console.log(`User: ${userAmount} | Main: ${amount}`)
    if (amount !== Number(userAmount)) {
        throw new ApiError(400, "Amount are not enough", ["Enter correct amount"])
    }

    await Cart_Items.destroy({
        where: { [Op.and]: [{ product_id: { [Op.in]: idArray } }, { user_id }] }
    })

    console.log(amount)

    const options = ({
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
    })
    try {
        const order = await razorpayInstance.orders.create(options)
        console.log(order, "order")

        console.log({ order, totalOrderProduct, productDetails }, "Razorpay Check out")
        return res
            .status(201)
            .json(new ApiResponse(201, { totalOrderProduct, productDetails, order }, "Order check successfully"))

    } catch (error) {
        throw new ApiError(500, "Razorpay order failed", [error]);
    }

})
const verifyPayment = asyncHandler(async (req, res) => {

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body
    console.log({ razorpay_order_id, razorpay_payment_id, razorpay_signature })
    const user_id = req.user.user_id
    let idArray = []
    let orderId = ''
    let invoiceId = ''

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        throw new ApiError(400, "All fields are required", ["Check [razorpay_order_id,razorpay_payment_id,razorpay_signature] are not missing"])
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || process.env.RAZOR_API_SECRET)
        .update(sign.toString())
        .digest("hex");

    const isAuthenticate = expectedSignature === razorpay_signature;

    if (!isAuthenticate) {
        throw new ApiError(400, "payment verification failed", ["razorpay_signature does not match"])
    }

    // await checkUserAddress(user_id)  
    const checkAddress = await Address.findOne({ where: { user_id }, raw: true })
    if (!checkAddress) throw new ApiError(400, "Address are required ", ["Enter your address"])

    // get bill details
    const allCartItems = await User.findAll({
        where: { user_id },
        attributes: ["user_id", "firstName", "lastName", "email", "role"],
        raw: true,
        include: [
            {
                model: Order_Items, attributes: ["order_item_id", "product_id", "itemName", "itemQuantity", "itemPrice"],
                include: [
                    { model: Products, attributes: ["productAddress", "productStock"] },
                    { model: Orders, where: { payment_status: 'Un-paid' }, attributes: ["payment_status", "payment_status"] },
                ]
            },
            { model: Address, attributes: ["address", "city_state"] }
        ],
       
    })
    const all = allCartItems.map((data) => {
        return {
            user_id: data.user_id,
            order_item_id: data['Order_Items.order_item_id'],
            itemName: data['Order_Items.itemName'],
            itemQuantity: data['Order_Items.itemQuantity'],
            itemPrice: data['Order_Items.itemPrice'],
            product_id: data['Order_Items.product_id'],
            seller_address: data['Order_Items.Product.productAddress'],
            productStock: data['Order_Items.Product.productStock'],
            buyer_address: data['Address.address'],
            buyer_city_state: data['Address.city_state'],
            payment_status: data['Order_Items.Order.payment_status']
        }
    })
    console.log(allCartItems, "data")
    // return;
    const orderProducts = await Orders.findAll({
        where: { user_id, payment_status: 'Un-paid' },
        attributes: ['order_id', 'total_amount', 'payment_status'],
        raw: true
    })                      // get bill details

    for (let item of orderProducts) {
        if (item.payment_status === 'Paid') {
            throw new ApiError(400, "Payment already paid")
        }
        idArray.push(Array.isArray(item.order_id) ? item.order_id : [item.order_id]);
    }

    const updateOrdersStatus = await Orders.update({
        order_status: 'Pending',
        payment_status: 'Paid',
        payment_method: 'RP'
    }, {
        where: { order_id: { [Op.in]: idArray } }
    })

    for (let b of all) {
        console.log(b)
        invoiceId = generateInvoiceID()
        console.log(b.product_id, 'inside b razoar pay')
        await Order_Bill.create({
            user_id,
            order_item_id: b.order_item_id,
            invoiceId,
            productName: b.itemName,
            product_id: b.product_id,
            quantity: b.itemQuantity,
            seller_address: b.seller_address,
            buyer_address: b.buyer_address,
            buyer_city_state: b.buyer_city_state,
            totalPrice: Number(b.itemPrice),
        })
        await Products.update({ productStock: b.productStock - 1 }, { where: { product_id: b.product_id } })
        await Order_Items.update({ success: 'True' }, { where: { order_item_id: b.order_item_id } })
    }
    console.log("Razor payment done")
    return res
        .status(200)
        .json(new ApiResponse(200, { status: "Paid" }, "Order placed successfully"));

})
const orderCancel = asyncHandler(async(req,res)=>{
    const {order_item_id} = req.body

    if(!order_item_id) throw new ApiError(400,"Order Item id is required")
    const findOrders = await Order_Items.findOne(
        {
        where:{order_item_id},
        attributes:["order_item_id",'order_id'],
    })

    let oi_id = findOrders.dataValues.order_item_id
    let o_id = findOrders.dataValues.order_id

    if(findOrders){
        await Orders.update(
            { order_status: 'Cancelled',payment_method: 'No-data',payment_status: 'No-data',createdAt:moment().toDate()},
            {
                where:{order_id:o_id}
            })
        await Order_Items.update(
            {order_status:'Cancelled',success:'False',createdAt:moment().toDate()},
            {
                where:{order_item_id:oi_id}
        })
    }
        return res
    .status(201)
    .json(new ApiResponse(201,`Order ${oi_id} cancelled`))
})
export {
    orderItems, orderPaymentProcess, getCompletedOrder, orderBill, verifyPayment, createRazorOrder,orderCancel
}
