import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import fs from "fs";
import path from "path";
import type { UploadedImage } from "@/types";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "images", "uploads");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
const MAX_DIMENSION = 4096; // pixels

function isAuthenticated(cookieStore: ReturnType<typeof cookies> extends Promise<infer T> ? T : never): boolean {
  const session = cookieStore.get("drivewell_session");
  return session?.value === "authorized_session_token_value";
}

const isBlobConfigured = () =>
  !!(process.env.BLOB_READ_WRITE_TOKEN ||
     process.env.VERCEL_OIDC_TOKEN ||
     process.env.BLOB_STORE_ID);

/* GET — list uploaded images */
export async function GET() {
  try {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    const files = fs.readdirSync(UPLOAD_DIR).filter(f => /\.(jpg|jpeg|png|webp|svg)$/i.test(f));
    const images: UploadedImage[] = files.map(f => {
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
      return NextResponse.json({ error: `File too large. Maximum size is 5 MB.` }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP, SVG.` }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const safeName = (slot || "upload") + "_" + Date.now() + "." + ext;

    if (isBlobConfigured()) {
      // Upload directly to Vercel Blob cloud storage
      const blob = await put(safeName, file, {
        access: "public",
      });
      revalidatePath("/");
      revalidatePath("/admin/dashboard");
      return NextResponse.json({
        success: true,
        image: {
          name: safeName,
          url: blob.url,
          size: file.size,
        } satisfies UploadedImage,
      });
    } else {
      // Try local file system write first
      try {
        if (!fs.existsSync(UPLOAD_DIR)) {
          fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        }
        const filePath = path.join(UPLOAD_DIR, safeName);
        const arrayBuffer = await file.arrayBuffer();
        fs.writeFileSync(filePath, Buffer.from(arrayBuffer));

        revalidatePath("/");
        revalidatePath("/admin/dashboard");
        return NextResponse.json({
          success: true,
          image: {
            name: safeName,
            url: `/images/uploads/${safeName}`,
            size: file.size,
          } satisfies UploadedImage,
        });
      } catch {
        // Fallback for read-only serverless filesystems (e.g. Vercel without Blob tokens)
        // Convert to Base64 Data URL so the user can still preview and save it inside content.json
        const arrayBuffer = await file.arrayBuffer();
        const base64String = Buffer.from(arrayBuffer).toString("base64");
        const dataUrl = `data:${file.type};base64,${base64String}`;

        revalidatePath("/");
        revalidatePath("/admin/dashboard");
        return NextResponse.json({
          success: true,
          image: {
            name: safeName,
            url: dataUrl,
            size: file.size,
            isBase64Fallback: true
          } satisfies UploadedImage,
        });
      }
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: msg }, { status: 500 });
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

    const safeName = path.basename(name);
    const filePath = path.join(UPLOAD_DIR, safeName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    return NextResponse.json({ success: true, deleted: safeName });
  } catch {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
