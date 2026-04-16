import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = 'gemini-2.5-flash'; // High-speed, lower cost model for chat/post features

/**
 * Senior Dev Tip: 
 * We keep this helper separate from server.ts to maintain the 'Single Responsibility Principle'.
 * It makes unit testing and swapping models (e.g., to GPT-4) much easier later.
 */

export interface GeminiResponse {
    text: string;
    error?: string;
}

/**
 * Core function to communicate with Gemini
 * @param prompt - The instruction you're sending to the AI
 * @returns {Promise<GeminiResponse>}
 */
export async function askGemini(prompt: string): Promise<GeminiResponse> {
    if (!API_KEY) {
        console.error("[GEMINI ERROR] API Key is missing in .env");
        return { text: "", error: "Missing API Key" };
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`;

    const requestBody = {
        contents: [
            {
                parts: [
                    {
                        text: prompt
                    }
                ]
            }
        ],
        generationConfig: {
            temperature: 0.7, // 0 is rigid/factual, 1 is creative/chaotic. 0.7 is the 'sweet spot' for conversational apps.
            maxOutputTokens: 4096,
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        const data: any = await response.json();

        if (!response.ok) {
            console.error("[GEMINI API ERROR]", data);
            return { text: "", error: data.error?.message || "Unknown API Error" };
        }

        // Parsing the deeply nested response from Google
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiText) {
            return { text: "", error: "AI returned an empty response" };
        }

        return { text: aiText };

    } catch (err: any) {
        console.error("[GEMINI FETCH ERROR]", err.message);
        return { text: "", error: "Network or Server failure" };
    }
}
