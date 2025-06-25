import React from 'react';
import { Risk } from '@/types/risk';
import { ProjectMeta } from '@/types/project';

interface Props {
  risks: Risk[];
  project: ProjectMeta;
}

const statuses: Risk['status'][] = ['Open', 'In-Progress', 'Mitigated', 'Accepted'];

function addStep(date: Date, step: 'week' | 'month' | 'year') {
  const d = new Date(date);
  if (step === 'week') d.setDate(d.getDate() + 7);
  else if (step === 'month') d.setMonth(d.getMonth() + 1);
  else d.setFullYear(d.getFullYear() + 1);
  return d;
}

export default function RiskHistoryTimeline({ risks, project }: Props) {
  if (!project.startDate || !project.endDate) return null;
  const start = new Date(project.startDate);
  const end = new Date(project.endDate);
  if (end <= start) return null;
  const diffDays = (end.getTime() - start.getTime()) / 86400000;
  let step: 'week' | 'month' | 'year';
  if (diffDays <= 120) step = 'week';
  else if (diffDays <= 730) step = 'month';
  else step = 'year';
  const dates: Date[] = [];
  for (let d = new Date(start); d <= end; d = addStep(d, step)) {
    dates.push(new Date(d));
  }
  const series = statuses.map((status) => {
    return dates.map((date) => {
      const active = risks.filter(
        (r) =>
          r.dateIdentified &&
          (!r.dateResolved || new Date(r.dateResolved) >= date) &&
          new Date(r.dateIdentified) <= date &&
          r.status === status,
      );
      return { date, value: active.length };
    });
  });

  const maxCount = Math.max(
    1,
    ...series.flat().map((d) => d.value),
  );
  // dimensions and scales
  const margin = { top: 20, right: 20, bottom: 60, left: 50 };
  const innerHeight = 300;
  const innerWidth = Math.max(600, dates.length * 100);
  const width = innerWidth + margin.left + margin.right;
  const height = innerHeight + margin.top + margin.bottom;
  const x = (date: Date) =>
    margin.left +
    ((date.getTime() - start.getTime()) / (end.getTime() - start.getTime())) *
      innerWidth;
  const y = (count: number) =>
    margin.top + innerHeight - (count / maxCount) * innerHeight;
  const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];
  const tickStep = Math.max(1, Math.ceil(maxCount / 5));
  const yTicks: number[] = [];
  for (let i = 0; i <= maxCount; i += tickStep) {
    yTicks.push(i);
  }
  if (yTicks[yTicks.length - 1] !== maxCount) yTicks.push(maxCount);

  return (
    <div className="overflow-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
        style={{ maxHeight: height }}
      >
        {/* axes */}
        <line
          x1={margin.left}
          y1={margin.top}
          x2={margin.left}
          y2={margin.top + innerHeight}
          stroke="#000"
        />
        <line
          x1={margin.left}
          y1={margin.top + innerHeight}
          x2={margin.left + innerWidth}
          y2={margin.top + innerHeight}
          stroke="#000"
        />
        {/* grid lines */}
        {dates.slice(1).map((d, i) => (
          <line
            key={`v-${i}`}
            x1={x(d)}
            y1={margin.top}
            x2={x(d)}
            y2={margin.top + innerHeight}
            stroke="#ddd"
          />
        ))}
        {yTicks.slice(1).map((s) => (
          <line
            key={`h-${s}`}
            x1={margin.left}
            y1={y(s)}
            x2={margin.left + innerWidth}
            y2={y(s)}
            stroke="#ddd"
          />
        ))}
        {/* y-axis labels */}
        {yTicks.map((s) => (
          <g key={s}>
            <line
              x1={margin.left}
              y1={y(s)}
              x2={margin.left - 5}
              y2={y(s)}
              stroke="#000"
            />
            <text
              x={margin.left - 8}
              y={y(s) + 4}
              textAnchor="end"
              fontSize="10"
            >
              {s}
            </text>
          </g>
        ))}
        {/* x-axis labels */}
        {dates.map((d, i) => (
          <g key={i}>
            <line
              x1={x(d)}
              y1={margin.top + innerHeight}
              x2={x(d)}
              y2={margin.top + innerHeight + 5}
              stroke="#000"
            />
            <text
              x={x(d)}
              y={margin.top + innerHeight + 15}
              textAnchor="end"
              fontSize="10"
              transform={`rotate(-45 ${x(d)} ${margin.top + innerHeight + 15})`}
            >
              {d.toISOString().split('T')[0]}
            </text>
          </g>
        ))}
        {/* axis titles */}
        <text
          x={margin.left + innerWidth / 2}
          y={height - 10}
          textAnchor="middle"
          fontSize="12"
          fontWeight="bold"
        >
          Risks
        </text>
        <text
          x={15}
          y={margin.top + innerHeight / 2}
          textAnchor="middle"
          fontSize="12"
          fontWeight="bold"
          transform={`rotate(-90 15 ${margin.top + innerHeight / 2})`}
        >
          Number of Risks
        </text>
        {series.map((data, idx) => (
          <polyline
            key={statuses[idx]}
            fill="none"
            stroke={colors[idx]}
            strokeWidth={2}
            points={data.map((p) => `${x(p.date)},${y(p.value)}`).join(' ')}
          />
        ))}
      </svg>
      <div className="flex space-x-2 pt-1 text-sm">
        {statuses.map((s, i) => (
          <div key={s} className="flex items-center space-x-1">
            <span className="w-3 h-3 inline-block" style={{ background: colors[i] }} />
            <span>{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
