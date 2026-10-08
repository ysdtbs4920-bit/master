import { useEffect, useRef } from "react";
import * as echarts from "echarts/core";
import { BarChart, LineChart, PieChart, ScatterChart, BoxplotChart, RadarChart, GaugeChart } from "echarts/charts";
import {
  DataZoomComponent,
  GridComponent,
  RadarComponent,
  LegendComponent,
  ToolboxComponent,
  TooltipComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { EChartsOption } from "echarts";

// 共通部品で使用するグラフ・操作・描画機能だけを登録する。
echarts.use([
  LineChart,
  BarChart,
  PieChart,
  ScatterChart,
  BoxplotChart,
  RadarChart,
  GaugeChart,
  RadarComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  ToolboxComponent,
  DataZoomComponent,
  CanvasRenderer,
]);

type EChartProps = {
  option: EChartsOption;
  height?: number;
  darkMode?: boolean;
};

/** EChartsの初期化、更新、リサイズ、破棄を共通で管理する。 */
export function EChart({
  option,
  height = 300,
  darkMode = false,
}: EChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  // テーマが変わった場合はインスタンスを再生成する。
  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    chartRef.current?.dispose();

    const chart = echarts.init(
      containerRef.current,
      darkMode ? "dark" : undefined,
      { renderer: "canvas" }
    );

    chartRef.current = chart;

    const observer = new ResizeObserver(() => {
      chart.resize();
    });

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, [darkMode]);

  // 初回表示、データ変更、テーマ変更後のインスタンスへ設定を反映する。
  useEffect(() => {
    if (!chartRef.current) {
      return;
    }

    chartRef.current.setOption(option, { notMerge: true });
  }, [option, darkMode]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height,
        backgroundColor: "transparent",
      }}
    />
  );
}
