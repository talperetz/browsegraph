import { sliceToMaxTokens } from "@/lib/agents/index";

const systemMessage = `
You are an expert in content recommendation. 
Your task is to write a concise map of high-level topics the user is into based on their recently visited website titles.
Topics should have a score (0.0-1.0) for how much their weighted in the user history.
Response should be sorted by the score DESC.

Example response:
{"Machine Learning": 0.3, "Data Science": 0.2, "Python":0.2, "Men Fashion": 0.1, "Travel":0.1}
`;

export const generateUserContentPreferences = async (
  historyItems: chrome.history.HistoryItem[],
): Promise<string> => {
  const session = await ai.languageModel.create({
    systemPrompt: systemMessage,
  });
  const historyItemsString = JSON.stringify(
    historyItems.map((item) => item.title),
  );
  const userPromptPrefix = `Here's my history from past 30d:\n`;
  const userPromptPrefixTokens =
    await session.countPromptTokens(userPromptPrefix);

  const countTokens = async (s: string) => session.countPromptTokens(s);

  const maxAllowedTokens = session.maxTokens - userPromptPrefixTokens;

  const trimmedHistoryItemsString = await sliceToMaxTokens(
    historyItemsString,
    maxAllowedTokens,
    countTokens,
  );

  const response = await session.prompt(
    `${userPromptPrefix}${trimmedHistoryItemsString}`,
  );

  return response;
};
