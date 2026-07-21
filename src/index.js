import dotenv from "dotenv";
dotenv.config();

import { app } from "./app.js";
// import { db } from "./db/index.js"
import { sequelize } from "./db/index.js";
import { User } from "./model/users.model.js";
import { Address } from "./model/address.model.js";
import { Carts } from "./model/carts.model.js";
import { Products } from "./model/products.model.js";
import { Cart_Items } from "./model/cart_item.model.js";
import { Orders } from "./model/orders.model.js";
import { Order_Items } from "./model/order-item.model.js";
import { Order_Bill } from "./model/order_bill.model.js";
import { Otp } from "./model/otp.model.js";

// User-Address
User.hasOne(Address, {
    foreignKey: "user_id",
    onDelete: 'CASCADE', // Parent delete hone par child bhi delete hoga
    hooks: true
})
Address.belongsTo(User, { foreignKey: "user_id" })

// User-Order_Item
User.hasMany(Orders, { foreignKey: "user_id", onDelete: "CASCADE" })
Orders.belongsTo(User, { foreignKey: "user_id" })

User.hasMany(Order_Items, { foreignKey: "user_id", onDelete: "CASCADE" })
Order_Items.belongsTo(User, { foreignKey: "user_id" })

// Product-Order
Orders.hasMany(Order_Items, { foreignKey: "order_id", onDelete: "CASCADE" })
Order_Items.belongsTo(Orders, { foreignKey: "order_id" })

Products.hasMany(Order_Items, { foreignKey: "product_id" })                         
Order_Items.belongsTo(Products, { foreignKey: "product_id" })

Order_Items.hasMany(Order_Bill, { foreignKey: "order_item_id" })
Order_Bill.belongsTo(Order_Items, { foreignKey: "order_item_id" })

User.hasMany(Order_Bill, { foreignKey: "user_id" })
Order_Bill.belongsTo(User, { foreignKey: "user_id" })


const startServer = async () => {
    try {
        await sequelize.authenticate();
        // console.log("Database connect successfully")

        await sequelize.sync()
        // console.log('All models synchronized');

        app.listen(process.env.PORT || 4000, () => {
            console.log(`Server running port on ${process.env.PORT}`)
        })
    } catch (error) {
        console.log("DB Error :", error.message)
        process.exit(1);
    }
}

startServer()


// db.query("SELECT 1")
//     .then(() => {
//         console.log("Database connect successfully")

//         app.listen(process.env.PORT || 4000, () => {
//             console.log(`Server running port on ${process.env.PORT}`)
//         })
//     }).catch((err) => {
//         console.log("Database connection failed", err);
//         process.exit(1)
//     });
