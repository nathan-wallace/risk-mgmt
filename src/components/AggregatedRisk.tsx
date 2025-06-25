import React, { useEffect, useRef, useState } from 'react';

interface Props {
  score: number;
}

const color = (score: number) => {
  if (score >= 15) return 'bg-red-500 text-white';
  if (score >= 5) return 'bg-yellow-300';
  return 'bg-green-300';
};

export default function AggregatedRisk({ score }: Props) {
  const [showInfo, setShowInfo] = useState(false);
  const infoRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (infoRef.current && !infoRef.current.contains(e.target as Node)) {
        setShowInfo(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  return (
    <div className="flex items-center">
      <span className={`px-4 py-2 rounded text-2xl font-semibold ${color(score)}`}>{
        score.toFixed(1)
      }</span>
      <div className="relative inline-block ml-2" ref={infoRef}>
        <button
          onClick={() => setShowInfo((p) => !p)}
          className="text-gray-600 hover:text-black"
          aria-label="Aggregated score info"
        >
          <svg
            className="w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        {showInfo && (
          <div className="absolute right-0 mt-1 w-64 bg-white border rounded shadow p-2 text-sm">
            Aggregated score is the average of each risk&apos;s probability multiplied by impact. Scores 15 or higher indicate high risk (red), 5–14 moderate (yellow), and below 5 low (green). This metric reflects the overall project risk severity.
          </div>
        )}
      </div>
    </div>
  );
}
