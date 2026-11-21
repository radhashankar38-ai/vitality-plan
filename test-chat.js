import { GoogleGenAI } from "@google/genai";

async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const chatSession = ai.chats.create({
      model: "gemini-3.1-pro-preview",
      config: {
        systemInstruction: "You are a health coach.",
        thinkingConfig: { thinkingLevel: "HIGH" }
      },
      history: []
    });
    const response = await chatSession.sendMessage({ message: "hello" });
    console.log(response.text);
  } catch (err) {
    console.log("Error:", err.status, err.message);
  }
}
test();
