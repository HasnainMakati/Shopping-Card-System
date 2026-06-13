import mysql from "mysql2/promise";
import Sequelize from "sequelize";
// const db = mysql.createPool({
//     user: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     host: process.env.DB_HOST,
//     database: process.env.DB_NAME
// })

let db;
export { db }


const sequelize = new Sequelize(process.env.DB_NAME2, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false
})

export { sequelize }