import { sequelize } from "../db/index.js";
import { DataTypes } from "sequelize";

// cart_id, user_id, productId, quantity
const Otp = sequelize.define('Otp',
    {
        otp_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
        },
        otp_num: {
            type: DataTypes.STRING,
        },
    },
    {
        freezeTableName: true,
    }
)

export { Otp }