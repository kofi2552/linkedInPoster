

export async function generateSocialPost(topic, description = "", userPersona = {}, platform = "linkedin") {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  let platformInstructions = "";
  switch (platform) {
    case "twitter":
      platformInstructions = `
      - Max 280 characters.
      - Use 2-3 relevant hashtags.
      - Casual, concise, and engaging style.
      - No intro/outro. Only the tweet text.`;
      break;
    case "facebook":
      platformInstructions = `
      - Engaging and conversational tone.
      - Can be longer than Twitter but keep it concise (under 500 chars).
      - Use 1-2 hashtags.
      - Encourages interaction (likes/comments).`;
      break;
    case "instagram":
      platformInstructions = `
      - Visually descriptive caption (since it accompanies an image).
      - Use line breaks and emojis.
      - Include 5-10 relevant hashtags at the bottom.
      - Engaging and lifestyle-focused tone.`;
      break;
    case "tiktok":
      platformInstructions = `
      - Short, punchy video caption.
      - Max 150 characters (ideal for readability).
      - Use trending hashtags.
      - Call to action (e.g., "Link in bio", "Follow for more").`;
      break;
    case "linkedin":
    default:
      platformInstructions = `
      - Professional and engaging tone.
      - Max 600 characters.
      - 2-3 relevant hashtags.
      - No emojis (clean text).`;
      break;
  }

  try {
    // 1️⃣ Generate post text
    const textResponse = await fetch(
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
                  text: `Using the following template, generate an engaging social media post for ${platform} using the title "${topic}". 
                  Maintain this tone: ${description || userPersona.tone || "professional"}. 
              
                  Author Context (The Persona):
                  - Profession: ${userPersona.profession || "Industry Professional"}
                  - Industry: ${userPersona.industry || "General Business"}
                  - Bio/Background: ${userPersona.bio || "Experienced professional sharing insights."}
                  - Voice/Tone: ${userPersona.tone || "Professional, engaging, and authentic"}

                  Follow these Requirements strictly:
                  ${platformInstructions}
                  
                  - Remove any greetings or sign-offs
                  - Remove any extra headings or subtitles
                  - Focus solely on the post content
                  - Return only the post content, nothing else.`,
                },
              ],
            },
          ],
        }),
      }
    );

    const textData = await textResponse.json();

    if (!textResponse.ok) {
      throw new Error(
        `Gemini API Error: ${textData.error?.message || textResponse.statusText
        }`
      );
    }

    const post =
      textData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "No content generated.";

    return { post };
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw new Error("Failed to generate AI content");
  }
}

// Legacy export for backward compatibility
export const generateLinkedInPost = (topic, desc, persona) => generateSocialPost(topic, desc, persona, "linkedin");

export async function generateBatchPosts(topics) {
  const posts = [];

  for (const topic of topics) {
    try {
      const content = await generateLinkedInPost(
        topic.title,
        topic.description,
        topic.userPersona || {}
      );
      posts.push({
        topicId: topic.id,
        content,
        success: true,
      });
    } catch (error) {
      posts.push({
        topicId: topic.id,
        content: null,
        success: false,
        error: error.message,
      });
    }
  }

  return posts;
}

export async function generateTopicSuggestions(keyword) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  try {
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
                  text: `Identify the core subject of the keyword/phrase: "${keyword}". 
                  Then, generate ONE single, engaging, and professional LinkedIn post title based on that suject.
                  
                  Guidelines:
                  - The title should be catchy but professional.
                  - It should sound like a thought leadership piece.
                  - Max 100 characters.
                  - NO intro text, NO explanations.
                  - ONLY return the title string.
                  - Example Input: "Remote Work"
                  - Example Output: "The Future of Remote Work: 5 Trends Shaping Our Office"
                  `,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Gemini API Error");

    const title =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      keyword; // Fallback to original keyword if generation fails

    // Generate a short description as well? For now, we'll just use the title as the primary focus 
    // and let the existing description logic handle the rest or leave it empty.
    // Actually, let's just return the title and a generic description if needed.

    return {
      title: title.replace(/^"|"$/g, ''), // Remove quotes if present
      description: `Generated from keyword: ${keyword}`
    };

  } catch (error) {
    console.error("Gemini Topic Generation Error:", error);
    // Fallback
    return { title: keyword, description: "" };
  }
}
