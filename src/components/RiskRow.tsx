import React from 'react';
import Link from 'next/link';
import { Risk } from '@/types/risk';

interface Props {
  risk: Risk;
  pid: string;
  onDelete: (id: string) => void;
}

export default function RiskRow({ risk, pid, onDelete }: Props) {
  const shortId = risk.id.length > 6 ? risk.id.slice(-6) : risk.id;
  const score = risk.probability * risk.impact;
  return (
    <tr className="border-t hover:bg-gray-50 transition">
      <td className="border p-1 text-xs text-gray-500">{shortId}</td>
      <td className="border p-1">
        <div className="font-medium">{risk.description}</div>
        <div className="text-xs text-gray-500">
          {risk.category} | Owner: {risk.owner}
        </div>
      </td>
      <td className="border p-1 text-center">
        <div className="font-semibold">
          {risk.probability} &times; {risk.impact}
        </div>
        <div className="text-xs text-gray-500">Score: {score}</div>
      </td>
      <td className="border p-1 text-sm">
        <div>{risk.status}</div>
        <div className="text-xs text-gray-500">
          {risk.dateIdentified ? risk.dateIdentified.split('T')[0] : ''}
          {risk.dateResolved && (
            <>
              {' → '}
              {risk.dateResolved.split('T')[0]}
            </>
          )}
        </div>
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
