/**
 * 箱ひげ図を表示する小さな部品です。
 * dataにはgroups内のsamples（グループごとの測定値）を渡します。darkModeは暗いテーマか、heightは高さです。
 * 表示設定はanalysis-options.tsで作り、実際の描画はEChart.tsxに任せます。
 */

import { EChart } from "./EChart";
import { boxPlotOption } from "./analysis-options";
import type { BoxPlotChartData } from "./types";

type Props = { data: BoxPlotChartData; darkMode: boolean; height?: number };

export function BoxPlotChart({ data, darkMode, height = 320 }: Props) {
  return <EChart option={boxPlotOption(data, darkMode)} darkMode={darkMode} height={height} />;
}
