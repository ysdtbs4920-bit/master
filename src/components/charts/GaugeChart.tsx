/**
 * ゲージを表示する小さな部品です。
 * dataにはvalue（現在値）・min・max・unitを渡します。darkModeは暗いテーマか、heightは高さです。
 * 表示設定はanalysis-options.tsで作り、実際の描画はEChart.tsxに任せます。
 */

import { EChart } from "./EChart";
import { gaugeOption } from "./analysis-options";
import type { GaugeChartData } from "./types";

type Props = { data: GaugeChartData; darkMode: boolean; height?: number };

export function GaugeChart({ data, darkMode, height = 320 }: Props) {
  return <EChart option={gaugeOption(data, darkMode)} darkMode={darkMode} height={height} />;
}
