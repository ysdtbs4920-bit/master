/**
 * テーマ管理をアプリ全体に提供します。OS設定を初期値として、HTMLのclassで色を切り替えます。
 * 呼び出し元から渡すpropsは部品の設定、childrenは内側に表示する内容です。
 * classNameは見た目のCSSクラス。業務データはfeaturesやdataで変更します。
 */

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
