import { Command } from "cmdk";
import "@/styles/raycast.scss";
import React, { useEffect, useRef, useState } from "react";
import { Results } from "@electric-sql/pglite";

const mockResults: Results<{ [key: string]: any }> = {
  fields: [],
  rows: [
    {
      id: 1,
      url: "https://example.com/article-1",
      content:
        "JavaScript is a versatile programming language widely used for building dynamic web applications. Its ability to run in browsers has made it an essential tool for front-end development, powering interactive elements and rich user experiences. From manipulating the DOM to handling events and creating animations, JavaScript enables developers to bring static websites to life. Additionally, with the advent of Node.js, JavaScript can now be used for server-side programming, allowing for full-stack development using a single language. Over the years, the ecosystem around JavaScript has grown significantly, with frameworks like React, Vue.js, and Angular streamlining the development process. Whether you're building a simple webpage or a complex application, understanding JavaScript is crucial for success in the modern web development landscape. Moreover, new features in ECMAScript continue to enhance its capabilities, making it easier to write concise and maintainable code. As technology evolves, JavaScript remains a cornerstone of innovation on the web, enabling developers to create seamless and engaging digital experiences.",
    },
    {
      id: 2,
      url: "https://example.com/article-2",
      content:
        "React components have revolutionized the way developers build user interfaces. By breaking down UIs into reusable, self-contained components, React promotes code reusability and scalability. Each component manages its own state and logic, which simplifies debugging and testing. With React's declarative syntax, developers can describe how the UI should look based on the application's current state, and React takes care of updating the DOM efficiently. The introduction of hooks has further streamlined state management and side effects in functional components, reducing the need for class components in many cases. Additionally, React's vast ecosystem includes tools like Redux for state management, React Router for navigation, and libraries like Material-UI for pre-built UI components. This flexibility makes React suitable for a wide range of applications, from simple single-page apps to complex enterprise solutions. As the web continues to evolve, React's commitment to performance and developer experience ensures its place as a top choice for front-end development.",
    },
    {
      id: 3,
      url: "https://example.com/article-3",
      content:
        "Embeddings are a fascinating area in AI that enable machines to understand and process complex data such as text, images, and audio. Essentially, an embedding is a dense vector representation of data, capturing its semantic meaning in a high-dimensional space. For example, in natural language processing, embeddings like Word2Vec or GPT-based models transform words into vectors that represent their meanings and relationships to other words. This allows machines to perform tasks like sentiment analysis, translation, and question answering more effectively. Similarly, embeddings are used in computer vision to analyze images by representing visual features in vector form. The versatility of embeddings extends to recommendation systems, where they help identify similarities between users and items. As AI continues to advance, the development of more sophisticated embeddings promises to unlock new possibilities in understanding and generating data, bridging the gap between human intuition and machine learning capabilities.",
    },
    {
      id: 4,
      url: "https://example.com/article-4",
      content:
        "PostgreSQL is a powerful, open-source relational database system known for its extensibility and robust feature set. Among its many extensions, pgvector stands out as a game-changer for AI and machine learning applications. The pgvector extension allows PostgreSQL to store and query vector embeddings, which are crucial for tasks such as similarity search and recommendation systems. By integrating pgvector, developers can perform operations like nearest-neighbor searches directly within the database, eliminating the need for external tools or services. This seamless integration simplifies workflows and reduces latency, making PostgreSQL a viable choice for AI-driven projects. Furthermore, PostgreSQL's support for JSON, full-text search, and advanced indexing mechanisms provides a versatile foundation for modern applications. As organizations continue to embrace data-driven decision-making, PostgreSQL's ability to handle diverse data types and workloads ensures its relevance in an ever-changing technological landscape.",
    },
    {
      id: 5,
      url: "https://example.com/article-5",
      content:
        "Building a command menu using cmdk and TailwindCSS is a great way to enhance the user experience in modern web applications. Command menus provide a fast, intuitive way for users to interact with applications by typing commands or searching for features. With cmdk, a lightweight library for building command menus in React, developers can create highly customizable and responsive menus with minimal effort. TailwindCSS further streamlines the process by offering utility-first CSS classes that simplify styling and ensure consistency across the UI. By combining these tools, developers can focus on functionality and user experience without being bogged down by complex styling or manual DOM manipulation. Command menus are especially useful in productivity apps, where quick access to features can save users significant time. As the demand for efficient and user-friendly interfaces grows, mastering tools like cmdk and TailwindCSS becomes increasingly important for developers aiming to stay ahead in the field.",
    },
  ],
};

function getSnippet(content: string, searchTerm: string): string {
  const index = content.toLowerCase().indexOf(searchTerm.toLowerCase());
  const snippetLength = 77;

  if (index !== -1) {
    const contextLength = Math.floor((snippetLength - searchTerm.length) / 2);
    const start = Math.max(0, index - contextLength);
    const end = Math.min(
      content.length,
      index + searchTerm.length + contextLength,
    );
    let snippet = content.substring(start, end);

    if (start > 0) snippet = "..." + snippet;
    if (end < content.length) snippet = snippet + "...";

    return snippet;
  } else {
    return content.slice(0, snippetLength) + "...";
  }
}

function Item({ row, index, search }) {
  const snippet = getSnippet(row.content, search);

  return (
    <Command.Item
      key={`${row.url as string}-${index}`}
      value={`${row.url as string}-${index}`}
      onSelect={() => {
        const cleanSnippet = snippet
          .replace(/^\.{3}/, "")
          .replace(/\.{3}$/, "")
          .trim();
        const urlWithFragment = `${row.url}#:~:text=${encodeURIComponent(cleanSnippet)}`;

        window.open(urlWithFragment, "_blank");
      }}
    >
      <div className="flex items-center justify-between w-full pr-2">
        <div className="flex flex-col gap-1 p-2">
          {snippet}
          <span className="opacity-35">{row.url}</span>
        </div>
        <span cmdk-raycast-meta="">
          <kbd>⏎</kbd>
        </span>
      </div>
    </Command.Item>
  );
}

export function CommandMenu() {
  const [search, setSearch] = useState("");
  const [embedding, setEmbedding] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Results>(mockResults);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef(null);

  useEffect(() => {
    inputRef?.current?.focus();
  }, []);

  useEffect(() => {
    setResults(mockResults);
  }, []);

  useEffect(() => {
    console.log("Search term changed:", search);
  }, [search]);

  // Calculate embedding whenever the search term changes
  // useEffect(() => {
  //   let isCancelled = false;
  //
  //   const calculateEmbedding = async () => {
  //     if (search.trim() === "") {
  //       setEmbedding(null);
  //
  //       return;
  //     }
  //
  //     setLoading(true);
  //
  //     try {
  //       const embeddingResult = await embed({
  //         model: geminiEmbeddingModel,
  //         value: search,
  //       });
  //
  //       if (!isCancelled) {
  //         setEmbedding(embeddingResult.embedding);
  //       }
  //     } catch (error) {
  //       console.error("Error calculating embedding:", error);
  //     } finally {
  //       if (!isCancelled) {
  //         setLoading(false);
  //       }
  //     }
  //   };
  //
  //   calculateEmbedding();
  //
  //   return () => {
  //     isCancelled = true;
  //   };
  // }, [search]);

  // const db = usePGlite();

  //   useEffect(() => {
  //     if (!db || !search || !embedding) {
  //       return;
  //     }
  //
  //     db.query(
  //       `
  //       SELECT *
  //       FROM embeddings
  // --       WHERE embeddings.embedding <#> $1 < $2
  //       ORDER BY embeddings.embedding <#> $1
  //       LIMIT $2;
  //       `,
  //       [JSON.stringify(embedding), 8],
  //     ).then((res) => {
  //       console.log("Results: ", res);
  //       setResults(res);
  //     });
  //   }, [db, search, embedding]);

  const isResultsEmpty = results && results.rows && results.rows.length === 0;
  const hasNoResults = !results || !results.rows;
  const showNoResults = !loading && (hasNoResults || isResultsEmpty);
  const showResults = !loading && !showNoResults;

  return (
    <div className="raycast m-5 w-[640px]">
      <Command
        loop
        shouldFilter={false}
        onKeyDown={(e) => {
          if (e.key === "Escape" || (e.key === "Backspace" && !search)) {
            e.preventDefault();
            setSearch("");
          }
        }}
      >
        <div cmdk-raycast-top-shine="" />
        <Command.Input
          ref={inputRef}
          placeholder="Ask anything or search..."
          value={search}
          onValueChange={(s) => setSearch(s)}
        />
        {search && (
          <>
            <hr cmdk-raycast-loader="" />
            {showNoResults && <Command.Empty>No results found.</Command.Empty>}
            {showResults && (
              <Command.List ref={listRef}>
                {results &&
                  results.rows &&
                  results.rows.length > 0 &&
                  results.rows.map((row, index) => (
                    <Item key={index} index={index} row={row} search={search} />
                  ))}
              </Command.List>
            )}
          </>
        )}
      </Command>
    </div>
  );
}
