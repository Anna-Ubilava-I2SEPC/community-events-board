import multer from "multer";
import multerS3 from "multer-s3";
import { s3 } from "./s3";
import { Request } from "express";

const bucket = process.env.AWS_BUCKET_NAME!;

export const upload = multer({
  storage: multerS3({
    s3,
    bucket,
    acl: "public-read",
    metadata: (req: Request, file: Express.Multer.File, cb: Function) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req: Request, file: Express.Multer.File, cb: Function) => {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    },
  }),
  // Add file filter for image types only
  fileFilter: (req: Request, file: Express.Multer.File, cb: Function) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
  // Limit file size to 5MB
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});
