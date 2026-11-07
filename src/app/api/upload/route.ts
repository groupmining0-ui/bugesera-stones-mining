import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files (JPEG, PNG, WebP, etc.) are allowed" }, { status: 400 });
    }

    // 15MB limit
    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: "Image size must be less than 15MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // If Cloudinary credentials are fully set in env, upload to Cloudinary
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
    if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
      try {
        cloudinary.config({
          cloud_name: CLOUDINARY_CLOUD_NAME,
          api_key: CLOUDINARY_API_KEY,
          api_secret: CLOUDINARY_API_SECRET,
        });

        const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "bugesera-stoneworks/admin" },
            (error, result) => {
              if (error || !result) reject(error || new Error("Cloudinary upload failed"));
              else resolve(result as { secure_url: string });
            }
          );
          stream.end(buffer);
        });

        return NextResponse.json({ url: uploadResult.secure_url });
      } catch (cloudErr) {
        console.warn("Cloudinary upload failed, falling back to local file storage:", cloudErr);
      }
    }

    // Local filesystem storage under public/uploads
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const rawExt = path.extname(file.name) || ".jpg";
    const ext = rawExt.toLowerCase();
    const cleanBase = path
      .basename(file.name, rawExt)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 40) || "image";

    const uniqueFilename = `${cleanBase}-${Date.now()}${ext}`;
    const destinationPath = path.join(uploadsDir, uniqueFilename);

    await fs.writeFile(destinationPath, buffer);

    return NextResponse.json({ url: `/uploads/${uniqueFilename}` });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload failed";
    console.error("Upload error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

