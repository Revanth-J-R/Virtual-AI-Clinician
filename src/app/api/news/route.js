import * as cheerio from "cheerio";

export async function GET() {
  // Hardcoded API key (for demonstration only—avoid in production)
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
      // Otherwise, return the error as JSON.
      return Response.json(
        { error: `API Error: ${response.statusText}` },
        { status: response.status }
      );
    }

    // If the content is JSON, parse and return it.
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      return Response.json(data);
    } 
    // If the content is HTML (but the response is OK), parse it with Cheerio.
    else if (contentType && contentType.includes("text/html")) {
      const html = await response.text();
      const $ = cheerio.load(html);
      const pageTitle = $("title").text();
      // Extract a snippet from the body text (first 200 characters)
      const bodySnippet = $("body").text().trim().slice(0, 200);
      return Response.json(
        {
          error: "Received HTML response instead of JSON",
          pageTitle,
          snippet: bodySnippet,
        },
        { status: 500 }
      );
    } 
    // If the content type is unknown, return an error.
    else {
      return Response.json(
        { error: "Unknown content type" },
        { status: 500 }
      );
    }
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch news" },
      { status: 500 }
    );
  }
}
