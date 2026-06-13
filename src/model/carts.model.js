import { sequelize } from "../db/index.js";
import { DataTypes } from "sequelize";

// cart_id, user_id, productId, quantity
const Carts = sequelize.define('Carts',
    {
        cart_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            allowNull: false,
            type: DataTypes.INTEGER,
        },
        product_id: {
            allowNull: false,
            type: DataTypes.INTEGER,
        },
        quantity: {
            allowNull: false,
            type: DataTypes.INTEGER,
        },
    },
    {
        freezeTableName: true,
        timestamps: false
    }
)

export { Carts }