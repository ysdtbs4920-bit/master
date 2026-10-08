/**
 * ライトモードとダークモードで使うグラフの色をまとめます。
 * primaryは主要な系列、alarmは異常や外れ値などに使う色です。
 * 色を変更すると、この関数を使う複数のグラフに反映されます。
 */

/** ライト／ダークモードに応じた共通のグラフ色。 */
export function getChartColors(darkMode: boolean) {
  return {
    primary: darkMode ? "#60a5fa" : "#001472",
    alarm: darkMode ? "#fb7185" : "#FA0C3C",
    secondary: darkMode ? "#64748b" : "#808cB8",
    waiting: darkMode ? "#e1f530" : "#d8a23e",
  };
}
