/**
 * 同じ位置の値を積み上げた棒グラフ。正常品と不良品などの内訳に使います。
 * seriesの各配列はlabelsの順序に対応します。stackは積み上げるグループ名です。
 * 単純な棒グラフに変える場合は、系列のstack設定を見直します。
 */

import type { BarSeriesOption, EChartsOption } from "echarts";

import { EChart } from "./EChart";
import { getChartColors } from "./chart-theme";
import type { StackedBarChartData } from "./types";

type StackedBarChartProps = {
  data: StackedBarChartData;
  darkMode: boolean;
  height?: number;
};

export function StackedBarChart({
  data,
  darkMode,
  height = 300,
}: StackedBarChartProps) {
  const { primary, alarm, secondary, waiting } = getChartColors(darkMode);
  const palette = [primary, alarm, secondary, waiting];
  const series = data.series.map<BarSeriesOption>((item, index) => ({
    name: item.name,
    type: "bar",
    stack: data.stack ?? "total",
    data: item.values,
    itemStyle: { color: item.color ?? palette[index % palette.length] ?? primary },
  }));

  const option: EChartsOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (value) =>
        `${String(value)}${data.unit ? ` ${data.unit}` : ""}`,
    },
    legend: { bottom: 0 },
    grid: { left: 45, right: 15, top: 35, bottom: 45 },
    xAxis: { type: "category", data: data.labels },
    yAxis: { type: "value", name: data.unit },
    series,
  };

  return <EChart option={option} height={height} darkMode={darkMode} />;
}
