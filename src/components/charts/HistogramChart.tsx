/**
 * ヒストグラムを表示する小さな部品です。
 * dataにはsamples（測定値）・binCount（区間数）を渡します。darkModeは暗いテーマか、heightは高さです。
 * 表示設定はanalysis-options.tsで作り、実際の描画はEChart.tsxに任せます。
 */

import { EChart } from "./EChart";
import { histogramOption } from "./analysis-options";
import type { HistogramChartData } from "./types";

type Props = { data: HistogramChartData; darkMode: boolean; height?: number };

export function HistogramChart({ data, darkMode, height = 320 }: Props) {
  return <EChart option={histogramOption(data, darkMode)} darkMode={darkMode} height={height} />;
}
