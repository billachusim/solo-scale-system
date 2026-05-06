import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { callAIJson } from "./ai.server";

// Diagnoser: generates diagnosis, hero angle, tone, cold message for a lead
export const diagnoseLead = createServerFn({ method: "POST" })
  .inputValidator((data: { leadId: string; businessName: string; city: string; niche: string; rating: number | null; reviewCount: number | null; websiteUrl: string | null; websiteAge: string | null }) => data)
  .handler(async ({ data }) => {
    const prompt = `Analyze this local business and generate a sales brief for a cold outreach campaign selling them a new website.

Business: ${data.businessName}
City: ${data.city}
Niche: ${data.niche}
Rating: ${data.rating || "unknown"}
Reviews: ${data.reviewCount || 0}
Current website: ${data.websiteUrl || "none"}
Website age: ${data.websiteAge || "unknown"}

Return a JSON object with these exact fields:
{
  "diagnosis_text": "A 50-word diagnosis of why this business needs a new website",
  "hero_angle": "The main angle/hook for their new landing page (1 sentence)",
  "tone": "The tone to use for outreach (e.g. professional, friendly, direct, warm)",
  "cold_message": "A personalized cold message under 70 words. No AI buzzwords, no 'leverage', no 'cutting-edge'. Sound human.",
  "channel": "Best outreach channel: email for service businesses, sms for tradesmen, ig_dm for salons, linkedin for realtors",
  "score": "Priority score 0-100 based on how likely this lead is to convert"
}`;

    const result = await callAIJson<{
      diagnosis_text: string;
      hero_angle: string;
      tone: string;
      cold_message: string;
      channel: string;
      score: number;
    }>(prompt, "You are a sales strategist for a web design agency targeting local businesses without modern websites. Output only valid JSON.");

    // Validate channel
    const validChannels = ["email", "sms", "ig_dm", "linkedin"];
    const channel = validChannels.includes(result.channel) ? result.channel : "email";

    return {
      diagnosis_text: result.diagnosis_text,
      hero_angle: result.hero_angle,
      tone: result.tone,
      cold_message: result.cold_message,
      channel: channel as "email" | "sms" | "ig_dm" | "linkedin",
      score: Math.min(100, Math.max(0, Number(result.score) || 50)),
    };
  });

// Checker: evaluates a cold message for quality
export const checkMessage = createServerFn({ method: "POST" })
  .inputValidator((data: { message: string; businessName: string; niche: string }) => data)
  .handler(async ({ data }) => {
    const prompt = `Evaluate this cold message for a ${data.niche} business called "${data.businessName}".

Message: "${data.message}"

Check for:
1. Personalization (does it mention the specific business?)
2. AI markers (words like "leverage", "cutting-edge", "revolutionize", "transform", "utilize", "synergy")
3. Buzzwords (too salesy or generic language)
4. Appropriate tone for the industry
5. Length (should be under 70 words)

Return JSON:
{
  "pass": true/false,
  "personalization_score": 0-100,
  "ai_marker_count": number,
  "buzzword_count": number,
  "tone_appropriate": true/false,
  "word_count": number,
  "notes": "Brief explanation of issues found, if any"
}`;

    return callAIJson<{
      pass: boolean;
      personalization_score: number;
      ai_marker_count: number;
      buzzword_count: number;
      tone_appropriate: boolean;
      word_count: number;
      notes: string;
    }>(prompt, "You are a message quality evaluator. Be strict. Output only valid JSON.");
  });
