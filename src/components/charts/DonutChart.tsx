import type { EChartsOption } from "echarts";

import { EChart } from "./EChart";
import { getChartColors } from "./chart-theme";
import type { DonutChartData } from "./types";

type DonutChartProps = {
  data: DonutChartData;
  darkMode: boolean;
  height?: number;
};

export function DonutChart({ data, darkMode, height = 300 }: DonutChartProps) {
  const { primary, alarm, secondary, waiting } = getChartColors(darkMode);
  const palette = [primary, alarm, secondary, waiting];

  const option: EChartsOption = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      formatter: `{b}<br />{c}${data.unit ?? ""}（{d}%）`,
    },
    legend: { bottom: 0 },
    series: [
      {
        name: data.name,
        type: "pie",
        radius: ["42%", "68%"],
        center: ["50%", "43%"],
        label: { formatter: "{d}%" },
        data: data.items.map((item, index) => ({
          name: item.name,
          value: item.value,
          itemStyle: {
            color: item.color ?? palette[index % palette.length] ?? primary,
          },
        })),
      },
    ],
  };

  return <EChart option={option} height={height} darkMode={darkMode} />;
}
