import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

const getMimeType = (filePath: string): string => {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
    };
    return mimeTypes[ext] || 'image/jpeg';
};

// Models to try in order (in case one hits rate limits)
const MODELS = ["gemini-2.0-flash-lite", "gemini-2.0-flash", "gemini-2.5-flash"];

export const analyzeImage = async (filePath: string) => {
    const base64ImageFile = fs.readFileSync(filePath, { encoding: "base64" });
    const mimeType = getMimeType(filePath);

    const contents = [
        {
            inlineData: {
                mimeType,
                data: base64ImageFile,
            },
        },
        { text: "Extract the food name and estimated calories from this image. Return a JSON object with foodName (string) and calories (number)." },
    ];

    const config = {
        responseMimeType: "application/json",
        responseSchema: {
            type: "object",
            properties: {
                foodName: { type: "string" },
                calories: { type: "number" }
            }
        }
    };

    let lastError: any = null;

    for (const model of MODELS) {
        try {
            console.log(`Trying model: ${model}`);
            const response = await ai.models.generateContent({
                model,
                contents,
                config
            });

            const parsed = JSON.parse(response.text);
            console.log(`Success with model ${model}:`, parsed);
            return parsed;
        } catch (error: any) {
            console.log(`Model ${model} failed:`, error.message || error);
            lastError = error;

            // If it's a quota/rate limit error, try the next model
            if (error.status === 429 || error.message?.includes('RESOURCE_EXHAUSTED') || error.message?.includes('quota')) {
                continue;
            }

            // For other errors (bad image, etc.), throw immediately
            throw error;
        }
    }

    // All models exhausted
    throw new Error(`All AI models are currently rate-limited. Please try again in a few minutes. (${lastError?.message || 'Unknown error'})`);
};


