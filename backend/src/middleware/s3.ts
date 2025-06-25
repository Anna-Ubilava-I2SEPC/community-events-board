import multer from "multer";
import multerS3 from "multer-s3";
import { s3 } from "../config/s3";

const bucketName = process.env.AWS_BUCKET_NAME!;
console.log("S3 bucket is:", process.env.AWS_BUCKET_NAME);

export const upload = multer({
  storage: multerS3({
    s3,
    bucket: bucketName,
    acl: "public-read", // or private if you use signed URLs
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    },
  }),
});
