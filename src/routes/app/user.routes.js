const express = require('express');
const userRouter = express.Router();
const authController=require("../../controller/app/auth.controller");
const linksController=require("../../controller/app/link.controller");
const middleWare=require("../../middleware/user.middleware");

userRouter.post("/register",authController.register);
userRouter.post("/login",authController.login);
userRouter.post("/sendOtp",authController.sendOtp);
userRouter.post("/verifyOtp",authController.verifyOpt);
userRouter.post("/changePassword",middleWare,authController.changePassword);
userRouter.post("/accountDelete",middleWare,authController.accountDelete);
userRouter.post("/forgetPassword",authController.forgetPassword);
userRouter.post("/updateProfile",middleWare,authController.updateProfile);
userRouter.get("/getUserInfo",authController.getUserInfo);
userRouter.get("/getUserInfotoken",middleWare,authController.getUserTokenInfo);
userRouter.post('/logout', authController.logout);

//links
userRouter.post('/add-links', middleWare,linksController.add);
userRouter.post("/link-update",middleWare, linksController.update);
userRouter.get("/link-updateStatus",middleWare, linksController.updateStatus);
userRouter.post("/update-index",middleWare, linksController.updateIndex);
userRouter.post("/link-delete",middleWare, linksController.delete);
userRouter.get("/get-links",middleWare, linksController.getAll);

//themes
userRouter.post('/update-Theme', authController.updateTheme);
module.exports=userRouter