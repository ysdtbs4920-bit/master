import { EChart } from "./EChart";
import { boxPlotOption } from "./analysis-options";
import type { BoxPlotChartData } from "./types";

type Props = { data: BoxPlotChartData; darkMode: boolean; height?: number };

export function BoxPlotChart({ data, darkMode, height = 320 }: Props) {
  return <EChart option={boxPlotOption(data, darkMode)} darkMode={darkMode} height={height} />;
}
