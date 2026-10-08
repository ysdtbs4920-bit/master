/** ライト／ダークモードに応じた共通のグラフ色。 */
export function getChartColors(darkMode: boolean) {
  return {
    primary: darkMode ? "#60a5fa" : "#001472",
    alarm: darkMode ? "#fb7185" : "#FA0C3C",
    secondary: darkMode ? "#64748b" : "#808cB8",
    waiting: darkMode ? "#e1f530" : "#d8a23e",
  };
}
