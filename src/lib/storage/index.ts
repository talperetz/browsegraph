import { openDB } from "idb";

import { GraphType } from "@/lib/schema/graph";

const dbPromise = openDB("knowledgeGraphDB", 1, {
  upgrade(db) {
    const store = db.createObjectStore("knowledgeGraphs", { keyPath: "id" });

    store.createIndex("createdAt", "createdAt"); // Index on createdAt for efficient querying
  },
});

export async function saveKnowledgeGraphToDB(id: string, graph: GraphType) {
  const db = await dbPromise;
  const createdAt = new Date().toISOString(); // Set createdAt timestamp

  await db.put("knowledgeGraphs", { id, ...graph, createdAt });
}

export async function getKnowledgeGraphFromDB(
  id: string,
): Promise<GraphType | undefined> {
  const db = await dbPromise;

  return await db.get("knowledgeGraphs", id);
}

// Function to get all graph records created today
export async function getTodayKnowledgeGraphsFromDB(): Promise<GraphType[]> {
  const db = await dbPromise;
  const transaction = db.transaction("knowledgeGraphs", "readonly");
  const store = transaction.objectStore("knowledgeGraphs");

  const todayGraphs: GraphType[] = [];
  const today = new Date();
  const yesterday = new Date();

  yesterday.setDate(today.getDate() - 10);

  today.setHours(0, 0, 0, 0); // Set to the beginning of today
  yesterday.setHours(0, 0, 0, 0); // Set to the beginning of today

  // Use a cursor to iterate and filter by today's date
  await store.openCursor().then(function cursorIterate(cursor) {
    if (!cursor) return;

    const graph = cursor.value;
    const graphDate = new Date(graph.createdAt);

    if (graphDate >= yesterday) {
      todayGraphs.push(graph);
    }

    return cursor.continue().then(cursorIterate);
  });

  await transaction.done;

  return todayGraphs;
}
