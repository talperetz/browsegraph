import {LLMGraphTransformer} from "@langchain/community/experimental/graph_transformers/llm";
import {Document} from "@langchain/core/documents";
import {ChatOpenAI} from "@langchain/openai";

export const generateKnowledgeGraphFromHistory = async (historyItems: chrome.history.HistoryItem[]): Promise<string> => {

    // const model = new ChatGoogleGenerativeAI({
    //     model: "gemini-pro",
    //     apiKey: import.meta.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY,
    // });

    const model2 = new ChatOpenAI({
        temperature: 0,
        model: "gpt-4o",
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    });

    const llmGraphTransformer = new LLMGraphTransformer({
        llm: model2,
    });
    const result = await llmGraphTransformer.convertToGraphDocuments(historyItems.map((item) => new Document({pageContent: JSON.stringify(item)})));
    console.log(`Nodes: ${result[0].nodes.length}`);
    console.log(`Relationships:${result[0].relationships.length}`);
    console.log(`graph docs: ${result.map((doc) => JSON.stringify(doc.nodes) + JSON.stringify(doc.relationships))}`);
    return 'done';


    // const session = await ai.languageModel.create();

    // Prompt the model and wait for the whole result to come back.
    // const result = await session.prompt(systemMessage + "\n\n" + generateUserPrompt(historyItems));  // <- this works
    // console.log(result);
    // return result;
}