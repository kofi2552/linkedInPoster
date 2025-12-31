
export async function generateImage(prompt) {
    const imageApiKey = process.env.CF_IMAGE_GENERATION_API_KEY;

    if (!imageApiKey) {
        throw new Error("Missing CF_IMAGE_GENERATION_API_KEY");
    }

    try {
        const res = await fetch("https://image-api.dev-kyde.workers.dev/", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${imageApiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ prompt }),
        });

        if (!res.ok) {
            const errorText = await res.text();
            console.error("Cloudflare Image API Error:", errorText);
            throw new Error(`Cloudflare API Error: ${res.statusText}`);
        }

        // The API returns a blob (image data). We need to convert it to base64.
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString("base64");

        console.log("Generated Image:", base64Image);

        return base64Image;
    } catch (error) {
        console.error("Image Generation Failed:", error);
        throw error;
    }
}
