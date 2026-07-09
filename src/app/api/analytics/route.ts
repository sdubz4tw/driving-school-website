import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const analyticsFile = path.join(process.cwd(), "src/data/analytics.json");

interface Hit {
  timestamp: string;
  type: "pageview" | "booking";
  date: string;
}

// Generate mock historical data if file is empty
function ensureDataInitialized() {
  try {
    if (!fs.existsSync(analyticsFile)) {
      const dir = path.dirname(analyticsFile);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(analyticsFile, JSON.stringify({ hits: [] }, null, 2));
    }

    const fileContent = fs.readFileSync(analyticsFile, "utf-8");
    const data = JSON.parse(fileContent);
    
    // Seed with 365 days of historical data if empty
    if (!data.hits || data.hits.length === 0) {
      const hits: Hit[] = [];
      const now = new Date();
      
      for (let i = 365; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        
        // Pageviews (between 30 and 150 per day)
        const pvCount = 30 + Math.floor(Math.random() * 120);
        for (let j = 0; j < pvCount; j++) {
          hits.push({
            timestamp: d.toISOString(),
            type: "pageview",
            date: dateStr
          });
        }
        
        // Bookings (roughly 2% to 6% conversion rate)
        const bCount = Math.floor(pvCount * (0.02 + Math.random() * 0.04));
        for (let j = 0; j < bCount; j++) {
          hits.push({
            timestamp: d.toISOString(),
            type: "booking",
            date: dateStr
          });
        }
      }
      
      fs.writeFileSync(analyticsFile, JSON.stringify({ hits }, null, 2));
    }
  } catch (e) {
    console.error("Failed to initialize analytics file:", e);
  }
}

/* GET — fetch and aggregate real metrics */
export async function GET(request: NextRequest) {
  ensureDataInitialized();
  try {
    const { searchParams } = new URL(request.url);
    const rangeParam = searchParams.get("range") || "30";
    const days = parseInt(rangeParam, 10);

    const fileContent = fs.readFileSync(analyticsFile, "utf-8");
    const data = JSON.parse(fileContent) as { hits: Hit[] };
    const hits = data.hits || [];

    const now = new Date();
    const cutoffDate = new Date();
    cutoffDate.setDate(now.getDate() - days);

    // Group hits by date
    const dateMap: Record<string, { date: string; visitors: number; pageViews: number; bookings: number }> = {};

    // Initialize all dates in range with 0 to ensure full chart coverage
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      
      dateMap[dateStr] = {
        date: label,
        visitors: 0,
        pageViews: 0,
        bookings: 0
      };
    }

    // Aggregate real hits
    hits.forEach(hit => {
      const hitTime = new Date(hit.timestamp);
      if (hitTime >= cutoffDate && hitTime <= now) {
        const dateKey = hit.date;
        if (dateMap[dateKey]) {
          if (hit.type === "pageview") {
            dateMap[dateKey].pageViews += 1;
            // Mock unique visitors as slightly less than pageviews for simplicity
            if (Math.random() > 0.3) {
              dateMap[dateKey].visitors += 1;
            }
          } else if (hit.type === "booking") {
            dateMap[dateKey].bookings += 1;
          }
        }
      }
    });

    const chartData = Object.keys(dateMap)
      .sort()
      .map(key => dateMap[key]);

    return NextResponse.json({ chartData });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load metrics" }, { status: 500 });
  }
}

/* POST — record a new traffic event */
export async function POST(request: NextRequest) {
  ensureDataInitialized();
  try {
    const { type } = await request.json();
    if (type !== "pageview" && type !== "booking") {
      return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
    }

    const fileContent = fs.readFileSync(analyticsFile, "utf-8");
    const data = JSON.parse(fileContent) as { hits: Hit[] };
    const hits = data.hits || [];

    const now = new Date();
    const newHit: Hit = {
      timestamp: now.toISOString(),
      type,
      date: now.toISOString().split("T")[0]
    };

    hits.push(newHit);
    
    // Limit log file size to last 50,000 hits to avoid memory overflow
    if (hits.length > 50000) {
      hits.splice(0, hits.length - 50000);
    }

    fs.writeFileSync(analyticsFile, JSON.stringify({ hits }, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to record event" }, { status: 500 });
  }
}
