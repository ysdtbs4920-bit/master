/**
 * URLの#以降（例：#/dashboard）から現在の画面IDを取り出します。
 * URLが変わるとReactに通知し、ブラウザーの戻る・進むにも追従します。
 * useで始まる関数はフックと呼ばれ、Reactの部品内で使います。
 */

import { useSyncExternalStore } from "react";

// URLの変更を監視します。返す関数は監視が不要になったときの後片付けです。
function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

// 現在のURLからIDを読みます。壊れた文字列なら空文字にして既定の画面へ戻します。
function getSnapshot() {
  try {
    return decodeURIComponent(window.location.hash.replace(/^#\/?/, ""));
  } catch {
    return "";
  }
}

/** URLのhashで画面を選択し、ブラウザーの戻る・進むにも追従する。 */
export function usePageId(defaultPageId: string) {
  return (
    useSyncExternalStore(subscribe, getSnapshot, () => defaultPageId) ||
    defaultPageId
  );
}
