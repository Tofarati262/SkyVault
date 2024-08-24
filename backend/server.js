require("dotenv").config();
const express = require("express");
const multer = require("multer");
const { PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { parseUrl } = require  ("@smithy/url-parser");
const { formatUrl } = require ( "@aws-sdk/util-format-url");
const { Hash } = require  ("@smithy/hash-node");
const https = require ("https");
const { HttpRequest } = require ("@smithy/protocol-http");
const cors = require("cors");

const app = express();
const port = 5000;

var corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());

// Set up Multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory as Buffer
const upload = multer({ storage: storage });

const createPresignedUrlWithClient = ({ region, bucket, key }) => {
  const client = new S3Client({ region });
  const command = new PutObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(client, command, { expiresIn: 3600 });
};

// Function to upload file to S3 using presigned URL
const put = (url, data) => {
  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      { method: "PUT", headers: { "Content-Length": Buffer.byteLength(data), timeout: 10000 } },
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
};

const main = async (file) => {
  const REGION = process.env.REGION;
  const BUCKET = process.env.BUCKET_NAME;
  const KEY = file.originalname; // Use the original file name as the key

  try {
    const clientUrl = await createPresignedUrlWithClient({
      region: REGION,
      bucket: BUCKET,
      key: KEY,
    });

    console.log("Calling PUT using presigned URL with client");
    await put(clientUrl, file.buffer); // Use the file buffer directly
    console.log("\nDone. Check your S3 console.");
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

// Route to handle file uploads
app.post("/uploads", upload.single("file"), async (req, res) => {
  try {
    const file = req.file; // Get the uploaded file from multer

    if (!file) {
      return res.status(400).send("No file uploaded.");
    }

    console.log("Received file:", file.originalname);
    const sent = await main(file);

    if (sent) {
      res.send(`File ${file.originalname} has been uploaded successfully.`);
    } else {
      res.status(500).send("File upload failed.");
    }
  } catch (error) {
    res.status(500).send("An error occurred while uploading the file.");
    console.error("Error in /uploads:", error);
  }
});

app.listen(port, () => console.log(`App is running on port ${port}`));

module.exports = app;
