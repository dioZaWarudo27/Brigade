import { OpenRouter } from '@openrouter/sdk';
import dotenv from 'dotenv';

dotenv.config();

const openRouter = new OpenRouter({
  apiKey: process.env.OPEN_ROUTER || '',

});

export async function agentOneExtract(userMessage: string) {
  if (!process.env.OPEN_ROUTER) {
    console.warn("⚠️ [AGENT 1] OPENROUTER is missing. Extraction skipped.");
    return { data: {}, thought: "API Key missing" };
  }

  try {
    const prompt = `
      You are Agent 1, the "Memory Specialist" for an elite fitness app.
      TASK:
      1. Analyze the user's message for physical facts: injuries, weight, goals, diet, or limitations.
      2. Return a structured JSON object under the key "extracted_data".
      3. Explain your logical reasoning for these extractions under the key "reasoning".
      STRICT RULE: Your final output must be ONLY a valid JSON object.
      USER MESSAGE: "${userMessage}"

    `; // (Your prompt stays exactly the same)

    const completion = await openRouter.chat.send({
      chatRequest:{
        model: 'deepseek/deepseek-r1' as any, 
        messages: [{ role: 'user', content: prompt }],
        stream: false,
      }

    });

    const content = completion.choices[0]?.message?.content || "{}";
    const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanJson);

  } catch (err: any) {
    console.error("❌ [AGENT 1 ERROR]:", err.message);
    return { data: {}, error: err.message };
  }
}