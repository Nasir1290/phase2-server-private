import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from "uuid";
import config from "../config";
import { fileFilter } from "./fileFilter";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

// Interface for upload options
interface UploadOptions {
  folder: string;
  title?: string;
  acl?: "public-read" | "private";
  contentType?: string;
}

// Initialize S3 client
export const s3Client = new S3Client({
  region: config.aws.region,
  endpoint: `https://${config.aws.spacesRegion}.digitaloceanspaces.com`,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
  maxAttempts: 5,
  // requestTimeout: 30000,
});

/**
 * Uploads a file to DigitalOcean Spaces
 * @param file - Multer file object
 * @param options - Upload options (folder, title, acl, contentType)
 * @returns Promise<string> - The public or CDN URL of the uploaded file
 */
export const fileUploadToS3 = async (
  file: Express.Multer.File,
  options: UploadOptions
): Promise<string> => {
  const bucketName = config.aws.bucketName;
  if (!bucketName) {
    throw new Error("S3 bucket name is not defined in the configuration.");
  }

  const {
    folder,
    title = "file",
    acl = "public-read",
    contentType = file.mimetype,
  } = options;
  const fileName = `${folder}/${title}_${uuidv4()}_${file.originalname}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: await fs.readFile(file.path),
    ContentType: contentType,
    ACL: acl,
  });

  try {
    await s3Client.send(command);
    const baseUrl = config.aws.cdnEnabled
      ? `https://${bucketName}.${config.aws.spacesRegion}.cdn.digitaloceanspaces.com`
      : `https://${bucketName}.${config.aws.spacesRegion}.digitaloceanspaces.com`;
    return `${baseUrl}/${fileName}`;
  } catch (error) {
    console.error("S3 Upload Error:", error);
    throw new Error("Failed to upload file to S3");
  } finally {
    try {
      await fs.unlink(file.path);
    } catch (err) {
      console.warn(`Failed to delete temporary file ${file.path}:`, err);
    }
  }
};

/**
 * Multer configuration with disk storage
 */
export const s3Uploader = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const uploadPath = path.join(__dirname, "../../../Uploads");
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueSuffix);
    },
  }),
  fileFilter: fileFilter,
  limits: {
    fileSize: 1 * 1024 * 1024 * 1024, // 1GB max file size
  },
});

/**
 * Deletes a file from DigitalOcean Spaces using the provided URL.
 * @param url - The URL of the file to delete.
 * @returns A Promise that resolves when the deletion is complete.
 */
export const deleteFileFromS3 = async (url: string): Promise<void> => {
  // Parse the URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch (error) {
    throw new Error("Invalid URL provided");
  }

  // Extract hostname and pathname
  const hostname = parsedUrl.hostname;
  const pathname = parsedUrl.pathname;

  // Verify that the URL belongs to the correct bucket
  const bucketName = config.aws.bucketName;
  const spacesRegion = config.aws.spacesRegion;
  const expectedPrefix = `${bucketName}.${spacesRegion}.`;
  if (!hostname.startsWith(expectedPrefix)) {
    throw new Error("Provided URL does not belong to this bucket");
  }

  // Extract the key from the pathname
  let key = pathname.slice(1); // Remove the leading '/'
  if (!key) {
    throw new Error("No file specified in the URL");
  }

  // Delete the object using S3Client
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });

  try {
    await s3Client.send(command);
    console.log(`Successfully deleted ${key} from ${bucketName}`);
  } catch (error) {
    console.error("Error deleting file from S3:", error);
    throw new Error("Failed to delete file from S3");
  }
};
