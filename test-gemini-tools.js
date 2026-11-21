import { GoogleGenAI } from "@google/genai";

async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Find the latest 3 important health, fitness, or nutrition related news, trends, or tips. Return a valid JSON array of objects, each containing 'title', 'snippet', and 'source'. Do not use markdown blocks, just return the JSON string.",
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    console.log(response.text);
  } catch (err) {
    console.log("Error:", err);
  }
}
test();
