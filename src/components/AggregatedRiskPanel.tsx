import React from 'react';
import AggregatedRisk from './AggregatedRisk';

interface Props {
  score: number;
}

export default function AggregatedRiskPanel({ score }: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="font-semibold mb-2">Aggregated Risk</h2>
      <AggregatedRisk score={score} />
    </div>
  );
}
