import { createServerFn } from "@tanstack/react-start";
import { diagnoseLead, checkMessage } from "./agents.server";

export const runDiagnoser = createServerFn({ method: "POST" })
  .inputValidator((data: { leadId: string; businessName: string; city: string; niche: string; rating: number | null; reviewCount: number | null; websiteUrl: string | null; websiteAge: string | null }) => data)
  .handler(async ({ data }) => {
    return diagnoseLead({ data });
  });

export const runChecker = createServerFn({ method: "POST" })
  .inputValidator((data: { message: string; businessName: string; niche: string }) => data)
  .handler(async ({ data }) => {
    return checkMessage({ data });
  });
