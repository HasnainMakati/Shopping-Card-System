import { Op } from "sequelize";
import { User } from "../model/users.model.js";
import { ApiError } from "../utils/ApiError.js";

const blockedUser = async (req,res,next) => {
    try {
        const user_id = req.user.user_id

        const result = await User.findOne({
            where: { [Op.and]: [{ user_id }, { ac_status: "block" }] },
            raw: true,
            attributes: ["user_id"]
        });
        if(result){
            return next(new ApiError(403, "You have been blocked by admin for some reasons"));        
        }
        next()
    } catch (error) {
        next(new ApiError(400, "Something went wrong", [error.message || error]));
    };
}

export {blockedUser}