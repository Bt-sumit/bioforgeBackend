const helper = require("../../helper/helper");
const statusCodes = require("../../helper/statusCodes")
const responseHelper = require("../../helper/response");
const userModel = require("../../model/user.model");
const authService = require("../../service/app/auth.service");
const authValidation = require("../../validation/app/auth.validation");
const optModel = require("../../model/otp.model");
const moment = require("moment");
const { default: mongoose } = require("mongoose");
class authController {
    register = async (request, response) => {
        try {

            const { error } = await authValidation.validateRegister(request.body,);
            const validationError = responseHelper.validatIonError(response, error);
            if (validationError) return;
            if (await userModel.findOne({ email: new RegExp(`^${request.body.email}$`, 'i'), is_deleted: "0" })) {
                return responseHelper.Forbidden(response, "Email already exists", null, statusCodes.OK);
            }
            const data = await authService.register(request);
            return responseHelper.success(response, data.username + " " + "is registered successfully", null, statusCodes.OK);
        } catch (error) {
            console.log(error);
            return responseHelper.error(response, error.message, statusCodes.INTERNAL_SERVER_ERROR);
        }
    };
    login = async (request, response) => {
        try {
            const { error } = await authValidation.validateLogin(request.body,);
            const validationError = responseHelper.validatIonError(response, error);
            if (validationError) return;
            const userData = await userModel.findOne({ email: new RegExp(`^${request.body.email}$`, 'i') });
            if (!userData) {
                return responseHelper.Forbidden(response, "Email not exists", null, statusCodes.OK);
            } else if (userData.is_deleted === '1') {
                return responseHelper.Forbidden(response, userData?.username + " " + "your account is deleted", null, statusCodes.OK);
            } else if (userData.status === 'inactive') {
                return responseHelper.Forbidden(response, userData?.username + " " + "your account is inactive Please contact to admin", null, statusCodes.OK);
            }
            if (!await helper.comparePassword(request?.body?.password, userData?.password)) {
                return responseHelper.BadRequest(response, "Password is wrong", null, statusCodes.OK);
            }
            else if (userData?.type === 'admin') {
                return responseHelper.Forbidden(response, userData?.username + " " + "you are not admin", { isEmailVerified: false, userId: userData?._id }, statusCodes.OK,);
            }
            const data = await authService.login(userData);
            response.cookie('token', data.token, {
                httpOnly: true,
                secure: false,
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000
            });
            return responseHelper.success(response, data.username + " is login successfully", { id: data._id, token: data.token }, statusCodes.OK);


        } catch (error) {
            console.log(error);
            return responseHelper.error(response, error.message, statusCodes.INTERNAL_SERVER_ERROR);
        };
    }
    sendOtp = async (request, response) => {
        try {
            const { error } = await authValidation.validateSendOtp(request.body,);
            const validationError = responseHelper.validatIonError(response, error);
            if (validationError) return;
            const userData = await userModel.findOne({ email: new RegExp(`^${request.body.email}$`, 'i') }, { password: 0 });
            if (!userData) {
                return responseHelper.Forbidden(response, "Email not exists", null, statusCodes.OK);
            } else if (userData.is_deleted === '1') {
                return responseHelper.Forbidden(response, userData?.name + " " + "your account is deleted", null, statusCodes.OK);
            } else if (userData.status === 'inactive') {
                return responseHelper.Forbidden(response, userData?.name + " " + "your account is inactive Please contact to admin", null, statusCodes.OK);
            }
            const data = await authService.sendOtp(userData, request?.body?.type);
            return responseHelper.success(response, data?.otp + " " + "Otp is sent to your register email please verify the email", userData, statusCodes.OK);
        } catch (error) {
            console.log(error);
            return responseHelper.error(response, error.message, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }
    verifyOpt = async (request, response) => {
        try {
            const { error } = await authValidation.validateVerifyOpt(request.body,);
            const validationError = responseHelper.validatIonError(response, error);
            if (validationError) return;
            const userData = await userModel.findOne({ _id: request.body.userId }, { password: 0 });
            if (!userData) {
                return responseHelper.Forbidden(response, "User does not exist", null, statusCodes.OK);
            } else if (userData.is_deleted === '1') {
                return responseHelper.Forbidden(response, userData?.name + " " + "your account is deleted", null, statusCodes.OK);
            } else if (userData.status === 'inactive') {
                return responseHelper.Forbidden(response, userData?.name + " " + "your account is inactive Please contact to admin", null, statusCodes.OK);
            }
            const otpData = await optModel.findOne({ userId: request?.body?.userId })
            if (!otpData) {
                return responseHelper.BadRequest(response, "OTP has expired Please request a new OTP", null, statusCodes.OK);
            }
            else if (moment(otpData.createdAt).add(2, 'minutes').isBefore(moment())) {
                return responseHelper.BadRequest(response, "OTP has expired Please request a new OTP", null, statusCodes.OK);
            }
            else if (otpData.otp !== request?.body?.otp) {
                return responseHelper.BadRequest(response, "Incorrect OTP Please enter the correct OTP", null, statusCodes.OK);
            }
            if (request?.body?.type === 'verify') {
                await userModel.findByIdAndUpdate({ _id: request.body.userId }, { isEmailVerified: true });
            }
            return responseHelper.success(response, "OTP verification successful", null, statusCodes.OK);
        } catch (error) {
            console.log(error);
            return responseHelper.error(response, error.message, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }
    forgetPassword = async (request, response) => {
        try {
            const { error } = await authValidation.validateForgetPassword(request.body,);
            const validationError = responseHelper.validatIonError(response, error);
            if (validationError) return;
            const userData = await userModel.findOne({ _id: request.body.userId });
            if (!userData) {
                return responseHelper.Forbidden(response, "User does not exist", null, statusCodes.OK);
            } else if (userData.is_deleted === '1') {
                return responseHelper.Forbidden(response, userData?.name + " " + "your account is deleted", null, statusCodes.OK);
            } else if (userData.status === 'inactive') {
                return responseHelper.Forbidden(response, userData?.name + " " + "your account is inactive Please contact to admin", null, statusCodes.OK);
            }
            await authService.forgetPassword(request);
            return responseHelper.success(response, "Password Update successfully", null, statusCodes.OK);

        } catch (error) {
            console.log(error);
            return responseHelper.error(response, error.message, statusCodes.INTERNAL_SERVER_ERROR);

        }
    }
    changePassword = async (request, response) => {
        try {
            const { error } = await authValidation.validateChangePassword(request.body,);
            const validationError = responseHelper.validatIonError(response, error);
            if (validationError) return;
            const userPassword = await userModel.findOne({ _id: request?.auth?._id })
            if (!await helper.comparePassword(request?.body?.oldPassword, userPassword?.password)) {
                return responseHelper.BadRequest(response, "Please Enter correct old password", null, statusCodes.OK);
            }
            if (request?.body?.oldPassword === request?.body?.newPassword) {
                return responseHelper.BadRequest(response, "Look like you enter same password", null, statusCodes.OK);
            }
            await authService.changePassword(request);
            return responseHelper.success(response, "Password Update successfully", null, statusCodes.OK);
        } catch (error) {
            console.log(error);
            return responseHelper.error(response, error.message, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }
    accountDelete = async (request, response) => {
        try {
            const { error } = await authValidation.validateAccountDelete(request.body,);
            const validationError = responseHelper.validatIonError(response, error);
            if (validationError) return;
            const userPassword = await userModel.findOne({ _id: request?.auth?._id })
            if (!await helper.comparePassword(request?.body?.password, userPassword?.password)) {
                return responseHelper.BadRequest(response, "Please Enter correct password", null, statusCodes.OK);
            }
            await authService.accountDelete(request);
            return responseHelper.success(response, "Account delete successfully", null, statusCodes.OK);
        } catch (error) {
            console.log(error);
            return responseHelper.error(response, error.message, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }
    updateProfile = async (request, response) => {
        try {
        // const userId = String(request.auth._id);
        //     console.log("===user",userId)

            const userData = await userModel.findOne({ _id: request?.body?._id, is_deleted: '0' });
            //  console.log("====",userData._id )
            // if(userData && String(userData.userId) === String(userId)){
               
            //     return responseHelper.Forbidden(response, `you are not authorize to update this profile `,null,statusCodes.OK)
            // }
            if (!userData) {
                return responseHelper.Forbidden(response, `user not found`, null, statusCodes.OK)
            }
            
            const data = await authService.updateprofile(request);
            return responseHelper.success(response, `profile updated successfully`, data, statusCodes.OK)
        } catch (error) {
            console.log(error);
            return responseHelper.error(response, error.message, statusCodes.INTERNAL_SERVER_ERROR)
        }
    }
    getUserInfo = async (request, response) => {
        try {
            const ObjectIdError = responseHelper.mongooseObjectIdError(request?.query?._id, response, "_id");
            if (ObjectIdError) return;
            const userInfo = await userModel.findOne({ _id: request.query._id, is_deleted: '0' });
            if (!userInfo) {
                return responseHelper.Forbidden(response, `user not found`, null, statusCodes.OK)
            }
            const data = await authService.getAll(request);
            return responseHelper.success(response, `all data fetched`, data, statusCodes.OK)
        } catch (error) {
            console.log(error);
            return responseHelper.error(response, error.message, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }
    getUserTokenInfo = async (request, response) => {
        try {
            const data = await authService.getTokenAll(request);
            return responseHelper.success(response, `all data fetched`, data, statusCodes.OK)
        } catch (error) {
            console.log(error);
            return responseHelper.error(response, error.message, statusCodes.INTERNAL_SERVER_ERROR);
        }
    }
    logout = (request, response) => {
        response.clearCookie('token', { httpOnly: true, secure: false, sameSite: 'lax' });
        return responseHelper.success(response, "Logged out successfully", null, statusCodes.OK);
    };
    updateTheme = async (request, response) => {
        try {
            const themeData = await authService.updateTheme(request);
            return responseHelper.success(response, "Theme updated successfully", themeData, statusCodes.OK);
        } catch (error) {
            console.error("Update Theme Error:", error);
            return responseHelper.error(response, error.message, statusCodes.INTERNAL_SERVER_ERROR);
        }
    };

}

module.exports = new authController();

