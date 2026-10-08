import { EChart } from "./EChart";
import { radarOption } from "./analysis-options";
import type { RadarChartData } from "./types";

type Props = { data: RadarChartData; darkMode: boolean; height?: number };

export function RadarChart({ data, darkMode, height = 320 }: Props) {
  return <EChart option={radarOption(data, darkMode)} darkMode={darkMode} height={height} />;
}
