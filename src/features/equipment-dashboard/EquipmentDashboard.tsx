import { useState } from "react";
import { useTheme } from "next-themes";

import { AnalysisCharts } from "@/components/charts/AnalysisCharts";
import { ChartCard } from "@/components/charts/ChartCard";
import { DonutChart } from "@/components/charts/DonutChart";
import { LineChart } from "@/components/charts/LineChart";
import { StackedBarChart } from "@/components/charts/StackedBarChart";
import { getChartColors } from "@/components/charts/chart-theme";
import { DataSelect } from "@/components/dashboard/DataSelect";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { equipmentDashboardData } from "./data";
import type { EquipmentDashboardData } from "./types";
import { searchConfig, type SearchField } from "./search-config";

type EquipmentDashboardProps = {
  data?: EquipmentDashboardData;
};

/** 設備固有の表示・データ変換をまとめた、交換可能なサンプル画面。 */
export function EquipmentDashboard({
  data = equipmentDashboardData,
}: EquipmentDashboardProps) {
  const { dashboard, charts } = data;
  const periods = charts.trend.periods;
  const metricOptions = Object.entries(charts.trend.metrics).map(
    ([id, item]) => ({ value: id, label: item.label }),
  );
  const fields = searchConfig.fields;
  const [searchValues, setSearchValues] = useState<Record<string, string>>({});
  const updateSearch = (id: string, value: string) =>
    setSearchValues((previous) => ({ ...previous, [id]: value }));
  const filterOptions = (field: SearchField) => field.options ?? Array.from(
    new Set(dashboard.equipment.map((item) => item[field.equipmentField!] ?? "")),
  ).filter(Boolean).map((value) => ({ value, label: value }));
  const filterValue = (field: SearchField) => {
    const value = searchValues[field.id] ?? field.defaultValue ?? "";
    return field.type === "text" || filterOptions(field).some((option) => option.value === value) ? value : "";
  };
  const equipmentList = dashboard.equipment.filter((item) => fields.every((field) => {
    if (!field.equipmentField || field.visible === false) return true;
    const value = filterValue(field);
    const actual = item[field.equipmentField] ?? "";
    return !value || (field.type === "text"
      ? actual.toLocaleLowerCase().includes(value.trim().toLocaleLowerCase())
      : actual === value);
  }));
  const sourceOptions = {
    equipment: equipmentList.map((item) => ({ value: item.id, label: item.name })),
    period: periods.map((item) => ({ value: item.id, label: item.label })),
    metric: metricOptions,
  };
  const optionsFor = (field: SearchField) => {
    if (!field.source) return filterOptions(field);
    const available = sourceOptions[field.source];
    return field.options ? field.options.filter((option) => available.some((item) => item.value === option.value)) : available;
  };
  const valueFor = (field: SearchField) => {
    if (!field.source) return filterValue(field);
    const options = optionsFor(field);
    const requested = searchValues[field.id] ?? field.defaultValue;
    return options.some((item) => item.value === requested) ? requested! : (options[0]?.value ?? "");
  };
  const sourceValue = (source: "equipment" | "period" | "metric") => {
    const field = fields.find((item) => item.source === source);
    return field ? valueFor(field) : (sourceOptions[source][0]?.value ?? "");
  };
  const selected = equipmentList.find((item) => item.id === sourceValue("equipment"));
  const selectedPeriod = periods.find((item) => item.id === sourceValue("period"));
  const selectedMetricId = sourceValue("metric");
  const { resolvedTheme } = useTheme();
  const darkMode = resolvedTheme === "dark";
  const colors = getChartColors(darkMode);

  const currentMetric = charts.trend.metrics[selectedMetricId];
  const values = selectedPeriod
    ? currentMetric?.values[selectedPeriod.id]
    : undefined;

  return (
    <section className="space-y-6" aria-labelledby="equipment-dashboard-title">
      <div>
        <h2
          id="equipment-dashboard-title"
          className="text-2xl font-bold tracking-tight"
        >
          設備監視ダッシュボード
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          設備の稼働状況と特性値を確認できます
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-wrap gap-4 pt-6">
          {fields.filter((field) => field.visible !== false).map((field) => (
            <div key={field.id} style={{ width: field.width ?? 192, maxWidth: "100%" }}>
              {field.type === "select" ? (
                <DataSelect
                  label={field.label}
                  options={field.equipmentField
                    ? [{ value: "__all__", label: field.placeholder ?? "すべて" }, ...optionsFor(field)]
                    : optionsFor(field)}
                  value={valueFor(field) || (field.equipmentField ? "__all__" : "")}
                  onValueChange={(value) => updateSearch(field.id, value === "__all__" ? "" : value)}
                  className="w-full"
                />
              ) : (
                <label className="block space-y-2 text-sm font-medium">
                  <span>{field.label}</span>
                  <input
                    type="text"
                    value={valueFor(field)}
                    onChange={(event) => updateSearch(field.id, event.target.value)}
                    placeholder={field.placeholder}
                    className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </label>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {selected ? (
        <KpiCards
          data={[
            {
              id: "operatingRate",
              label: "設備稼働率",
              value: selected.kpis.operatingRate,
              unit: "%",
              description: "選択設備",
            },
            {
              id: "productionCount",
              label: "生産数",
              value: selected.kpis.productionCount,
              description: "個 / 日",
            },
            {
              id: "abnormalCount",
              label: "異常件数",
              value: selected.kpis.abnormalCount,
              description: "件 / 日",
            },
            {
              id: "averageCycle",
              label: "平均サイクル",
              value: selected.kpis.averageCycle,
              description: "秒 / 個",
            },
          ]}
        />
      ) : (
        <p className="text-sm text-muted-foreground">
          表示できる設備がありません。
        </p>
      )}

      <Tabs defaultValue="charts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="charts">グラフ分析</TabsTrigger>
          <TabsTrigger value="equipment">設備一覧</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-4">
          <ChartCard
            title={
              selected && currentMetric
                ? `${selected.name} - ${currentMetric.label}トレンド`
                : "設備トレンド"
            }
            description="ズーム、凡例操作、画像保存を試せます"
          >
            {selected &&
            currentMetric &&
            values?.length &&
            charts.trend.timeLabels.length ? (
              <LineChart
                data={{
                  labels: charts.trend.timeLabels,
                  series: [
                    {
                      name: currentMetric.label,
                      values,
                      color: colors.primary,
                    },
                  ],
                  unit: currentMetric.unit,
                  referenceLine: {
                    name: "上限参考値",
                    value: currentMetric.upperLimit,
                    color: colors.alarm,
                  },
                }}
                darkMode={darkMode}
                height={360}
              />
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">
                表示できる波形データがありません。
              </p>
            )}
          </ChartCard>

          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard title="日別生産実績" description="積み上げ棒グラフ">
              <StackedBarChart
                data={{
                  labels: charts.production.map((item) => item.day),
                  series: [
                    {
                      name: "正常品",
                      values: charts.production.map((item) => item.normal),
                      color: colors.primary,
                    },
                    {
                      name: "不良品",
                      values: charts.production.map((item) => item.defective),
                      color: colors.alarm,
                    },
                  ],
                  stack: "production",
                }}
                darkMode={darkMode}
                height={300}
              />
            </ChartCard>

            <ChartCard title="設備状態の割合" description="ドーナツグラフ">
              <DonutChart
                data={{
                  name: "設備状態",
                  unit: "時間",
                  items: [
                    {
                      name: "稼働",
                      value: charts.equipmentStatus.running,
                      color: colors.primary,
                    },
                    {
                      name: "停止",
                      value: charts.equipmentStatus.stopped,
                      color: colors.secondary,
                    },
                    {
                      name: "待機",
                      value: charts.equipmentStatus.waiting,
                      color: colors.waiting,
                    },
                  ],
                }}
                darkMode={darkMode}
                height={300}
              />
            </ChartCard>
          </div>
          {charts.analysis && <AnalysisCharts data={charts.analysis} darkMode={darkMode} />}
        </TabsContent>

        <TabsContent value="equipment">
          <Card>
            <CardHeader>
              <CardTitle>設備一覧</CardTitle>
              <CardDescription>設備の状態と稼働率を確認できます</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>設備ID</TableHead>
                    <TableHead>設備名</TableHead>
                    <TableHead>状態</TableHead>
                    <TableHead>稼働率</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {equipmentList.length ? (
                    equipmentList.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.id}</TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.status === "稼働中" ? "default" : "destructive"
                            }
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex min-w-32 items-center gap-3">
                            <Progress value={item.kpis.operatingRate} />
                            <span className="text-sm">
                              {item.kpis.operatingRate}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-8 text-center text-muted-foreground"
                      >
                        表示できる設備がありません。
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </section>
  );
}
