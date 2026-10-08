/** 表示する項目をJSONで定義できる汎用KPI。 */
export type KpiItem = {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  description?: string;
};

export type SelectOption = {
  value: string;
  label: string;
};
