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
