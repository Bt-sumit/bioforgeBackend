const jwt = require("jsonwebtoken");
const responseHelper = require("../helper/response");
const secretKey = "RobertRDalgadoverses";
const userModel = require("../model/user.model");
const statusCodes=require("../helper/statusCodes")
const mongoose = require("mongoose");
const userMiddleWare = async (request, response, nextFunction) => {
    try {
        const BearerToken = request.headers["authorization"];
        if (!BearerToken) {
            return responseHelper.unauthorized(response, "Authorization token is missing", statusCodes.UNAUTHORIZED);
        }
        const tokenParts = BearerToken.split(" ");
        if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer") {
            return responseHelper.unauthorized(response, "Invalid token format Use Bearer token", statusCodes.UNAUTHORIZED);
        }
        const token = tokenParts[1];
        jwt.verify(token, secretKey, async (err, decodedToken) => {
            if (err) {
                return responseHelper.unauthorized(response, "Invalid or expired token", statusCodes.UNAUTHORIZED);
            }
            if (!["user", "admin"].includes(decodedToken?.type)) {
                return responseHelper.unauthorized(response, "Access denied Invalid user type", statusCodes.UNAUTHORIZED);
            }
            try {
                const userData = await userModel.findOne({ _id: new mongoose.Types.ObjectId(decodedToken?._id) });
                if (!userData) {
                    return responseHelper.unauthorized(response,"User does not exist", statusCodes.UNAUTHORIZED);
                } else if (userData.is_deleted === "1") {
                    return responseHelper.unauthorized(response, userData?.username + " " + "your account is deleted", statusCodes.UNAUTHORIZED);
                } else if (userData.status === "inactive") {
                    return responseHelper.unauthorized(response, userData?.username + " " + "your account is inactive Please contact to admin", statusCodes.UNAUTHORIZED);
                } else if (userData?.type === 'admin') {
                    return responseHelper.unauthorized(response, userData?.username + " " + "you are not admin", statusCodes.UNAUTHORIZED);
                }
                request.auth = userData;
                nextFunction();
            } catch (dbError) {
                console.error("Database Error:", dbError);
                return responseHelper.error(response, "Internal server error while fetching user details", statusCodes.INTERNAL_SERVER_ERROR);
            }
        });
    } catch (error) {
        console.error("Unexpected Error:", error);
        return responseHelper.error(response, "An unexpected error occurred", statusCodes.INTERNAL_SERVER_ERROR);
    }
};
module.exports = userMiddleWare;
