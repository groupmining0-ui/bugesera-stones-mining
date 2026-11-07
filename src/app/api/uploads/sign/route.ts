import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Returns a signed payload so the browser can upload straight to Cloudinary
// without the API secret ever leaving the server.
// Accepts an optional ?folder= query param (defaults to "quotes").
export async function POST(request: Request) {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return NextResponse.json({ error: "File uploads are not configured yet." }, { status: 503 });
  }
  const url = new URL(request.url);
  const subfolder = url.searchParams.get("folder") ?? "quotes";
  const timestamp = Math.round(Date.now() / 1000);
  const folder = `bugesera-stoneworks/${subfolder}`;
  const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, CLOUDINARY_API_SECRET);
  return NextResponse.json({ timestamp, folder, signature, apiKey: CLOUDINARY_API_KEY, cloudName: CLOUDINARY_CLOUD_NAME });
}
