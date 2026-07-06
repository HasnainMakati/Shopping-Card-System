import dotenv from "dotenv";
import mysql from "mysql2/promise";
import Sequelize from "sequelize";

dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME2, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false
})

export { sequelize }