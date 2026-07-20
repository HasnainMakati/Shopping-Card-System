import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../model/users.model.js";
import { Op, where } from "sequelize";
import { Address } from "../model/address.model.js";
import crypto from "crypto";
import { Otp } from "../model/otp.model.js";
// import { sendEmail } from "../service/emailConfig.js";
import { sequelize } from "../db/index.js";
import axios from "axios";
import gender_detect from "gender-detection"

export const generateAccessAndRefreshToken = async (user_id) => {
    try {
        const user = await User.findByPk(user_id);

        const accessToken = await user.createAccessToken();
        const refreshToken = await user.createRefreshToken();

        user.refreshToken = refreshToken;
        await user.save();
        // console.log(accessToken, refreshToken, "token")

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Token generate failed", [
            {
                error: "Server error",
                issues:
                    "Some thing went wrong while we generate access and refresh token",
            },
        ]);
    }
};
const registerUser = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, phone, password, gender, role } =
        req.body;

    if ([firstName, lastName, email, phone, password, gender, role].some(
            (fields) => !fields || fields.trim() === "",
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        where: {
            [Op.or]: [{ email }, { phone }],
        },
    });

    if (existedUser) {
        throw new ApiError(400, "User already existed");
    }

    let lowerRole = "user";
    if (role === process.env.ROLE_SECRET_KEY) {
        lowerRole = process.env.ROLE_SECRET_KEY;
    }

    const createUser = await User.create({
        firstName,
        lastName,
        email,
        phone,
        password,
        gender,
        role: lowerRole,
    });
                                                                
    let user_id = createUser.user_id;

    const user = await User.findByPk(user_id, {
        attributes: {
            exclude: ["password", "refreshToken", "ac_status"],
        },
    });
    console.log(user.dataValues, `${lowerRole} CREATED`);

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                user.dataValues,
                `${lowerRole} created Successfully`,
            ),
        );
});
const loginUser = asyncHandler(async (req, res) => {
    
    const { email, password, role } = req.body;
    console.log({ email, password, role },"Login")
    if (!email || !password || !role) {
        throw new ApiError(400, "All fields are required ");
    }

    const findUser = await User.findOne({
        where: { [Op.and]: [{ email }, { role }] },
    });

    if (!findUser) {
        throw new ApiError(400, "Invalid data", [
            "There are no user that you enter email and role",
        ]);
    }

    const isPasswordCorrect = await bcrypt.compare(password, findUser.password);

    if (!isPasswordCorrect) {
        throw new ApiError(404, "Invalid password");
    }
    console.log(isPasswordCorrect, "pass");
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        findUser.user_id,
    );

    const loggedUser = await User.findOne({
        where: {
            [Op.and]: [{ user_id: findUser.user_id }, { role: findUser.role }],
        },
    });

    console.log({ email, password, role }, "LOGIN");
    const loginResponse = {
        user_id: loggedUser.user_id,
        firstName: loggedUser.firstName,
        lastName: loggedUser.lastName,
        email: loggedUser.email,
        phone: loggedUser.phone,
        gender: loggedUser.gender,
        accessToken,
        refreshToken,
    };

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                loginResponse,
                `${findUser.role} logged successfully`,
            ),
        );
});
const logoutUser = asyncHandler(async (req, res) => {
    const user_id = req.user.user_id;
    await User.update({ refreshToken: "" }, { where: { user_id: user_id } });

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(201)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(201, {}, `User ${user_id} logged out`));
});
const refreshAccessToken = asyncHandler(async (req, res) => {
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (!token) {
        throw new ApiError(401, "Unauthorized access");
    }

    const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

    const user = await User.findByPk(decodedToken._id);

    if (!user) {
        throw new ApiError(404, "Invalid refresh token");
    }

    if (!token !== !user.refreshToken) {
        throw new ApiError(401, "Refresh token expired or used");
    }
    console.log(user.user_id, user.email);
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user.user_id,
        user.email,
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                201,
                { accessToken, refreshToken },
                "New refresh token generated",
            ),
        );
});
const editUser = asyncHandler(async (req, res) => {
    const { user_id, firstName, lastName, email, phone, gender } = req.body;

    console.log({ user_id, firstName, lastName, email, phone, gender });

    if (!user_id) {
        throw new ApiError(400, "Id is required");
    }

    if (
        [firstName, lastName, email, phone, gender].some(
            (fields) => !fields || fields.trim() === "",
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const a = await User.update(
        { firstName, lastName, email, phone, gender },
        {
            where: { user_id },
            raw: true,
            raw: true,
        },
    );

    console.log(a, "edit hua");
    const user = await User.findByPk(user_id, {
        attributes: {
            exclude: ["refreshToken", "password"],
        },
        raw: true,
    });
    console.log(user, "Edited user");

    return res
        .status(201)
        .json(new ApiResponse(201, user, "User edited successfully"));
});
const userAddressDetails = asyncHandler(async (req, res) => {
    const { fullName, pincode, state, city, address, country } = req.body;

    console.log({ fullName, pincode, state, city, address, country })
    if (
        [fullName, pincode, state, city, address, country].some(
            (fields) => !fields || fields.trim() === "",
        )
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const user_id = req.user.user_id;

    const existedAddress = await Address.findOne({
        where: { user_id,address },
        attributes: ["user_id"],
        raw: true,
    });

    if (existedAddress) {
        throw new ApiError(400, "Please enter the different address");
    }

    const city_state = city.concat("-", state);

    const createAddress = await Address.create({
        fullName,
        address,
        city_state,
        country,
        pincode,
        user_id,
    });

    const response = await Address.findByPk(createAddress.dataValues.id, {
        raw: true,
    });
    // console.log(response, "USer address")
    return res.status(201).json(new ApiResponse(201, response, "Address added"));
});
const getAddress = asyncHandler(async(req,res)=>{
    const user_id = req.user.user_id

    const address = await Address.findAll({where:{user_id}})

    if(!address || address.length === 0) throw new ApiError(400,"No address for this user")

    return res
    .status(200)
    .json(new ApiResponse(200,address,"Address fetched"))
})
const deleteAddress = asyncHandler(async(req,res)=>{
    const id = req.query.id

    if(!id) throw new ApiError(400,"Id is required",)
    const address = await Address.destroy({where:{id}})

    return res
    .status(200)
    .json(new ApiResponse(200,`Deleted ${id}`,"Address deleted"))
})
const generateOTP = () => {
    return crypto.randomInt(100000, 1000000);
};
const sendOtp = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) throw new ApiError(400, "Email are required");

    const emailExists = await User.findOne({where:{email}})
    if (!emailExists) throw new ApiError(400, "There are no email that you have enter",["Please enter correct email"])
        
    console.log("email :", email);
    // const otp = await generateOTP();

    try {
        // await sendEmail(email, otp);
        // await Otp.create({ otp_num: String(otp) });
        // console.log("Your 6-Digit OTP:", otp);
        
    } catch (err) {
        throw new ApiError(500,"Email sending failed",[err])
    }

    return res.status(201).json(new ApiResponse(201, "Email Verified"));
});
const otpVerification = asyncHandler(async (req, res) => {
    const { otp } = req.body;

    if (!otp) throw new ApiError(400, "Enter otp number");

    const checkOtp = await Otp.findOne({ where: { otp_num: otp } });

    if (!null) throw new ApiError(401, "Invalid Otp");

    return res
        .status(200)
        .json(new ApiResponse(200, "Otp verification Successful"));
});
const newPassword = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    console.log(email);

    const user = await User.findOne({
        where: { email },
        attributes: ["updatedAt"],
        raw: true,
    });

    console.log({ password });

    if (!password) throw new ApiError(400, "All field are required");

    await User.update({ password }, { where: { email }, individualHooks: true });

    return res
        .status(201)
        .json(new ApiResponse(201, "Password Updated Successfully"));
});
const googleAuth = asyncHandler(async (req, res) => {
    const { access_token } = req.body;

    if (!access_token) {
        throw new ApiError(400, "Access token is required");
    }

    const googleRes = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo",
        { headers: { Authorization: `Bearer ${access_token}` } }
    );

    const profile = googleRes.data;

    let gender = gender_detect.detect(profile.given_name);

    if (!profile?.email) {
        throw new ApiError(400, "There are no user that you have enter");
    }

    let user = await User.findOne({ where: { email: profile.email } });

    if (!user) {
        user = await User.create({
            firstName: profile.given_name.toLowerCase() || "",
            lastName: profile.family_name.toLowerCase() || "",
            email: profile.email,
            phone: 0,
            gender,
            password: crypto.randomBytes(16).toString("hex"),
            role: "user",
            ac_status: true,
        });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user.dataValues.user_id
    );

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, { user: user.dataValues, accessToken }, "Google login successful")
        );
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    editUser,
    userAddressDetails,
    sendOtp,
    otpVerification,
    newPassword,
    getAddress,
    deleteAddress,
    googleAuth
};
