require('dotenv').config();
const express = require('express');
const path = require("path")
const cors = require("cors")
const fileUpload = require("express-fileupload");
const userRouter = require("./routes/app/user.routes")
const adminRouter = require("./routes/admin/admin.routes")
const imageRouter = require("./routes/upload/upload.route")
const mongooseConnection = require("./config/db");
const app = express();
const PORT = process.env.PORT || 3006;
mongooseConnection();

app.use(cors({
  origin: ['http://192.168.0.96:5173','http://localhost:5173'], 
  credentials: true               
}));
app.use("/images", express.static(path.join(__dirname, "../public/profile")));
app.use("/images", express.static(path.join(__dirname, "../public/banner")));
app.use("/images", express.static(path.join(__dirname, "../public/linkLogo")));
app.use("/images", express.static(path.join(__dirname, "../public/tempUploads")));
app.use("/images", express.static(path.join(__dirname, "../public/default")));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(fileUpload())

app.use("/api/v1", userRouter);
// admin
app.use("/api/admin/v1", adminRouter);
// image upload
app.use("/api/upload", imageRouter);

app.use((request, response) => {
  response.status(404).json({
    status: false,
    message: 'This endpoint does not exist. Please provide a valid endpoint .'
  });
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
