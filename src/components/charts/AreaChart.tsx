import { EChart } from "./EChart";
import { areaOption } from "./analysis-options";
import type { AreaChartData } from "./types";

type Props = { data: AreaChartData; darkMode: boolean; height?: number };

export function AreaChart({ data, darkMode, height = 320 }: Props) {
  return <EChart option={areaOption(data, darkMode)} darkMode={darkMode} height={height} />;
}
