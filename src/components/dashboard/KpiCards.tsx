/**
 * KPI（稼働率や生産数などの主要な数値）をカードで表示します。
 * data配列を順に表示し、数値は日本語形式の桁区切りにします。
 * grid-colsの数字は横並び数。smやlgは画面幅に応じた切り替えを表します。
 */

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { KpiItem } from "./types";

type KpiCardsProps = {
  data: KpiItem[];
};

export function KpiCards({ data }: KpiCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {data.map((item) => (
        <Card key={item.id}>
          <CardHeader className="pb-2">
            <CardDescription>{item.label}</CardDescription>
            <CardTitle className="text-3xl">
              {typeof item.value === "number"
                ? item.value.toLocaleString("ja-JP", {
                    maximumFractionDigits: 20,
                  })
                : item.value}
              {item.unit}
            </CardTitle>
          </CardHeader>
          {item.description && (
            <CardContent>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </CardContent>
          )}
        </Card>
      ))}
    </div>
  );
}
