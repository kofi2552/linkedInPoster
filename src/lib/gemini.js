export async function generateLinkedInPost(topic, description = "") {
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
                  text: `Using the following template, generate an engaging LinkedIn-style post titled "${topic}". 
                  Maintain the structure and this tone: ${description}. 
              
                  Follow these Requirements strictly:
                - The post should have a title and body (with paragraphs if needed)  
                - Fit within these guidelines
                - The post must be relevant to LinkedIn audiences who are expected to be educational tech professionals or educational leaders.
                - Remove any greetings or sign-offs
                - Remove any extra headings or subtitles
                - Focus solely on the post content
                - Use a clear and concise writing style
                - Maximum 600 characters
                - Minimum 500 characters
                - Professional and engaging tone
                - Include relevant hashtags (2-3)
                - No emojis
                - Make it actionable or thought-provoking

                Return only the post content, nothing else.`,
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
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "No content generated.";

    return content;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw new Error("Failed to generate AI content");
  }
}

export async function generateBatchPosts(topics) {
  const posts = [];

  for (const topic of topics) {
    try {
      const content = await generateLinkedInPost(
        topic.title,
        topic.description
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
