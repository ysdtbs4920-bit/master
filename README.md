# 汎用アプリケーションテンプレート

React・TypeScript・shadcn/ui を使った、業務アプリ開発のマスターです。共通レイアウト、テーマ、画面切り替え、JSONで値を渡せる部品を備えています。設備監視デモとグラフを使わないサンプルページを、開発例として同梱しています。

## 起動する

Node.js は20.19以上の20系、22.13以上の22系、または24以上が必要です。npmを使用します。

```sh
cd my-app
npm ci
npm run dev
```

ターミナルに表示されたURLを開きます。通常は `http://localhost:5173` です。PowerShellでnpmの実行が制限される場合は `npm.cmd` を使用してください。

## マスターから新しいアプリを作る

`my-app` で以下を実行します。

```sh
npm run create-app -- inventory-app
cd ../inventory-app
npm ci
npm run dev
```

既定ではマスターの隣に `Master/inventory-app` を新規作成します。作成後は派生先で開発し、マスターは次のアプリを作るために残してください。

コピー先を指定する場合は、第2引数へ相対パスまたは絶対パスを渡します。相対パスは実行時のディレクトリを基準にします。

```sh
npm run create-app -- inventory-app ../applications/inventory-app
```

アプリ名は英小文字で始まる英小文字・数字・ハイフン、214文字以内です。Windowsの予約名は使用できません。作成時に `package.json`、`package-lock.json`、アプリ設定の `id`・`title`、HTMLのタイトルを更新します。

既存のコピー先と、マスター自身・その内部・親ディレクトリは指定できません。ソース、公開アセット、スクリプト、説明文、ビルド設定をコピーし、`node_modules`、`dist`、`.git`、`.env`・`.env.*`、`.vscode`などのローカル設定、リンクは除外します。

コピー途中にI/Oエラーが起きた場合は、作成途中のディレクトリのパスを表示して残します。その内容を確認し、別のコピー先で再実行できます。

## 最初に変更する場所

1. `src/config/app-config.json` でアプリ名・説明・表示言語を設定する。
2. `src/data/starter-data.json` を編集して、グラフを使わない画面を試す。
3. `src/features/` に業務用の画面を作り、`src/app/pages.ts` に登録する。
4. 必要なJSON・データ型・UIを追加し、不要なサンプル画面の登録を外す。
5. `public/favicon.svg` と `src/index.css` の配色を調整し、`npm run check` を実行する。

### アプリ設定

`src/config/app-config.json` を編集します。

```json
{
  "id": "inventory-app",
  "title": "在庫管理",
  "description": "商品の在庫と入出庫を管理します",
  "badge": "",
  "footer": "在庫管理アプリ",
  "language": "ja"
}
```

`title` は共通ヘッダーとブラウザーのタイトル、`language` はHTMLの `lang` に反映します。`description`・`badge`・`footer` は共通レイアウトに表示し、空文字なら省略します。

テーマは `next-themes` で管理し、初期状態はOS設定に従います。選択は `localStorage` の `${id}:theme` に保存するため、アプリごとに異なる `id` を設定してください。

## 画面を追加・差し替えする

`App.tsx` は共通レイアウトの `AppShell` と、登録された画面を組み立てます。各画面の表示・状態・業務処理は `src/features/` に置きます。

画面一覧は `src/app/pages.ts` の `appPages` で定義します。`#/dashboard` は設備監視デモ、`#/starter` はサンプルページです。URLで画面を選び、ブラウザーの戻る・進むに追従します。空または不明な画面IDは配列の先頭を表示します。

グラフを使わない `StarterPage` は `src/data/starter-data.json` の `title`、`description`、`sections` をカードに表示します。`sections` の各項目は `id`、`title`、`body` を持ちます。文章やカードを変更するだけなら、このJSONを編集してください。

例えば、在庫管理画面を作る場合は `src/features/inventory/InventoryPage.tsx` を追加します。

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function InventoryPage() {
  return (
    <Card>
      <CardHeader><CardTitle>商品在庫</CardTitle></CardHeader>
      <CardContent>この画面に商品一覧や入力フォームを追加します。</CardContent>
    </Card>
  );
}
```

次に `appPages` へ以下を追加します。`lazy` は同ファイルでインポート済みです。画面は選択されたときに読み込みます。

```tsx
{
  id: "inventory",
  label: "商品在庫",
  component: lazy(() =>
    import("@/features/inventory/InventoryPage").then((module) => ({
      default: module.InventoryPage,
    }))
  ),
},
```

これでナビゲーションと `#/inventory` が利用できます。最初に表示したい画面を配列の先頭に置いてください。JSONを使う画面は `StarterPage` の型付き読み込みと `data` propsの実装を参考にできます。

## JSONと共通部品を使う

共通部品は設備専用のフィールドを要求せず、JSONとして保存・通信できるオブジェクトや配列を受け取ります。JSON文字列は呼び出し側で解析してください。

| 部品 | 受け渡す値 |
| --- | --- |
| `KpiCards` | `data: { id, label, value, unit?, description? }[]`。値は数値または文字列 |
| `DataSelect` | `options: { value, label }[]`、`label`、`value`、`onValueChange` |
| `LineChart` | `data: { labels, series, unit?, referenceLine? }` |
| `StackedBarChart` | `data: { labels, series, unit?, stack? }` |
| `DonutChart` | `data: { name?, items: { name, value, color? }[], unit? }` |
| `ChartCard` | `title`、任意の `description`、子要素にグラフなどを配置 |

折れ線・棒グラフの `series` は `{ name, values: number[], color? }[]` です。`labels` と各 `values` の順序・件数をそろえてください。`referenceLine` は `{ name, value, color? }` です。グラフには `darkMode` と、任意の `height` も渡せます。

売上画面なら、次のようなJSONを `src/data/sales-data.json` に保存できます。

```json
{
  "kpis": [
    { "id": "sales", "label": "売上", "value": 120000, "unit": "円" },
    { "id": "orders", "label": "注文数", "value": 24, "unit": "件" }
  ],
  "trend": {
    "labels": ["月", "火", "水"],
    "series": [{ "name": "売上", "values": [40000, 35000, 45000] }],
    "unit": "円"
  }
}
```

画面側から以下のように渡します。

```tsx
import { useTheme } from "next-themes";
import { ChartCard } from "@/components/charts/ChartCard";
import { LineChart } from "@/components/charts/LineChart";
import { KpiCards } from "@/components/dashboard/KpiCards";
import salesData from "@/data/sales-data.json";

export function SalesSummary() {
  const { resolvedTheme } = useTheme();
  return (
    <div className="space-y-4">
      <KpiCards data={salesData.kpis} />
      <ChartCard title="売上の推移">
        <LineChart data={salesData.trend} darkMode={resolvedTheme === "dark"} />
      </ChartCard>
    </div>
  );
}
```

型は `src/components/dashboard/types.ts` と `src/components/charts/types.ts` にあります。新しいグラフ種類やECharts機能を使う場合は、`EChart.tsx` の `echarts/core` への登録を追加します。現在は折れ線・棒・円グラフと、凡例・ツールチップ・ズーム・画像保存など必要な機能だけを読み込みます。

## 設備監視デモのデータ

設備固有の表示・状態・共通部品へのデータ変換は `src/features/equipment-dashboard/` に隔離しています。`data.ts` がJSON読み込みの境界、`types.ts` がそのデータ型です。

| JSON | 内容 |
| --- | --- |
| `src/data/dashboard-data.json` | `equipment` 配列に設備ID・名称・状態と4種類のKPI |
| `src/data/chart-data.json` | 波形、期間・指標の定義、日別生産実績、設備状態の割合 |

既存の設備・KPI・波形・生産実績・設備状態のサンプル値は維持しています。`EquipmentDashboard` は任意の `data` propsも受け取れます。

```tsx
<EquipmentDashboard data={{ dashboard: dashboardData, charts: chartData }} />
```

波形は `trend.timeLabels`、`trend.metrics[指標ID]` の `label`・`unit`・`upperLimit`・`values[期間ID]` で定義します。期間選択肢は `trend.periods` の `{ id, label }` 配列です。

- 指標を増やす場合は `trend.metrics` に新しいキーを追加し、各期間の値を設定します。
- 期間を増やす場合は `trend.periods` に追加し、全指標の `values` に同じ期間IDの配列を追加します。
- 各波形配列の件数を `trend.timeLabels` に合わせます。選択肢はJSONから生成します。

デモは静的JSONを使用し、実API、認証、DBとの接続は実装していません。波形・棒・ドーナツのサンプル値は設備共通で、期間選択は保存済み波形の切り替えです。外部データを扱う場合は、各featureの読み込み境界で取得・検証し、部品へ渡してください。

## コマンドと構成

| コマンド | 用途 |
| --- | --- |
| `npm run dev` | 開発サーバー |
| `npm run build` | TypeScriptの型チェックと `dist/` へのビルド |
| `npm run lint` | ESLint |
| `npm run preview` | ビルド結果のローカル確認 |
| `npm test` | 複製スクリプトのテスト |
| `npm run check` | Lint・ビルド・テストを順に実行 |
| `npm run create-app -- <名前> [コピー先]` | 新しいアプリを複製 |

TypeScriptは `strict` と `noUncheckedIndexedAccess` を有効にしています。`@/` は `src/` のエイリアスです。

```text
src/
  app/                         # 画面登録、URLとの同期
  config/                      # アプリ設定
  components/
    layout/                    # 共通レイアウト
    ui/                        # shadcn/ui、テーマ
    dashboard/                 # 汎用KPI・選択部品
    charts/                    # 汎用グラフと描画処理
  features/
    equipment-dashboard/       # 設備監視デモ
    starter/                   # グラフを使わない画面例
  data/                        # 各画面のサンプルJSON
  App.tsx                      # レイアウトと画面の組み立て
  main.tsx                     # 起動・テーマ・タイトル・言語
  index.css                    # Tailwind CSSと配色
scripts/                       # 複製スクリプトとテスト
public/                        # faviconなど
```

使用技術はReact 19、TypeScript 6、Vite 8、Tailwind CSS 4、shadcn/ui・Radix UI、next-themes、Apache ECharts、Lucide React、ESLintです。
