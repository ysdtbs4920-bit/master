/**
 * レーダーチャートを表示する小さな部品です。
 * dataにはindicators（指標と最大値）・seriesを渡します。darkModeは暗いテーマか、heightは高さです。
 * 表示設定はanalysis-options.tsで作り、実際の描画はEChart.tsxに任せます。
 */

import { EChart } from "./EChart";
import { radarOption } from "./analysis-options";
import type { RadarChartData } from "./types";

type Props = { data: RadarChartData; darkMode: boolean; height?: number };

export function RadarChart({ data, darkMode, height = 320 }: Props) {
  return <EChart option={radarOption(data, darkMode)} darkMode={darkMode} height={height} />;
}
