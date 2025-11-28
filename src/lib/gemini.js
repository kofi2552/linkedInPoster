import { GoogleGenAI, Modality } from "@google/genai";
import fs from "fs";

// const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
// const ImageApiKey = process.env.GOOGLE_IMAGE_GENERATION_API_KEY;

// export async function generateLinkedInPost(topic, description = "") {
//   const ai = new GoogleGenAI({ apiKey: ImageApiKey });

//   try {
//     // 1️⃣ Generate post text and image prompt
//     const textResponse = await fetch(
//       "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "X-goog-api-key": apiKey,
//         },
//         body: JSON.stringify({
//           contents: [
//             {
//               parts: [
//                 {
//                   text: `Using the following template, generate an engaging LinkedIn-style post using the title "${topic}".
//                   Maintain the structure and this tone: ${description}.

//                   Follow these Requirements strictly:
//                 - Contrust a unique post title that captures attention not more than 150 characters.
//                 - The post should have a humanized body (with paragraphs if needed)
//                 - Fit within these guidelines
//                 - The post must be relevant to LinkedIn audiences who are expected to be educational tech professionals or educational leaders.
//                 - Remove any greetings or sign-offs
//                 - Remove any extra headings or subtitles
//                 - Focus solely on the post content
//                 - Use a clear and concise writing style
//                 - Maximum 600 characters
//                 - Minimum 500 characters
//                 - Professional and engaging tone
//                 - Include relevant hashtags (2-3)
//                 - No emojis
//                 - Make it actionable or thought-provoking
//                 - Sound as human as possible

//                 Return only the post content, nothing else.`,
//                 },
//               ],
//             },
//           ],
//         }),
//       }
//     );

//     const textData = await textResponse.json();

//     if (!textResponse.ok) {
//       throw new Error(
//         `Gemini API Error: ${
//           textData.error?.message || textResponse.statusText
//         }`
//       );
//     }

//     const post =
//       textData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
//       "No content generated.";

//     //console.log("Generated post content:", post);

//     // 2️⃣ Generate matching image
//     const imagePrompt = `Genrate a professional image related to ${topic}. It should be suitable for a professional LinkedIn post. The style should be clean, modern, and visually appealing to educational tech professionals and leaders. Avoid using any text or logos in the image. Use a color palette that is engaging yet professional. Create real-life concept images with real people or things in line with topic not just generic tech background images.Strict size: "1024x1024"`;

//     const imageResponse = await ai.models.generateContent({
//       model: "gemini-2.0-flash-preview-image-generation",
//       contents: [
//         {
//           role: "user",
//           parts: [{ text: imagePrompt }],
//         },
//       ],
//       config: {
//         responseMimeType: "image/png",
//         size: "1024x1024",
//       },
//     });

//     let imageBase64 = null;

//     const candidates = imageResponse?.candidates || [];
//     for (const candidate of candidates) {
//       const parts = candidate?.content?.parts || [];
//       for (const part of parts) {
//         if (part.inlineData?.data) {
//           imageBase64 = part.inlineData.data;
//           break; // found the image data, stop inner loop
//         }
//       }
//       if (imageBase64) break; // stop outer loop once found
//     }

//     if (!imageBase64) {
//       console.warn("⚠️ No base64 image found in Gemini response");
//     }

//     return { post, imageBase64 };
//   } catch (error) {
//     console.error("Gemini Image Generation Error:", error);
//     throw new Error("Failed to generate AI content or image");
//   }
// }

export async function generateLinkedInPost(topic, description = "") {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const ImageApiKey = process.env.GOOGLE_IMAGE_GENERATION_API_KEY;

  const ai = new GoogleGenAI({ apiKey: ImageApiKey });

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
                  Maintain the structure and this tone: ${description}. 
              
                  Follow these Requirements strictly:
                - Contrust a unique post title that captures attention not more than 150 characters.
                - The post should have a humanized body (with paragraphs if needed)  
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
                - Sound as human as possible

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
        `Gemini API Error: ${
          textData.error?.message || textResponse.statusText
        }`
      );
    }

    const post =
      textData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "No content generated.";

    //console.log("Generated post content:", post);

    // 2️⃣ Generate matching image
    // const imagePrompt = `Genrate a professional background image related to ${topic}. It should be suitable for a professional LinkedIn post. The style should be clean, modern, and visually appealing to educational tech professionals and leaders. Avoid using any text or logos in the image. Use a color palette that is engaging yet professional. Strict size: "1024x1024"`;

    // const imageResponse = await ai.models.generateContent({
    //   model: "gemini-2.0-flash",
    //   contents: imagePrompt,
    //   config: {
    //     responseModalities: [Modality.TEXT, Modality.IMAGE],
    //   },
    // });

    // let imageBase64 = null;

    // const candidates = imageResponse?.candidates || [];
    // for (const candidate of candidates) {
    //   const parts = candidate?.content?.parts || [];
    //   for (const part of parts) {
    //     if (part.inlineData?.data) {
    //       imageBase64 = part.inlineData.data;

    //       // Save a local copy (optional)
    //       const buffer = Buffer.from(imageBase64, "base64");
    //       fs.writeFileSync("linkedin-post-image.png", buffer);
    //       console.log("✅ Image saved as linkedin-post-image.png");

    //       break;
    //     }
    //   }
    //   if (imageBase64) break; // stop early if found
    // }

    // if (!imageBase64) {
    //   console.warn("⚠️ No base64 image found in Gemini response");
    // }

    // return { post, imageBase64 };
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
