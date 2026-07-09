import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "fs/promises";
import path from "path";

const contentFilePath = path.join(process.cwd(), "src/data/content.json");

export async function GET() {
  try {
    const data = await fs.readFile(contentFilePath, "utf-8");
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    return NextResponse.json({ error: "Failed to read content data" }, { status: 500 });
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

    await fs.writeFile(contentFilePath, JSON.stringify(newContent, null, 2), "utf-8");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to write content data" }, { status: 500 });
  }
}
