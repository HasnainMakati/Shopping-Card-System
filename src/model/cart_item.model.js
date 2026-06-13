import { sequelize } from "../db/index.js";
import { DataTypes } from "sequelize";

const Cart_Items = sequelize.define('Cart_Items',
    {
        cart_item_id: {
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
        itemName: {
            allowNull: false,
            type: DataTypes.STRING(70),
        },
        itemDetails: {
            allowNull: false,
            type: DataTypes.STRING(150),
        },
        itemImage: {
            allowNull: false,
            type: DataTypes.STRING(150),
        },
        itemQuantity: {
            allowNull: false,
            type: DataTypes.BIGINT
        },
        itemPrice: {
            allowNull: false,
            type: DataTypes.DECIMAL(10, 2),
        }
    },
    {
        freezeTableName: true,
        timestamps: true
    }
)

export { Cart_Items }