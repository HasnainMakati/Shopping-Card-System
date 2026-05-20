import { ApiError } from "../utils/ApiError.js";
import { db } from "../db/index.js";


const findUserByToken = async (user_id) => {

    const [rows] = await db.query("SELECT user_id,email FROM users WHERE user_id = ?", [user_id])
    if (rows.length === 0) {
        throw new ApiError(401, "Decoded token id is not found",)
    }
    return rows[0]
}
const findUserByEmail = async (email) => {

    const [rows] = await db.query("SELECT user_id,email,password FROM users WHERE email = ?", [email])
    if (rows.length === 0) {
        throw new ApiError(401, "No user exists with this email address",)
    }
    return rows[0]
}
const findUserById = async (user_id) => {
    const [rows] = await db.query("SELECT user_id,email,password,refreshToken FROM users WHERE user_id = ?", [user_id])
    if (rows.length === 0) {
        throw new ApiError(401, "No user exists with this email address",)
    }
    return rows[0]
}
const findExistedUser = async (phone, email) => {

    const [rows] = await db.query("SELECT user_id,email FROM users WHERE phone = ? OR email = ?", [phone, email])
    if (rows.length > 0) {
        throw new ApiError(401, "The email or phone number you entered already exist",)
    }
}
const createUser = async (firstName, lastName, email, phone, encryptedPassword, gender) => {
    const [result] = await db.query(`
    INSERT INTO users (firstName, lastName, email, phone, password, gender)
    VALUES (?, ?, ?,?,?,?)`, [firstName, lastName, email, phone, encryptedPassword, gender])

    if (result.affectedRows === 0) {
        throw new ApiError(404, "Database inserted data error")
    }

    return result
}
const getUser = async (user_id) => {
    const [rows] = await db.query(
        "SELECT user_id,firstName,lastName,email,phone,gender FROM users WHERE user_id = ?",
        [user_id]
    );

    if (rows.length === 0) {
        throw new ApiError(404, "User not exists in database",)
    }
    return rows[0];
}
const userUpdateById = async (firstName, lastName, email, phone, gender, user_id) => {
    const [result] = await db.query(`
    UPDATE users SET firstName=?,lastName=?,email=?,phone=?,gender=? WHERE user_id = ?`, [firstName, lastName, email, phone, gender, user_id])
    if (result.affectedRows === 0) {
        throw new ApiError(404, "There is no user with the user_id you have submitted")
    }
    return result
}
const userFindByIdAndUpdateRefreshToken = async (user_id, emptyToken) => {
    const [result] = await db.query(`
    UPDATE users SET refreshToken=? WHERE user_id = ?`, [emptyToken, user_id])

    if (result.affectedRows === 0) {
        throw new ApiError(404, "There is no user with the id you have enter")
    }
    return result
}
const userDeleteById = async (user_id) => {
    const [result] = await db.query('DELETE FROM users WHERE user_id = ?', [user_id])

    if (result.affectedRows === 0) {
        throw new ApiError(404, "There is no user with the name you have delete")
    }
    return { message: "Delete" }
}
const addUserAddress = async (user_id, lowerFullName, pincode, lowerState, lowerCity, lowerAddress, lowerCountry) => {
    const [result] = await db.query(`
    INSERT INTO user_address (user_id, fullName, pincode, state, city, address, country)
    VALUES (?,?,?,?,?,?,?)`, [user_id, lowerFullName, pincode, lowerState, lowerCity, lowerAddress, lowerCountry])

    if (result.affectedRows === 0) {
        throw new ApiError(404, "Database inserted data error", ["addUserAddress"])
    }

    return result
}
const checkUserAddress = async (user_id) => {
    const [rows] = await db.query(`SELECT * FROM user_address WHERE user_id=?`, [user_id])

    if (rows.length === 0) {
        throw new ApiError(404, "User address is empty")
    }
    return rows[0]
}
const findExistedUserAddress = async (user_id) => {

    const [rows] = await db.query("SELECT user_id FROM user_address WHERE user_id = ?", [user_id])
    console.log(rows, 'mili')
    if (rows.length > 0) {
        throw new ApiError(401, "The address you entered already exist", ["delete old address then enter new address"])
    }
}
export {
    findExistedUser, createUser, getUser, findUserByEmail, userDeleteById,
    userUpdateById, userFindByIdAndUpdateRefreshToken, findUserById, findUserByToken,
    addUserAddress, checkUserAddress, findExistedUserAddress
}