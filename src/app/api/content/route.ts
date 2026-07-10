import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

const contentFilePath = path.join(process.cwd(), "src/data/content.json");

export const dynamic = "force-dynamic";

const isBlobConfigured = () => 
  !!(process.env.BLOB_READ_WRITE_TOKEN || 
     process.env.VERCEL_OIDC_TOKEN || 
     process.env.BLOB_STORE_ID);

export async function GET() {
  console.log("SERVER LOG: GET /api/content request received");
  try {
    if (isBlobConfigured()) {
      console.log("SERVER LOG: Vercel Blob is configured, checking for content.json in blob store");
      const { list } = await import("@vercel/blob");
      const { blobs } = await list();
      const contentBlob = blobs.find(b => b.pathname === "content.json");
      
      if (contentBlob) {
        console.log("SERVER LOG: Found content.json in blob store, URL:", contentBlob.url);
        // Add cache busting to the fetch request to prevent browser caching of the blob URL
        const res = await fetch(`${contentBlob.url}?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          console.log("SERVER LOG: Successfully loaded content from Vercel Blob");
          return NextResponse.json(data);
        }
        console.warn("SERVER LOG: Failed to fetch blob content from URL, falling back to local file");
      } else {
        console.log("SERVER LOG: content.json not found in Vercel Blob yet, falling back to local file");
      }
    } else {
      console.log("SERVER LOG: Vercel Blob not configured, loading from local file");
    }

    // Fallback to local file system
    const data = await fs.readFile(contentFilePath, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch (error: any) {
    console.error("SERVER LOG: GET request failed:", error);
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  console.log("SERVER LOG: Received POST /api/content request");
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("drivewell_session");

    if (!session || session.value !== "authorized_session_token_value") {
      console.warn("SERVER LOG: Unauthorized access attempt, session cookie missing or invalid");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("SERVER LOG: Parsing request JSON payload");
    const newContent = await request.json();
    
    console.log("SERVER LOG: Validating content schema structure");
    if (!newContent.hero || !newContent.packages || !newContent.contact) {
      console.error("SERVER LOG: Validation failed, structure is missing hero, packages or contact key");
      return NextResponse.json({ error: "Invalid content structure" }, { status: 400 });
    }

    if (isBlobConfigured()) {
      console.log("SERVER LOG: Vercel Blob is configured, uploading content.json to Vercel Blob");
      const { put } = await import("@vercel/blob");
      
      const payloadString = JSON.stringify(newContent, null, 2);
      const blob = await put("content.json", payloadString, {
        access: "public",
        contentType: "application/json",
        addRandomSuffix: false
      });
      console.log("SERVER LOG: Vercel Blob upload successful, URL:", blob.url);
    } else {
      console.log("SERVER LOG: Local filesystem fallback, saving to content.json");
      await fs.writeFile(contentFilePath, JSON.stringify(newContent, null, 2), "utf-8");
      console.log("SERVER LOG: Local file write successful");
    }

    console.log("SERVER LOG: Purging page caches via revalidatePath");
    try {
      revalidatePath("/");
      revalidatePath("/dashboard");
      console.log("SERVER LOG: Cache revalidation commands sent");
    } catch (revalErr: any) {
      console.warn("SERVER LOG: Non-fatal error during cache revalidation:", revalErr?.message || revalErr);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("SERVER LOG: Unhandled exception caught in POST handler:", error);
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
  }
}
