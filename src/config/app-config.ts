import configJson from "./app-config.json";

export type AppConfig = {
  id: string;
  title: string;
  description: string;
  badge: string;
  footer: string;
  language: string;
};

export const appConfig: AppConfig = configJson;
export const themeStorageKey = `${appConfig.id}:theme`;
