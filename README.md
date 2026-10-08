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

型は `src/components/dashboard/types.ts` と `src/components/charts/types.ts` にあります。新しいグラフ種類やECharts機能を使う場合は、`EChart.tsx` の `echarts/core` への登録を追加します。現在は折れ線・棒・円・散布図・箱ひげ図・レーダー・ゲージと、凡例・ツールチップ・ズーム・画像保存など必要な機能だけを読み込みます。

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

## 検索欄をJSONで設定する

`src/config/search-config.json` の `fields` を編集します。配列の順序が画面の順序になります。項目名は `label`、表示有無は `visible`（省略すると表示）、横幅は `width`（px）、初期値は `defaultValue` で変更できます。`id` は重複しない名前を指定してください。

```json
{
  "fields": [
    { "id": "name", "label": "設備名を検索", "type": "text", "equipmentField": "name", "placeholder": "設備名の一部を入力", "width": 256 },
    { "id": "status", "label": "状態", "type": "select", "equipmentField": "status", "placeholder": "すべての状態" },
    { "id": "equipment", "label": "対象設備", "type": "select", "source": "equipment", "width": 256 },
    { "id": "period", "label": "期間", "type": "select", "source": "period", "defaultValue": "today" },
    { "id": "metric", "label": "特性値", "type": "select", "source": "metric" }
  ]
}
```

`source` は `equipment`・`period`・`metric` から指定し、同じsourceは1回まで使用できます。選択肢は既存のデータJSONから生成します。`options: [{ "value": "実際のID", "label": "表示名" }]` を指定すると、選択肢の表示名・順序・対象を変更できます。データに存在しないIDは表示されません。初期値が候補にない場合は先頭の候補を使用します。

設備の絞り込み項目は `source` の代わりに `equipmentField` を指定します。対象は `id`・`name`・`status`・`factoryName`・`lineName`・`productSerial`。`text` は大文字小文字を区別しない部分一致、`select` は完全一致で、複数条件はAND検索です。selectの選択肢は設備データから自動生成され、`options` で明示的にも指定できます。空欄または「すべて」で絞り込みを解除します。絞り込みは対象設備の候補、設備一覧、選択設備のKPIに反映します。グラフのサンプル値は引き続き設備共通です。

項目を削除するか `visible: false` にすると非表示になります。非表示の絞り込み条件は適用しません。source項目を削除した場合はデータの先頭を使います。新しいデータ属性や独自の検索処理を追加する場合はTypeScript側の拡張が必要です。

開発中は保存すると反映されます。公開用ビルドではJSON変更後に再ビルドしてください。

### 工場・ライン・設備・期間・製品シリアルで検索する

現在の検索欄は「工場名」「ライン名」「設備名」「期間」「製品シリアル」の順です。工場名・ライン名は設備データの候補から選択し、設備名は絞り込んだ設備から選択します。製品シリアルは部分一致検索です。工場名・ライン名の「すべて」、製品シリアルの空欄で条件を解除します。

`src/data/dashboard-data.json` の各設備に `factoryName`（工場名）、`lineName`（ライン名）、`productSerial`（製品シリアル）を設定します。追加した値はデモ用のサンプルです。これらの属性を省略した設備は空文字として扱います。追加グラフではanalysis-records.jsonの記録を使い、複数シリアルと期間の組み合わせにも対応します。期間は保存済みの波形・分析記録の切り替えに使います。

## 追加グラフを設定する

「グラフ分析」タブに散布図・ヒストグラム・箱ひげ図・面グラフ・レーダーチャート・ゲージを追加しています。`src/data/analysis-chart-data.json` を編集して値を変更します。各グラフの `title` はカード名、`visible: false` は非表示、`height` は高さ（px、既定320）です。追加グラフは検索条件に一致する `analysis-records.json` の記録から作ります。

| キー / 共通部品 | JSONで設定するデータ |
| --- | --- |
| `scatter` / `ScatterChart` | `xLabel`・`yLabel`、`series: [{ name, points: [{ x, y }], color? }]` |
| `histogram` / `HistogramChart` | `samples: number[]`、`binCount`（1～100、既定10）、`unit` |
| `boxplot` / `BoxPlotChart` | `groups: [{ name, samples: number[] }]`、`unit` |
| `area` / `AreaChart` | `labels`、`series: [{ name, values: number[], color? }]`、`unit`、`stacked` |
| `radar` / `RadarChart` | `indicators: [{ name, max }]`、`series: [{ name, values: number[], color? }]` |
| `gauge` / `GaugeChart` | `name`、`value`、`min`（既定0）、`max`（既定100）、`unit` |

面グラフのvaluesはlabelsの件数・順序、レーダーのvaluesはindicatorsの件数・順序に合わせます。レーダーのmaxは正の数、ゲージのmaxはminより大きい数を指定してください。

ヒストグラムは等幅区間で集計します。区間の右端は最後の区間のみ含みます。同じ値だけの場合は1区間になります。箱ひげ図は線形補間で四分位数を計算し、1.5 IQR内の最小・最大値をひげとして、その外側を外れ値の点で表示します。空のグループは表示せず、有限数でない測定値は集計から除外します。

追加部品も `data`・`darkMode`・`height` propsで個別利用できます。データ型は `src/components/charts/types.ts` にあります。`EquipmentDashboard` に独自のdataを渡す場合、追加グラフを表示するには `charts.analysis` を設定してください。

## 初心者向けのファイル説明

各ソースファイルの先頭に、役割・データの流れ・変更する場所の説明を追加しています。[ファイル説明](docs/beginner-guide.md)には、全ファイルの役割、JSON項目、よく変更する場所と用語をまとめています。

## 検索に連動する追加グラフ

`src/data/analysis-records.json` に設備・期間・製品シリアル別の測定記録を保存します。追加した記録はデモ用サンプルです。工場・ラインで設備候補を絞り、その中で選択した設備と期間に一致する記録を表示します。製品シリアルは記録内のシリアルを検索するので、設備に複数のシリアルがあっても対応できます。

- `equipmentId`：dashboard-data.jsonの設備IDと一致させます。
- `periodId`：chart-data.jsonの期間ID（today/week/monthなど）と一致させます。日付範囲の自動計算ではなく、期間ごとに保存済みの記録を選びます。
- `productSerial`：製品シリアル。文字検索は部分一致、選択式は完全一致です。
- `measurements`：label（時刻など）、temperature（℃）、cycleTime（秒）、productionCount（個）の配列。
- `operatingRate`・`quality`・`productivity`・`maintenance`・`energySaving`：0～100の指標。

散布図は温度とサイクル時間、ヒストグラムはサイクル時間、箱ひげ図はシリアル別のサイクル時間、面グラフは時刻別の生産数、レーダーは5つの指標、ゲージは一致した記録の稼働率の算術平均です。データがない場合は空状態を表示します。

`analysis-chart-data.json` はタイトル・visible・height・ヒストグラムのbinCount・面グラフのstackedなどの表示設定として引き続き使用します。追加グラフの測定値はanalysis-records.jsonで変更してください。単体のグラフ部品では、これまでのデータ形式も引き続き利用できます。

`src/features/equipment-dashboard/analysis-data.ts` が検索結果を6種類のグラフデータへ変換する処理です。独自のdata propsでは `charts.analysis` に表示設定、`charts.analysisRecords` に記録を渡します。記録がない場合に固定サンプルへ戻す処理はありません。
