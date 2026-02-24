
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateBlessing = async (name: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Write a short, heartfelt, and poetic wedding blessing or wish for Esther and Emmanuel's wedding (Hashtag #Ease26) from a guest named ${name}. Keep it under 40 words.`,
      config: {
        temperature: 0.8,
        topP: 0.95,
      },
    });
    return response.text?.trim() || "Wishing Esther and Emmanuel a lifetime of love and joy!";
  } catch (error) {
    console.error("Error generating blessing:", error);
    return "May your love story be as beautiful and enduring as this day.";
  }
};
