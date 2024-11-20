import { createGoogleGenerativeAI } from "@ai-sdk/google";

const google = createGoogleGenerativeAI({
  apiKey: import.meta.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY,
});

export const geminiFlash = google("models/gemini-1.5-flash", {});

export const geminiEmbeddingModel =
  google.textEmbeddingModel("text-embedding-004");

export async function sliceToMaxTokens(
  input: string,
  maxTokensAllowed: number,
  countTokens: (str: string) => Promise<number>,
): Promise<string> {
  const words = input.split(/\s+/); // Split the string into words
  let accumulatedTokens = 0;
  let result: string[] = [];

  for (const word of words) {
    const tokenCount = await countTokens(word); // Await the token count

    if (accumulatedTokens + tokenCount > maxTokensAllowed) {
      break; // Stop adding words if max tokens exceeded
    }
    result.push(word);
    accumulatedTokens += tokenCount;
  }

  return result.join(" "); // Join the result words back into a string
}

// Example async token counting function
const asyncTokenCounter = async (str: string): Promise<number> => {
  // Simulate async behavior, e.g., calling an external tokenizer API
  return new Promise((resolve) =>
    setTimeout(() => resolve(str.split(/\s+/).length), 10),
  );
};
