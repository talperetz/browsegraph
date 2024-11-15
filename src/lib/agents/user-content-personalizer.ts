import { generateText } from "ai";

import { geminiFlash } from "@/lib/agents/index";

const systemMessage = `
You are an expert in content recommendation.
Your goal is to create the shortest description of the content this user loves to read and save.
`;

const generateUserPrompt = (
  historyItems: chrome.history.HistoryItem[],
): string => {
  const history = JSON.stringify(
    historyItems.map((item) => item.title + " " + item.url),
  );

  return `Here's my history from past 30d:\n${history}`;
};

export const generateUserContentPreferences = async (
  historyItems: chrome.history.HistoryItem[],
): Promise<string> => {
  const reply = await generateText({
    // @ts-ignore
    model: geminiFlash,
    maxRetries: 3,
    system: systemMessage,
    prompt: generateUserPrompt(historyItems),
    temperature: 0.5,
  });

  return reply.text;
};
