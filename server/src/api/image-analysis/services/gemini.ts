import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

export const analyzeImage = async (filePath: string) => {
    try {
        const base64ImageFile = fs.readFileSync(filePath, { encoding: "base64" });

        const contents = [
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: base64ImageFile,
                },
            },
            { text: "Extract the food name and estimated calories from this image in a json object." },
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

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: contents,
            config
        });

        return JSON.parse(response.text);
    } catch (error) {
        console.log(error);
        throw error;
    }
};
