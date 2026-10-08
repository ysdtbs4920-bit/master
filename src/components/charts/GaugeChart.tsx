import { EChart } from "./EChart";
import { gaugeOption } from "./analysis-options";
import type { GaugeChartData } from "./types";

type Props = { data: GaugeChartData; darkMode: boolean; height?: number };

export function GaugeChart({ data, darkMode, height = 320 }: Props) {
  return <EChart option={gaugeOption(data, darkMode)} darkMode={darkMode} height={height} />;
}
