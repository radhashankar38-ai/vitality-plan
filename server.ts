import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.post("/api/generate-plan", async (req, res) => {
    try {
      const { 
        height, weight, unit, preference, 
        dietPreference, allergies, likedFoods, dislikedFoods, cuisines,
        modelType 
      } = req.body;

      if (!height || !weight || !unit) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      let bmi = 0;
      if (unit === "metric") {
        const heightM = height / 100;
        bmi = weight / (heightM * heightM);
      } else {
        // imperial: weight in lbs, height in inches
        bmi = (weight / (height * height)) * 703;
      }

      bmi = parseFloat(bmi.toFixed(1));

      const prompt = `
        A user has a BMI of ${bmi} (Height: ${height} ${unit === 'metric' ? 'cm' : 'inches'}, Weight: ${weight} ${unit === 'metric' ? 'kg' : 'lbs'}).
        They prefer a ${preference} workout plan.
        Their dietary preference is ${dietPreference || 'no specific restrictions'}.
        Allergies/Restrictions: ${allergies && allergies.length > 0 ? allergies.join(', ') : 'None'}
        Liked Foods: ${likedFoods && likedFoods.length > 0 ? likedFoods.join(', ') : 'No specific preference'}
        Disliked Foods: ${dislikedFoods && dislikedFoods.length > 0 ? dislikedFoods.join(', ') : 'None'}
        Preferred Cuisines: ${cuisines && cuisines.length > 0 ? cuisines.join(', ') : 'Any'}
        
        Generate a personalized:
        1. Diet plan (suggested meals for a day) accommodating their likes, dislikes, and allergies. Provide alternatives if necessary.
        2. Exercise plan (specific routine).
        
        Make sure the advice is tailored to their BMI category (underweight, normal, overweight, obese).
      `;

      let modelId = "gemini-3.5-flash";
      let config: any = {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bmiCategory: {
              type: Type.STRING,
              description: "The category for this BMI (e.g., Normal, Overweight)",
            },
            dietPlan: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                breakfast: { type: Type.STRING },
                lunch: { type: Type.STRING },
                dinner: { type: Type.STRING },
                snacks: { type: Type.STRING },
              },
              required: ["summary", "breakfast", "lunch", "dinner", "snacks"]
            },
            exercisePlan: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                routine: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      day: { type: Type.STRING },
                      exercises: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["day", "exercises"]
                  }
                }
              },
              required: ["summary", "routine"]
            }
          },
          required: ["bmiCategory", "dietPlan", "exercisePlan"]
        }
      };

      if (modelType === "fast") {
        modelId = "gemini-3.1-flash-lite";
      } else if (modelType === "complex") {
        modelId = "gemini-3.1-pro-preview";
        config.thinkingConfig = { thinkingLevel: "HIGH" };
      }

      let planStr = "";
      let retries = 3;
      while (retries > 0) {
        try {
          const response = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
            config,
          });
          planStr = response.text || "";
          if (planStr) break;
        } catch (err: any) {
          const status = err.status || (err.response && err.response.status);
          const isPermissionDenied = status === 403 || err.message?.includes('PERMISSION_DENIED') || err.message?.includes('denied access');
          if (isPermissionDenied) {
            console.log(`Model ${modelId} denied access (403). Falling back to gemini-3.5-flash.`);
            modelId = "gemini-3.5-flash";
            if (config.thinkingConfig) {
              delete config.thinkingConfig;
            }
            // Do not decrement retries, just retry with the new model immediately
            continue;
          }

          const isRateLimitOrUnavailable = status === 503 || status === 429 || err.message?.includes('503') || err.message?.includes('429') || err.message?.includes('Quota exceeded');
          if (isRateLimitOrUnavailable) {
            retries--;
            if (retries === 0) {
              console.log("Falling back to gemini-3.1-flash-lite due to rate limits");
              modelId = "gemini-3.1-flash-lite";
              if (config.thinkingConfig) {
                delete config.thinkingConfig;
              }
              
              let fallbackRetries = 3;
              while (fallbackRetries > 0) {
                try {
                  const fallbackResponse = await ai.models.generateContent({
                    model: modelId,
                    contents: prompt,
                    config,
                  });
                  planStr = fallbackResponse.text || "";
                  break;
                } catch (fallbackErr: any) {
                  fallbackRetries--;
                  if (fallbackRetries === 0) throw fallbackErr;
                  await new Promise(res => setTimeout(res, 5000));
                }
              }
              break;
            }
            await new Promise(res => setTimeout(res, 5000));
          } else {
            throw err;
          }
        }
      }

      if (!planStr) {
         return res.status(500).json({ error: "Failed to generate plan" });
      }

      let planStrRaw = planStr.trim();
      if (planStrRaw.startsWith('```json')) {
        planStrRaw = planStrRaw.substring(7);
        if (planStrRaw.endsWith('```')) {
          planStrRaw = planStrRaw.substring(0, planStrRaw.length - 3);
        }
      } else if (planStrRaw.startsWith('```')) {
        planStrRaw = planStrRaw.substring(3);
        if (planStrRaw.endsWith('```')) {
          planStrRaw = planStrRaw.substring(0, planStrRaw.length - 3);
        }
      }
      
      const plan = JSON.parse(planStrRaw.trim());
      res.json({ bmi, plan });
    } catch (error: any) {
      console.error("Error generating plan:", error);
      const status = error.status || (error.response && error.response.status) || 500;
      if (status === 429 || error.message?.includes('429') || error.message?.includes('Quota exceeded')) {
        return res.status(429).json({ error: "System at maximum capacity. Please wait a few seconds and try again." });
      }
      res.status(500).json({ error: "An error occurred while generating the plan." });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { history, message, modelType } = req.body;
      let modelId = "gemini-3.5-flash";
      let config: any = {
        systemInstruction: "You are a world-class personal trainer, nutritionist, and health coach. You provide concise, highly personalized, and scientific advice. Use a friendly, encouraging tone. When providing advice, be specific and practical.",
      };

      if (modelType === "fast") {
        modelId = "gemini-3.1-flash-lite";
      } else if (modelType === "complex") {
        modelId = "gemini-3.1-pro-preview";
        config.thinkingConfig = { thinkingLevel: "HIGH" };
      }

      const chatSession = ai.chats.create({
        model: modelId,
        config,
        history: history.map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }))
      });

      let response;
      let retries = 3;
      while (retries > 0) {
        try {
          response = await chatSession.sendMessage({ message });
          break; // success
        } catch (err: any) {
          const status = err.status || (err.response && err.response.status);
          const isPermissionDenied = status === 403 || err.message?.includes('PERMISSION_DENIED') || err.message?.includes('denied access');
          if (isPermissionDenied) {
            console.log(`Chat model ${modelId} denied access (403). Falling back to gemini-3.5-flash.`);
            modelId = "gemini-3.5-flash";
            const fallbackConfig = { ...config };
            if (fallbackConfig.thinkingConfig) {
              delete fallbackConfig.thinkingConfig;
            }
            const fallbackChatSession = ai.chats.create({
              model: modelId,
              config: fallbackConfig,
              history: history.map((msg: any) => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
              }))
            });
            response = await fallbackChatSession.sendMessage({ message });
            break;
          }

          const isRateLimitOrUnavailable = status === 503 || status === 429 || err.message?.includes('503') || err.message?.includes('429') || err.message?.includes('Quota exceeded');
          if (isRateLimitOrUnavailable) {
            retries--;
            if (retries === 0) {
              if (modelId === "gemini-3.1-pro-preview") {
                console.log("Falling back to gemini-3.1-flash-lite for chat due to rate limits");
                const fallbackConfig = { ...config };
                delete fallbackConfig.thinkingConfig;
                
                const fallbackChatSession = ai.chats.create({
                  model: "gemini-3.1-flash-lite",
                  config: fallbackConfig,
                  history: history.map((msg: any) => ({
                    role: msg.role === 'user' ? 'user' : 'model',
                    parts: [{ text: msg.text }]
                  }))
                });
                
                // Try fallback once with its own retries
                let fallbackRetries = 3;
                while (fallbackRetries > 0) {
                  try {
                    response = await fallbackChatSession.sendMessage({ message });
                    break;
                  } catch (fallbackErr: any) {
                    fallbackRetries--;
                    if (fallbackRetries === 0) throw fallbackErr;
                    await new Promise(res => setTimeout(res, 5000));
                  }
                }
                break; // Exit main retry loop after fallback attempt
              } else {
                throw err;
              }
            }
            await new Promise(res => setTimeout(res, 5000));
          } else {
            throw err;
          }
        }
      }
      res.json({ text: response?.text || "" });
    } catch (error: any) {
      console.error("Error in chat:", error);
      const status = error.status || (error.response && error.response.status) || 500;
      if (status === 429 || error.message?.includes('429') || error.message?.includes('Quota exceeded')) {
        return res.status(429).json({ error: "System at maximum capacity. Please wait a few seconds and try again." });
      }
      res.status(500).json({ error: "Failed to get chat response" });
    }
  });

  app.get("/api/health-insights", async (req, res) => {
    try {
      let responseText = "[]";
      let retries = 3;
      while (retries > 0) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: "Find the latest 3 important health, fitness, or nutrition related news, trends, or tips. Return a valid JSON array of objects, each containing 'title', 'snippet', and 'source'. Do not use markdown blocks, just return the JSON string.",
            config: {
              tools: [{ googleSearch: {} }]
            }
          });
          responseText = response.text || "[]";
          break;
        } catch (err: any) {
          const status = err.status || (err.response && err.response.status);
          const isPermissionDenied = status === 403 || err.message?.includes('PERMISSION_DENIED') || err.message?.includes('denied access');
          if (isPermissionDenied) {
            console.log("googleSearch tool denied access (403). Retrying without googleSearch tool.");
            try {
              const fallbackResponse = await ai.models.generateContent({
                model: "gemini-3.5-flash",
                contents: "Find the latest 3 important health, fitness, or nutrition related news, trends, or tips. Return a valid JSON array of objects, each containing 'title', 'snippet', and 'source' (provide simulated or high-quality educational sources). Do not use markdown blocks, just return the JSON string.",
              });
              responseText = fallbackResponse.text || "[]";
              break;
            } catch (fallbackErr) {
              throw fallbackErr;
            }
          }

          retries--;
          if (retries === 0 || (status !== 503 && status !== 429 && !err.message?.includes('503') && !err.message?.includes('429') && !err.message?.includes('Quota exceeded'))) {
            throw err;
          }
          await new Promise(res => setTimeout(res, 5000));
        }
      }

      if (responseText.startsWith('```json')) {
        responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      } else if (responseText.startsWith('```')) {
        responseText = responseText.replace(/```/g, '').trim();
      }
      
      const insights = JSON.parse(responseText);
      res.json({ insights });
    } catch (error: any) {
      console.error("Error fetching health insights:", error);
      const status = error.status || (error.response && error.response.status) || 500;
      if (status === 429 || error.message?.includes('429') || error.message?.includes('Quota exceeded')) {
        return res.status(429).json({ error: "System at maximum capacity. Please wait a few seconds and try again." });
      }
      res.status(500).json({ error: "Failed to fetch health insights" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
