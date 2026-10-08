/**
 * 画面の登録一覧。idはURLの識別名、labelはメニューの表示名です。
 * componentは表示するReact部品。lazyで必要になったときに読み込みます。
 * 画面を増やすときはappPagesに追加します。配列の先頭が既定の画面です。
 */

import { lazy } from "react";
import type { ComponentType } from "react";

export type AppPage = {
  id: string;
  label: string;
  component: ComponentType;
};

/** 画面を追加するときは、コンポーネントをこの配列へ登録する。 */
export const appPages: AppPage[] = [
  {
    id: "dashboard",
    label: "設備監視デモ",
    component: lazy(() =>
      import("@/features/equipment-dashboard/EquipmentDashboard").then(
        (module) => ({ default: module.EquipmentDashboard })
      )
    ),
  },
  {
    id: "starter",
    label: "サンプルページ",
    component: lazy(() =>
      import("@/features/starter/StarterPage").then((module) => ({
        default: module.StarterPage,
      }))
    ),
  },
];
