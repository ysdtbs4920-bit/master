import { useSyncExternalStore } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

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
