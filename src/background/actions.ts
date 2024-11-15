import { fetchBrowsingHistory } from "@/lib/utils/history";
// import {saveToLocalStorage} from "@/lib/storage/local-storage.ts";

export const storeUserPreferences = async () => {
  const now = Date.now();
  const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
  const historyItems = await fetchBrowsingHistory(monthAgo, now);

  console.log("User history fetched", historyItems);
  // const contentPreferences = await generateUserContentPreferences(historyItems);
  // const designPreferences = await generateUserDesignPreferences(historyItems);

  // saveToLocalStorage("preferences", preferences)
  // console.log("User preferences stored", preferences)
};
