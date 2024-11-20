import { fetchBrowsingHistory } from "@/lib/utils/history";
import { generateUserContentPreferences } from "@/lib/agents/user-content-personalizer";
import {
  getLatestUserPreferencesFromDB,
  saveUserPreferencesToDB,
} from "@/lib/storage/user";
import { generateShortUUID } from "@/lib/utils/uuid";
import { generateUserDesignPreferences } from "@/lib/agents/user-design-personalizer";

export const storeUserPreferences = async () => {
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

  const savedPreferences = await getLatestUserPreferencesFromDB();

  if (
    savedPreferences &&
    savedPreferences.updatedAt > weekAgo &&
    savedPreferences.preferredContent &&
    savedPreferences.preferredDesign
  ) {
    console.debug("Using existing user preferences", savedPreferences);

    return savedPreferences;
  }

  const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
  const historyItems = await fetchBrowsingHistory(monthAgo, now);

  console.debug("User history fetched", historyItems);
  const contentPreferences = await generateUserContentPreferences(historyItems);
  const designPreference =
    await generateUserDesignPreferences(contentPreferences);

  const generatedId = generateShortUUID();
  const userPreferences = {
    id: generatedId,
    preferredContent: contentPreferences,
    preferredDesign: designPreference,
    updatedAt: now,
  };

  await saveUserPreferencesToDB(generatedId, userPreferences);
  console.debug("User preferences stored", userPreferences);

  return userPreferences;
};
