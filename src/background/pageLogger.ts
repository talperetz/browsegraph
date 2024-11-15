import { TabContentMessage } from "@/types";
import { PageItem } from "@/lib/storage/page-vectors";
import { generatePageKnowledgeGraph } from "@/lib/agents/page-graph-transformer";
import { saveKnowledgeGraphToDB } from "@/lib/storage";

let tabChangeTimeout: ReturnType<typeof setTimeout> | null = null;
let currentTabId: number | null = null;
let currentUrl: string | null = null;

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
    if (tabChangeTimeout && currentUrl !== tab.url) {
      clearTimeout(tabChangeTimeout);

      return;
    }

    currentTabId = tabId;
    currentUrl = tab.url;

    tabChangeTimeout = setTimeout(() => {
      if (currentTabId !== null) {
        console.log("Requesting content for tab:", currentTabId);
        chrome.tabs
          .sendMessage(currentTabId, { type: "TAB_CHANGE" })
          .catch(console.error);
      }
    }, 10); // 10 miliseconds
  }
};

const startTabChangeListener = (): void => {
  chrome.tabs.onUpdated.addListener(tabChangedListener);
};

const stopTabChangeListener = (): void => {
  chrome.tabs.onUpdated.removeListener(tabChangedListener);
};

export const startInteractionLogger = (): void => {
  startTabChangeListener();
};

export const stopInteractionLogger = (): void => {
  stopTabChangeListener();
};

// const getEmbedding = async (text: string): Promise<number[]> => {
//     const embeddingResult = await embed({
//         model: chromeai('embedding'),
//         value: text,
//     });
//     return embeddingResult.embedding;
// }
//
// export const indexPage = async (page: PageItem) => {
//     index.add({...page, embedding: await getEmbedding(page.title)});
//     page.headers.map(async (header: string) => {
//         index.add({...page, embedding: await getEmbedding(header)});
//     });
//     index.saveIndex('indexedDB').catch((error) => console.error('Error saving index:', error));
//     console.log('Indexed page:', page);
// }

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

  console.log("Generating knowledge graph...", page);

  const graph = await generatePageKnowledgeGraph(page).catch(console.error);

  if (!graph) {
    return;
  }
  await saveKnowledgeGraphToDB(page.url, graph).catch(console.error);

  // indexPage(page).then(async () => {
  //     // const queryEmbedding = await getEmbedding(page.title);
  //     // const results = await index.search(queryEmbedding, {topK: 5, useStorage: "indexedDB",})
  //     searchPages(page.title, 5).then(results => {
  //         if (!results || !results.length) {
  //             return;
  //         }
  //         console.log('Search results:', results);
  //     }).catch(console.error);
  // }).catch(console.error);

  // summarizePage(message)
  //     .then(summary => console.log(summary))
  //     .catch(console.error);
});

// todo: add a summary of new tabs with chromeai
