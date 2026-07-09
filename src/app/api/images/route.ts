import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "images", "uploads");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
const MAX_DIMENSION = 4096; // pixels

function isAuthenticated(cookieStore: ReturnType<typeof cookies> extends Promise<infer T> ? T : never): boolean {
  const session = cookieStore.get("drivewell_session");
  return session?.value === "authorized_session_token_value";
}

/* GET — list uploaded images */
export async function GET() {
  try {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    const files = fs.readdirSync(UPLOAD_DIR).filter(f => /\.(jpg|jpeg|png|webp|svg)$/i.test(f));
    const images = files.map(f => {
      const stat = fs.statSync(path.join(UPLOAD_DIR, f));
      return {
        name: f,
        url: `/images/uploads/${f}`,
        size: stat.size,
        uploadedAt: stat.mtime.toISOString(),
      };
    });
    return NextResponse.json({ images, limits: { maxSizeMB: 5, maxDimension: MAX_DIMENSION, allowedTypes: ["JPEG", "PNG", "WebP", "SVG"] } });
  } catch {
    return NextResponse.json({ images: [], limits: { maxSizeMB: 5, maxDimension: MAX_DIMENSION, allowedTypes: ["JPEG", "PNG", "WebP", "SVG"] } });
  }
}

/* POST — upload an image */
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  if (!isAuthenticated(cookieStore)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const slot = formData.get("slot") as string | null; // "logo" or "hero_slide" etc.

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: `File too large. Maximum size is 5 MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)} MB.` }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP, SVG.` }, { status: 400 });
    }

    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const safeName = (slot || "upload") + "_" + Date.now() + "." + ext;
    const filePath = path.join(UPLOAD_DIR, safeName);

    const arrayBuffer = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

    return NextResponse.json({
      success: true,
      image: {
        name: safeName,
        url: `/images/uploads/${safeName}`,
        size: file.size,
      },
    });
  } catch {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

/* DELETE — remove an uploaded image */
export async function DELETE(request: NextRequest) {
  const cookieStore = await cookies();
  if (!isAuthenticated(cookieStore)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name } = await request.json();
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Image name required" }, { status: 400 });
    }

    // Prevent directory traversal
    const safeName = path.basename(name);
    const filePath = path.join(UPLOAD_DIR, safeName);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    fs.unlinkSync(filePath);
    return NextResponse.json({ success: true, deleted: safeName });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
