import React from "react";
import ReactDOM from "react-dom/client";
import { NextUIProvider } from "@nextui-org/system";

import App from "./app";

import "@/styles/globals.css";
import "@/styles/globals-v2.scss";
import "@/styles/index.module.scss";
import { getDB } from "@/lib/storage/vector";

import { PGliteProvider } from "@electric-sql/pglite-react";

// import { XMLHttpRequestPolyfill } from "@/lib/pollyfills/xhrPollyfill";

// (globalThis as any).XMLHttpRequest = XMLHttpRequestPolyfill;

const db = await getDB();

ReactDOM.createRoot(document.getElementById("app") as HTMLElement).render(
  <React.StrictMode>
    <NextUIProvider>
      <PGliteProvider db={db}>
        <App />
      </PGliteProvider>
    </NextUIProvider>
  </React.StrictMode>,
);
