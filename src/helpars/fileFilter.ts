import { Request } from "express";
import multer from "multer";

export const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = [
    // Image formats
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/bmp",
    "image/x-icon",
    "image/vnd.microsoft.icon",
    "image/svg+xml",
    "image/avif",
    "image/apng",
    "image/jfif",
    // Video formats
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime",
    "video/x-msvideo",
    "video/mpeg",
  ];

  // Normalize MIME type to lowercase for case-insensitive comparison
  const mimeType = file.mimetype.toLowerCase();

  if (allowedTypes.includes(mimeType)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only browser-supported image (JPEG, PNG, GIF, WebP, BMP, ICO, SVG, AVIF, APNG) " +
        "and video (MP4, WebM, Ogg, MOV, AVI, MPEG) formats are allowed."
      )
    );
  }
};