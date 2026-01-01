import { generateTopicSuggestions } from "@/lib/gemini";

export async function POST(request) {
    try {
        const { keyword } = await request.json();

        if (!keyword) {
            return Response.json(
                { error: "Keyword is required" },
                { status: 400 }
            );
        }

        const result = await generateTopicSuggestions(keyword);

        return Response.json(result);
    } catch (error) {
        console.error("Error generating topic:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}
