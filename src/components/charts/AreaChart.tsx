/**
 * 面グラフを表示する小さな部品です。
 * dataにはlabels・series・stackedを渡します。darkModeは暗いテーマか、heightは高さです。
 * 表示設定はanalysis-options.tsで作り、実際の描画はEChart.tsxに任せます。
 */

import { EChart } from "./EChart";
import { areaOption } from "./analysis-options";
import type { AreaChartData } from "./types";

type Props = { data: AreaChartData; darkMode: boolean; height?: number };

export function AreaChart({ data, darkMode, height = 320 }: Props) {
  return <EChart option={areaOption(data, darkMode)} darkMode={darkMode} height={height} />;
}
