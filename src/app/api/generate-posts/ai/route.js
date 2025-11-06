import { NextResponse } from "next/server";

export async function POST(req) {
  const { topic, contentTemplate } = await req.json();

  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Using the following template, generate an engaging linkedin-style post titled "${topic}". 
                  Maintain the structure and tone specified by the template. Do not add any additional information outside of the template.For example, if the template includes placeholders, ensure they are filled appropriately. Desist from adding greetings, sign-offs, or any extra commentary.

                  TEMPLATE:
                  ${contentTemplate}`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        `Gemini API Error: ${data.error?.message || response.statusText}`
      );
    }

    const content =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No content generated.";

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI content." },
      { status: 500 }
    );
  }
}
