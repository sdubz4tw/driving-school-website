import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { kv } from "@vercel/kv";
import fs from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const bookingsFilePath = path.join(process.cwd(), "src/data/bookings.json");
const KV_KEY = "driving_school_bookings";

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  package: string;
  timePreference: string;
  timestamp: string;
}

const isKvConfigured = () => !!(process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL);

function isAuthenticated(cookieStore: ReturnType<typeof cookies> extends Promise<infer T> ? T : never): boolean {
  const session = cookieStore.get("drivewell_session");
  return session?.value === "authorized_session_token_value";
}

/* GET — fetch all bookings (admin only) */
export async function GET() {
  const cookieStore = await cookies();
  if (!isAuthenticated(cookieStore)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let bookingsList: Booking[] = [];
    if (isKvConfigured()) {
      const data = await kv.get<{ bookings: Booking[] }>(KV_KEY);
      if (data && data.bookings) {
        bookingsList = data.bookings;
      }
    } else {
      try {
        const data = await fs.readFile(bookingsFilePath, "utf-8");
        const parsed = JSON.parse(data);
        bookingsList = parsed.bookings || [];
      } catch {
        bookingsList = [];
      }
    }

    // Sort bookings by newest first
    bookingsList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return NextResponse.json({ bookings: bookingsList });
  } catch (error) {
    return NextResponse.json({ error: "Failed to read bookings" }, { status: 500 });
  }
}

/* POST — public booking submission */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, package: pkgId, timePreference } = body;

    if (!name || !email || !phone) {
      return NextResponse.json({ error: "Name, email, and phone are required fields" }, { status: 400 });
    }

    const newBooking: Booking = {
      id: "b_" + Date.now() + Math.random().toString(36).substr(2, 4),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      package: pkgId || "defensive",
      timePreference: timePreference || "afternoon",
      timestamp: new Date().toISOString(),
    };

    let currentBookings: Booking[] = [];

    if (isKvConfigured()) {
      const data = await kv.get<{ bookings: Booking[] }>(KV_KEY);
      if (data && data.bookings) {
        currentBookings = data.bookings;
      }
      currentBookings.push(newBooking);
      await kv.set(KV_KEY, { bookings: currentBookings });
    } else {
      try {
        if (!existsSync(bookingsFilePath)) {
          await fs.writeFile(bookingsFilePath, JSON.stringify({ bookings: [] }), "utf-8");
        }
        const data = await fs.readFile(bookingsFilePath, "utf-8");
        const parsed = JSON.parse(data);
        currentBookings = parsed.bookings || [];
      } catch {
        currentBookings = [];
      }
      currentBookings.push(newBooking);
      await fs.writeFile(bookingsFilePath, JSON.stringify({ bookings: currentBookings }, null, 2), "utf-8");
    }

    return NextResponse.json({ success: true, booking: newBooking });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save booking" }, { status: 500 });
  }
}
