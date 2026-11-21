import { GoogleGenAI } from "@google/genai";

async function test() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    let config = {
      systemInstruction: "You are a health coach.",
      thinkingConfig: { thinkingLevel: "HIGH" }
    };
    const fallbackConfig = { ...config };
    delete fallbackConfig.thinkingConfig;
    
    const chatSession = ai.chats.create({
      model: "gemini-3.5-flash",
      config: fallbackConfig,
      history: []
    });
    const response = await chatSession.sendMessage({ message: "hello" });
    console.log("Success:", response.text);
  } catch (err) {
    console.log("Error:", err.status, err.message);
  }
}
test();
