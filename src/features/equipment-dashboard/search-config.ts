import searchJson from "@/config/search-config.json";
import type { SelectOption } from "@/components/dashboard/types";

export type SearchField = {
  id: string;
  label: string;
  type: "select" | "text";
  source?: "equipment" | "period" | "metric";
  equipmentField?: "id" | "name" | "status" | "factoryName" | "lineName" | "productSerial";
  options?: SelectOption[];
  defaultValue?: string;
  placeholder?: string;
  visible?: boolean;
  width?: number;
};

export type SearchConfig = { fields: SearchField[] };

// JSONの設定ミスを画面表示前に検出します。
export function parseSearchConfig(input: unknown): SearchConfig {
  if (!input || typeof input !== "object" || !("fields" in input) || !Array.isArray(input.fields)) {
    throw new Error("検索設定: fields は配列で指定してください。");
  }
  const ids = new Set<string>();
  const sources = new Set<string>();
  for (const field of input.fields) {
    if (!field || typeof field !== "object" || typeof field.id !== "string" || !field.id ||
        typeof field.label !== "string" || !["select", "text"].includes(field.type)) {
      throw new Error("検索設定: 各項目に id・label・type (select/text) が必要です。");
    }
    if (ids.has(field.id)) throw new Error(`検索設定: id が重複しています (${field.id})。`);
    ids.add(field.id);
    if (field.source !== undefined) {
      if (!["equipment", "period", "metric"].includes(field.source) || field.type !== "select" || sources.has(field.source)) {
        throw new Error(`検索設定: source は重複しない equipment/period/metric の select にしてください (${field.id})。`);
      }
      sources.add(field.source);
    }
    if (field.equipmentField !== undefined && !["id", "name", "status", "factoryName", "lineName", "productSerial"].includes(field.equipmentField)) {
      throw new Error(`検索設定: equipmentField は id/name/status/factoryName/lineName/productSerial にしてください (${field.id})。`);
    }
    if ((field.source === undefined) === (field.equipmentField === undefined)) {
      throw new Error(`検索設定: source または equipmentField のどちらかを指定してください (${field.id})。`);
    }
    if (field.options !== undefined && (!Array.isArray(field.options) || field.type !== "select" ||
        field.options.some((option: SelectOption) => !option || typeof option.value !== "string" || !option.value || typeof option.label !== "string") ||
        new Set(field.options.map((option: SelectOption) => option.value)).size !== field.options.length)) {
      throw new Error(`検索設定: options に重複のない空でない value と label を指定してください (${field.id})。`);
    }
    for (const key of ["defaultValue", "placeholder"] as const) {
      if (field[key] !== undefined && typeof field[key] !== "string") throw new Error(`検索設定: ${key} は文字列です (${field.id})。`);
    }
    if ((field.visible !== undefined && typeof field.visible !== "boolean") ||
        (field.width !== undefined && (typeof field.width !== "number" || !Number.isFinite(field.width) || field.width <= 0))) {
      throw new Error(`検索設定: visible は真偽値、width は正の数で指定してください (${field.id})。`);
    }
  }
  return input as SearchConfig;
}

export const searchConfig = parseSearchConfig(searchJson);
