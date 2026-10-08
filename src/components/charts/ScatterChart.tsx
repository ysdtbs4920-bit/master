/**
 * 散布図を表示する小さな部品です。
 * dataにはseries内のpoints（xとyの組）を渡します。darkModeは暗いテーマか、heightは高さです。
 * 表示設定はanalysis-options.tsで作り、実際の描画はEChart.tsxに任せます。
 */

import { EChart } from "./EChart";
import { scatterOption } from "./analysis-options";
import type { ScatterChartData } from "./types";

type Props = { data: ScatterChartData; darkMode: boolean; height?: number };

export function ScatterChart({ data, darkMode, height = 320 }: Props) {
  return <EChart option={scatterOption(data, darkMode)} darkMode={darkMode} height={height} />;
}
