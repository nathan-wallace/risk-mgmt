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
      const avg =
        active.length === 0
          ? 0
          : active.reduce((s, r) => s + r.probability * r.impact, 0) / active.length;
      return { date, value: avg };
    });
  });
  // intrinsic dimensions for viewBox calculations
  const width = 600;
  const height = 300;
  const x = (score: number) => (score / 25) * width;
  const y = (date: Date) =>
    ((date.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * height;
  const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6'];

  return (
    <div className="overflow-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="border w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
        style={{ maxHeight: height }}
      >
        {/* axes */}
        <line x1={0} y1={0} x2={0} y2={height} stroke="#000" />
        <line x1={0} y1={height} x2={width} y2={height} stroke="#000" />
        {/* grid lines */}
        {dates.slice(1).map((d, i) => (
          <line
            key={`h-${i}`}
            x1={0}
            y1={y(d)}
            x2={width}
            y2={y(d)}
            stroke="#ddd"
          />
        ))}
        {[5, 10, 15, 20, 25].map((s) => (
          <line
            key={`v-${s}`}
            x1={x(s)}
            y1={0}
            x2={x(s)}
            y2={height}
            stroke="#ddd"
          />
        ))}
        {/* y-axis labels */}
        {dates.map((d, i) => (
          <g key={i}>
            <line x1={0} y1={y(d)} x2={-5} y2={y(d)} stroke="#000" />
            <text x={-8} y={y(d) + 4} textAnchor="end" fontSize="10">
              {d.toISOString().split('T')[0]}
            </text>
          </g>
        ))}
        {/* x-axis labels */}
        {[0, 5, 10, 15, 20, 25].map((s) => (
          <g key={s}>
            <line x1={x(s)} y1={height} x2={x(s)} y2={height + 5} stroke="#000" />
            <text x={x(s)} y={height + 15} textAnchor="middle" fontSize="10">
              {s}
            </text>
          </g>
        ))}
        {/* axis titles */}
        <text
          x={width / 2}
          y={height + 35}
          textAnchor="middle"
          fontSize="12"
          fontWeight="bold"
        >
          Risk Score
        </text>
        <text
          x={-40}
          y={height / 2}
          textAnchor="middle"
          fontSize="12"
          fontWeight="bold"
          transform={`rotate(-90 -40 ${height / 2})`}
        >
          Date
        </text>
        {series.map((data, idx) => (
          <polyline
            key={statuses[idx]}
            fill="none"
            stroke={colors[idx]}
            strokeWidth={2}
            points={data.map((p) => `${x(p.value)},${y(p.date)}`).join(' ')}
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
