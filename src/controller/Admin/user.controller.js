const responseHelper = require("../../helper/response");
const userService = require("../../service/admin/user.service")
const authService = require("../../service/app/auth.service")
const userValidation = require("../../validation/admin/user.validation")
const statusCodes=require("../../helper/statusCodes")
const userModel = require("../../model/user.model");
const { default: mongoose } = require("mongoose");
class userController {
    add = async (request, response) => {
        try {
            const { error } = await userValidation.validateadd(request.body);
            const validationError = responseHelper.validatIonError(response, error);
            if (validationError) return;
            if (await userModel.findOne({ email: new RegExp(`^${request.body.email}$`, 'i'), is_deleted: "0" })) {
                return responseHelper.Forbidden(response, "Email already exists", null, statusCodes.OK);
            }
            await userService.add(request)
            return responseHelper.success(response, `User create successfully`, null, statusCodes.OK);

        } catch (error) {
            console.log(error);
            return responseHelper.error(response, error.message, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }
    getAll = async (request, response) => {
        try {
            const data = await userService.get(request)
            return responseHelper.success(response, `User List`, data, statusCodes.OK);

        } catch (error) {
            console.log(error);
            return responseHelper.error(response, error.message, statusCodes.INTERNAL_SERVER_ERROR);

        }
    }
    update = async (request, response) => {
        try {
            const { error } = await userValidation.validateUpdate(request.body);
            const validationError = responseHelper.validatIonError(response, error);
            if (validationError) return;
            const userInfo = await userModel.findOne({ _id: new mongoose.Types.ObjectId(request?.body?._id) })
            if (!userInfo) {
                return responseHelper.Forbidden(response, "User not exists", null, statusCodes.OK);
            } else if (userInfo.is_deleted === '1') {
                return responseHelper.Forbidden(response, "User account is deleted", null, statusCodes.OK);
            }
            if (await userModel.findOne({ _id: { $ne: new mongoose.Types.ObjectId(request?.body?._id) }, email: request.body.email, is_deleted: "0" })) {
                return responseHelper.Forbidden(response, "Email already exists", null, statusCodes.OK);
            }
            await userService.update(request)
            return responseHelper.success(response, `User update successfully`, null, statusCodes.OK);

        } catch (error) {
            console.log(error);
            return responseHelper.error(response, error.message, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }
    delete = async (request, response) => {
        try {
            const objectId = responseHelper.mongooseObjectIdError(request?.query?._id, response, "_id"
            );
            if (objectId) return;
            const userInfo = await userModel.findOne({ _id: new mongoose.Types.ObjectId(request?.query?._id) })
            if (!userInfo) {
                return responseHelper.Forbidden(response, "User not exists", null, statusCodes.OK);
            } else if (userInfo.is_deleted === '1') {
                return responseHelper.Forbidden(response, "User account is deleted", null, statusCodes.OK);
            }
            await userService.delete(request)
            return responseHelper.success(response, `User delete successfully`, null, statusCodes.OK);

        } catch (error) {
            console.log(error);
            return responseHelper.error(response, error.message, statusCodes.INTERNAL_SERVER_ERROR);

        }
    }
    status = async (request, response) => {
        try {
            const objectId = responseHelper.mongooseObjectIdError(request?.query?._id, response,"_id"
            );
            if (objectId) return;
            const userInfo = await userModel.findOne({ _id: new mongoose.Types.ObjectId(request?.query?._id) })
            if (!userInfo) {
                return responseHelper.Forbidden(response, "User not exists", null, statusCodes.OK);
            } else if (userInfo.is_deleted === '1') {
                return responseHelper.Forbidden(response, "User account is deleted", null, statusCodes.OK);
            }
            await userService.status(request)
            return responseHelper.success(response, `User status update successfully`, null, statusCodes.OK);

        } catch (error) {
            console.log(error);
            return responseHelper.error(response, error.message, statusCodes.INTERNAL_SERVER_ERROR);

        }
    }

}
module.exports = new userController()