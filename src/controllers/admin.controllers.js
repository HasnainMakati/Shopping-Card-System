import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { userAccountStatusUpdate, userDeleteById } from "../model/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Products } from "../model/products.model.js";
import { DATE, Op } from "sequelize";
import { User } from "../model/users.model.js";
import { Orders } from "../model/orders.model.js";
import { Order_Items } from "../model/order-item.model.js";
import { Order_Bill } from "../model/order_bill.model.js";
import { sequelize } from "../db/index.js";

const checkAdmin = async (adminId) => {
    const result = await User.findOne({
        where: { [Op.and]: [{ user_id: adminId }, { role: 'admin' }] },
        raw: true
    })
    if (!result) throw new ApiError(400, "There are no admin in the database")

    return true;
}
const addProduct = asyncHandler(async (req, res) => {

    const user_id = req.user.user_id
    // product_id, productName, productType, productPrice, productStock, productAddress, productImage, createdAt, updatedAt, user_id

    const { productType, productName, productDetails, productPrice, productAddress, productStock } = req.body

    await checkAdmin(user_id)

    if ([productType, productName, productDetails, productPrice, productAddress].some((fields) => !fields || fields.trim() === "")) {
        throw new ApiError(400, "All fields are required")
    }

    if (!productStock) {
        throw new ApiError(400, "productStock are required !")
    }

    const existedProducts = await Products.findOne({
        where: {
            [Op.or]: [{ productName }, { productType }]
        },
        attributes: ["product_id"],
        raw: true
    })

    if (existedProducts) {
        throw new ApiError(400, "Product already existed !")
    }
    const productImageLocalPath = req.file?.path;

    if (!productImageLocalPath) {
        throw new ApiError(400, "Image are required")
    }

    const productImageDone = await uploadOnCloudinary(productImageLocalPath)

    if (!productImageDone) {
        throw new ApiError(400, "Image upload failed")
    }

    const productAddInDb = await Products.create(
        {
            user_id,
            productName,
            productDetails,
            productType,
            productPrice,
            productStock,
            productAddress,
            productImage: productImageDone
        })

    const product = await Products.findByPk(productAddInDb.dataValues.product_id, { raw: true })
    console.log(product, "PRODUCT CREATED")

    return res
        .status(201)
        .json(
            new ApiResponse(201, product, "Product successfully added")
        )
})
const editProduct = asyncHandler(async (req, res) => {
    const { productId, productType, productName, productDetails, productPrice, productAddress, productStock } = req.body
    const user_id = req.user.user_id


    if ([productType, productName, productDetails, productAddress].some((fields) => !fields || fields.trim() === "") || !productPrice) {
        throw new ApiError(400, "All fields are required")
    }

    await checkAdmin(user_id)
    if (!productStock) {
        throw new ApiError(400, "productStock are required")
    }
    const findProduct = await Products.findOne({
        where: { [Op.or]: productId },
        raw: true
    })
    // await productFindById(productId)
    const productImageLocalPath = req.file?.path;

    if (!productImageLocalPath) {
        throw new ApiError(400, "Image are required")
    }

    const productImageDone = await uploadOnCloudinary(productImageLocalPath)

    if (!productImageDone) {
        throw new ApiError(400, "Image upload failed")
    }
    console.log(productImageDone, "Url")

    await Products.update({ productType, productName, productDetails, productPrice, productStock, productAddress, productImageDone },
        { where: { product_id } }
    )

    const product = await Products.findOne({ where: { product_id }, raw: true })
    console.log(product, "PRODUCT UPDATED")

    return res
        .status(201)
        .json(
            new ApiResponse(201, product, "Product updated")
        )
})
const removeProduct = asyncHandler(async (req, res) => {
    const { productId } = req.body
    const user_id = req.user.user_id

    if (!productId) {
        throw new ApiError(400, "ProductId is required")
    }

    await checkAdmin(user_id)
    await Products.destroy({ where: { product_id } })
    console.log(productId, 'Del')
    return res
        .status(201)
        .json(new ApiResponse(201, "Product deleted"))
})
const setUserAccountBlock = asyncHandler(async (req, res) => {

    const { user_id, ac_status } = req.body
    console.log({ user_id, ac_status })
    const adminId = req.user.user_id

    // await findAdmin(adminId)

    if (!user_id || !ac_status) {
        throw new ApiError(400, "user_id or ac_status is required")
    }

    await checkAdmin(adminId)

    const setStatus = ac_status === 'block' ?
        await User.update({ ac_status: 'block' }, { where: { user_id } }) :
        await User.update({ ac_status: 'active' }, { where: { user_id } })

    console.log(setStatus)
    return res
        .status(201)
        .json(new ApiResponse(201, `User ${user_id} is ${setStatus.ac_status}`))
})
const deleteUser = asyncHandler(async (req, res) => {
    const { user_id } = req.body
    const adminId = req.user.user_id

    await checkAdmin(adminId)

    if (!user_id) throw new ApiError(400, "User id is required")

    const user = await User.findOne({ where: { user_id } })

    if (!user) throw new ApiError(404, "User not found")

    await User.destroy({ where: { [Op.and]: [{ user_id }, { role: 'user' }] } })

    return res
        .status(201)
        .json(new ApiResponse(201, {}, `User ${user_id} is deleted`))
})
const getAllUser = asyncHandler(async (req, res) => {
    const user_id = req.user.user_id
    await checkAdmin(user_id)

    const users = await User.findAll({ attributes: { exclude: ["password", "refreshToken", "updatedAt"] } })

    const bills = await Order_Bill.findAll({ raw: true })

    const countingData = bills.reduce((acc, cur) => {
        const userId = cur.user_id;
        const price = Number(cur.totalPrice) || 0;

        if (!acc[userId]) {
            acc[userId] = {
                user_id: userId,
                totalOrders: 0,
                totalAmount: 0
            };
        }

        acc[userId].totalOrders += 1;
        acc[userId].totalAmount += price;

        return acc
    }, {})

    if (!users) throw new ApiError(404, "Users not found")

    console.log('AU')
    return res
        .status(201)
        .json(
            new ApiResponse(201, { users, countingData }, "All users fetched")
        )
})
const getAllProducts = asyncHandler(async (req, res) => {
    const user_id = req.user.user_id
    await checkAdmin(user_id)

    const products = await Products.findAll()
    if (!products) throw new ApiError(404, "Products not found")

    console.log('AP')
    return res
        .status(201)
        .json(new ApiResponse(201, products, "All products fetched"))
})
const getAllOrders = asyncHandler(async (req, res) => {
    const user_id = req.user.user_id
    await checkAdmin(user_id)

    const orders = await Orders.findAll({
        where: { payment_status: 'paid' },
        attributes: ["order_id", "total_amount", "order_status", "createdAt"],
        include: [{
            model: Order_Items,
            include: [{ model: User, attributes: ["firstName", "lastName"] }],
            attributes: ["user_id"]
        }]
    })
    if (!orders) throw new ApiError(404, "Orders not found")
    console.log('AO')
    return res
        .status(201)
        .json(
            new ApiResponse(201, orders, "All orders fetched")
        )
})
const getAllInVoice = asyncHandler(async (req, res) => {
    const user_id = req.user.user_id
    await checkAdmin(user_id)

    const inVoicesData = await User.findAll({
        attributes: ["user_id", "firstName", "lastName", "role"],
        where: { role: 'user' },
        include: [{
            model: Order_Items, attributes: ["itemName", "itemPrice"],
            include: [
                { model: Orders, attributes: ["order_id", "payment_status", "product_id"], where: { payment_status: 'paid' } },
                { model: Order_Bill, attributes: ["user_id", "invoiceId", "bill_id", "bill_date"] }]
        }]
    })
    return res
        .status(201)
        .json(new ApiResponse(201, inVoicesData, "All inVoice are fetched"))

})
const getAllBill = asyncHandler(async (req, res) => {
    const { order_item_id } = req.body
    const user_id = req.user.user_id
    await checkAdmin(user_id)

    if (!order_item_id) {
        throw new ApiError(400, "orderId is required")
    }
    const bill = await Order_Bill.findOne({ where: { order_item_id } })
    if (!bill) { throw new ApiError(404, "Orders bill no found with this order_item_id") }
    console.log('AB')
    return res
        .status(201)
        .json(
            new ApiResponse(201, bill, "All bill fetched")
        )
})
const operationalHighlight = asyncHandler(async (req, res) => {

    const user_id = req.user.user_id

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    let month = `${startOfMonth}`.split(" ")[1]

    await checkAdmin(user_id)

    try {
        const [pendingOrders, totalOrders, lowStock, totalProduct, activeAccount, totalUsers, revenue] = await Promise.all([
            Orders.count({ col: 'order_status', where: { order_status: 'pending' } }),
            Orders.count({ col: 'order_status', where: { order_status: 'shipped' } }),
            Products.count({ col: 'productStock', where: { productStock: { [Op.lt]: 10 } } }),
            Products.count({ col: "product_id" }),
            User.count({ col: 'ac_status', where: { ac_status: 'active' } }),
            User.count({ col: "user_id" }),
            Order_Bill.sum("totalPrice", { where: { bill_date: { [Op.gte]: startOfMonth } } })
        ])

        console.log('AH')

        return res
            .status(201)
            .json(
                new ApiResponse(201,
                    {
                        pendingOrders,
                        totalOrders,
                        lowStock,
                        totalProduct,
                        activeAccount,
                        totalUsers,
                        revenue: (revenue * 10) / 100,
                        month
                    }, "All data fetched")
            )
    } catch (error) {
        throw new ApiError(500, "Something went wrong while we get data from the database", [error.message])
    }

})

export {
    addProduct, editProduct, removeProduct, setUserAccountBlock, deleteUser,
    getAllUser, getAllProducts, getAllOrders, getAllInVoice, getAllBill,
    operationalHighlight
}