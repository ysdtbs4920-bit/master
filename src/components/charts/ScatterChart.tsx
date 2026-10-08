import { EChart } from "./EChart";
import { scatterOption } from "./analysis-options";
import type { ScatterChartData } from "./types";

type Props = { data: ScatterChartData; darkMode: boolean; height?: number };

export function ScatterChart({ data, darkMode, height = 320 }: Props) {
  return <EChart option={scatterOption(data, darkMode)} darkMode={darkMode} height={height} />;
}
