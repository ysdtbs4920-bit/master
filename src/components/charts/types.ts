/**
 * 共通グラフが受け取るデータの形を定義します。
 * ChartSeriesは系列（1本の線など）。AnalysisChartSettingsはタイトルや表示設定を加えます。
 * 新しいJSONを作るときは、そのグラフの型を見ると必要な項目がわかります。
 */

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

export type AreaChartData = {
  labels: string[];
  series: ChartSeries[];
  unit?: string;
  stacked?: boolean;
};

export type ScatterChartData = {
  xLabel?: string;
  yLabel?: string;
  series: { name: string; points: { x: number; y: number }[]; color?: string }[];
};

export type HistogramChartData = {
  samples: number[];
  binCount?: number;
  unit?: string;
};

export type BoxPlotChartData = {
  groups: { name: string; samples: number[] }[];
  unit?: string;
};

export type RadarChartData = {
  indicators: { name: string; max: number }[];
  series: ChartSeries[];
};

export type GaugeChartData = {
  name: string;
  value: number;
  min?: number;
  max?: number;
  unit?: string;
};

export type AnalysisChartSettings<T> = T & {
  title: string;
  visible?: boolean;
  height?: number;
};

export type AnalysisChartsData = {
  area: AnalysisChartSettings<AreaChartData>;
  scatter: AnalysisChartSettings<ScatterChartData>;
  histogram: AnalysisChartSettings<HistogramChartData>;
  boxplot: AnalysisChartSettings<BoxPlotChartData>;
  radar: AnalysisChartSettings<RadarChartData>;
  gauge: AnalysisChartSettings<GaugeChartData>;
};
