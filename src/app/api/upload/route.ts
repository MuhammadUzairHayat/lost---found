import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  uploadImageBuffer,
} from "@/lib/cloudinary";
import { requireAuthenticatedUser } from "@/lib/api/session";

export async function POST(request: Request) {
  const auth = await requireAuthenticatedUser();
  if (auth instanceof NextResponse) return auth;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "A file is required." }, { status: 400 });
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Image must be JPG, PNG, or WebP." },
      { status: 400 }
    );
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return NextResponse.json(
      { error: "Image must be less than 5MB." },
      { status: 400 }
    );
  }

  const context =
    formData.get("context") === "post" ? "post" : "avatar";

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const publicId =
      context === "post"
        ? `posts/${auth.user.id}/${uuidv4()}`
        : `avatars/${auth.user.id}`;

    const upload = await uploadImageBuffer(buffer, { publicId });

    return NextResponse.json({
      url: upload.secureUrl,
      publicId: upload.publicId,
      width: upload.width,
      height: upload.height,
      format: upload.format,
      bytes: upload.bytes,
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to upload image.";
    const status = message.includes("CLOUDINARY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}