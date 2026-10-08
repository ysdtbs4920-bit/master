import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import starterJson from "@/data/starter-data.json";
import type { StarterPageData } from "./types";

const starterData: StarterPageData = starterJson;

type StarterPageProps = {
  data?: StarterPageData;
};

/** グラフを使わない、JSONとカードだけの画面例。 */
export function StarterPage({ data = starterData }: StarterPageProps) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{data.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{data.description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {data.sections.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
