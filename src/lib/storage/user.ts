import { openDB } from "idb";

import { UserPreferences } from "@/types";

const dbPromise = openDB("userPreferencesDB", 2, {
  upgrade(db, oldVersion, newVersion, transaction) {
    let userStore;

    if (!db.objectStoreNames.contains("userPreferences")) {
      // Create object store in version 1
      userStore = db.createObjectStore("userPreferences", { keyPath: "id" });
    } else {
      // Object store already exists, access it using the transaction
      userStore = transaction.objectStore("userPreferences");
    }

    // Add the updatedAt index in version 2
    if (oldVersion < 2) {
      if (!userStore.indexNames.contains("updatedAt")) {
        userStore.createIndex("updatedAt", "updatedAt", { unique: false });
        console.debug("Index 'updatedAt' created");
      }
    }
  },
});

// User Preferences Functions
export async function saveUserPreferencesToDB(
  id: string,
  preferences: UserPreferences,
) {
  const db = await dbPromise;

  await db.put("userPreferences", preferences);
}

export async function getUserPreferencesFromDB(
  id: string,
): Promise<UserPreferences | undefined> {
  const db = await dbPromise;

  return await db.get("userPreferences", id);
}

export async function getLatestUserPreferencesFromDB(): Promise<
  UserPreferences | undefined
> {
  const db = await dbPromise;

  // Query the database for the latest preferences sorted by `updatedAt`
  const transaction = db.transaction("userPreferences", "readonly");
  const store = transaction.objectStore("userPreferences");
  const index = store.index("updatedAt");

  const cursor = await index.openCursor(null, "prev");

  return cursor?.value;
}
