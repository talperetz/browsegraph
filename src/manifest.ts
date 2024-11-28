import { defineManifest } from "@crxjs/vite-plugin";

export const isProduction = process.env.NODE_ENV === "production";
export default defineManifest({
  name: isProduction ? "BrowseGraph" : "BrowseGraph (Dev)",
  description: "",
  version: "0.1.0",
  manifest_version: 3,
  icons: {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png",
  },

  action: {
    default_icon: "icons/icon48.png",
  },
  // options_page: 'options.html',
  background: {
    service_worker: "src/background/index.ts",
    type: "module",
  },
  side_panel: {
    default_path: "sidepanel.html",
  },
  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["src/content/index.ts"],
    },
  ],
  chrome_url_overrides: {
    newtab: "newtab.html",
  },
  web_accessible_resources: [
    {
      resources: [
        "img/icon16.png",
        "img/icon32.png",
        "img/icon48.png",
        "img/icon128.png",
      ],
      matches: [],
    },
  ],
  permissions: [
    "sidePanel",
    "tabs",
    "activeTab",
    "storage",
    "history",
    "webNavigation",
    "scripting",
    "cookies",
  ],
  content_security_policy: {
    extension_pages:
      "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src-elem 'self' ws://localhost:5174/ https://cdnjs.cloudflare.com; font-src 'self' https://cdnjs.cloudflare.com; connect-src 'self' ws://localhost:5174/ http://localhost:5174/ https://huggingface.co/Xenova/gte-small/ https://cdn-lfs.huggingface.co/ https://cdn.jsdelivr.net https://generativelanguage.googleapis.com https://api.openai.com",
  },
});
