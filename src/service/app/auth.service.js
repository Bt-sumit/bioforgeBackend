const helper = require("../../helper/helper");
const userModel = require("../../model/user.model");
const otpModel = require("../../model/otp.model");
const sendEmail = require("../../helper/sendVerificationEmail");
const emailTemplateImage = require("../../config/template");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { type } = require("os");
const authService = {}
authService.register = async (request) => {
    const hashpassword = await helper.createPassword(request.body.password)
    request.body.password = hashpassword
    // if (request.body.profile_img) {
    //     request.body.profile_img = await helper.moveFileFromFolder(request.body.profile_img, "profile");
    // }
    const data = await userModel.create(request.body)
    // authService.sendOtp(data, "verify")
    return data
};
authService.login = async (data) => {
    const user = data.toObject();
    user.token = await helper.generateTokken(user);
    delete user.password;
    delete user.isEmailVerified;
    delete user.status;
    delete user.is_deleted;
    delete user.createdAt;
    delete user.updatedAt;
    delete user.__v;
    return user;
};
authService.sendOtp = async (data, type) => {
    const opt = await helper.otp()
    let html = ""
    let subject = ""
    if (type === 'forget') {
        subject = "Forget Password"
        html = ` <table width="100%" cellpadding="0" cellspacing="0" border="0"
            style="max-width: 450px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <tr>
                <td
                    style="padding: 40px 0;     background-color: #f2e5cc;
              border-radius: 8px 8px 0 0; text-align: center;">
                    <img src=${emailTemplateImage.logo} alt="Logo"
                        style="width: 130px;">
                </td>
            </tr>
            <tr>
                <td style="padding: 20px; text-align: center;">
                    <h3 style="margin: 20px 0;
                line-height: 1.4;
                color: #333333;
                font-family: Kreon, serif;
                font-weight: 500;
                text-shadow: 0 4px 4px #00000040;
                font-size: 20px;">
                      Welcome to the Credo In Deum app.
                            Please copy and paste the OTP code below into the Forgot Email field to proceed.</h3>
                    <div style=" margin: 30px auto;
                            background-image: url(${emailTemplateImage.background});
                            background-position: 50%;
                            border: none;
                            border-radius: 15px;
                            box-shadow: 0 7px 4px 0 #875505f2;
                            color: #000;
                            font-size: 22px;
                            font-weight: 400;
                            padding: 12px 26px;
                            text-transform: uppercase;
                            width: 150px;  font-family: Kreon, serif;
                        ">
                        ${opt}
                    </div>
                    <div
                        style="font-size: 16px; color: #333333; margin-top: 30px; font-family: Kreon, serif;">
                        Humbly,
                    </div>
                    <div
                        style="font-size: 14px; color: #666666; margin-top: 5px; font-family: Kreon, serif;">
                        Credo In Deum
                    </div>
                </td>
            </tr>
            <tr>
                <td
                    style="text-align: center; padding: 20px; font-size: 14px; color: #999999;font-family: Kreon, serif;">
                    &copy; 2024 Credo In Deum. All rights reserved.
                </td>
            </tr>
        </table>`
    } else {
        subject = "Email Verification"
        html = ` <table width="100%" cellpadding="0" cellspacing="0" border="0"
            style="max-width: 450px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
            <tr>
                <td
                    style="padding: 40px 0;     background-color: #f2e5cc;
                  border-radius: 8px 8px 0 0; text-align: center;">
                    <img src=${emailTemplateImage.logo} alt="Logo"
                        style="width: 130px;">
                </td>
            </tr>
            <tr>
                <td style="padding: 20px; text-align: center;">
                    <h3 style="margin: 20px 0;
                    line-height: 1.4;
                    color: #333333;
                    font-family: Kreon, serif;
                    font-weight: 500;
                    text-shadow: 0 4px 4px #00000040;
                    font-size: 20px;">
                        Welcome
                        to Credo In Deum app. Please
                        copy and paste the verification code below into the email verification box.</h3>
                    <div style=" margin: 30px auto;
                                background-image: url(${emailTemplateImage.background});
                                background-position: 50%;
                                border: none;
                                border-radius: 15px;
                                box-shadow: 0 7px 4px 0 #875505f2;
                                color: #000;
                                font-size: 22px;
                                font-weight: 400;
                                padding: 12px 26px;
                                text-transform: uppercase;
                                width: 150px;  font-family: Kreon, serif;
                            ">
                        ${opt}
                    </div>
                    <div
                        style="font-size: 16px; color: #333333; margin-top: 30px; font-family: Kreon, serif;">
                        Humbly,
                    </div>
                    <div
                        style="font-size: 14px; color: #666666; margin-top: 5px; font-family: Kreon, serif;">
                        Credo In Deum
                    </div>
                </td>
            </tr>
            <tr>
                <td
                    style="text-align: center; padding: 20px; font-size: 14px; color: #999999;font-family: Kreon, serif;">
                    &copy; 2024 Credo In Deum. All rights reserved.
                </td>
            </tr>
        </table>`
    }
    sendEmail(data?.email, subject, html)
    const otpData = await otpModel.create({
        userId: data?._id,
        otp: opt
    })
    return otpData
};
authService.forgetPassword = async (request) => {
    const hashpassword = await helper.createPassword(request.body.password)
    await userModel.findByIdAndUpdate({ _id: request.body.userId }, { password: hashpassword })
};
authService.changePassword = async (request) => {
    const hashpassword = await helper.createPassword(request.body.newPassword)
    await userModel.findByIdAndUpdate({ _id: request?.auth?._id }, { password: hashpassword })
};
authService.accountDelete = async (request) => {
    const userId = request?.auth?._id;
    const user = await userModel.findById(userId);
    if (user) {
        if (user.profile_img) {
            const profileImgPath = path.join("public", "profile", user.profile_img);
            if (fs.existsSync(profileImgPath)) {
                fs.unlink(profileImgPath, (err) => {
                    if (err) {
                        console.error(`Failed to delete profile image: ${err.message}`);
                    }
                });
            }
        }
        if (user.banner_img) {
            const bannerImgPath = path.join("public", "banner", user.banner_img);
            if (fs.existsSync(bannerImgPath)) {
                fs.unlink(bannerImgPath, (err) => {
                    if (err) {
                        console.error(`Failed to delete banner image: ${err.message}`);
                    }
                });
            }
        }
    }
    await userModel.findByIdAndUpdate({ _id: userId }, { is_deleted: "1" });
};
authService.updateprofile = async (request) => {
    const userData = await userModel.findOne({ _id: request?.body?._id });
    const oldProfileImg = userData.profile_img || "";
    const newProfileImg = request.body.profile_img || "";
    const oldBannerImg = userData.banner_img || "";
    const newBannerImg = request.body.banner_img || "";
    if (newProfileImg) {
        const tempProfilePath = path.join("public", "tempUploads", newProfileImg);
        if (fs.existsSync(tempProfilePath)) {
            await helper.moveFileFromFolder(newProfileImg, "profile");
            if (oldProfileImg && oldProfileImg !== newProfileImg) {
                const oldProfilePath = path.join("public", "profile", oldProfileImg);
                if (fs.existsSync(oldProfilePath)) {
                    fs.unlink(oldProfilePath, (err) => {
                        if (err) {
                            console.error(`Failed to delete old profile image: ${err.message}`);
                        } else {
                            console.log(`Deleted old profile image: ${oldProfileImg}`);
                        }
                    });
                }
            }
            request.body.profile_img = newProfileImg;
        }
    }
    if (newBannerImg) {
        const tempBannerPath = path.join("public", "tempUploads", newBannerImg);
        if (fs.existsSync(tempBannerPath)) {
            await helper.moveFileFromFolder(newBannerImg, "banner");
            if (oldBannerImg && oldBannerImg !== newBannerImg) {
                const oldBannerPath = path.join("public", "banner", oldBannerImg);
                if (fs.existsSync(oldBannerPath)) {
                    fs.unlink(oldBannerPath, (err) => {
                        if (err) {
                            console.error(`Failed to delete old banner image: ${err.message}`);
                        } else {
                            console.log(`Deleted old banner image: ${oldBannerImg}`);
                        }
                    });
                }
            }
            request.body.banner_img = newBannerImg;
        }
    }

    await userModel.findByIdAndUpdate(
        { _id: new mongoose.Types.ObjectId(request?.body?._id) },
        request.body
    );
    return;
};
authService.getAll = async (request) => {
     const userId = request?.query?._id;
    return await userModel.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(userId),
                status: 'active',
                is_deleted: '0'
            }
        },
        
       {
            $lookup: {
                from: "links",
                localField: "_id",
                foreignField: "userId",
                as: "social",
                pipeline:[
                    {
                        $match:{
                            status:'active',
                            is_deleted:'0',
                            type:'social'
                        }
                    },
                    {
                        $addFields: {
                            sort_index: {
                                $ifNull: ["$is_index", 999999]
                            }
                        }
                    },
                    {
                        $sort: {
                            sort_index: 1 ,
                             type: -1,
                        }
                    },
                    {
                        $project:{
                            _id:1,
                            linkTitle:1,
                            linkUrl:1,
                            linkLogo:1,
                            type:1,
                            status:1,
                            is_index:1
                        }
                    }
                ]
            }
        },
       {
            $lookup: {
                from: "links",
                localField: "_id",
                foreignField: "userId",
                as: "non_social",
                pipeline:[
                    {
                        $match:{
                            status:'active',
                            is_deleted:'0',
                            type:'non_social'
                        }
                    },
                    {
                        $addFields: {
                            sort_index: {
                                $ifNull: ["$is_index", 999999]
                            }
                        }
                    },
                    {
                        $sort: {
                            sort_index: 1 ,
                             type: -1,
                        }
                    },
                    {
                        $project:{
                            _id:1,
                            linkTitle:1,
                            linkUrl:1,
                            linkLogo:1,
                            type:1,
                            status:1,
                            is_index:1
                        }
                    }
                ]
            }
        },
        {
            $project:{
                _id:1,
                username:1,
                email:1,
                bio:1,
                profile_img:1,
                banner_img:1,
                social:1,
                non_social:1,
                
            }
        }

    ]);
};
authService.getTokenAll = async (request) => {
    const userId = request?.auth?._id;
    console.log("user data ", userId);
    return await userModel.aggregate([
        {
            $match:{
                is_deleted:'0',
                status:'active',
                _id:new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $project:{
                username:1,
                email:1,
                bio:1,
                profile_img:1,
                links: {
                    $filter: {
                        input: "$links",
                        as: "link",
                        cond: { $eq: ["$$link.status", "active"] }
                    }
                }


            }
        }
    ])
};
authService.updateTheme = async (request) => {
    const { userId, themeType, fontFamily, is_colorImage } = request.body;
    if (!userId) {
        throw new Error("userId is required");
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid userId");
    }
    const user = await userModel.findOne({ _id: userId, is_deleted: "0" });
    if (!user) {
        throw new Error("User not found");
    }
    if (!user.theme) user.theme = {};

    if (themeType) {
        if (!["color", "img"].includes(themeType)) {
            throw new Error("themeType must be 'color' or 'img'");
        }
        user.theme.themeType = themeType;
    }
    if (fontFamily) {
        user.theme.fontFamily = fontFamily;
    }
    if (typeof is_colorImage !== "undefined") {
        user.theme.is_colorImage = is_colorImage;
    }
    await user.save();
    return user.theme;
};
module.exports = authService
