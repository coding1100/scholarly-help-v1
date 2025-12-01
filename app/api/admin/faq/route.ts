import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from 'mongodb';

export const dynamic = 'force-dynamic';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

export async function GET() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const client = new MongoClient(databaseUrl);
    await client.connect();
    const db = client.db('scholarly_help');
    const content = await db.collection('faq').findOne({});
    await client.close();

    return NextResponse.json(content || {}, { headers: corsHeaders });
  } catch (error) {
    console.error('Error fetching from MongoDB:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500, headers: corsHeaders });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/admin/faq - Starting save operation');

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error('Database URL not configured');
      return NextResponse.json({ error: 'Database not configured' }, { status: 500, headers: corsHeaders });
    }

    const body = await request.json();
    console.log('Received data, size:', JSON.stringify(body).length, 'characters');

    // Exclude _id from the update to prevent immutable field error
    const { _id, ...updateData } = body;

    const client = new MongoClient(databaseUrl, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      connectTimeoutMS: 10000, // 10 second timeout
    });

    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected to MongoDB successfully');

    const db = client.db('scholarly_help');
    console.log('Using database: scholarly_help');

    const result = await db.collection('faq').replaceOne({}, updateData, { upsert: true });
    console.log('Save result:', result);

    await client.close();
    console.log('Connection closed, save operation completed');

    return NextResponse.json({
      success: true,
      message: 'Data saved successfully',
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount
    }, { headers: corsHeaders });
  } catch (error) {
    console.error('Error saving to MongoDB:', error);
    return NextResponse.json({
      error: 'Failed to save data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500, headers: corsHeaders });
  }
}