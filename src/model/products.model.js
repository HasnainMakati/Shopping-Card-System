import { sequelize } from "../db/index.js";
import { DataTypes } from "sequelize";


const Products = sequelize.define('Products',
    {
        product_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        productName: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        productDetails: {
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        productType: {
            type: DataTypes.STRING(30),
            allowNull: false,
            validate: {
                isLowercase: true,
            }
        },
        productPrice: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        productStock: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        productAddress: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        productImage: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    },
    {
        freezeTableName: true,
        timestamps: true
    }
)

export { Products }