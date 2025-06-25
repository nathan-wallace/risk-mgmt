import React from 'react';
import { Risk } from '@/types/risk';

interface Props {
  matrix: Record<number, Record<number, Risk[]>>;
  filter: { prob: number; impact: number } | null;
  onCellClick: (prob: number, impact: number) => void;
}

const color = (score: number) => {
  if (score >= 15) return 'bg-red-500 text-white';
  if (score >= 5) return 'bg-yellow-300';
  return 'bg-green-300';
};

export default function RiskMatrix({ matrix, filter, onCellClick }: Props) {
  return (
    <table className="border-collapse rounded shadow">
      <caption className="sr-only">
        Risk matrix showing number of risks for each probability and impact score
      </caption>
      <tbody>
        {Array.from({ length: 5 }, (_, i) => 5 - i).map((impact) => (
          <tr key={impact}>
            {Array.from({ length: 5 }, (_, j) => j + 1).map((prob) => {
              const items = matrix[prob][impact];
              const score = prob * impact;
              const selected =
                filter && filter.prob === prob && filter.impact === impact;
              return (
                <td
                  key={prob}
                  role="button"
                  tabIndex={0}
                  aria-label={`Probability ${prob} Impact ${impact} contains ${items.length} risks`}
                  onClick={() => onCellClick(prob, impact)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onCellClick(prob, impact);
                    }
                  }}
                  className={`w-12 h-12 border text-center cursor-pointer ${color(score)} ${selected ? 'ring-2 ring-black' : ''}`}
                >
                  {items.length}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
