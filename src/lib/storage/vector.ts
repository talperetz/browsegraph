import { PGlite } from "@electric-sql/pglite";
// @ts-ignore
import { vector } from "@electric-sql/pglite/vector";

let dbInstance: PGlite | null = null;

// Singleton pattern to ensure only one database instance
export async function getDB() {
  if (dbInstance) {
    return dbInstance;
  }
  const metaDb = new PGlite("idb://browsegraph-db", {
    extensions: {
      vector,
    },
  });

  await metaDb.waitReady;
  dbInstance = metaDb;

  console.debug("Database initialized");

  return metaDb;
}

// Initialize the database schema
export const initSchema = async (db: PGlite) => {
  await db.exec(`
    create extension if not exists vector;
    create table if not exists embeddings (
      id bigint primary key generated always as identity,
      url text not null,
      content text not null,
      embedding vector (768)
    );
    create index if not exists embeddings_idx on embeddings using hnsw (embedding vector_ip_ops);
  `);
};

export async function insertEmbeddings(
  dataArray: Array<{
    url: string;
    content: string;
    embedding: Array<number>;
  }>,
) {
  const db = await getDB();

  // Ensure schema is initialized
  await initSchema(db);

  await db.transaction(async (tx) => {
    for (const data of dataArray) {
      // Serialize the embedding array to JSON
      const embeddingJson = JSON.stringify(data.embedding);

      console.debug(`Inserting embedding for ${embeddingJson}`);

      // Insert the embedding
      await tx.query(
        `
        INSERT INTO embeddings (url, content, embedding)
        VALUES ($1, $2, $3)
        `,
        [data.url, data.content, embeddingJson],
      );
    }
  });

  console.debug(`Inserted ${dataArray.length} embeddings`);
}

export const searchPglite = async (
  embedding,
  match_threshold = 0.8,
  limit = 3,
) => {
  const db = await getDB();
  const res = await db.query(
    `
    select * from embeddings

    where embeddings.embedding <#> $1 < $2

    order by embeddings.embedding <#> $1
    limit $3;
    `,
    [JSON.stringify(embedding), -Number(match_threshold), Number(limit)],
  );

  return res;
};
