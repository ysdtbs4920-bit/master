/**
 * 追加6種類について、JSONの値をEChartsの表示設定に変換する関数群です。
 * xAxis/yAxisは軸、seriesは描くデータ、tooltipはカーソルを合わせたときの表示です。
 * グラフの見た目を変えるならここ、測定値を変えるならanalysis-chart-data.jsonを編集します。
 */

import type { EChartsOption } from "echarts";
import { getChartColors } from "./chart-theme";
import { buildHistogram, summarizeBoxPlot } from "./statistics";
import type { AreaChartData, ScatterChartData, HistogramChartData, BoxPlotChartData, RadarChartData, GaugeChartData } from "./types";

// 全グラフで使う設定。背景を透明にし、リセットと画像保存を用意します。
const common = { backgroundColor: "transparent", toolbox: { feature: { restore: {}, saveAsImage: {} } } };
const grid = { left: 65, right: 25, top: 55, bottom: 75 };
const palette = (darkMode: boolean) => {
  const c = getChartColors(darkMode);
  return [c.primary, c.alarm, c.secondary, c.waiting];
};

export function areaOption(data: AreaChartData, darkMode: boolean): EChartsOption {
  const colors = palette(darkMode);
  return {
    ...common, color: colors, grid, legend: { bottom: 0 }, tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: data.labels, boundaryGap: false },
    yAxis: { type: "value", name: data.unit },
    series: data.series.map((item, index) => ({
      name: item.name, type: "line", data: item.values, showSymbol: false,
      stack: data.stacked ? "total" : undefined,
      itemStyle: { color: item.color ?? colors[index % colors.length] },
      areaStyle: { opacity: 0.35 },
    })),
  };
}

export function scatterOption(data: ScatterChartData, darkMode: boolean): EChartsOption {
  return {
    ...common, color: palette(darkMode), grid, legend: { bottom: 0 }, tooltip: { trigger: "item" },
    xAxis: { type: "value", name: data.xLabel, nameLocation: "middle", nameGap: 30, scale: true },
    yAxis: { type: "value", name: data.yLabel, scale: true },
    series: data.series.map((item) => ({ name: item.name, type: "scatter", symbolSize: 10,
      data: item.points.filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y)).map((point) => [point.x, point.y]),
      itemStyle: { color: item.color },
    })),
  };
}

// 生の測定値を区間ごとの件数に変換して、隙間のない棒として描きます。
export function histogramOption(data: HistogramChartData, darkMode: boolean): EChartsOption {
  const bins = buildHistogram(data.samples, data.binCount);
  const format = (value: number) => Number(value.toPrecision(6)).toString();
  return {
    ...common, grid, tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    xAxis: { type: "category", name: data.unit, data: bins.map((bin) => `${format(bin.lower)}–${format(bin.upper)}`), axisLabel: { rotate: 25 } },
    yAxis: { type: "value", name: "件数", minInterval: 1 },
    series: [{ name: "度数", type: "bar", barCategoryGap: "0%", data: bins.map((bin) => bin.count), itemStyle: { color: getChartColors(darkMode).primary } }],
  };
}

// 四分位数とひげを箱ひげ図、外れ値を散布図の点として重ねます。
export function boxPlotOption(data: BoxPlotChartData, darkMode: boolean): EChartsOption {
  const groups = data.groups.flatMap((group) => {
    const result = summarizeBoxPlot(group.samples);
    return result ? [{ name: group.name, ...result }] : [];
  });
  const colors = getChartColors(darkMode);
  return {
    ...common, grid, tooltip: { trigger: "item" },
    xAxis: { type: "category", data: groups.map((group) => group.name) },
    yAxis: { type: "value", name: data.unit, scale: true },
    series: [
      { name: "分布", type: "boxplot", data: groups.map((group) => group.summary), itemStyle: { color: colors.primary, borderColor: colors.secondary } },
      { name: "外れ値", type: "scatter", data: groups.flatMap((group, index) => group.outliers.map((value) => [index, value])), itemStyle: { color: colors.alarm } },
    ],
  };
}

export function radarOption(data: RadarChartData, darkMode: boolean): EChartsOption {
  return {
    ...common, color: palette(darkMode), tooltip: { trigger: "item" }, legend: { bottom: 0 },
    radar: { indicator: data.indicators, radius: "60%", center: ["50%", "45%"] },
    series: [{ type: "radar", data: data.series.map((item) => ({ name: item.name, value: item.values, itemStyle: { color: item.color }, areaStyle: { opacity: 0.15 } })) }],
  };
}

export function gaugeOption(data: GaugeChartData, darkMode: boolean): EChartsOption {
  const min = data.min ?? 0, max = data.max ?? 100;
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min || !Number.isFinite(data.value)) {
    throw new Error("ゲージのmin/max/valueは有限数、maxはminより大きい値にしてください。");
  }
  const colors = getChartColors(darkMode);
  return {
    ...common,
    series: [{ type: "gauge", min, max, radius: "80%", progress: { show: true, itemStyle: { color: colors.primary } },
      pointer: { itemStyle: { color: colors.primary } }, axisLabel: { color: colors.secondary },
      detail: { valueAnimation: true, formatter: `{value}${data.unit ?? ""}`, fontSize: 24, offsetCenter: [0, "65%"] },
      title: { offsetCenter: [0, "40%"] }, data: [{ name: data.name, value: data.value }],
    }],
  };
}
