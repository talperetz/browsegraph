import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "langchain/document";
import { ChromeAI } from "@langchain/community/experimental/llms/chrome_ai";

import { PageItem } from "@/lib/storage/page-vectors";
import { sliceToMaxTokens } from "@/lib/agents/index";
import { ChromePromptAPI } from "@/types/global";

const systemMessage = `
You are an expert in summarizing web pages for later retrieval.
Your goal is to create the most concise summary.
Below you find a section from the web page content:
--------
{text}
--------

Total output will be one sentence at most from the page.
`;

export const generateSearchText = async (
  chunk: string,
  chunkIndex: number,
  session: ChromePromptAPI,
): Promise<string> => {
  const freshSession = await session.clone();
  const userPromptPrefix = `Here's chunk ${chunkIndex}:\n`;
  const userPromptPrefixTokens =
    await freshSession.countPromptTokens(userPromptPrefix);

  const countTokens = async (s: string) => freshSession.countPromptTokens(s);
  const maxAllowedTokens = freshSession.maxTokens - userPromptPrefixTokens;
  const trimmedHistoryItemsString = await sliceToMaxTokens(
    chunk,
    maxAllowedTokens,
    countTokens,
  );

  const response = await freshSession.prompt(
    `${userPromptPrefix}${trimmedHistoryItemsString}`,
  );

  return response;
};

const summaryLlm = new ChromeAI({
  temperature: 0.5,
});

export const chunkPage = async (page: PageItem): Promise<Document[]> => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 3000,
    chunkOverlap: 500,
  });

  const rawDocs = await splitter.createDocuments([page.content]);
  const session = await ai.languageModel.create({
    systemPrompt: systemMessage,
  });
  let docs = [];
  let index = 0;

  for (const rawDoc of rawDocs) {
    const pageContent = await generateSearchText(
      rawDoc.pageContent,
      index,
      session,
    );
    const doc = new Document({
      pageContent,
      metadata: { url: page.url, chunkIndex: index },
      id: `${page.url}-chunk-${index}`,
    });

    docs.push(doc);
    index += 1;
  }

  return docs;
};
