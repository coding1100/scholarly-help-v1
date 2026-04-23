import { MongoClient, MongoClientOptions } from "mongodb";
import { v2 as cloudinary } from "cloudinary";
import { google, sheets_v4 } from "googleapis";
import nodemailer from "nodemailer";

const mongoOptions: MongoClientOptions = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 15_000,
  connectTimeoutMS: 15_000,
  retryReads: true,
  retryWrites: true,
};

declare global {
  // eslint-disable-next-line no-var
  var __orderQuoteMongoClientPromise: Promise<MongoClient> | undefined;
}

function getMongoUri(): string {
  const uri =
    process.env.MONGODB_CONNECTION_STRING ||
    process.env.DATABASE_URL ||
    process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MongoDB connection string");
  return uri;
}

export async function getMongoClient(): Promise<MongoClient> {
  if (!global.__orderQuoteMongoClientPromise) {
    const uri = getMongoUri();
    const client = new MongoClient(uri, mongoOptions);
    global.__orderQuoteMongoClientPromise = client.connect();
  }
  return global.__orderQuoteMongoClientPromise;
}

export function getMongoDbName(): string | undefined {
  return process.env.MONGODB_DB_NAME;
}

export function ensureCloudinaryConfigured(): void {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Missing Cloudinary env vars");
  }
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

export async function uploadToCloudinary(fileBuffer: Buffer) {
  ensureCloudinaryConfigured();
  return await new Promise<{ publicId: string; fileUrl: string }>(
    (resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: "auto", folder: "scholarlyhelp" },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve({ publicId: result.public_id, fileUrl: result.secure_url });
        },
      );
      uploadStream.end(fileBuffer);
    },
  );
}

export function getSheetsClient(): sheets_v4.Sheets {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!clientEmail || !privateKey) {
    throw new Error("Missing GOOGLE_CLIENT_EMAIL / GOOGLE_PRIVATE_KEY");
  }
  const scopes = [
    process.env.GOOGLE_APIS_SCOPE ||
      "https://www.googleapis.com/auth/spreadsheets",
  ];
  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes,
  });
  return google.sheets({ version: "v4", auth });
}

export async function appendSheetRow(values: any[][]) {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
  const range = process.env.GOOGLE_SPREADSHEET_RANGE || "Sheet2";
  if (!spreadsheetId) throw new Error("Missing GOOGLE_SPREADSHEET_ID");

  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
}

export function getSmtpTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || "587");
  const user = process.env.SMTP_USERNAME;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !user || !pass) {
    throw new Error("Missing SMTP env vars");
  }

  const secure =
    String(process.env.SMTP_SECURE || "").toLowerCase() === "true";

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

export function getGhlAuthorizationToken(): string | undefined {
  return process.env.GHL_AUTHORIZATION_TOKEN;
}

