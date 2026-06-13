// order_id int AI PK 
// user_id int 
// productId int 
// total_amount decimal(10,2) 
// order_status varchar(30) 
// payment_status varchar(30) 
// payment_method varchar(30) 
// order_date timestamp

import { sequelize } from "../db/index.js";
import { DataTypes } from "sequelize";

const Orders = sequelize.define('Orders',
    {
        order_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        total_amount: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        order_status: {
            type: DataTypes.STRING(30),
            defaultValue: 'pending',
            allowNull: false
        },
        payment_method: {
            type: DataTypes.STRING(30),
            defaultValue: 'no data',
            allowNull: false
        },
        payment_status: {
            type: DataTypes.STRING(30),
            defaultValue: 'unpaid',
            allowNull: false
        },

    },
    {
        freezeTableName: true,
        timestamps: true
    }
)


export { Orders }