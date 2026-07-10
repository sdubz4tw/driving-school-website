import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

const contentFilePath = path.join(process.cwd(), "src/data/content.json");
const KV_KEY = "driving_school_content";

export const dynamic = "force-dynamic";

// Helper to determine if we should use Vercel KV
const isKvConfigured = () => !!(process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL);

export async function GET() {
  try {
    if (isKvConfigured()) {
      const { kv } = await import("@vercel/kv");
      const data = await kv.get(KV_KEY);
      if (data) {
        return NextResponse.json(data);
      }
    }
    // Fallback to local file system
    const data = await fs.readFile(contentFilePath, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  console.log("SERVER LOG: Received POST /api/content request");
  try {
    console.log("SERVER LOG: Checking auth cookies");
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

    if (isKvConfigured()) {
      console.log("SERVER LOG: Database KV is configured, saving to Vercel KV");
      const { kv } = await import("@vercel/kv");
      await kv.set(KV_KEY, newContent);
      console.log("SERVER LOG: Save to Vercel KV successful");
    } else {
      console.log("SERVER LOG: Local filesystem fallback, saving to", contentFilePath);
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
