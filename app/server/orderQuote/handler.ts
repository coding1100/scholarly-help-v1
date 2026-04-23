import { NextRequest, NextResponse } from "next/server";
import dayjs from "dayjs";
import { PhoneNumberUtil } from "google-libphonenumber";

import {
  appendSheetRow,
  getGhlAuthorizationToken,
  getMongoClient,
  getMongoDbName,
  getSmtpTransport,
  uploadToCloudinary,
} from "./deps";

type QuotePayload = {
  course_level?: string;
  course_name?: string;
  course_weeks?: string;
  course_deadline?: string;
  email?: string;
  phone_number?: string;
  no_of_pages?: string;
  instructions?: string;
  gclid?: string;
  fbclid?: string;
  url?: string;
};

function normalizeString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

async function getCountryNameFromPhone(phoneNumber: string): Promise<string | undefined> {
  try {
    const phoneUtil = PhoneNumberUtil.getInstance();
    const parsed = phoneUtil.parseAndKeepRawInput(phoneNumber);
    if (!phoneUtil.isValidNumber(parsed)) return undefined;
    const region = phoneUtil.getRegionCodeForNumber(parsed);
    if (!region) return undefined;
    const display = new Intl.DisplayNames(["en"], { type: "region" });
    return display.of(region) || undefined;
  } catch {
    return undefined;
  }
}

async function createGhlContact(params: {
  email?: string;
  phone?: string;
  source?: string;
  locationId: string;
}): Promise<void> {
  const token = getGhlAuthorizationToken();
  if (!token) {
    console.warn("GHL: missing GHL_AUTHORIZATION_TOKEN; skipping contact create");
    return;
  }

  const payload: Record<string, unknown> = { locationId: params.locationId };
  if (params.email) payload.email = params.email;
  if (params.phone) payload.phone = params.phone;
  if (params.source) payload.source = params.source;

  try {
    const res = await fetch("https://services.leadconnectorhq.com/contacts/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Version: "2021-07-28",
      },
      body: JSON.stringify(payload),
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : null;

    if (!res.ok) {
      const msg = String(data?.message || data?.errors?.[0]?.message || "");
      const lower = msg.toLowerCase();
      if (
        res.status === 400 ||
        res.status === 422 ||
        lower.includes("duplicate") ||
        lower.includes("already exists") ||
        lower.includes("contact already")
      ) {
        console.log("GHL: Duplicate contact detected, ignoring...");
        return;
      }

      console.error("GHL Service Error:", {
        status: res.status,
        data,
      });
      return;
    }

    console.log("GHL: Contact created successfully", {
      contactId: data?.contact?.id,
    });
  } catch (error) {
    console.error("GHL: Unexpected error in contact creation", error);
  }
}

async function sendGetAQuoteMail(args: {
  email?: string;
  phone_number?: string;
  course_level?: string;
  course_name?: string;
  course_weeks?: string;
  course_deadline?: string;
  no_of_pages?: string;
  instructions?: string;
  gclid?: string;
  fbclid?: string;
  url?: string;
  country_name?: string;
}): Promise<void> {
  try {
    const transporter = getSmtpTransport();
    const fromUser = process.env.SMTP_USERNAME;
    const to = process.env.SCHOLARLY_SUPPORT_EMAIL;
    if (!fromUser || !to) throw new Error("Missing SMTP_USERNAME / SCHOLARLY_SUPPORT_EMAIL");

    const template = `<!DOCTYPE html>
                      <html lang="en">
                      <head>
                          <meta charset="UTF-8">
                          <meta name="viewport" content="width=device-width, initial-scale=1.0">
                          <title>Get A Quote Request</title>
                          <style>
                              body, table, td, div { margin: 0; padding: 0; font-family: Arial, sans-serif; color: #2B2275; }
                              body { background-color: #E0D7F5; font-size: 16px; line-height: 1.5; }
                              .container { width: 100%; max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); overflow: hidden; }
                              .header { background-color: #2B2275; color: #FFFFFF; text-align: center; padding: 20px; font-size: 24px; font-weight: bold; }
                              .content { padding: 20px; color: #2B2275; }
                              .summary { margin-top: 20px; border-collapse: collapse; width: 100%; }
                              .summary td, .summary th { padding: 10px; border: 1px solid #DDDDDD; text-align: left; font-size: 14px; }
                              .summary th { background-color: #F2F2F2; font-weight: bold; }
                              .footer { background-color: #E0D7F5; color: #888888; text-align: center; padding: 10px; font-size: 12px; }
                              @media only screen and (max-width: 600px) {
                                  .container { width: 90%; }
                                  .header, .content, .footer { padding: 15px; }
                                  .summary td, .summary th { padding: 8px; font-size: 12px; }
                                  .summary th, .summary td { display: block; width: 100%; text-align: left; }
                              }
                          </style>
                      </head>
                      <body>
                          <div class="container">
                              <div class="header">Get A Quote Request</div>
                              <div class="content">
                                  <p>A new quote request has been made by the client with the following contact: <strong>${args.email || args.phone_number || ""}</strong></p>
                                  <div>
                                      <p style="font-size: 18px; font-weight: bold; margin-top: 0;">Summary:</p>
                                      <table class="summary">
                                          <tr><th>Course Name</th><td>${args.course_name || ""}</td><th>Course Level</th><td>${args.course_level || ""}</td></tr>
                                          <tr><th>Course Weeks</th><td>${args.course_weeks || ""}</td><th>Deadline</th><td>${args.course_deadline || ""}</td></tr>
                                          <tr><th>No of Pages</th><td>${args.no_of_pages || ""}</td><th>Instructions</th><td>${args.instructions || ""}</td></tr>
                                          <tr><th>Phone Number</th><td>${args.phone_number || ""}</td><th>Country</th><td>${args.country_name || ""}</td></tr>
                                          <tr><th>Gclid</th><td>${args.gclid || ""}</td><th>Fbclid</th><td>${args.fbclid || ""}</td></tr>
                                          <tr><th>Url</th><td colspan="3">${args.url || ""}</td></tr>
                                      </table>
                                  </div>
                              </div>
                              <div class="footer">
                                  <p>&copy; ${new Date().getFullYear()} ScholarlyHelp. All rights reserved.</p>
                                  <p>Contact us at: <a href="mailto:support@scholarlyhelp.com" style="color: #2B2275;">support@scholarlyhelp.com</a></p>
                              </div>
                          </div>
                      </body>
                      </html>`;

    await transporter.sendMail({
      from: `"ScholarlyHelp" <${fromUser}>`,
      to,
      subject: "Client",
      html: template,
    });
  } catch (error) {
    console.error("Email send error:", error);
  }
}

export async function handleOrderQuotePost(request: NextRequest) {
  try {
    const formData = await request.formData();

    const payload: QuotePayload = {
      course_level: normalizeString(formData.get("course_level")),
      course_name: normalizeString(formData.get("course_name")),
      course_weeks: normalizeString(formData.get("course_weeks")),
      course_deadline: normalizeString(formData.get("course_deadline")),
      email: normalizeString(formData.get("email")),
      phone_number: normalizeString(formData.get("phone_number")),
      no_of_pages: normalizeString(formData.get("no_of_pages")),
      instructions: normalizeString(formData.get("instructions")),
      gclid: normalizeString(formData.get("gclid")),
      fbclid: normalizeString(formData.get("fbclid")),
      url: normalizeString(formData.get("url")),
    };

    if (!payload.email && !payload.phone_number) {
      return NextResponse.json(
        { success: false, message: "You must include email or phone_number" },
        { status: 400 },
      );
    }

    const file = formData.get("file");
    const fileBuffer =
      file && typeof file === "object" && "arrayBuffer" in file
        ? Buffer.from(await (file as File).arrayBuffer())
        : null;

    const fileUrl = fileBuffer
      ? await uploadToCloudinary(fileBuffer)
          .then((r) => r.fileUrl)
          .catch((error) => {
            console.error("Cloudinary Service Error:", error);
            return null;
          })
      : null;

    const client = await getMongoClient();
    const db = getMongoDbName() ? client.db(getMongoDbName()) : client.db();

    const createQuotePromise = db.collection("quotes").insertOne({
      course_level: payload.course_level || "",
      course_name: payload.course_name || "",
      course_weeks: payload.course_weeks || "",
      course_deadline: payload.course_deadline || "",
      email: payload.email || "",
      phone_number: payload.phone_number || "",
      file: fileUrl,
      no_of_pages: payload.no_of_pages || "",
      instructions: payload.instructions || "",
      gclid: payload.gclid || "",
      fbclid: payload.fbclid || "",
      url: payload.url || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const appendValuesPromise = appendSheetRow([
      [
        payload.email || "",
        payload.phone_number ? payload.phone_number.replace("+", "") : "",
        payload.course_level || "",
        payload.course_name || "",
        payload.course_weeks || "",
        payload.course_deadline || "",
        payload.no_of_pages || "",
        payload.instructions || "",
        payload.gclid || "",
        payload.fbclid || "",
        payload.url || "",
        dayjs().add(5, "h").format("MMMM D, YYYY h:mm A"),
      ],
    ]);

    const createGHLContactPromise = createGhlContact({
      email: payload.email || undefined,
      phone: payload.phone_number || undefined,
      source: payload.fbclid || payload.gclid || undefined,
      locationId: "PrmJ3qseVQyutkMwBUm7",
    });

    const country_name = payload.phone_number
      ? await getCountryNameFromPhone(payload.phone_number)
      : undefined;

    const sendMailPromise = sendGetAQuoteMail({
      ...payload,
      country_name,
    });

    await Promise.all([
      createQuotePromise,
      appendValuesPromise,
      sendMailPromise,
      createGHLContactPromise,
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing /order/quote:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process quote request" },
      { status: 500 },
    );
  }
}

