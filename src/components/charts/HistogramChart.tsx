import { EChart } from "./EChart";
import { histogramOption } from "./analysis-options";
import type { HistogramChartData } from "./types";

type Props = { data: HistogramChartData; darkMode: boolean; height?: number };

export function HistogramChart({ data, darkMode, height = 320 }: Props) {
  return <EChart option={histogramOption(data, darkMode)} darkMode={darkMode} height={height} />;
}
