/**
 * 開発サーバーと公開用ビルドを行うViteの設定です。
 * pluginsでReactとTailwind CSSを有効にし、aliasで@をsrcフォルダーの略記にします。
 * 通常、検索項目やグラフの値を変えるだけなら編集は不要です。
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
