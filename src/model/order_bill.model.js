/* bill_id int AI PK 
order_item_id int 
orderId varchar(50) 
invoiceId varchar(50) 
productId int 

seller_address varchar(100) 
buyer_address varchar(150) 
buyer_city varchar(30) 
totalPrice decimal(10,2) 
bill_date timestamp 
productName varchar(100) */

import { sequelize } from "../db/index.js";
import { DataTypes } from "sequelize";

const Order_Bill = sequelize.define('Order_Bill',
    {
        bill_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        order_item_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        invoiceId: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        productName: {
            type: DataTypes.STRING(150),
            allowNull: false
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        seller_address: {
            type: DataTypes.STRING(150),
            allowNull: false
        },
        buyer_address: {
            type: DataTypes.STRING(150),
            allowNull: false
        },
        buyer_city_state: {
            type: DataTypes.STRING(30),
            allowNull: false
        },
        totalPrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        bill_date: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    },
    {
        freezeTableName: true,
        timestamps: false,
        initialAutoIncrement: '1001'
    }
)

export { Order_Bill }