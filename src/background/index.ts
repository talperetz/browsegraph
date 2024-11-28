import { storeUserPreferences } from "./actions";
import { keepAlive } from "./keep-alive";

import { startPageIndexer } from "@/background/pageIndexer";

const initializeExtension = async () => {
  try {
    keepAlive(true);
    storeUserPreferences().catch(console.error);
  } catch (error) {
    console.error("Error initializing extension:", error);
  } finally {
    keepAlive(false);
  }
};

chrome.runtime.onInstalled.addListener(() => {
  initializeExtension().catch(console.error);
  startPageIndexer();
});

chrome.runtime.onStartup.addListener(() => {
  initializeExtension().catch(console.error);
  startPageIndexer();
});

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));
