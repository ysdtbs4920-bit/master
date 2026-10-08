/**
 * URLに対応する画面を選び、共通のヘッダーやフッターと組み合わせます。
 * pages.tsが画面一覧、use-page.tsが現在の画面IDを担当します。
 * Suspenseは画面の読み込みを待っている間に「読み込み中」を表示します。
 */

import { Suspense } from "react";

import { appPages } from "@/app/pages";
import { usePageId } from "@/app/use-page";
import { AppShell } from "@/components/layout/AppShell";
import { appConfig } from "@/config/app-config";

export default function App() {
  const pageId = usePageId(appPages[0]?.id ?? "");
  const selectedPage =
    appPages.find((page) => page.id === pageId) ?? appPages[0];
  // React部品として使う変数は大文字で始め、下で<CurrentPage />として表示します。
  const CurrentPage = selectedPage?.component;

  return (
    <AppShell
      config={appConfig}
      navigation={appPages}
      activePageId={selectedPage?.id ?? ""}
    >
      <Suspense fallback={<p role="status">読み込み中…</p>}>
        {CurrentPage ? <CurrentPage /> : <p>表示できるページがありません。</p>}
      </Suspense>
    </AppShell>
  );
}
