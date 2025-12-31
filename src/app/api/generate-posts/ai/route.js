
import { NextResponse } from "next/server";
import { User } from "@/lib/models.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req) {
  try {
    const { topic, contentTemplate, userId } = await req.json();

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    // Verify user exists and get persona
    const user = await User.findByPk(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Construct Persona Context
    let personaContext = "";
    if (user.profession || user.industry || user.tone || user.bio) {
      personaContext = `
        You are writing as a professional with the following profile:
        - Profession: ${user.profession || "not specified"}
        - Industry: ${user.industry || "not specified"}
        - Tone: ${user.tone || "professional and engaging"}
        - Background: ${user.bio || "not specified"}
        
        Ensure the post reflects this specific professional voice, expertise, and tone.
        `;
    }

    // Define the system instruction
    const systemInstruction = `You are an expert LinkedIn content creator. Your goal is to write high-engagement, viral LinkedIn posts.
      ${personaContext}
      
      Follow these formatting rules:
      - Use short, punchy sentences.
      - Use line breaks frequently for readability.
      - Include 3-5 relevant hashtags at the end.
      - Do not use markdown for bolding (LinkedIn doesn't support it natively), use unicode if absolutely necessary but prefer clean text.
      - Do NOT include "Here is a post..." or meta-commentary. Just output the post content.`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      systemInstruction: systemInstruction,
    });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Using the following template, generate an engaging linkedin-style post titled "${topic}". 
                        Maintain the structure and tone specified by the template. Do not add any additional information outside of the template.For example, if the template includes placeholders, ensure they are filled appropriately. Desist from adding greetings, sign-offs, or any extra commentary.
      
                        TEMPLATE:
                        ${contentTemplate}`
            }
          ]
        }
      ]
    });

    const response = await result.response;
    const content = response.text() || "No content generated.";

    return NextResponse.json({ content });
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI content." },
      { status: 500 }
    );
  }
}
