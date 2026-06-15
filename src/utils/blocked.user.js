import { User } from "../model/users.model";
import { ApiError } from "./ApiError";

const checkUserBlocked = async (user_id) => {
    const result = await User.findOne({
        where: { [Op.and]: [{ user_id: user_id }, { ac_status: 'block' }] },
        raw: true
    })
    if (!result) throw new ApiError(400, "Your account is not active")

    return true;
}

export { checkUserBlocked }