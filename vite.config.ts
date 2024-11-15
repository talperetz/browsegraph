import path, { resolve } from "path";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import zipPack from "vite-plugin-zip-pack";

import manifest from "./src/manifest";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: "build",
    target: "esnext",
    rollupOptions: {
      input: {
        newtab: resolve(__dirname, "newtab.html"),
        sidepanel: resolve(__dirname, "sidepanel.html"),
      },
      output: {
        chunkFileNames: "assets/chunk-[hash].js",
      },
    },
  },

  server: {
    port: 5174,
    strictPort: true,
    hmr: {
      port: 5174,
      protocol: "ws",
    },
  },

  plugins: [
    crx({ manifest }),
    react(),
    zipPack({
      outDir: `package`,
      inDir: "build",
      // @ts-ignore
      outFileName: `${manifest.short_name ?? manifest.name.replaceAll(" ", "-")}-extension-v${manifest.version}.zip`,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
