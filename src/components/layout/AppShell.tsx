import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import type { AppConfig } from "@/config/app-config";

type NavigationItem = {
  id: string;
  label: string;
};

type AppShellProps = {
  config: AppConfig;
  navigation: NavigationItem[];
  activePageId: string;
  children: ReactNode;
};

/** アプリ共通のヘッダー、画面ナビゲーション、フッター。 */
export function AppShell({
  config,
  navigation,
  activePageId,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-background p-4 text-foreground transition-colors duration-300 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{config.title}</h1>
            {config.description && (
              <p className="mt-1 text-sm text-muted-foreground">
                {config.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {config.badge && <Badge variant="outline">{config.badge}</Badge>}
            <ModeToggle />
            <Button variant="outline" onClick={() => window.location.reload()}>
              更新
            </Button>
          </div>
        </header>

        <nav aria-label="メインナビゲーション" className="flex flex-wrap gap-2">
          {navigation.map((item) => (
            <Button
              key={item.id}
              asChild
              variant={activePageId === item.id ? "default" : "outline"}
            >
              <a
                href={`#/${encodeURIComponent(item.id)}`}
                aria-current={activePageId === item.id ? "page" : undefined}
              >
                {item.label}
              </a>
            </Button>
          ))}
        </nav>

        <main>{children}</main>

        {config.footer && (
          <footer className="text-center text-xs text-muted-foreground">
            {config.footer}
          </footer>
        )}
      </div>
    </div>
  );
}
