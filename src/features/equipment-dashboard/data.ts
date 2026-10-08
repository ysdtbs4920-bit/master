import analysisJson from "@/data/analysis-chart-data.json";
import chartJson from "@/data/chart-data.json";
import dashboardJson from "@/data/dashboard-data.json";
import type { EquipmentDashboardData } from "./types";

/** JSON 読み込みを集約する境界。API データへの置き換えもここから行えます。 */
export const equipmentDashboardData: EquipmentDashboardData = {
  dashboard: dashboardJson,
  charts: { ...chartJson, analysis: analysisJson },
};
