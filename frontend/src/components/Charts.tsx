import { useState, type MouseEvent } from 'react';
import { usePreferences } from '../contexts/PreferencesContext';
import type { AnalyticsBreakdown, AnalyticsPoint } from '../types/domain';

const colors = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

type TooltipTone = 'default' | 'sky' | 'emerald';

type CursorTooltipState = {
  x: number;
  y: number;
  title: string;
  rows: Array<{
    label: string;
    value: string;
    tone?: TooltipTone;
  }>;
};

function getTooltipPosition(event: MouseEvent<Element>, width = 196, height = 148) {
  const offset = 14;
  const viewportWidth = window.innerWidth || 1024;
  const viewportHeight = window.innerHeight || 768;
  const x = Math.min(event.clientX + offset, viewportWidth - width - offset);
  const y = Math.min(event.clientY + offset, viewportHeight - height - offset);

  return {
    x: Math.max(offset, x),
    y: Math.max(offset, y)
  };
}

function CursorTooltip({ tooltip }: { tooltip: CursorTooltipState | null }) {
  if (!tooltip) {
    return null;
  }

  const toneClass: Record<TooltipTone, string> = {
    default: 'text-slate-950',
    sky: 'text-sky-700',
    emerald: 'text-emerald-700'
  };

  return (
    <div
      className="pointer-events-none fixed z-[9999] w-48 rounded-md border border-slate-200 bg-white px-3 py-2 text-xs shadow-xl ring-1 ring-slate-950/5"
      style={{ left: tooltip.x, top: tooltip.y }}
    >
      <p className="font-bold text-slate-950">{tooltip.title}</p>
      <div className="mt-2 space-y-1.5">
        {tooltip.rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[auto_1fr] gap-3">
            <span className="font-semibold text-slate-500">{row.label}</span>
            <span className={`truncate text-right font-bold ${toneClass[row.tone ?? 'default']}`}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function maxValue(points: { value: number }[]) {
  return Math.max(...points.map((point) => point.value), 1);
}

function compactNumber(value: number, locale = 'vi-VN') {
  if (Math.abs(value) >= 1_000_000_000) {
    return `${Number((value / 1_000_000_000).toFixed(1))}B`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `${Number((value / 1_000_000).toFixed(1))}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${Number((value / 1_000).toFixed(1))}K`;
  }
  return value.toLocaleString(locale);
}

function fullNumber(value: number, locale = 'vi-VN') {
  return value.toLocaleString(locale);
}

export function LineChart({ points }: { points: AnalyticsPoint[] }) {
  const { language, t, theme } = usePreferences();
  const [hovered, setHovered] = useState<AnalyticsPoint & { x: number; y: number } | null>(null);
  const [tooltip, setTooltip] = useState<CursorTooltipState | null>(null);
  const locale = language === 'en' ? 'en-US' : 'vi-VN';
  const gridStroke = theme === 'dark' ? '#334155' : '#e2e8f0';
  const labelFill = theme === 'dark' ? '#cbd5e1' : '#64748b';
  const valueFill = theme === 'dark' ? '#f8fafc' : '#0f172a';
  const width = 720;
  const height = 260;
  const paddingX = 58;
  const paddingTop = 44;
  const paddingBottom = 36;
  const max = maxValue(points);
  const step = points.length > 1 ? (width - paddingX * 2) / (points.length - 1) : 0;
  const coords = points.map((point, index) => {
    const x = paddingX + index * step;
    const y = height - paddingBottom - (point.value / max) * (height - paddingTop - paddingBottom);
    return { ...point, x, y };
  });
  const path = coords.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const area = `${path} L ${width - paddingX} ${height - paddingBottom} L ${paddingX} ${height - paddingBottom} Z`;
  const labelEvery = points.length > 20 ? 3 : points.length > 14 ? 2 : 1;
  const showPointTooltip = (event: MouseEvent<Element>, point: AnalyticsPoint & { x: number; y: number }) => {
    setHovered(point);
    setTooltip({
      ...getTooltipPosition(event),
      title: t('Chi tiết dữ liệu'),
      rows: [
        { label: t('Thời gian'), value: point.label },
        { label: t('Giá trị'), value: fullNumber(point.value, locale), tone: 'sky' }
      ]
    });
  };
  const hideTooltip = () => {
    setHovered(null);
    setTooltip(null);
  };

  return (
    <div className="max-w-full overflow-x-auto overflow-y-hidden">
      <div className="relative w-[720px] min-w-[720px]" onMouseLeave={hideTooltip}>
        <svg viewBox={`0 0 ${width} ${height}`} className="block w-[720px]">
          <defs>
            <linearGradient id="lineFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3].map((line) => {
            const y = paddingTop + line * ((height - paddingTop - paddingBottom) / 3);
            return <line key={line} x1={paddingX} x2={width - paddingX} y1={y} y2={y} stroke={gridStroke} strokeDasharray="4 4" />;
          })}
          <path d={area} fill="url(#lineFill)" />
          <path d={path} fill="none" stroke="#0284c7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {coords.map((point, index) => (
            <g key={point.key}>
              {hovered?.key === point.key ? (
                <line x1={point.x} x2={point.x} y1={paddingTop} y2={height - paddingBottom} stroke="#0284c7" strokeDasharray="4 4" opacity="0.5" />
              ) : null}
              <circle
                cx={point.x}
                cy={point.y}
                r={hovered?.key === point.key ? 6 : 4}
                fill="#0284c7"
                className="cursor-pointer"
              />
              {index % labelEvery === 0 || index === coords.length - 1 ? (
                <text x={point.x} y={height - 10} textAnchor="middle" fontSize="10" fill={labelFill}>
                  {point.label}
                </text>
              ) : null}
              {point.value > 0 ? (
                <text x={point.x} y={Math.max(14, point.y - 10)} textAnchor="middle" fontSize="10" fontWeight="700" fill={valueFill}>
                  {compactNumber(point.value, locale)}
                </text>
              ) : null}
              <circle
                cx={point.x}
                cy={point.y}
                r="14"
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={(event) => showPointTooltip(event, point)}
                onMouseMove={(event) => showPointTooltip(event, point)}
                onMouseLeave={hideTooltip}
              />
            </g>
          ))}
        </svg>
        <CursorTooltip tooltip={tooltip} />
      </div>
    </div>
  );
}

export function BarChart({ points }: { points: AnalyticsPoint[] }) {
  const { language, t } = usePreferences();
  const [hovered, setHovered] = useState<AnalyticsPoint | null>(null);
  const [tooltip, setTooltip] = useState<CursorTooltipState | null>(null);
  const locale = language === 'en' ? 'en-US' : 'vi-VN';
  const max = maxValue(points);
  const showPointTooltip = (event: MouseEvent<Element>, point: AnalyticsPoint) => {
    setHovered(point);
    setTooltip({
      ...getTooltipPosition(event),
      title: t('Chi tiết dữ liệu'),
      rows: [
        { label: t('Thời gian'), value: point.label },
        { label: t('Giá trị'), value: fullNumber(point.value, locale), tone: 'sky' }
      ]
    });
  };
  const hideTooltip = () => {
    setHovered(null);
    setTooltip(null);
  };

  return (
    <div className="flex h-72 items-end gap-2 overflow-x-auto rounded-lg bg-slate-50 p-4" onMouseLeave={hideTooltip}>
      {points.map((point, index) => (
        <div key={point.key} className="relative flex min-w-12 flex-1 flex-col items-center gap-2">
          <div className="flex h-56 w-full items-end">
            <div
              className={`w-full cursor-pointer rounded-t-md bg-sky-600 transition ${
                hovered?.key === point.key ? 'brightness-95 ring-2 ring-slate-900/10' : 'hover:brightness-95'
              }`}
              style={{ height: `${Math.max(4, (point.value / max) * 100)}%`, backgroundColor: colors[index % colors.length] }}
              onMouseEnter={(event) => showPointTooltip(event, point)}
              onMouseMove={(event) => showPointTooltip(event, point)}
              onMouseLeave={hideTooltip}
            />
          </div>
          <p className="text-xs font-medium text-slate-500">{point.label}</p>
        </div>
      ))}
      <CursorTooltip tooltip={tooltip} />
    </div>
  );
}

export function DonutChart({ data }: { data: AnalyticsBreakdown[] }) {
  const { language, t, theme } = usePreferences();
  const [hovered, setHovered] = useState<AnalyticsBreakdown | null>(null);
  const [tooltip, setTooltip] = useState<CursorTooltipState | null>(null);
  const locale = language === 'en' ? 'en-US' : 'vi-VN';
  const mutedStroke = theme === 'dark' ? '#334155' : '#e2e8f0';
  const totalFill = theme === 'dark' ? '#f8fafc' : '#0f172a';
  const labelFill = theme === 'dark' ? '#cbd5e1' : '#64748b';
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  let offset = 25;
  const showItemTooltip = (event: MouseEvent<Element>, item: AnalyticsBreakdown) => {
    setHovered(item);
    setTooltip({
      ...getTooltipPosition(event),
      title: t('Tỷ trọng'),
      rows: [
        { label: t('Nhóm'), value: t(item.label) },
        { label: t('Giá trị'), value: fullNumber(item.value, locale), tone: 'sky' },
        { label: t('Tỷ lệ'), value: `${((item.value / total) * 100).toFixed(1)}%`, tone: 'emerald' }
      ]
    });
  };
  const hideTooltip = () => {
    setHovered(null);
    setTooltip(null);
  };

  return (
    <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(180px,220px)_minmax(0,1fr)]" onMouseLeave={hideTooltip}>
      <div className="relative flex justify-center">
        <svg viewBox="0 0 220 220" className="h-52 w-52 max-w-full">
        <circle cx="110" cy="110" r="78" fill="none" stroke={mutedStroke} strokeWidth="28" />
        {data.map((item, index) => {
          const length = (item.value / total) * 100;
          const active = hovered?.label === item.label;
          const circle = (
            <circle
              key={item.label}
              cx="110"
              cy="110"
              r="78"
              fill="none"
              stroke={colors[index % colors.length]}
              strokeWidth={active ? 32 : 28}
              strokeDasharray={`${length} ${100 - length}`}
              strokeDashoffset={-offset}
              pathLength="100"
              transform="rotate(-90 110 110)"
              className="cursor-pointer transition-all"
              opacity={hovered && !active ? 0.45 : 1}
              onMouseEnter={(event) => showItemTooltip(event, item)}
              onMouseMove={(event) => showItemTooltip(event, item)}
              onMouseLeave={hideTooltip}
            />
          );
          offset += length;
          return circle;
        })}
        <text x="110" y="105" textAnchor="middle" fontSize="24" fontWeight="800" fill={totalFill}>
          {compactNumber(total, locale)}
        </text>
        <text x="110" y="128" textAnchor="middle" fontSize="12" fill={labelFill}>
          {t('Tổng cộng')}
        </text>
        </svg>
      </div>
      <div className="grid min-w-0 content-center gap-3">
        {data.map((item, index) => (
          <div
            key={item.label}
            className="grid min-w-0 cursor-pointer grid-cols-[1fr_auto] items-center gap-3 rounded-md border border-slate-200 px-3 py-2 hover:bg-slate-50"
            onMouseEnter={(event) => showItemTooltip(event, item)}
            onMouseMove={(event) => showItemTooltip(event, item)}
            onMouseLeave={hideTooltip}
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
              <span className="min-w-0 truncate text-sm font-semibold text-slate-700" title={t(item.label)}>
                {t(item.label)}
              </span>
            </div>
            <span className="whitespace-nowrap text-sm font-bold text-slate-950" title={fullNumber(item.value, locale)}>
              {compactNumber(item.value, locale)}
            </span>
          </div>
        ))}
      </div>
      <CursorTooltip tooltip={tooltip} />
    </div>
  );
}
