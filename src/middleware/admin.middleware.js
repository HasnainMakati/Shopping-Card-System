import { ApiError } from "../utils/ApiError.js";

const verifyAdmin = async (req,res,next) => {
    try {
        const adminId = req.user.user_id
        const result = await User.findOne({
            where: { [Op.and]: [{ user_id: adminId }, { role: "admin" }] },
            raw: true,
        });
    
        next()
    } catch (error) {
        throw new ApiError(400, "There are no admin in the database");    }
};

export {verifyAdmin}