import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "langchain/document";
import { PromptTemplate } from "@langchain/core/prompts";
import { loadSummarizationChain } from "langchain/chains";
import { ChromeAI } from "@langchain/community/experimental/llms/chrome_ai";

import { PageItem } from "@/types";
import { GraphType } from "@/lib/schema/graph";

const summaryTemplate = `
You are an expert in summarizing web pages for later retrieval.
Your goal is to create the most concise summary.
Below you find a section from the web page content:
--------
{text}
--------

Total output will be one sentence at most from the page.

Key Points:
`;

const SUMMARY_PROMPT = PromptTemplate.fromTemplate(summaryTemplate);

const summaryRefineTemplate = `
You are an expert in summarizing web pages for later retrieval.
Your goal is to create the most concise summary.
We have provided an existing summary up to a certain point: {existing_answer}

Below you find a section of the web page:
--------
{text}
--------

Given the new context, you can add up to one sentence at most.
If the context isn't useful, return the original summary.
Total output will be the updated summary.

KEY POINTS:
`;

const SUMMARY_REFINE_PROMPT = PromptTemplate.fromTemplate(
  summaryRefineTemplate,
);

// const systemMessage = `You are a world-class content analyst specializing in web page content summarization.
//
// ### Task:
// Analyze the given web page content and provide a comprehensive summary.
//
// ### Instructions:
// 1. Provide a TL;DR summary of the web page content.
// 2. Include the main points and key takeaways.
// 3. Keep the summary concise and informative.
// 4. Use your expertise to provide a high-quality questions that can be answered by the page.
// `
const pageToDocs = async (page: PageItem): Promise<Document[]> => {
  // const docs = [
  //     new Document({
  //         pageContent: page.details.content,
  //         metadata: {url: page.details.url, title: page.details.title}
  //     }),
  // ];
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 3000,
    chunkOverlap: 500,
  });
  // const transformer = new HtmlToTextTransformer();

  // @ts-ignore
  // const sequence = splitter.pipe(transformer);

  return await splitter.createDocuments([page.details.content]);
};

const summaryLlm = new ChromeAI({
  temperature: 0.5,
});

export const summarizePage = async (
  page: PageItem,
  knowledgeGraph: GraphType,
): Promise<string> => {
  const pageChunks = await pageToDocs(page);

  const summarizeChain = loadSummarizationChain(summaryLlm, {
    type: "refine",
    verbose: true,
    questionPrompt: SUMMARY_PROMPT,
    refinePrompt: SUMMARY_REFINE_PROMPT,
  });

  const result = await summarizeChain.invoke(pageChunks);

  return result[0].summary;
};
