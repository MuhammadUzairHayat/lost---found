import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

export function getCloudinaryConfig() {
  return {
    cloud_name: requireEnv("CLOUDINARY_CLOUD_NAME"),
    api_key: requireEnv("CLOUDINARY_API_KEY"),
    api_secret: requireEnv("CLOUDINARY_API_SECRET"),
  };
}

export function configureCloudinary() {
  cloudinary.config(getCloudinaryConfig());
  return cloudinary;
}

export const UPLOAD_FOLDER = "lost-found";
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
]);

export type CloudinaryUploadResult = {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
};

export async function uploadImageBuffer(
  buffer: Buffer,
  options?: { folder?: string; publicId?: string }
): Promise<CloudinaryUploadResult> {
  const cld = configureCloudinary();

  const result = await new Promise<UploadApiResponse>(
    (resolve, reject) => {
      const stream = cld.uploader.upload_stream(
        {
          folder: options?.folder ?? UPLOAD_FOLDER,
          public_id: options?.publicId,
          resource_type: "image",
          overwrite: true,
        },
        (error, uploadResult) => {
          if (error || !uploadResult) {
            reject(error ?? new Error("Upload failed."));
            return;
          }
          resolve(uploadResult);
        }
      );
      stream.end(buffer);
    }
  );

  return {
    publicId: result.public_id,
    url: result.url,
    secureUrl: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}
