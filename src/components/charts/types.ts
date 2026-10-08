/** JSONで渡せるグラフ共通の系列データ。 */
export type ChartSeries = {
  name: string;
  values: number[];
  color?: string;
};

export type LineChartData = {
  labels: string[];
  series: ChartSeries[];
  unit?: string;
  referenceLine?: {
    name: string;
    value: number;
    color?: string;
  };
};

export type StackedBarChartData = {
  labels: string[];
  series: ChartSeries[];
  unit?: string;
  stack?: string;
};

export type DonutChartData = {
  name?: string;
  items: {
    name: string;
    value: number;
    color?: string;
  }[];
  unit?: string;
};
