/**
 * 追加6種類のグラフをカードにまとめて並べます。
 * entriesの順序が表示順。visibleがfalseのものは除外します。
 * 横並び数は下のgrid-cols、値やカード名はanalysis-chart-data.jsonで変更します。
 */

import { ChartCard } from "./ChartCard";
import { AreaChart } from "./AreaChart";
import { ScatterChart } from "./ScatterChart";
import { HistogramChart } from "./HistogramChart";
import { BoxPlotChart } from "./BoxPlotChart";
import { RadarChart } from "./RadarChart";
import { GaugeChart } from "./GaugeChart";
import type { AnalysisChartsData } from "./types";

export function AnalysisCharts({ data, darkMode }: { data: AnalysisChartsData; darkMode: boolean }) {
  // 各カードのデータとグラフを一覧にします。この配列を並べ替えると表示順が変わります。
  const entries = [
    { key: "scatter", data: data.scatter, description: "2つの特性値の関係", chart: <ScatterChart data={data.scatter} darkMode={darkMode} height={data.scatter.height} /> },
    { key: "histogram", data: data.histogram, description: "特性値の度数分布", chart: <HistogramChart data={data.histogram} darkMode={darkMode} height={data.histogram.height} /> },
    { key: "boxplot", data: data.boxplot, description: "中央値・四分位範囲・1.5 IQRのひげと外れ値", chart: <BoxPlotChart data={data.boxplot} darkMode={darkMode} height={data.boxplot.height} /> },
    { key: "area", data: data.area, description: "系列ごとの推移", chart: <AreaChart data={data.area} darkMode={darkMode} height={data.area.height} /> },
    { key: "radar", data: data.radar, description: "複数の指標を比較", chart: <RadarChart data={data.radar} darkMode={darkMode} height={data.radar.height} /> },
    { key: "gauge", data: data.gauge, description: "指標の現在値", chart: <GaugeChart data={data.gauge} darkMode={darkMode} height={data.gauge.height} /> },
  ].filter((entry) => entry.data.visible !== false);
  // 全部が非表示なら、このエリア自体を表示しません。
  if (!entries.length) return null;
  return (
    <section className="space-y-4" aria-label="追加グラフ">
      <div>
        <h3 className="text-lg font-semibold">追加グラフ</h3>
        <p className="text-sm text-muted-foreground">検索条件に連動しない分析用のサンプルデータです。</p>
      </div>
      {/* gridは格子状の配置、gap-4は間隔。lg:grid-cols-2は幅1024px以上で2列、それより狭いと1列です。 */}
      <div className="grid gap-4 lg:grid-cols-2">
        {entries.map((entry) => <ChartCard key={entry.key} title={entry.data.title} description={entry.description}>{entry.chart}</ChartCard>)}
      </div>
    </section>
  );
}
