import { sequelize } from "../db/index.js";
import { DataTypes } from "sequelize";

const Address = sequelize.define('Address',
    {
        fullName: {
            required: true,
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                isLowercase: true,
            },
        },
        address: {
            required: true,
            type: DataTypes.STRING(150),
            allowNull: false,
            validate: {
                isLowercase: true,
            },
        },
        city_state: {
            required: true,
            type: DataTypes.STRING(70),
            allowNull: false,
            validate: {
                isLowercase: true,
            },
        },
        country: {
            required: true,
            type: DataTypes.STRING(30),
            allowNull: false,
            validate: {
                isLowercase: true,
            },
        },
        pincode: {
            required: true,
            type: DataTypes.STRING(10),
            allowNull: false,
        },
    },
    {
        freezeTableName: true,
        timestamps: false
    }
)

export { Address }