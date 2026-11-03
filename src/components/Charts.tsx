export interface Slice {
  label: string;
  value: number;
  color: string;
}

export function Donut({ title, slices }: { title: string; slices: Slice[] }) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <figure className="chart-card">
      <figcaption>{title}</figcaption>
      {total === 0 ? (
        <p className="muted">No data.</p>
      ) : (
        <div className="donut-layout">
          <svg viewBox="0 0 120 120" role="img" aria-label={title}>
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="var(--nebula-color-border-default)"
              strokeWidth="12"
            />
            {slices.map((slice) => {
              const length = (slice.value / total) * circumference;
              const dash = `${length} ${circumference - length}`;
              const element = (
                <circle
                  key={slice.label}
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth="12"
                  strokeDasharray={dash}
                  strokeDashoffset={-offset}
                  transform="rotate(-90 60 60)"
                />
              );
              offset += length;
              return element;
            })}
            <text
              x="60"
              y="64"
              textAnchor="middle"
              fill="var(--nebula-color-text-primary)"
              fontSize="16"
            >
              {total}
            </text>
          </svg>
          <ul className="legend">
            {slices.map((slice) => (
              <li key={slice.label}>
                <span className="legend-swatch" style={{ background: slice.color }} />
                <span>
                  {slice.label}
                </span>
                <span className="numeric">{slice.value}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </figure>
  );
}

export function BarChart({
  title,
  unit,
  rows,
}: {
  title: string;
  unit: string;
  rows: { id: string; label: string; value: number; color: string }[];
}) {
  const max = Math.max(...rows.map((row) => row.value), 1);
  return (
    <figure className="chart-card">
      <figcaption>{title}</figcaption>
      <div className="bar-chart">
        {rows.map((row) => (
          <div key={row.id} className="bar-row">
            <span className="bar-label" title={row.label}>
              {row.label}
            </span>
            <span className="bar-track">
              <span
                className="bar-fill"
                style={{ width: `${Math.max(2, (row.value / max) * 100)}%`, background: row.color }}
              />
            </span>
            <span className="bar-value numeric">
              {row.value.toLocaleString("en-US", { maximumFractionDigits: row.value >= 100 ? 0 : 1 })} {unit}
            </span>
          </div>
        ))}
      </div>
    </figure>
  );
}

export function Histogram({
  title,
  unit,
  values,
}: {
  title: string;
  unit: string;
  values: number[];
}) {
  const bins = binValues(values, 8);
  const max = Math.max(...bins.map((bin) => bin.count), 1);
  return (
    <figure className="chart-card">
      <figcaption>
        {title}
        <span className="muted"> ({unit})</span>
      </figcaption>
      <div className="histogram" aria-label={title}>
        {bins.map((bin) => (
          <div key={bin.label} className="histogram-col">
            <span className="histogram-count">{bin.count}</span>
            <span className="histogram-track">
              <span
                className="histogram-fill"
                style={{ height: `${Math.max(4, (bin.count / max) * 100)}%` }}
              />
            </span>
            <span className="histogram-label">{bin.label}</span>
          </div>
        ))}
      </div>
    </figure>
  );
}

function binValues(values: number[], binCount: number): { label: string; count: number }[] {
  if (values.length === 0) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const counts = Array.from({ length: binCount }, () => 0);
  for (const value of values) {
    let index = Math.floor(((value - min) / span) * binCount);
    if (index >= binCount) index = binCount - 1;
    counts[index] += 1;
  }
  return counts.map((count, index) => {
    const start = min + (span * index) / binCount;
    const end = min + (span * (index + 1)) / binCount;
    const digits = span > 500 ? 0 : 0;
    return {
      label: `${Math.round(start).toFixed(digits)}–${Math.round(end).toFixed(digits)}`,
      count,
    };
  });
}

export const SERIES_COLORS = [
  "var(--nebula-color-data-visualization-blue-medium)",
  "var(--nebula-color-data-visualization-teal-medium)",
  "var(--nebula-color-data-visualization-orange-medium)",
  "var(--nebula-color-data-visualization-purple-medium)",
  "var(--nebula-color-data-visualization-green-medium)",
  "var(--nebula-color-data-visualization-pink-medium)",
  "var(--nebula-color-data-visualization-yellow-dark)",
  "var(--nebula-color-data-visualization-red-medium)",
];

export function colorForIndex(index: number): string {
  return SERIES_COLORS[index % SERIES_COLORS.length];
}

export function slicesFromCounts(counts: Map<string, number>): Slice[] {
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([label, value], index) => ({ label, value, color: colorForIndex(index) }));
}
