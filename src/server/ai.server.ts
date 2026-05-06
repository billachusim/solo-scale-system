import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// AI Gateway helper for server functions
async function callAI(prompt: string, systemPrompt?: string): Promise<string> {
  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

  const messages: { role: string; content: string }[] = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  messages.push({ role: "user", content: prompt });

  const res = await fetch("https://ai-gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`AI Gateway error [${res.status}]: ${errText}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callAIJson<T>(prompt: string, systemPrompt?: string): Promise<T> {
  const raw = await callAI(prompt, systemPrompt);
  // Extract JSON from markdown code blocks if present
  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : raw.trim();
  return JSON.parse(jsonStr);
}

export { callAI, callAIJson };
