"use client";
import { useEffect, useRef, useState } from "react";
import CloudLayout from "d3-cloud";
import { Download, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadVisualizationImage } from "../lib/downloadVisualizationImage";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Visualization } from "../schemas/workspace";
const colors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];
const sentimentColors = [
  "var(--chart-2)",
  "var(--chart-1)",
  "var(--chart-4)",
  "var(--muted-foreground)",
];
const sentimentKeys = [
  "positive",
  "negative",
  "mixed",
  "unclassified",
] as const;
type Filter = { kind: string; value: string };

function CategoryTick({
  x = 0,
  y = 0,
  payload,
}: {
  x?: number;
  y?: number;
  payload?: { value: string };
}) {
  const label = String(payload?.value ?? "");
  const words = label.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if (line && `${line} ${word}`.length > 24) {
      lines.push(line);
      line = word;
    } else line = line ? `${line} ${word}` : word;
  }
  if (line) lines.push(line);
  return (
    <text
      x={x - 8}
      y={y}
      textAnchor="end"
      fill="var(--muted-foreground)"
      fontSize={12}
    >
      <title>{label}</title>
      {lines.slice(0, 3).map((text, index) => (
        <tspan
          key={index}
          x={x - 8}
          dy={index === 0 ? -(Math.min(lines.length, 3) - 1) * 8 + 4 : 16}
        >
          {index === 2 && lines.length > 3
            ? `${text.slice(0, 23)}…`
            : text.length > 24
              ? `${text.slice(0, 23)}…`
              : text}
        </tspan>
      ))}
    </text>
  );
}

type VisualizationProps = {
  visualization: Visualization;
  title: string;
  t: (key: string) => string;
  onFilter: (filter: Filter) => void;
};

export function ComparisonAiVisualization(props: VisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [failed, setFailed] = useState(false);
  async function download() {
    const container = containerRef.current;
    if (!container) return;
    setDownloading(true);
    setFailed(false);
    try {
      await downloadVisualizationImage(container, props.title);
    } catch {
      setFailed(true);
    } finally {
      setDownloading(false);
    }
  }
  return (
    <div ref={containerRef} className="min-w-0 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <h4 className="min-w-0 text-sm font-semibold break-words">
          {props.title}
        </h4>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0"
          disabled={downloading || !props.visualization.data.length}
          onClick={() => void download()}
        >
          {downloading ? (
            <LoaderCircle
              className="size-4 animate-spin motion-reduce:animate-none"
              aria-hidden="true"
            />
          ) : (
            <Download className="size-4" aria-hidden="true" />
          )}
          {props.t("downloadImage")}
        </Button>
      </div>
      {failed ? (
        <p role="alert" className="text-sm text-destructive">
          {props.t("downloadImageError")}
        </p>
      ) : null}
      <VisualizationContent {...props} />
    </div>
  );
}

function VisualizationContent({
  visualization,
  title,
  t,
  onFilter,
}: VisualizationProps) {
  if (!visualization.data.length)
    return <p className="text-sm text-muted-foreground">{t("noChartData")}</p>;
  if (visualization.type === "word_cloud")
    return (
      <WordCloud
        visualization={visualization}
        title={title}
        t={t}
        onFilter={onFilter}
      />
    );
  const click = (event: unknown) => {
    if (!event || typeof event !== "object") return;
    const datum = event as {
      filterKind?: string;
      filterValue?: string;
      payload?: { filterKind?: string; filterValue?: string };
    };
    const row = datum.payload ?? datum;
    if (row.filterKind && row.filterValue)
      onFilter({ kind: row.filterKind, value: row.filterValue });
  };
  const categorical =
    visualization.type === "themes" ||
    visualization.type === "listing_comparison";
  if (visualization.type === "radar") {
    const data = sentimentKeys.map((key) => ({
      name: t(key),
      ...Object.fromEntries(
        visualization.data.map((listing, index) => [
          `listing${index}`,
          listing[key],
        ]),
      ),
    }));
    return (
      <div role="group" aria-label={title} className="h-96 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            data={data}
            outerRadius="65%"
            margin={{ top: 24, right: 32, bottom: 24, left: 32 }}
          >
            <PolarGrid />
            <PolarAngleAxis dataKey="name" tick={{ fontSize: 12 }} />
            <PolarRadiusAxis domain={[0, "auto"]} allowDecimals={false} />
            <Tooltip />
            <Legend />
            {visualization.data.map((listing, index) => (
              <Radar
                key={index}
                dataKey={`listing${index}`}
                name={listing.name}
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.08}
                dot={{
                  r: 3,
                  cursor: "pointer",
                  onClick: () =>
                    onFilter({
                      kind: listing.filterKind,
                      value: listing.filterValue,
                    }),
                }}
                activeDot={{
                  r: 5,
                  onClick: () =>
                    onFilter({
                      kind: listing.filterKind,
                      value: listing.filterValue,
                    }),
                }}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    );
  }
  return (
    <div
      role="group"
      aria-label={title}
      className="w-full min-w-0 overflow-auto max-h-[32rem]"
      tabIndex={categorical ? 0 : undefined}
    >
      <div
        style={{
          height: categorical
            ? Math.max(288, visualization.data.length * 64 + 80)
            : 288,
          minWidth: categorical ? 520 : undefined,
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          {visualization.type === "sentiment" ? (
            <PieChart>
              <Pie
                data={visualization.data}
                dataKey="count"
                nameKey="name"
                outerRadius={95}
                onClick={click}
              >
                {visualization.data.map((_, index) => (
                  <Cell
                    key={index}
                    fill={sentimentColors[index % sentimentColors.length]}
                    cursor="pointer"
                  />
                ))}
              </Pie>
              <Legend />
              <Tooltip formatter={(value) => [value, t("count")]} />
            </PieChart>
          ) : visualization.type === "area" ? (
            <AreaChart
              data={visualization.data}
              margin={{ top: 12, right: 16, bottom: 4, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              {sentimentKeys.map((key, index) => (
                <Area
                  key={key}
                  type="linear"
                  dataKey={key}
                  name={t(key)}
                  stackId="sentiment"
                  stroke={sentimentColors[index]}
                  fill={sentimentColors[index]}
                  fillOpacity={0.45}
                  dot={{ r: 3, cursor: "pointer", onClick: click }}
                  activeDot={{ r: 6, onClick: click }}
                />
              ))}
            </AreaChart>
          ) : visualization.type === "sentiment_trend" ? (
            <LineChart
              data={visualization.data}
              margin={{ top: 12, right: 16, bottom: 4, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              {sentimentKeys.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  name={t(key)}
                  stroke={sentimentColors[index]}
                  dot={{ r: 3, cursor: "pointer", onClick: click }}
                  activeDot={{ r: 6, onClick: click }}
                />
              ))}
            </LineChart>
          ) : visualization.type === "themes" ||
            visualization.type === "listing_comparison" ? (
            <BarChart
              layout="vertical"
              data={
                visualization.type === "themes" ||
                visualization.type === "listing_comparison"
                  ? visualization.data
                  : []
              }
              margin={{ top: 12, right: 24, bottom: 12, left: 0 }}
              barSize={24}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={190}
                interval={0}
                tick={<CategoryTick />}
                tickLine={false}
              />
              <Tooltip />
              <Legend verticalAlign="top" height={40} />
              {visualization.type === "themes" ||
              visualization.type === "listing_comparison" ? (
                sentimentKeys.map((key, index) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    name={t(key)}
                    stackId="sentiment"
                    fill={sentimentColors[index]}
                    onClick={click}
                    cursor="pointer"
                  />
                ))
              ) : (
                <Bar
                  dataKey="count"
                  name={t("count")}
                  fill={colors[0]}
                  onClick={click}
                  cursor="pointer"
                />
              )}
            </BarChart>
          ) : null}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function WordCloud({
  visualization,
  title,
  t,
  onFilter,
}: {
  visualization: Extract<Visualization, { type: "word_cloud" }>;
  title: string;
  t: (key: string) => string;
  onFilter: (filter: Filter) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cloud, setCloud] = useState<{
    width: number;
    height: number;
    font: string;
    centerX: number;
    centerY: number;
    words: {
      text: string;
      value: number;
      size: number;
      weight: number;
      x: number;
      y: number;
    }[];
  } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let active = true;
    let frame = 0;
    // Measure and render with the same loaded font so sprite spacing stays accurate.
    const draw = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        if (!active) return;
        const width = Math.floor(container.clientWidth);
        const height = Math.floor(container.clientHeight);
        if (!width || !height) return;
        const font = window.getComputedStyle(container).fontFamily;
        const data = visualization.data.toSorted(
          (a, b) => b.value - a.value || a.text.localeCompare(b.text),
        );
        const max = Math.max(1, ...data.map((item) => item.value));
        const layout = new CloudLayout()
          .size([Math.max(1, width - 32), height - 32])
          .overflow(false)
          .random(() => 0.5);
        const words = data.flatMap((item) => {
          const prominence = Math.sqrt(Math.max(0, item.value) / max);
          const size = Math.max(
            12,
            Math.min(
              12 + prominence * Math.min(24, width * 0.05),
              (width - 48) / Math.max(1, item.text.length * 0.65),
            ),
          );
          const weight = prominence > 0.65 ? 700 : 500;
          const sprite = layout.getSprite(item.text, {
            size,
            font,
            weight,
            padding: 4,
            rotate: 0,
          });
          if (!sprite) return [];
          const word = layout.place(sprite, { x: 0, y: 0 });
          return word
            ? [
                {
                  text: item.text,
                  value: item.value,
                  size,
                  weight,
                  x: word.x,
                  y: word.y,
                },
              ]
            : [];
        });
        const bounds = layout.bounds();
        setCloud({
          width,
          height,
          font,
          centerX: bounds ? (bounds[0].x + bounds[1].x) / 2 : 0,
          centerY: bounds ? (bounds[0].y + bounds[1].y) / 2 : 0,
          words,
        });
      });
    };
    const observer = new ResizeObserver(draw);
    void document.fonts.ready.then(() => {
      if (!active) return;
      observer.observe(container);
      draw();
    });
    return () => {
      active = false;
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [visualization]);

  return (
    <figure className="min-w-0 space-y-2">
      <div ref={containerRef} className="h-80 w-full min-w-0 sm:h-96">
        {cloud ? (
          <svg
            viewBox={`0 0 ${cloud.width} ${cloud.height}`}
            role="group"
            aria-label={title}
            className="h-full w-full overflow-visible"
            style={{ fontFamily: cloud.font }}
          >
            <g
              transform={`translate(${cloud.width / 2 - cloud.centerX}, ${cloud.height / 2 - cloud.centerY})`}
            >
              {cloud.words.map((word) => (
                <text
                  key={word.text}
                  x={word.x}
                  y={word.y}
                  textAnchor="middle"
                  fontSize={word.size}
                  fontWeight={word.weight}
                  fill={
                    word.weight === 700
                      ? "color-mix(in oklch, var(--primary), var(--foreground) 25%)"
                      : "var(--muted-foreground)"
                  }
                  role="button"
                  aria-label={`${word.text}: ${word.value} ${t("wordOccurrences")}`}
                  className="cursor-pointer rounded-sm outline-none hover:fill-foreground focus-visible:fill-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                  onClick={() => onFilter({ kind: "word", value: word.text })}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onFilter({ kind: "word", value: word.text });
                    }
                  }}
                  tabIndex={0}
                >
                  <title>{`${word.text} · ${word.value} ${t("wordOccurrences")}`}</title>
                  {word.text}
                </text>
              ))}
            </g>
          </svg>
        ) : null}
      </div>
      <figcaption className="text-xs leading-relaxed text-muted-foreground">
        {t("wordCloudHint")}
      </figcaption>
    </figure>
  );
}
