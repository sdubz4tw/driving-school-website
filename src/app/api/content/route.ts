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
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("drivewell_session");

    if (!session || session.value !== "authorized_session_token_value") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const newContent = await request.json();
    
    // Perform basic validation
    if (!newContent.hero || !newContent.packages || !newContent.contact) {
      return NextResponse.json({ error: "Invalid content structure" }, { status: 400 });
    }

    if (isKvConfigured()) {
      const { kv } = await import("@vercel/kv");
      await kv.set(KV_KEY, newContent);
    } else {
      await fs.writeFile(contentFilePath, JSON.stringify(newContent, null, 2), "utf-8");
    }

    revalidatePath("/");
    revalidatePath("/dashboard");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 });
  }
}
