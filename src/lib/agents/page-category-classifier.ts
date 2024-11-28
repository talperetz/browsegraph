import pRetry from "p-retry";

import { sliceToMaxTokens } from "@/lib/agents/index";
import { PageItem, UserPreferences } from "@/types";

const systemMessage = (userPreferences: UserPreferences) => `
You are an expert content recommender. 
Your task is to classify whether the user would like reading it based on their preferences and the page content preview.
Classification should be a number between 0.0 and 1.0.

User preferences are ${userPreferences ? JSON.stringify(userPreferences.preferredContent) + " non-exclusive list" : "not available"}.
`;

export const classifyShouldReadPage = async (
  userPreferences: UserPreferences,
  page: PageItem,
): Promise<boolean> => {
  const session = await ai.languageModel.create({
    systemPrompt: systemMessage(userPreferences),
    temperature: 0.8,
    topK: 10,
  });

  console.debug("Classifying page", page.url);
  const pageContentString = `url:${page.url}\npreview:${page.headers}`;
  const userPromptPrefix = `Content Preview:`;
  const userPromptPrefixTokens =
    await session.countPromptTokens(userPromptPrefix);

  const countTokens = async (s: string) => session.countPromptTokens(s);

  const maxAllowedTokens = session.maxTokens - userPromptPrefixTokens;

  const trimmedPageContentString = await sliceToMaxTokens(
    pageContentString,
    maxAllowedTokens,
    countTokens,
  );

  const response = await pRetry(
    async () => {
      const res = await session.prompt(
        `${userPromptPrefix}\n\n${trimmedPageContentString}`,
      );

      return res;
    },
    {
      retries: 3,
      onFailedAttempt: (error) => {
        console.error(
          `Attempt ${error.attemptNumber} failed. Retrying...`,
          error.message,
        );
      },
    },
  );

  console.debug("Response", response);

  const match = response.match(/\b0\.\d+|1\.0\b/);

  return match ? parseFloat(match[0]) >= 0.5 : false;
};
