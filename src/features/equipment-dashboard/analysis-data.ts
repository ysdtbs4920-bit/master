/**
 * 検索条件に合う測定記録を選び、追加6種類へ渡すデータに変換します。
 * settingsはタイトル・表示有無などの設定、recordsは設備・期間・シリアル別の実際の値です。
 * 条件に合わない記録や空の記録は使わず、データがなければundefinedを返します。
 */
import type { AnalysisChartsData } from "@/components/charts/types";
import type { AnalysisRecord } from "./types";

export function selectAnalysisData(
  settings: AnalysisChartsData,
  records: AnalysisRecord[],
  equipmentId: string,
  periodId: string,
  serialQuery = "",
): AnalysisChartsData | undefined {
  const query = serialQuery.trim().toLocaleLowerCase();
  const matched = records.filter((record) => record.equipmentId === equipmentId && record.periodId === periodId &&
    (!query || record.productSerial.toLocaleLowerCase().includes(query))).map((record) => ({
      ...record,
      measurements: record.measurements.filter((item) => Number.isFinite(item.temperature) && Number.isFinite(item.cycleTime) && Number.isFinite(item.productionCount)),
    })).filter((record) => record.measurements.length > 0);
  if (!matched.length) return undefined;

  // 同じ時刻の測定を横軸にそろえます。データがない時刻の生産数は0として扱います。
  const labels = [...new Set(matched.flatMap((record) => record.measurements.map((item) => item.label)))];
  const samples = matched.flatMap((record) => record.measurements.map((item) => item.cycleTime));
  const indicators = ["operatingRate", "quality", "productivity", "maintenance", "energySaving"] as const;
  return {
    scatter: { ...settings.scatter, xLabel: "温度 (℃)", yLabel: "サイクル時間 (秒)",
      series: matched.map((record) => ({ name: record.productSerial, points: record.measurements.map((item) => ({ x: item.temperature, y: item.cycleTime })) })),
    },
    histogram: { ...settings.histogram, unit: "秒", samples },
    boxplot: { ...settings.boxplot, unit: "秒", groups: matched.map((record) => ({ name: record.productSerial, samples: record.measurements.map((item) => item.cycleTime) })) },
    area: { ...settings.area, unit: "個", labels, series: matched.map((record) => ({
      name: record.productSerial,
      values: labels.map((label) => record.measurements.filter((item) => item.label === label).reduce((sum, item) => sum + item.productionCount, 0)),
    })) },
    radar: { ...settings.radar,
      indicators: [{ name: "稼働率", max: 100 }, { name: "品質", max: 100 }, { name: "生産性", max: 100 }, { name: "保全", max: 100 }, { name: "省エネ", max: 100 }],
      series: matched.map((record) => ({ name: record.productSerial, values: indicators.map((key) => record[key]) })),
    },
    // 複数のシリアルが一致した場合は、その記録の稼働率の算術平均を表示します。
    gauge: { ...settings.gauge, name: "稼働率", unit: "%", min: 0, max: 100,
      value: Math.round(matched.reduce((sum, record) => sum + record.operatingRate, 0) / matched.length * 10) / 10,
    },
  };
}
