"use client";

import { useState, useCallback, useMemo } from "react";
import type { ChartSeries } from "@/types/recommendations";

/** Default: when there are more than this many points, day labels are shown only at a periodic interval */
const DEFAULT_THIN_LABELS_ABOVE = 10;
/** Default: when thinning, show roughly this many day labels (first, last, and evenly spaced between) */
const DEFAULT_MAX_VISIBLE_LABELS = 8;

interface VitalsLineChartProps {
  /** X-axis labels (e.g. last 7 days); used when dateKeys not provided */
  labels: string[];
  /** Up to 3 series (e.g. 3 vitals) */
  series: ChartSeries[];
  /** Optional YYYY-MM-DD dates; when set, axis shows day + month in two rows */
  dateKeys?: string[];
  width?: number;
  height?: number;
  /** When there are more than this many points, day labels are shown periodically (default 10) */
  maxLabelsBeforeThin?: number;
  /** When thinning, show at most this many day labels (default 8) */
  maxVisibleLabels?: number;
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

/** Format vital value for tooltip (e.g. BP sys/dia, units) */
function formatPointValue(seriesLabel: string, raw: number | null): string {
  if (raw == null) return "—";
  if (seriesLabel.toLowerCase().includes("blood") && seriesLabel.includes("sys")) return `${raw} mmHg`;
  if (seriesLabel.toLowerCase().includes("heart")) return `${raw} bpm`;
  if (seriesLabel.toLowerCase().includes("weight")) return `${raw} kg`;
  if (seriesLabel.toLowerCase().includes("bmi")) return String(raw);
  if (seriesLabel.toLowerCase().includes("sleep")) return `${raw} h`;
  if (seriesLabel.toLowerCase().includes("stress")) return String(raw);
  if (seriesLabel.toLowerCase().includes("spo") || seriesLabel.toLowerCase().includes("oxygen")) return `${raw}%`;
  if (seriesLabel.toLowerCase().includes("glucose")) return `${raw} mg/dL`;
  return String(raw);
}

/** Format YYYY-MM-DD as day number and short month for axis */
function formatDayAndMonth(dateKey: string): { day: string; month: string } {
  if (dateKey === "—" || !dateKey) return { day: "—", month: "" };
  try {
    const d = new Date(dateKey + "T12:00:00");
    if (Number.isNaN(d.getTime())) return { day: "—", month: "" };
    return {
      day: String(d.getDate()),
      month: d.toLocaleDateString(undefined, { month: "short" }),
    };
  } catch {
    return { day: "—", month: "" };
  }
}

/** Format dateKey for tooltip (e.g. "12 Feb") */
function formatTooltipDate(dateKey: string | undefined, fallbackLabel: string): string {
  if (!dateKey || dateKey === "—") return fallbackLabel;
  try {
    const d = new Date(dateKey + "T12:00:00");
    if (Number.isNaN(d.getTime())) return fallbackLabel;
    const day = d.getDate();
    const month = d.toLocaleDateString(undefined, { month: "short" });
    return `${day} ${month}`;
  } catch {
    return fallbackLabel;
  }
}

/** Indices at which to show a day label when there are too many points (keeps axis readable) */
function getVisibleLabelIndices(
  count: number,
  thinAbove: number,
  maxVisible: number,
): Set<number> {
  if (count <= thinAbove) {
    return new Set(Array.from({ length: count }, (_, i) => i));
  }
  const set = new Set<number>();
  const n = Math.min(maxVisible, count);
  for (let i = 0; i < n; i++) {
    const idx = n <= 1 ? 0 : Math.round((i / (n - 1)) * (count - 1));
    set.add(idx);
  }
  return set;
}

export default function VitalsLineChart({
  labels,
  series,
  dateKeys,
  width = 200,
  height = 120,
  maxLabelsBeforeThin = DEFAULT_THIN_LABELS_ABOVE,
  maxVisibleLabels = DEFAULT_MAX_VISIBLE_LABELS,
}: VitalsLineChartProps) {
  const [tooltip, setTooltip] = useState<{
    date: string;
    label: string;
    value: string;
    x: number;
    y: number;
    seriesIdx: number;
    pointIdx: number;
  } | null>(null);

  const padding = useMemo(() => ({ top: 8, right: 8, bottom: 40, left: 8 }), []);
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const stepX = labels.length > 1 ? chartWidth / (labels.length - 1) : 0;

  const normalized = series.map((s) => normalize(s.values));

  const toPath = useCallback(
    (values: number[]) => {
      return values
        .map((y, i) => {
          const x = padding.left + i * stepX;
          const yVal = padding.top + chartHeight - (y / 100) * chartHeight;
          return `${i === 0 ? "M" : "L"} ${x} ${yVal}`;
        })
        .join(" ");
    },
    [stepX, padding, chartHeight],
  );

  const getPoint = useCallback(
    (seriesIdx: number, pointIdx: number) => {
      const vals = normalized[seriesIdx];
      if (!vals || pointIdx >= vals.length) return null;
      const x = padding.left + pointIdx * stepX;
      const y = padding.top + chartHeight - (vals[pointIdx] / 100) * chartHeight;
      return { x, y };
    },
    [normalized, stepX, padding, chartHeight],
  );

  const handlePointClick = useCallback(
    (seriesIdx: number, pointIdx: number) => {
      const s = series[seriesIdx];
      const raw = s?.values[pointIdx] ?? null;
      const dateLabel = labels[pointIdx] ?? "";
      const date = dateKeys?.[pointIdx]
        ? formatTooltipDate(dateKeys[pointIdx], dateLabel)
        : dateLabel;
      const pos = getPoint(seriesIdx, pointIdx);
      if (!pos) return;
      setTooltip((prev) => {
        if (prev?.seriesIdx === seriesIdx && prev?.pointIdx === pointIdx) return null;
        const value = formatPointValue(s?.label ?? "", raw);
        return {
          date,
          label: s?.label ?? "",
          value,
          x: pos.x,
          y: pos.y,
          seriesIdx,
          pointIdx,
        };
      });
    },
    [series, labels, dateKeys, getPoint],
  );

  return (
    <div className="flex flex-col gap-1">
      <div className="relative">
        <svg
          width={width}
          height={height}
          className="overflow-visible"
          onMouseLeave={() => setTooltip(null)}
        >
          {normalized.map((values, idx) => (
            <g key={series[idx].label}>
              <path
                d={toPath(values)}
                fill="none"
                stroke={series[idx].color ?? CHART_LINE_COLORS[idx % CHART_LINE_COLORS.length]}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {values.map((_, pointIdx) => {
                const raw = series[idx]?.values[pointIdx];
                if (raw == null) return null;
                const pos = getPoint(idx, pointIdx);
                if (!pos) return null;
                return (
                  <circle
                    key={`${idx}-${pointIdx}`}
                    cx={pos.x}
                    cy={pos.y}
                    r={8}
                    fill="transparent"
                    stroke="none"
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePointClick(idx, pointIdx);
                    }}
                  />
                );
              })}
              {values.map((_, pointIdx) => {
                const raw = series[idx]?.values[pointIdx];
                if (raw == null) return null;
                const pos = getPoint(idx, pointIdx);
                if (!pos) return null;
                const color = series[idx].color ?? CHART_LINE_COLORS[idx % CHART_LINE_COLORS.length];
                return (
                  <circle
                    key={`dot-${idx}-${pointIdx}`}
                    cx={pos.x}
                    cy={pos.y}
                    r={4}
                    fill={color}
                    stroke="white"
                    strokeWidth={1.5}
                    className="pointer-events-none"
                  />
                );
              })}
            </g>
          ))}
        </svg>
        {tooltip && (
          <div
            className="pointer-events-none absolute z-10 rounded-lg border border-light-green-subtle/80 bg-white px-2.5 py-1.5 text-xs shadow-lg"
            style={{
              left: Math.min(tooltip.x + 8, width - 120),
              top: Math.max(0, tooltip.y - 36),
            }}
          >
            <div className="font-medium text-light-green-dark">{tooltip.date}</div>
            <div style={{ color: "#0d9488" }}>{tooltip.label}: {tooltip.value}</div>
          </div>
        )}
      </div>
      {/* Dates at bottom: day + month; thinned by config when many points; month only when it changes (among visible labels) */}
      <div
        className="flex justify-between text-[10px] text-slate-500"
        style={{ width, paddingLeft: padding.left, paddingRight: padding.right }}
      >
        {dateKeys && dateKeys.length === labels.length
          ? (() => {
              const visible = getVisibleLabelIndices(
                dateKeys.length,
                maxLabelsBeforeThin,
                maxVisibleLabels,
              );
              const visibleList = Array.from(visible).sort((a, b) => a - b);
              const prevVisibleMonth = (idx: number) => {
                const pos = visibleList.indexOf(idx);
                return pos <= 0 ? "" : formatDayAndMonth(dateKeys![visibleList[pos - 1]]).month;
              };
              return dateKeys.map((key, i) => {
                const showLabel = visible.has(i);
                if (!showLabel) {
                  return <span key={i} className="flex shrink-0 flex-col items-center" aria-hidden />;
                }
                const { day, month } = formatDayAndMonth(key);
                const showMonth = month && month !== prevVisibleMonth(i);
                return (
                  <span key={i} className="flex shrink-0 flex-col items-center">
                    <span className="font-medium">{day}</span>
                    {showMonth && <span className="text-[9px] text-slate-400">{month}</span>}
                  </span>
                );
              });
            })()
          : labels.map((label, i) => (
              <span key={i} className="shrink-0">
                {label}
              </span>
            ))}
      </div>
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
