import React from 'react';
import { Risk } from '@/types/risk';
import RiskMatrix from './RiskMatrix';

interface Props {
  matrix: Record<number, Record<number, Risk[]>>;
  filter: { prob: number; impact: number } | null;
  onCellClick: (prob: number, impact: number) => void;
}

export default function RiskMatrixPanel({ matrix, filter, onCellClick }: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-4 overflow-auto">
      <h2 className="font-semibold mb-2">Risk Matrix</h2>
      <RiskMatrix matrix={matrix} filter={filter} onCellClick={onCellClick} />
    </div>
  );
}
