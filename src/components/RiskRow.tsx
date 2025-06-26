import React from 'react';
import Link from 'next/link';
import { Risk } from '@/types/risk';

interface Props {
  risk: Risk;
  pid: string;
  onDelete: (id: string) => void;
}

const scoreColor = (score: number) => {
  if (score >= 15) return 'bg-red-500 text-white';
  if (score >= 5) return 'bg-yellow-300';
  return 'bg-green-300';
};

export default function RiskRow({ risk, pid, onDelete }: Props) {
  const score = risk.probability * risk.impact;
  const lastNote = risk.statusHistory[risk.statusHistory.length - 1]?.note || '';
  return (
    <tr className="border-t hover:bg-gray-50 transition">
      <td className="border p-1 text-center space-y-1">
        <div
          className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center font-semibold ${scoreColor(score)}`}
        >
          {score}
        </div>
      </td>
      <td className="border p-1">
        <Link
          href={`/project/${pid}/risk/view/${risk.id}`}
          className="font-medium text-blue-600 hover:underline"
        >
          {risk.title}
        </Link>
        <div className="text-xs text-gray-500">{risk.description}</div>
        <div className="text-xs text-gray-500">
          {risk.category} | Owner: {risk.owner}
        </div>
      </td>
      <td className="border p-1 text-center">{risk.priority}</td>
      <td className="border p-1 text-sm">
        <div>{risk.status}</div>
        <div className="text-xs text-gray-500">
          {risk.dateIdentified ? risk.dateIdentified.split('T')[0] : ''}
          {risk.dateResolved && (
            <>
              {' \u2192 '}
              {risk.dateResolved.split('T')[0]}
            </>
          )}
        </div>
        <div className="text-xs text-gray-500">
          Reviewed: {risk.lastReviewed.split('T')[0]}
        </div>
        {lastNote && (
          <div className="text-xs italic text-gray-500">{lastNote}</div>
        )}
      </td>
      <td className="border p-1 space-x-2 whitespace-nowrap">
        <Link href={`/project/${pid}/risk/${risk.id}`} className="text-blue-600">
          Manage
        </Link>
        <button onClick={() => onDelete(risk.id)} className="text-red-600">
          Delete
        </button>
      </td>
    </tr>
  );
}
