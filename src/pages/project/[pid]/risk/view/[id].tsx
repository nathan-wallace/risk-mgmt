import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Risk } from '@/types/risk';
import { Project } from '@/types/project';

export default function ViewRisk() {
  const router = useRouter();
  const { pid, id } = router.query as { pid?: string; id?: string };
  const [risk, setRisk] = useState<Risk | null>(null);

  useEffect(() => {
    if (!router.isReady) return;
    const saved = typeof window !== 'undefined' && localStorage.getItem('projects');
    if (!saved) return;
    const projects: Project[] = JSON.parse(saved);
    const proj = projects.find((p) => p.id === pid);
    const r = proj?.risks.find((item) => item.id === id);
    if (r) setRisk(r);
  }, [router.isReady, pid, id]);

  if (!risk) {
    return <p className="p-4">Risk not found.</p>;
  }

  const lastNote = risk.statusHistory[risk.statusHistory.length - 1]?.note || '';

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-950 text-white shadow">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Risk Manager</h1>
          <Link href={`/project/${pid}/risk/${id}`} className="underline">
            Edit Risk
          </Link>
        </div>
      </nav>
      <main className="container mx-auto p-4 space-y-6">
        <div className="bg-white rounded-lg shadow p-4 space-y-2">
          <h1 className="text-xl font-semibold">{risk.title}</h1>
          <p>{risk.description}</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <h2 className="font-semibold">Details</h2>
              <p>Category: {risk.category}</p>
              <p>Owner: {risk.owner}</p>
              <p>Priority: {risk.priority}</p>
              <p>Response: {risk.response}</p>
              <p>Status: {risk.status}</p>
              <p>Date Identified: {risk.dateIdentified?.split('T')[0]}</p>
              {risk.dateResolved && (
                <p>Date Resolved: {risk.dateResolved.split('T')[0]}</p>
              )}
              <p>Last Reviewed: {risk.lastReviewed.split('T')[0]}</p>
              {lastNote && <p>Status Note: {lastNote}</p>}
            </div>
            <div className="space-y-1">
              <h2 className="font-semibold">Mitigation</h2>
              <p>{risk.mitigation}</p>
            </div>
          </div>
          <div className="space-y-1">
            <h2 className="font-semibold">Status History</h2>
            <ul className="list-disc ml-5 text-sm space-y-1">
              {risk.statusHistory.map((s, idx) => (
                <li key={idx}>
                  {s.date.split('T')[0]} - {s.status}
                  {s.note ? ` - ${s.note}` : ''}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <Link href={`/project/${pid}`} className="text-blue-600 underline">
              Back to Project
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
