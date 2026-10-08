/**
 * 集計の正しさと、追加6種類が描画できることを確認する自動テストです。
 * 一時フォルダーにTypeScriptを変換し、ブラウザーなしでSVG（図形データ）に描画します。
 * 件数の境界・外れ値・空データ・両テーマを確認します。npm.cmd testで実行します。
 */

import assert from "node:assert/strict";
import { test, after } from "node:test";
import { readFile, writeFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import ts from "typescript";
import * as echarts from "echarts/core";
import { BarChart, LineChart, ScatterChart, BoxplotChart, RadarChart, GaugeChart } from "echarts/charts";
import { GridComponent, RadarComponent, LegendComponent, TooltipComponent, ToolboxComponent } from "echarts/components";
import { SVGRenderer } from "echarts/renderers";

echarts.use([BarChart, LineChart, ScatterChart, BoxplotChart, RadarChart, GaugeChart, GridComponent, RadarComponent, LegendComponent, TooltipComponent, ToolboxComponent, SVGRenderer]);
const directory = await mkdtemp(join(tmpdir(), "analysis-chart-tests-"));
after(() => rm(directory, { recursive: true, force: true }));
for (const name of ["statistics", "chart-theme", "analysis-options"]) {
  const source = await readFile(new URL(`../src/components/charts/${name}.ts`, import.meta.url), "utf8");
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2023 } }).outputText;
  await writeFile(join(directory, `${name}.mjs`), output.replace(/from "\.\/(statistics|chart-theme)"/g, 'from "./$1.mjs"'));
}
// 検索処理は型だけを読み込むので、単独で実行できる形に変換します。
const selectionSource = await readFile(new URL("../src/features/equipment-dashboard/analysis-data.ts", import.meta.url), "utf8");
await writeFile(join(directory, "analysis-data.mjs"), ts.transpileModule(selectionSource, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2023 } }).outputText);
const { selectAnalysisData } = await import(pathToFileURL(join(directory, "analysis-data.mjs")).href);
const records = JSON.parse(await readFile(new URL("../src/data/analysis-records.json", import.meta.url), "utf8"));
const { buildHistogram, summarizeBoxPlot } = await import(pathToFileURL(join(directory, "statistics.mjs")).href);
const options = await import(pathToFileURL(join(directory, "analysis-options.mjs")).href);
const data = JSON.parse(await readFile(new URL("../src/data/analysis-chart-data.json", import.meta.url), "utf8"));

test("histogram assigns boundary values once, includes the maximum, and preserves counts", () => {
  const bins = buildHistogram([0, 1, 2, 3, 4], 4);
  assert.deepEqual(bins.map((bin) => bin.count), [1, 1, 1, 2]);
  assert.equal(bins.at(-1).upper, 4);
  assert.deepEqual(buildHistogram([3, 3, 3], 10), [{ lower: 3, upper: 3, count: 3 }]);
  assert.deepEqual(buildHistogram([], 10), []);
  assert.equal(buildHistogram([NaN, Infinity, 1], 10)[0].count, 1);
  assert.equal(buildHistogram([-1, 0, 1], 0).length, 1);
  assert.equal(buildHistogram([-1, 0, 1], 1000).length, 100);
  assert.equal(buildHistogram([-1, 0, 1], NaN).length, 10);
});

test("box plot uses interpolated quartiles, actual whiskers, and separates outliers without mutating input", () => {
  const samples = [100, 5, 4, 3, 2, 1];
  const result = summarizeBoxPlot(samples);
  assert.deepEqual(result.summary, [1, 2.25, 3.5, 4.75, 5]);
  assert.deepEqual(result.outliers, [100]);
  assert.deepEqual(samples, [100, 5, 4, 3, 2, 1]);
  assert.deepEqual(summarizeBoxPlot([7]).summary, [7, 7, 7, 7, 7]);
  assert.equal(summarizeBoxPlot([NaN, Infinity]), undefined);
});

test("all six chart options render SVG in both themes with registered ECharts modules", () => {
  const builders = { area: options.areaOption, scatter: options.scatterOption, histogram: options.histogramOption, boxplot: options.boxPlotOption, radar: options.radarOption, gauge: options.gaugeOption };
  for (const darkMode of [false, true]) {
    for (const [name, build] of Object.entries(builders)) {
      const chart = echarts.init(null, darkMode ? "dark" : undefined, { renderer: "svg", ssr: true, width: 640, height: 360 });
      try {
        chart.setOption(build(data[name], darkMode));
        const svg = chart.renderToSVGString();
        assert.ok(svg.includes("<svg") && svg.length > 1000, name);
        assert.ok(!svg.includes("NaN"), name);
      } finally { chart.dispose(); }
    }
  }
});

test("empty measurement data produces empty series and invalid gauge ranges are rejected", () => {
  assert.deepEqual(options.histogramOption({samples:[]}, false).series[0].data, []);
  assert.deepEqual(options.boxPlotOption({groups:[{name:"empty",samples:[]}]}, false).series[0].data, []);
  assert.deepEqual(options.scatterOption({series:[{name:"invalid",points:[{x:NaN,y:1}]}]}, false).series[0].data, []);
  assert.throws(() => options.gaugeOption({name:"test",value:5,min:10,max:0}, false));
  assert.throws(() => options.gaugeOption({name:"test",value:NaN}, false));
});

test("additional graphs use the selected equipment and period without leaking other records", () => {
  const first = records[0];
  const selected = selectAnalysisData(data, records, first.equipmentId, first.periodId);
  assert.equal(selected.gauge.value, first.operatingRate);
  assert.deepEqual(selected.histogram.samples, first.measurements.map(item => item.cycleTime));
  assert.deepEqual(selected.scatter.series[0].points, first.measurements.map(item => ({x:item.temperature,y:item.cycleTime})));
  assert.deepEqual(selected.boxplot.groups[0].samples, selected.histogram.samples);
  assert.deepEqual(selected.area.series[0].values, first.measurements.map(item => item.productionCount));
  assert.equal(selected.radar.series[0].values[0], first.operatingRate);
  const otherPeriod = records.find(record => record.equipmentId === first.equipmentId && record.periodId !== first.periodId);
  assert.notDeepEqual(selectAnalysisData(data, records, otherPeriod.equipmentId, otherPeriod.periodId).histogram.samples, selected.histogram.samples);
  const otherEquipment = records.find(record => record.equipmentId !== first.equipmentId && record.periodId === first.periodId);
  assert.notDeepEqual(selectAnalysisData(data, records, otherEquipment.equipmentId, otherEquipment.periodId).area.series, selected.area.series);
  assert.equal(selectAnalysisData(data, records, "missing", first.periodId), undefined);
  assert.equal(selectAnalysisData(data, records, first.equipmentId, "missing"), undefined);
  assert.equal(selectAnalysisData(data, [], first.equipmentId, first.periodId), undefined);
});

test("serial filtering separates multiple products, retains settings, averages rates and does not mutate inputs", () => {
  const first = {...records[0], productSerial:"PRODUCT-A"};
  const second = {...first, productSerial:"PRODUCT-B", operatingRate:50, measurements:[{label:"18:00",temperature:60,cycleTime:99,productionCount:5}]};
  const source = [first, second];
  const before = JSON.stringify(source);
  const settings = {...data, histogram:{...data.histogram, visible:false, height:400, binCount:5}};
  const onlyB = selectAnalysisData(settings, source, first.equipmentId, first.periodId, " product-b ");
  assert.deepEqual(onlyB.histogram.samples,[99]);
  assert.equal(onlyB.gauge.value,50);
  assert.equal(onlyB.histogram.visible,false);
  assert.equal(onlyB.histogram.height,400);
  assert.equal(onlyB.histogram.binCount,5);
  const all = selectAnalysisData(settings, source, first.equipmentId, first.periodId);
  assert.equal(all.gauge.value,(first.operatingRate+50)/2);
  assert.equal(all.boxplot.groups.length,2);
  assert.equal(all.area.series[0].values.at(-1),0);
  assert.equal(all.area.series[1].values.at(-1),5);
  assert.equal(selectAnalysisData(settings, source, first.equipmentId, first.periodId, "missing"),undefined);
  assert.equal(selectAnalysisData(settings,[{...first,measurements:[]}],first.equipmentId,first.periodId),undefined);
  assert.equal(JSON.stringify(source),before);
});
