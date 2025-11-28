import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl) {
      try {
        const client = new MongoClient(databaseUrl);
        await client.connect();
        const db = client.db('directus');
        const content = await db.collection('assignments').findOne({});
        await client.close();
        if (content) {
          return NextResponse.json(content);
        }
      } catch (mongoError) {
        console.warn('MongoDB not available, falling back to JSON file:', mongoError);
      }
    }

    // Fallback to JSON file
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'data', 'assignment.json');
    const jsonData = fs.readFileSync(filePath, 'utf8');
    const content = JSON.parse(jsonData);
    return NextResponse.json(content);
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const databaseUrl = process.env.DATABASE_URL;

    if (databaseUrl) {
      try {
        const client = new MongoClient(databaseUrl);
        await client.connect();
        const db = client.db('directus');
        await db.collection('assignments').replaceOne({}, body, { upsert: true });
        await client.close();
        return NextResponse.json({ success: true });
      } catch (mongoError) {
        console.warn('MongoDB not available, falling back to JSON file:', mongoError);
      }
    }

    // Fallback to JSON file
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'data', 'assignment.json');
    fs.writeFileSync(filePath, JSON.stringify(body, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving data:', error);
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
  }
}