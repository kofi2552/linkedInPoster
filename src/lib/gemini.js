
export async function generateLinkedInPost(topic, description = "", userPersona = {}) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;


  try {
    // 1️⃣ Generate post text and image prompt
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
                  text: `Using the following template, generate an engaging LinkedIn-style post using the title "${topic}". 
                  Maintain the structure and this tone: ${description || userPersona.tone || "professional"}. 
              
                  Author Context (The Persona):
                  - Profession: ${userPersona.profession || "Industry Professional"}
                  - Industry: ${userPersona.industry || "General Business"}
                  - Bio/Background: ${userPersona.bio || "Experienced professional sharing insights."}
                  - Voice/Tone: ${userPersona.tone || "Professional, engaging, and authentic"}

                  Follow these Requirements strictly:
                - Construct a unique post title that captures attention not more than 150 characters.
                - The viral post should have a body (with paragraphs -   at least 2)
                - The post must be relevant to LinkedIn audiences in the ${userPersona.industry || "General Business"} industry.
                - Write FROM the perspective of a ${userPersona.profession || "professional"}, incorporating their expertise.
                - Remove any greetings or sign-offs
                - Remove any extra headings or subtitles
                - Focus solely on the post content
                - Use a clear and concise writing style
                - Maximum 600 characters
                - Minimum 500 characters
                - Professional and engaging tone
                - Include relevant hashtags (2-3)
                - No emojis , only output the clean words, no noise characters or decorative symbols.

                Return only the post content, nothing else.`,
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
    console.error("Gemini Image Generation Error:", error);
    throw new Error("Failed to generate AI content or image");
  }
}

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
