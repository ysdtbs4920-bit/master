# 初心者向け：ファイルの役割と変更する場所

ソースファイルの先頭に役割・入力・変更する場所のコメントを追加しています。このガイドでは、コメントを直接書けないJSONや画像も説明します。説明は開発者用で、アプリ画面には表示されません。

## 最初に知っておく言葉

- コンポーネント：画面を作る部品。`<AnalysisCharts />` のように組み合わせます。
- props：親の部品から子の部品へ渡す設定やデータ。`data`・`height`などです。
- state：入力内容など、画面が覚えておく値。`useState`で保存し、更新すると再表示します。
- 型：データの設計図。`string`は文字、`number`は数値、`boolean`は真偽、`[]`は配列、`?`は省略可です。型だけでは実行時のJSON検証になりません。
- `map`：配列の各項目を別の形へ変換。`filter`：条件に合う項目を残す。`find`：合う1件を探す。
- `??`：左側がnullやundefinedなら右側を使う。`?.`：対象がない場合に読み取りを中断します。
- `className`：見た目のCSSクラス。`grid`は格子配置、`gap-4`は間隔、`lg:grid-cols-3`は幅1024px以上で3列です。
- import：他のファイルを読み込む。export：他のファイルから利用できるよう公開する。`@/`は`src/`の略です。

## 画面が表示される流れ

1. `index.html` が `src/main.tsx` を読み込みます。
2. `main.tsx` がテーマを準備し、`App.tsx` を表示します。
3. `App.tsx` が `pages.ts` と `use-page.ts` で表示する画面を選びます。
4. `AppShell.tsx` が共通の外枠、`EquipmentDashboard.tsx` などが本文を表示します。
5. 各画面がJSONの値をカードやグラフへ渡します。

## JSONの設定ファイル

JSONにはコメントを書けません。文字は二重引用符で囲み、最後の項目の後ろにカンマを付けないでください。`true`・`false`や数値は引用符なしで書きます。次の各パスはプロジェクトのルートから見た場所です。

| ファイル | 役割・主な項目 |
| --- | --- |
| `src/config/app-config.json` | `id`はアプリ識別名、`title`はアプリ名、`description`は説明、`badge`は短いラベル、`footer`は下部の文章、`language`は表示言語。 |
| `src/config/search-config.json` | `fields`が検索項目の配列。`id`は重複しない識別名、`label`は表示名、`type`はselect/text、`source`はequipment/period/metric、`equipmentField`は絞り込む設備属性。`options`は候補、`defaultValue`は初期値、`placeholder`は入力例や全件選択の表示名、`visible`は表示有無、`width`は横幅px。 |
| `src/data/dashboard-data.json` | `equipment`が設備一覧。`id`・`name`・`status`・`factoryName`・`lineName`・`productSerial`を持ちます。`kpis`内のoperatingRateは稼働率、productionCountは生産数、abnormalCountは異常件数、averageCycleは平均サイクルです。 |
| `src/data/chart-data.json` | `trend.timeLabels`は波形の横軸、`trend.periods`は期間の候補。`trend.metrics`のキーは特性値IDで、labelは名前、unitは単位、upperLimitは上限参考値、valuesは期間IDごとの波形配列。`production`は日別のnormal/defective、`equipmentStatus`はrunning/stopped/waitingの量です。 |
| `src/data/analysis-chart-data.json` | 追加6種類の値。各グラフのtitleは名前、visibleは表示有無、heightは高さpxです。詳しいデータの形は下の表を参照してください。 |
| `src/data/starter-data.json` | `title`と`description`が画面の見出し、`sections`がカードの配列。各カードはid・title・bodyを持ちます。 |
| `package.json` | アプリ名、必要なライブラリ、実行コマンド。scriptsのdevは起動、buildは公開用ビルド、lintはコード検査、testは自動テスト、checkは一括確認です。 |
| `package-lock.json` | インストールするライブラリのバージョンを固定するnpmの生成ファイル。直接書き換えず、npmのコマンドで更新します。 |
| `components.json` | shadcnの部品を追加するための設定。styleはスタイル、aliasesは配置先の略記、tailwindはCSS設定です。 |
| `tsconfig.json` | TypeScriptの設定の入口。referencesでアプリ用と設定ファイル用を分けます。 |
| `tsconfig.app.json` | srcの型チェック。strictは厳しい検査、pathsは@の略記、includeは対象、noEmitはJS出力をしない指定です。 |
| `tsconfig.node.json` | Vite設定など、Node.js側で使うTypeScriptの検査設定です。 |

### 追加グラフのJSON

| キー | 値の書き方 |
| --- | --- |
| `scatter` | xLabel/yLabelは軸の名前。series内のpointsに `{ "x": 60, "y": 12.4 }` のように点を書きます。 |
| `histogram` | samplesに測定値の配列、binCountに区間数、unitに単位を書きます。 |
| `boxplot` | groupsにnameとsamplesを持つグループを並べます。四分位数や外れ値は自動計算します。 |
| `area` | labelsに横軸、seriesにnameとvalues。stackedをtrueにすると積み上げます。 |
| `radar` | indicatorsにnameとmax、seriesにnameとvalues。valuesの順序と件数をindicatorsに合わせます。 |
| `gauge` | nameは指標名、valueは現在値、min/maxは範囲、unitは単位です。 |

## よく変更する場所

- グラフの横並び数：`src/components/charts/AnalysisCharts.tsx` の `lg:grid-cols-2`。既存2枚の並びは `EquipmentDashboard.tsx` にあります。
- 検索項目や表示名：`src/config/search-config.json`。
- 工場名・ライン名・設備名・シリアル：`src/data/dashboard-data.json`。
- グラフの値：既存グラフは `chart-data.json`、追加グラフは `analysis-chart-data.json`。
- グラフの色：`src/components/charts/chart-theme.ts`。
- アプリ全体の色：`src/index.css`。
- 画面の追加：`src/features/` に部品を作り、`src/app/pages.ts` に登録します。

検索条件は設備候補・一覧・KPIに反映します。追加6種類は選択設備・期間・製品シリアルに一致する分析記録から作ります。期間選択は既存波形の切り替えです。

## ソース・スクリプト一覧

各ファイルの先頭コメントも合わせて読んでください。

| ファイル | 役割 |
| --- | --- |
| [src/main.tsx](../src/main.tsx) | アプリを起動する入口。index.htmlのrootという場所にReactの画面を表示します。 |
| [src/App.tsx](../src/App.tsx) | URLに対応する画面を選び、共通のヘッダーやフッターと組み合わせます。 |
| [src/app/pages.ts](../src/app/pages.ts) | 画面の登録一覧。idはURLの識別名、labelはメニューの表示名です。 |
| [src/app/use-page.ts](../src/app/use-page.ts) | URLの#以降（例：#/dashboard）から現在の画面IDを取り出します。 |
| [src/config/app-config.ts](../src/config/app-config.ts) | app-config.jsonを読み込み、アプリ共通の設定として公開します。 |
| [src/features/equipment-dashboard/EquipmentDashboard.tsx](../src/features/equipment-dashboard/EquipmentDashboard.tsx) | 設備監視画面全体。検索欄・KPI・グラフ・設備一覧を組み立てます。 |
| [src/features/equipment-dashboard/data.ts](../src/features/equipment-dashboard/data.ts) | 各JSONの読み込みを1か所にまとめ、画面に渡すデータを作ります。 |
| [src/features/equipment-dashboard/types.ts](../src/features/equipment-dashboard/types.ts) | 設備監視データの設計図。TypeScriptが項目名や値の種類を確認するために使います。 |
| [src/features/equipment-dashboard/search-config.ts](../src/features/equipment-dashboard/search-config.ts) | 検索欄の設定をJSONから読み込み、設定ミスがないか検証します。 |
| [src/features/starter/StarterPage.tsx](../src/features/starter/StarterPage.tsx) | JSONの文章をカードに表示するシンプルな画面例です。 |
| [src/features/starter/types.ts](../src/features/starter/types.ts) | サンプルページに渡すデータの形を定義します。 |
| [src/components/layout/AppShell.tsx](../src/components/layout/AppShell.tsx) | 全画面で共通の外枠。ヘッダー・画面メニュー・本文・フッターを表示します。 |
| [src/components/dashboard/DataSelect.tsx](../src/components/dashboard/DataSelect.tsx) | 見出し付きの選択欄。設備専用ではなく、任意の選択肢を渡せます。 |
| [src/components/dashboard/KpiCards.tsx](../src/components/dashboard/KpiCards.tsx) | KPI（稼働率や生産数などの主要な数値）をカードで表示します。 |
| [src/components/dashboard/types.ts](../src/components/dashboard/types.ts) | 数値カードと選択欄で共通に使うデータの型です。 |
| [src/components/charts/EChart.tsx](../src/components/charts/EChart.tsx) | すべてのグラフに共通する描画処理。EChartsというライブラリを使います。 |
| [src/components/charts/ChartCard.tsx](../src/components/charts/ChartCard.tsx) | グラフを囲むカード。見出し・任意の説明・中身を表示します。 |
| [src/components/charts/AnalysisCharts.tsx](../src/components/charts/AnalysisCharts.tsx) | 追加6種類のグラフをカードにまとめて並べます。 |
| [src/components/charts/LineChart.tsx](../src/components/charts/LineChart.tsx) | 時系列の値を折れ線で表示します。参考値の線も追加できます。 |
| [src/components/charts/StackedBarChart.tsx](../src/components/charts/StackedBarChart.tsx) | 同じ位置の値を積み上げた棒グラフ。正常品と不良品などの内訳に使います。 |
| [src/components/charts/DonutChart.tsx](../src/components/charts/DonutChart.tsx) | 項目ごとの割合を、中央に穴のある円グラフで表示します。 |
| [src/components/charts/chart-theme.ts](../src/components/charts/chart-theme.ts) | ライトモードとダークモードで使うグラフの色をまとめます。 |
| [src/components/charts/types.ts](../src/components/charts/types.ts) | 共通グラフが受け取るデータの形を定義します。 |
| [src/components/charts/statistics.ts](../src/components/charts/statistics.ts) | 測定値を、ヒストグラムや箱ひげ図で使う数値に集計します。 |
| [src/components/charts/analysis-options.ts](../src/components/charts/analysis-options.ts) | 追加6種類について、JSONの値をEChartsの表示設定に変換する関数群です。 |
| [src/lib/utils.ts](../src/lib/utils.ts) | CSSクラスを組み合わせるcn関数を外部ライブラリから公開します。 |
| [vite.config.ts](../vite.config.ts) | 開発サーバーと公開用ビルドを行うViteの設定です。 |
| [eslint.config.js](../eslint.config.js) | コードの書き方や問題を確認するESLintの設定です。 |
| [scripts/create-app.mjs](../scripts/create-app.mjs) | このマスターをコピーし、新しいアプリのフォルダーを作るスクリプトです。 |
| [scripts/create-app.test.mjs](../scripts/create-app.test.mjs) | アプリ複製スクリプトの自動テストです。テスト用の一時フォルダーで確認します。 |
| [scripts/analysis-charts.test.mjs](../scripts/analysis-charts.test.mjs) | 集計の正しさと、追加6種類が描画できることを確認する自動テストです。 |
| [src/components/charts/AreaChart.tsx](../src/components/charts/AreaChart.tsx) | 面グラフを表示する小さな部品です。 |
| [src/components/charts/ScatterChart.tsx](../src/components/charts/ScatterChart.tsx) | 散布図を表示する小さな部品です。 |
| [src/components/charts/HistogramChart.tsx](../src/components/charts/HistogramChart.tsx) | ヒストグラムを表示する小さな部品です。 |
| [src/components/charts/BoxPlotChart.tsx](../src/components/charts/BoxPlotChart.tsx) | 箱ひげ図を表示する小さな部品です。 |
| [src/components/charts/RadarChart.tsx](../src/components/charts/RadarChart.tsx) | レーダーチャートを表示する小さな部品です。 |
| [src/components/charts/GaugeChart.tsx](../src/components/charts/GaugeChart.tsx) | ゲージを表示する小さな部品です。 |
| [src/components/ui/badge.tsx](../src/components/ui/badge.tsx) | 状態や区分を短い文字で表示する小さなラベル。variantで見た目を切り替えます。 |
| [src/components/ui/button.tsx](../src/components/ui/button.tsx) | 共通ボタン。variantは色や枠、sizeは大きさ。asChildならリンクなどにボタンの見た目を付けます。 |
| [src/components/ui/card.tsx](../src/components/ui/card.tsx) | カードの枠・見出し・本文・フッターを分けた部品。組み合わせて使います。 |
| [src/components/ui/progress.tsx](../src/components/ui/progress.tsx) | 0～100の値をバーの長さで表示する部品。設備一覧の稼働率で使用します。 |
| [src/components/ui/select.tsx](../src/components/ui/select.tsx) | 選択欄の土台。Triggerが選択欄、Contentが候補一覧、Itemが候補1個です。 |
| [src/components/ui/table.tsx](../src/components/ui/table.tsx) | 表の土台。Headerが見出し、Bodyがデータ、Rowが行、Cellが1つのセルです。 |
| [src/components/ui/tabs.tsx](../src/components/ui/tabs.tsx) | タブによる切り替えの土台。TriggerとContentに同じvalueを付けて対応させます。 |
| [src/components/ui/theme-provider.tsx](../src/components/ui/theme-provider.tsx) | テーマ管理をアプリ全体に提供します。OS設定を初期値として、HTMLのclassで色を切り替えます。 |
| [src/components/ui/mode-toggle.tsx](../src/components/ui/mode-toggle.tsx) | ライトとダークを切り替えるボタン。useThemeから現在のテーマと変更関数を受け取ります。 |

## 画像・その他のファイル

- `public/favicon.svg`：ブラウザーのタブに表示するアイコン。
- `public/icons.svg`：複数のSVGアイコンをまとめた素材。
- `src/assets/hero.png`：画面などで利用できる画像素材。バイナリ画像なのでコメントは追記できません。
- `src/assets/react.svg`・`src/assets/vite.svg`：ReactとViteのロゴ素材。画像を表示する場合は部品から読み込みます。
- `.gitignore`：Gitに含めないファイルの指定。
- `README.md`：起動方法やJSON設定、アプリの複製方法をまとめた説明書。
- `dist/`：ビルド結果。直接編集せず、srcを変更して再ビルドします。
- `node_modules/`：インストールした外部ライブラリ。直接編集せず、package.jsonとnpmで管理します。

## 変更後の確認

PowerShellでプロジェクトのフォルダーに移動し、`npm.cmd run check` でLint・型チェック・ビルド・テストを確認します。起動は `npm.cmd run dev`。開発中のJSON変更は保存後に反映され、公開用には再ビルドが必要です。

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
