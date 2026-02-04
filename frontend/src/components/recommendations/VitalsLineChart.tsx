"use client";

import type { ChartSeries } from "@/types/recommendations";

interface VitalsLineChartProps {
  /** X-axis labels (e.g. last 7 days) */
  labels: string[];
  /** Up to 3 series (e.g. 3 vitals) */
  series: ChartSeries[];
  width?: number;
  height?: number;
}

/** Line colors: distinct gradient so each of the 3 series is easy to identify. */
const CHART_LINE_COLORS = [
  "#0d9488", // teal (light-green primary)
  "#2563eb", // blue
  "#ca8a04", // amber
];

function normalize(values: (number | null)[]): number[] {
  const defined = values.filter((v): v is number => v != null);
  if (defined.length === 0) return values.map(() => 50);
  const min = Math.min(...defined);
  const max = Math.max(...defined);
  const range = max - min || 1;
  return values.map((v) => (v == null ? 50 : 10 + (80 * (v - min)) / range));
}

export default function VitalsLineChart({ labels, series, width = 200, height = 120 }: VitalsLineChartProps) {
  const padding = { top: 8, right: 8, bottom: 24, left: 8 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const stepX = labels.length > 1 ? chartWidth / (labels.length - 1) : 0;

  const normalized = series.map((s) => normalize(s.values));

  const toPath = (values: number[]) => {
    return values
      .map((y, i) => {
        const x = padding.left + i * stepX;
        const yVal = padding.top + chartHeight - (y / 100) * chartHeight;
        return `${i === 0 ? "M" : "L"} ${x} ${yVal}`;
      })
      .join(" ");
  };

  return (
    <div className="flex flex-col gap-1">
      <svg width={width} height={height} className="overflow-visible">
        {normalized.map((values, idx) => (
          <path
            key={series[idx].label}
            d={toPath(values)}
            fill="none"
            stroke={series[idx].color ?? CHART_LINE_COLORS[idx % CHART_LINE_COLORS.length]}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
        {series.map((s, i) => (
          <span key={s.label} style={{ color: s.color ?? CHART_LINE_COLORS[i % CHART_LINE_COLORS.length] }}>
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
