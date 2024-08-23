require("dotenv").config();
const express = require("express");
const app = express();
const https = require("https");
const { PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const { fromIni } = require("@aws-sdk/credential-providers");
const { HttpRequest } = require("@smithy/protocol-http");
const {
  getSignedUrl,
  S3RequestPresigner,
} = require("@aws-sdk/s3-request-presigner");
const { parseUrl } = require("@smithy/url-parser");
const { formatUrl } = require("@aws-sdk/util-format-url");
const { Hash } = require("@smithy/hash-node");

// Step 1: Create a presigned URL
const createPresignedUrlWithClient = ({ region, bucket, key }) => {
  const client = new S3Client({ region });
  const command = new PutObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(client, command, { expiresIn: 3600 });
};

// Step 4: Upload files to AWS bucket
function put(url, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      { method: "PUT", headers: { "Content-Length": Buffer.byteLength(data) } },
      (res) => {
        let responseBody = "";
        res.on("data", (chunk) => {
          responseBody += chunk;
        });
        res.on("end", () => {
          resolve(responseBody);
        });
      }
    );
    req.on("error", (err) => {
      reject(err);
    });
    req.write(data);
    req.end();
  });
}

// Step 3: Function calls to create a presigned URL with client
const main = async (keydata) => {
  const REGION = process.env.REGION;
  const BUCKET = process.env.BUCKET_NAME;
  const KEY = keydata.file;

  try {
    const clientUrl = await createPresignedUrlWithClient({
      region: REGION,
      bucket: BUCKET,
      key: KEY,
    });

    console.log("Calling PUT using presigned URL with client");
    await put(clientUrl, KEY);
    console.log("\nDone. Check your S3 console.");
    return true; // Indicate success
  } catch (err) {
    console.error(err);
    return false; // Indicate failure
  }
};

const port = 5000;

app.use(express.json());

app.post("/uploads", async (req, res) => {
  try {
    const keydata = req.body;
    console.log(req.body);
    const sent = await main(keydata);
    if (sent) {
      res.send(`File ${keydata.file} has been uploaded`);
    } else {
      res.status(500).send("File upload failed");
    }
  } catch (error) {
    res.status(500).send("An error occurred");
    console.error("Error in /uploads:", error);
  }
  console.log("Request processed");
});

app.listen(port, () => console.log(`App is running on port ${port}`));

module.exports = app;
