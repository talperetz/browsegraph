import { EmbeddingIndex, getEmbedding } from "@/lib/storage/vector-store";

export let index = new EmbeddingIndex();

export interface PageItem {
  url: string;
  title: string;
  headers: string[];
  content: string;
}

export const indexPage = async (page: PageItem) => {
  // Check if the page is already indexed
  const isExisting = index.get({ url: page.url, title: page.title });

  if (isExisting) {
    return;
  }
  // Index the page summary
  index.add({
    ...page,
    embedding: await getEmbedding(page.title),
    text: page.title,
  });
  page.headers.map(async (header: string) => {
    index.add({ ...page, embedding: await getEmbedding(header), text: header });
  });
  index
    .saveIndex("indexedDB")
    .catch((error) => console.error("Error saving index:", error));
  console.log("Indexed page:", page);
};

export const searchPages = async (query: string, k: number = 5) => {
  const queryEmbedding = await getEmbedding(query);

  return await index.search(queryEmbedding, {
    topK: k,
    useStorage: "indexedDB",
  });
};
