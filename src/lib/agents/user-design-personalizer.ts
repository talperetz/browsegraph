import { generateObject } from "ai";
import { z } from "zod";

import { geminiFlash } from "@/lib/agents/index";
import { PreferredDesign } from "@/types";

const systemMessage = `
You are an expert in UI/UX design recommendation.
Your goal is to choose the best theme for the user based on their browsing preferences.

### Instructions
Think step by step:
1. Analyze the user persona. e.g developer, 
2. Choose the best theme for the user based on their browsing history.
`;

export const generateUserDesignPreferences = async (
  contentPreferences: string,
): Promise<PreferredDesign> => {
  const themeOptions = Object.keys(PreferredDesign).filter(
    (key) => typeof key[0] === "string",
  );

  const { object: userPreferences } = await generateObject({
    // @ts-ignore
    model: geminiFlash,
    maxRetries: 3,
    system: systemMessage,
    prompt: `My interests are: ${contentPreferences}`,
    schema: z.object({
      userPersona: z
        .string()
        .describe("Brief description of the user persona (up to 20 chars)"),
      recommendedTheme: z.enum(themeOptions as [string, ...string[]]),
    }),
    temperature: 1.0,
  });

  console.log("user design preferences", userPreferences);

  let themeEnumValue =
    PreferredDesign[
      userPreferences.recommendedTheme as keyof typeof PreferredDesign
    ];

  if (!themeEnumValue) {
    themeEnumValue = PreferredDesign.Light;
  }

  return themeEnumValue;
};
