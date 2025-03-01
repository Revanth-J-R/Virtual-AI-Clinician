import * as cheerio from "cheerio";
import { writeFile } from "fs/promises";
import path from "path";

export async function GET() {
  const apiKey = "pub_724460b3ff0d8ae0209bcd07c88a1b3621421";
  const url = `https://newsdata.io/api/1/news?apikey=${apiKey}&country=in&language=en&category=health`;

  try {
    const response = await fetch(url);
    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      if (contentType && contentType.includes("text/html")) {
        const html = await response.text();
        const $ = cheerio.load(html);
        const errorTitle = $("title").text();
        return Response.json(
          {
            error: `API Error: ${response.statusText}`,
            pageTitle: errorTitle,
          },
          { status: response.status }
        );
      }
      return Response.json(
        { error: `API Error: ${response.statusText}` },
        { status: response.status }
      );
    }

    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return Response.json(data);
    } else if (contentType && contentType.includes("text/html")) {
      const html = await response.text();
      const $ = cheerio.load(html);
      const pageTitle = $("title").text();
      const bodySnippet = $("body").text().trim().slice(0, 200);
      return Response.json(
        {
          error: "Received HTML response instead of JSON",
          pageTitle,
          snippet: bodySnippet,
        },
        { status: 500 }
      );
    } else {
      return Response.json(
        { error: "Unknown content type" },
        { status: 500 }
      );
    }
  } catch (error) {
    return Response.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return Response.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file to /public/uploads
    const uploadDir = path.join(process.cwd(), "public/uploads");
    const filePath = path.join(uploadDir, file.name);

    await writeFile(filePath, buffer);
    return Response.json({ message: "File uploaded successfully", filePath });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
