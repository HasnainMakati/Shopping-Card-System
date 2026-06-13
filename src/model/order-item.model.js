// user_id int 
// order_id int 
// productId int 
// snapshot_name varchar(70) 
// snapshot_price decimal(10,2) 
// quantity int 
// productImageUrl varchar(200) 
// order_status varchar(80) 
// success varchar(30) 
// order_date timestamp

import { sequelize } from "../db/index.js";
import { DataTypes } from "sequelize";

const Order_Items = sequelize.define('Order_Items',
    {
        order_item_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        product_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        itemName: {
            allowNull: false,
            type: DataTypes.STRING(70),
        },
        itemPrice: {
            allowNull: false,
            type: DataTypes.DECIMAL(10, 2),
        },
        itemQuantity: {
            allowNull: false,
            type: DataTypes.INTEGER
        },
        itemImage: {
            allowNull: false,
            type: DataTypes.STRING(150),
        },
        order_status: {
            type: DataTypes.STRING(50),
            defaultValue: 'Your item is on the way',
        },
        success: {
            type: DataTypes.STRING(50),
            defaultValue: 'no data',
        },
    },
    {
        freezeTableName: true,
        timestamps: true
    }
)


export { Order_Items }