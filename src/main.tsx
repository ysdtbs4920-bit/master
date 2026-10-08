/**
 * アプリを起動する入口。index.htmlのrootという場所にReactの画面を表示します。
 * Appをテーマ管理で包み、ブラウザーのタイトルと言語も設定します。
 * 画面そのものの変更はApp.tsxやfeatures配下で行います。
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { appConfig, themeStorageKey } from "@/config/app-config";

document.title = appConfig.title;
document.documentElement.lang = appConfig.language;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider storageKey={themeStorageKey}>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
