/**
 * 各JSONの読み込みを1か所にまとめ、画面に渡すデータを作ります。
 * dashboardは設備、chartsは波形など、charts.analysisは追加6種類のグラフです。
 * 将来APIから読み込む場合は、この読み込み部分が変更の出発点になります。
 */

import analysisRecords from "@/data/analysis-records.json";
import analysisJson from "@/data/analysis-chart-data.json";
import chartJson from "@/data/chart-data.json";
import dashboardJson from "@/data/dashboard-data.json";
import type { EquipmentDashboardData } from "./types";

/** JSON 読み込みを集約する境界。API データへの置き換えもここから行えます。 */
export const equipmentDashboardData: EquipmentDashboardData = {
  dashboard: dashboardJson,
  charts: { ...chartJson, analysis: analysisJson, analysisRecords },
};
