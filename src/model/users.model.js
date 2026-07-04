import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/ApiError.js";


const User = sequelize.define(
    "User",
    {
        user_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        firstName: {
            required: true,
            type: DataTypes.STRING(30),
            validate: {
                isLowercase: true,
            },
            allowNull: false,
        },
        lastName: {
            type: DataTypes.STRING(30),
            validate: {
                isLowercase: true,
            },
        },
        email: {
            required: true,
            type: DataTypes.STRING,
            validate: {
                isEmail: true,
                isLowercase: true,
            },
            unique: true,
            allowNull: false,
        },
        phone: {
            required: true,
            type: DataTypes.STRING(20),
            validate: {
                isNumeric: true,
            },
            unique: true,
            allowNull: false,
        },
        password: {
            required: true,
            type: DataTypes.STRING,
            validate: {
                len: [6, 100],
            },
        },
        gender: {
            type: DataTypes.ENUM("male", "female", "other"),
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM("user", "admin"),
        },
        ac_status: {
            type: DataTypes.ENUM("active", "block"),
            defaultValue: "active",
        },
        refreshToken: {
            type: DataTypes.STRING,
        },
    },
    {
        hooks: {
            beforeCreate: async (user) => {
                user.password = await bcrypt.hash(user.password, 10);
            },
            beforeUpdate: async (user) => {
                
                if (user.changed("password")) {
                    user.password = await bcrypt.hash(user.password, 10);
                }
            },
        },
        timestamps: true,
    },
);

User.prototype.createAccessToken = function () {
    return jwt.sign(
        {
            _id: this.user_id,
            email: this.email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        },
    );
};
User.prototype.createRefreshToken = function () {
    return jwt.sign(
        {
            _id: this.user_id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        },
    );
};
export { User };
