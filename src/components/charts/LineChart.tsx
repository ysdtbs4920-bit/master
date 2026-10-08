import type { EChartsOption, LineSeriesOption } from "echarts";

import { EChart } from "./EChart";
import { getChartColors } from "./chart-theme";
import type { LineChartData } from "./types";

type LineChartProps = {
  data: LineChartData;
  darkMode: boolean;
  height?: number;
};

export function LineChart({ data, darkMode, height = 360 }: LineChartProps) {
  const { primary, alarm, secondary, waiting } = getChartColors(darkMode);
  const palette = [primary, alarm, secondary, waiting];
  const series = data.series.map<LineSeriesOption>((item, index) => {
    const color = item.color ?? palette[index % palette.length] ?? primary;

    return {
      name: item.name,
      type: "line",
      smooth: true,
      showSymbol: false,
      data: item.values,
      lineStyle: { color, width: 3 },
      itemStyle: { color },
      areaStyle: { color, opacity: 0.12 },
    };
  });

  if (data.referenceLine) {
    const { name, value, color = alarm } = data.referenceLine;

    series.push({
      name,
      type: "line",
      symbol: "none",
      lineStyle: { type: "dashed", width: 2, color },
      itemStyle: { color },
      data: data.labels.map(() => value),
    });
  }

  const option: EChartsOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "axis",
      valueFormatter: (value) =>
        `${String(value)}${data.unit ? ` ${data.unit}` : ""}`,
    },
    legend: { bottom: 0 },
    grid: { left: 55, right: 25, top: 35, bottom: 75 },
    toolbox: {
      right: 10,
      feature: {
        dataZoom: { yAxisIndex: "none" },
        restore: {},
        saveAsImage: {},
      },
    },
    xAxis: { type: "category", data: data.labels, boundaryGap: false },
    yAxis: { type: "value", name: data.unit, scale: true },
    dataZoom: [
      { type: "inside" },
      { type: "slider", bottom: 30, height: 16 },
    ],
    series,
  };

  return <EChart option={option} height={height} darkMode={darkMode} />;
}
