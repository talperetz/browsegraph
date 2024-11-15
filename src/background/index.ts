import { startAllBackgroundJobs } from "./chromeActivity";
import { storeUserPreferences } from "./actions";
import { keepAlive } from "./keep-alive";

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
  startAllBackgroundJobs();
});

chrome.runtime.onStartup.addListener(() => {
  initializeExtension().catch(console.error);
  startAllBackgroundJobs();
});

// handleBrowserIdleState(startAllBackgroundJobs, stopAllBackgroundJobs);

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));
