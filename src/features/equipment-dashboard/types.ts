import type { AnalysisChartsData } from "@/components/charts/types";

export type EquipmentKpiData = {
  operatingRate: number;
  productionCount: number;
  abnormalCount: number;
  averageCycle: number;
};

export type EquipmentData = {
  id: string;
  name: string;
  status: string;
  factoryName?: string;
  lineName?: string;
  productSerial?: string;
  kpis: EquipmentKpiData;
};

export type DashboardData = {
  equipment: EquipmentData[];
};

export type ProductionDataPoint = {
  day: string;
  normal: number;
  defective: number;
};

export type EquipmentStatusData = {
  running: number;
  stopped: number;
  waiting: number;
};

export type TrendMetricData = {
  label: string;
  unit: string;
  upperLimit: number;
  values: Record<string, number[]>;
};

export type ChartData = {
  analysis?: AnalysisChartsData;
  trend: {
    timeLabels: string[];
    periods: Array<{ id: string; label: string }>;
    metrics: Record<string, TrendMetricData>;
  };
  production: ProductionDataPoint[];
  equipmentStatus: EquipmentStatusData;
};

export type EquipmentDashboardData = {
  dashboard: DashboardData;
  charts: ChartData;
};
