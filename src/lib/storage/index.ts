import { openDB } from "idb";

import { PageKnowledgeGraph } from "@/lib/agents/page-graph-transformer";

const dbPromise = openDB("knowledgeGraphDB", 1, {
  upgrade(db) {
    db.createObjectStore("knowledgeGraphs", { keyPath: "id" });
  },
});

export async function saveKnowledgeGraphToDB(
  id: string,
  graph: PageKnowledgeGraph,
) {
  const db = await dbPromise;

  await db.put("knowledgeGraphs", { id, ...graph });
}

export async function getKnowledgeGraphFromDB(
  id: string,
): Promise<PageKnowledgeGraph | undefined> {
  const db = await dbPromise;

  return await db.get("knowledgeGraphs", id);
}
