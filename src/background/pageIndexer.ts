import { embedMany } from "ai";

import { PageItem, TabContentMessage, UserPreferences } from "@/types";
import { insertEmbeddings } from "@/lib/storage/vector";
import { getLatestUserPreferencesFromDB } from "@/lib/storage/user";
import { geminiEmbeddingModel } from "@/lib/agents";
import { chunkPage } from "@/lib/agents/page-chunker";
import { getKnowledgeGraphFromDB, saveKnowledgeGraphToDB } from "@/lib/storage";
import { classifyShouldReadPage } from "@/lib/agents/page-category-classifier";
import { generatePageKnowledgeGraph } from "@/lib/agents/page-graph-transformer";

let tabChangeTimeout: ReturnType<typeof setTimeout> | null = null;
let currentTabId: number | null = null;
let currentUrl: string | null = null;

let cachedUserPreferences: UserPreferences | null = null;
let lastUserPreferencesLoadTime: number | null = null;

const loadUserPreferencesIfNeeded =
  async (): Promise<UserPreferences | null> => {
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    if (
      !cachedUserPreferences ||
      !lastUserPreferencesLoadTime ||
      lastUserPreferencesLoadTime < oneWeekAgo
    ) {
      try {
        cachedUserPreferences = await getLatestUserPreferencesFromDB();
        lastUserPreferencesLoadTime = now;
        console.debug("User preferences reloaded:", cachedUserPreferences);
      } catch (error) {
        console.error("Failed to load user preferences:", error);
        cachedUserPreferences = null;
      }
    }

    return cachedUserPreferences;
  };

const tabChangedListener = (
  tabId: number,
  changeInfo: chrome.tabs.TabChangeInfo,
  tab: chrome.tabs.Tab,
): void => {
  if (!tab || !tab.url || !/^http/.test(tab.url!)) {
    return;
  }

  if (changeInfo.status === "complete") {
    console.log("Tab changed:", tab.url);

    currentTabId = tabId;
    currentUrl = tab.url;

    chrome.tabs
      .sendMessage(currentTabId, { type: "TAB_CHANGE" })
      .catch(console.error);
  }
};

export const startPageIndexer = (): void => {
  chrome.tabs.onUpdated.addListener(tabChangedListener);
};

export const stopPageIndexer = (): void => {
  chrome.tabs.onUpdated.removeListener(tabChangedListener);
};

chrome.runtime.onMessage.addListener(async (message: TabContentMessage) => {
  console.log("Received tab content:", message);
  if (!message || message.type !== "TAB_CONTENT" || !message.details.content) {
    return;
  }
  if (
    !message.details.url ||
    !message.details.title ||
    !message.details.content
  ) {
    return;
  }
  const page: PageItem = {
    url: message.details.url,
    title: message.details.title,
    headers: message.details.headers,
    content: message.details.content,
  };

  const existingPageKnowledgeGraph = await getKnowledgeGraphFromDB(
    page.url,
  ).catch();

  if (existingPageKnowledgeGraph) {
    console.log(
      "Page already exists in the database:",
      existingPageKnowledgeGraph,
    );

    return;
  }

  const userPreferences = await loadUserPreferencesIfNeeded();

  const shouldUserReadPage = await classifyShouldReadPage(
    userPreferences,
    page,
  );

  console.debug("Should user read page:", shouldUserReadPage);

  if (!shouldUserReadPage) {
    return;
  }

  console.debug("Generating knowledge graph...", page);
  const graph = await generatePageKnowledgeGraph(page).catch(console.error);

  if (!graph) {
    return;
  }

  await saveKnowledgeGraphToDB(page.url, graph).catch(console.error);

  console.debug("Stored page knowledge graph in db");

  const docs = await chunkPage(page);
  const texts = docs.map((doc) => doc.pageContent);
  const embeddings = await embedMany({
    model: geminiEmbeddingModel,
    values: texts,
  });

  console.debug("Finished generating embeddings", embeddings);

  const embeddingData = docs.map((doc, index) => ({
    url: doc.metadata.url,
    content: doc.pageContent,
    embedding: embeddings.embeddings[index],
  }));

  await insertEmbeddings(embeddingData).catch(console.error);

  console.debug("Inserted embeddings into the database");
});
