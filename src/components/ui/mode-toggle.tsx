/**
 * ライトとダークを切り替えるボタン。useThemeから現在のテーマと変更関数を受け取ります。
 * 呼び出し元から渡すpropsは部品の設定、childrenは内側に表示する内容です。
 * classNameは見た目のCSSクラス。業務データはfeaturesやdataで変更します。
 */

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const darkMode = resolvedTheme === "dark";

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(darkMode ? "light" : "dark")}
      aria-label="表示テーマを切り替える"
      title={darkMode ? "ライトモードに切替" : "ダークモードに切替"}
    >
      {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
