import { Suspense } from "react";

import { appPages } from "@/app/pages";
import { usePageId } from "@/app/use-page";
import { AppShell } from "@/components/layout/AppShell";
import { appConfig } from "@/config/app-config";

export default function App() {
  const pageId = usePageId(appPages[0]?.id ?? "");
  const selectedPage =
    appPages.find((page) => page.id === pageId) ?? appPages[0];
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
