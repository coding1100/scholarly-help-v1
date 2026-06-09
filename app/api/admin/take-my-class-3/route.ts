import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export const dynamic = "force-dynamic";

const PAGE_ID = "take-my-class-3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error("DATABASE_URL not configured");
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500, headers: corsHeaders },
      );
    }

    const client = new MongoClient(databaseUrl, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    await client.connect();
    const db = client.db("scholarly_help");

    const query = {
      $or: [{ id: PAGE_ID }, { pageType: PAGE_ID }],
    };

    console.log(
      `Querying pages collection for ${PAGE_ID}, query:`,
      JSON.stringify(query),
    );
    const content = await db.collection("pages").findOne(query);
    console.log("Found content:", content ? "Yes" : "No");

    await client.close();

    return NextResponse.json(content || {}, { headers: corsHeaders });
  } catch (error) {
    console.error("Error fetching from MongoDB:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: corsHeaders },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log(`POST /api/admin/${PAGE_ID} - Starting save operation`);

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error("Database URL not configured");
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500, headers: corsHeaders },
      );
    }

    const body = await request.json();
    console.log("Received data, size:", JSON.stringify(body).length, "characters");

    const removeImageFields = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map((item) => removeImageFields(item));
      }
      if (obj && typeof obj === "object") {
        const cleaned: any = {};
        for (const [key, value] of Object.entries(obj)) {
          if (
            key.toLowerCase().includes("icon") ||
            key.toLowerCase().includes("image") ||
            key.toLowerCase().includes("img") ||
            key === "formBackImg2" ||
            key === "imge"
          ) {
            continue;
          }
          cleaned[key] = removeImageFields(value);
        }
        return cleaned;
      }
      return obj;
    };

    const { _id, slug, id, ...updateData } = body;
    const cleanedData = removeImageFields(updateData);

    const client = new MongoClient(databaseUrl, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });

    console.log("Connecting to MongoDB...");
    await client.connect();
    console.log("Connected to MongoDB successfully");

    const db = client.db("scholarly_help");

    const query = {
      $or: [{ id: PAGE_ID }, { pageType: PAGE_ID }],
    };

    const dataToSave = {
      ...cleanedData,
      id: PAGE_ID,
      pageType: PAGE_ID,
    };

    const result = await db
      .collection("pages")
      .replaceOne(query, dataToSave, { upsert: true });
    console.log("Save result:", result);

    await client.close();
    console.log("Connection closed, save operation completed");

    return NextResponse.json(
      {
        success: true,
        message: "Data saved successfully",
        modifiedCount: result.modifiedCount,
        upsertedCount: result.upsertedCount,
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error("Error saving to MongoDB:", error);
    return NextResponse.json(
      {
        error: "Failed to save data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, headers: corsHeaders },
    );
  }
}
