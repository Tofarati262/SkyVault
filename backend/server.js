require("dotenv").config();
const express = require("express");
const app = express();
const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const aws = require("aws-sdk");


//new depencies for getting presigned url to upload object data into Aws bucket

import https from "https";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { fromIni } from "@aws-sdk/credential-providers";
import { HttpRequest } from "@smithy/protocol-http";
import {
  getSignedUrl,
  S3RequestPresigner,
} from "@aws-sdk/s3-request-presigner";
import { parseUrl } from "@smithy/url-parser";
import { formatUrl } from "@aws-sdk/util-format-url";
import { Hash } from "@smithy/hash-node";

// step 1 create presigned url 
const createPresignedUrlWithClient = ({ region, bucket, key }) => {
    const client = new S3Client({ region });
    const command = new PutObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(client, command, { expiresIn: 3600 });
};

// step 4 uploads files to aws bucket

function put(url, data) {
    return new Promise((resolve, reject) => {
      const req = https.request(
        url,
        { method: "PUT", headers: { "Content-Length": new Blob([data]).size } },
        (res) => {
          let responseBody = "";
          res.on("data", (chunk) => {
            responseBody += chunk;
          });
          res.on("end", () => {
            resolve(responseBody);
          });
        },
      );
      req.on("error", (err) => {
        reject(err);
      });
      req.write(data);
      req.end();
    });
  }

  // step 3 function calls to create a presigned url with client

  export const main = async (keydata) => {
    const REGION = process.env.REGION;
    const BUCKET = process.env.BUCKET_NAME;
    let  KEY = keydata.file;
  
    // There are two ways to generate a presigned URL.
    // 1. Use createPresignedUrl without the S3 client.
    // 2. Use getSignedUrl in conjunction with the S3 client and GetObjectCommand.
    try {
      
  
      const clientUrl = await createPresignedUrlWithClient({
        region: REGION,
        bucket: BUCKET,
        key: KEY,
      });

      
  
      // After you get the presigned URL, you can provide your own file
      // data. Refer to put() above.
  
  
      console.log("Calling PUT using presigned URL with client");
      try{
      await put(clientUrl, KEY);
      console.log("\nDone. Check your S3 console.");
      }catch(error){
        console.log(`Put request failed: ${error}`);
      }
    } catch (err) {
      console.error(err);
    }
  };



const port = 5000;

app.use(express.json());

app.get("/uploads",async(req,res)=>{
    try{
        const keydata = req.body
        console.log(req.body);
       const sent = await main(keydata)
       if(sent){
        res.send(`File ${keydata.fileName} has been Uploaded`);
       }
       
    }catch(error){

    }
    console.log("is not running yup");
})


app.listen(port,()=>console.log(`App is running on ${port} `));

module.exports = app;