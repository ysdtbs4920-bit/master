/** 等幅の区間。最後の区間のみ右端を含みます。 */
export function buildHistogram(samples: number[], requestedBins = 10) {
  const values = samples.filter(Number.isFinite);
  if (!values.length) return [];
  let min = Infinity;
  let max = -Infinity;
  for (const value of values) { min = Math.min(min, value); max = Math.max(max, value); }
  if (min === max) return [{ lower: min, upper: max, count: values.length }];
  const binCount = Number.isFinite(requestedBins) ? Math.max(1, Math.min(100, Math.floor(requestedBins))) : 10;
  const width = (max - min) / binCount;
  const bins = Array.from({ length: binCount }, (_, index) => ({
    lower: min + index * width, upper: index === binCount - 1 ? max : min + (index + 1) * width, count: 0,
  }));
  for (const value of values) {
    const bin = bins[Math.min(binCount - 1, Math.floor((value - min) / width))];
    if (bin) bin.count += 1;
  }
  return bins;
}

/** 線形補間した四分位数と1.5 IQRによるひげ・外れ値。 */
export function summarizeBoxPlot(samples: number[]) {
  const values = samples.filter(Number.isFinite).sort((a, b) => a - b);
  if (!values.length) return undefined;
  const quantile = (fraction: number) => {
    const position = (values.length - 1) * fraction;
    const index = Math.floor(position);
    const lower = values[index]!;
    return lower + ((values[index + 1] ?? lower) - lower) * (position - index);
  };
  const q1 = quantile(0.25), median = quantile(0.5), q3 = quantile(0.75);
  const iqr = q3 - q1;
  const inliers = values.filter((value) => value >= q1 - 1.5 * iqr && value <= q3 + 1.5 * iqr);
  const summary = [inliers[0]!, q1, median, q3, inliers.at(-1)!];
  return { summary, outliers: values.filter((value) => value < q1 - 1.5 * iqr || value > q3 + 1.5 * iqr) };
}
