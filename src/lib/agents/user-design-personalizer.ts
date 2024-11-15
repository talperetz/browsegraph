import { generateObject } from "ai";
import { z } from "zod";

import { geminiFlash } from "@/lib/agents/index";

const systemMessage = `
You are an expert in UI/UX design recommendation.
Your goal is to choose the best theme for the user based on their preferences and browsing history.

### Instructions
Think step by step:
1. Analyze the user's browsing history to understand what website design the user prefers.
2. Choose the best theme for the user based on their browsing history.
`;

const generateUserPrompt = (
  historyItems: chrome.history.HistoryItem[],
): string => {
  const history = JSON.stringify(
    historyItems.map((item) => item.title + " " + item.url),
  );

  return `Here's my history from past 30d:\n${history}`;
};

export const generateUserDesignPreferences = async (
  historyItems: chrome.history.HistoryItem[],
): Promise<string> => {
  const { object: userPreferences } = await generateObject({
    // @ts-ignore
    model: geminiFlash,
    maxRetries: 3,
    system: systemMessage,
    prompt: generateUserPrompt(historyItems),
    schema: z.object({
      designPreference: z
        .string()
        .describe(
          "Brief description of the user's design preference based on history",
        ),
      recommendedTheme: z.enum(["light", "dark", "system"]),
    }),
    temperature: 1.0,
  });

  console.log("user design preferences", userPreferences);

  return userPreferences.recommendedTheme;
};
