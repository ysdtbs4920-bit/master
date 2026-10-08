/**
 * app-config.jsonを読み込み、アプリ共通の設定として公開します。
 * AppConfigは設定データの形を定義する型で、実行時の検証処理ではありません。
 * themeStorageKeyはテーマを保存する名前。アプリIDごとに保存先を分けます。
 */

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
