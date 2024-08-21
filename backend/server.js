const express = require("express");
const app = express();
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const aws = require("aws-sdk");
const port = 5000;

app.use(express.json());

app.get("/",(req,res)=>{
    console.log("is not running");
})


app.listen(port,()=>console.log(`App is running on ${port} `));

module.exports = app;