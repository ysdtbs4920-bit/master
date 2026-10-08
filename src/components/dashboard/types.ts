/**
 * 数値カードと選択欄で共通に使うデータの型です。
 * KpiItemはカード1枚、SelectOptionは選択肢1個の形です。
 * valueは処理用の値、labelは表示名。設備以外の画面でも使えます。
 */

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
