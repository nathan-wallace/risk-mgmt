import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { Risk } from '@/types/risk';
import { ProjectMeta, Project } from '@/types/project';
import RiskHistoryTimeline from '@/components/RiskHistoryTimeline';
import RiskMatrixPanel from '@/components/RiskMatrixPanel';
import AggregatedRiskPanel from '@/components/AggregatedRiskPanel';
import * as XLSX from 'xlsx';

export default function ProjectHome() {
  const router = useRouter();
  const { pid } = router.query;

  const [risks, setRisks] = useState<Risk[]>([]);
  const [filter, setFilter] = useState<{ prob: number; impact: number } | null>(
    null,
  );
  const [meta, setMeta] = useState<ProjectMeta>({
    projectName: '',
    projectManager: '',
    sponsor: '',
    startDate: '',
    endDate: '',
    riskPlan: '',
  });

  useEffect(() => {
    if (!router.isReady) return;
    const saved = typeof window !== 'undefined' && localStorage.getItem('projects');
    const list: Project[] = saved ? JSON.parse(saved) : [];
    const current = list.find((p) => p.id === pid);
    if (current) {
      setRisks(current.risks || []);
      setMeta(current.meta);
    }
  }, [router.isReady, pid]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExportOptions(false);
      }
      if (addRef.current && !addRef.current.contains(e.target as Node)) {
        setShowAddOptions(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const saveProject = (data: Partial<Project>) => {
    if (!router.isReady) return;
    const saved = typeof window !== 'undefined' && localStorage.getItem('projects');
    const list: Project[] = saved ? JSON.parse(saved) : [];
    const idx = list.findIndex((p) => p.id === pid);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...data } as Project;
      localStorage.setItem('projects', JSON.stringify(list));
    }
  };

  const saveRisks = (items: Risk[]) => {
    setRisks(items);
    saveProject({ risks: items });
  };

  const saveMeta = (data: ProjectMeta) => {
    setMeta(data);
    saveProject({ meta: data });
  };

  const removeRisk = (id: string) => {
    const updated = risks.filter((item) => item.id !== id);
    saveRisks(updated);
  };

  const matrix: Record<number, Record<number, Risk[]>> = {};
  for (let p = 1; p <= 5; p++) {
    matrix[p] = {};
    for (let i = 1; i <= 5; i++) matrix[p][i] = [];
  }
  risks.forEach((r) => matrix[r.probability][r.impact].push(r));

  const aggregatedScore =
    risks.length > 0
      ? risks.reduce((sum, r) => sum + r.probability * r.impact, 0) / risks.length
      : 0;

  const handleCellClick = (prob: number, impact: number) => {
    if (filter && filter.prob === prob && filter.impact === impact) {
      setFilter(null);
    } else {
      setFilter({ prob, impact });
    }
  };

  const filteredRisks = filter
    ? risks.filter((r) => r.probability === filter.prob && r.impact === filter.impact)
    : risks;

  const exportData = (format: 'csv' | 'xlsx') => {
    const riskSheet = XLSX.utils.json_to_sheet(risks);
    if (format === 'xlsx') {
      const metaSheet = XLSX.utils.json_to_sheet([meta]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, metaSheet, 'Meta');
      XLSX.utils.book_append_sheet(wb, riskSheet, 'Risks');
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'risks.xlsx';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const csv = XLSX.utils.sheet_to_csv(riskSheet);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'risks.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const [showExportOptions, setShowExportOptions] = useState(false);
  const [showAddOptions, setShowAddOptions] = useState(false);
  const exportRef = useRef<HTMLDivElement | null>(null);
  const addRef = useRef<HTMLDivElement | null>(null);

  const fileInput = useRef<HTMLInputElement | null>(null);

  const importFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    const reader = new FileReader();
    reader.onload = () => {
      let wb: XLSX.WorkBook | null = null;
      if (ext === 'csv') {
        wb = XLSX.read(reader.result as string, { type: 'string' });
      } else {
        const data = new Uint8Array(reader.result as ArrayBuffer);
        wb = XLSX.read(data, { type: 'array' });
      }
      if (!wb) return;
      const riskSheet = wb.Sheets['Risks'] || wb.Sheets[wb.SheetNames[0]];
      const metaSheet = wb.Sheets['Meta'];
      if (metaSheet) {
        const metaData = XLSX.utils.sheet_to_json<ProjectMeta>(metaSheet)[0] as ProjectMeta;
        if (metaData) {
          saveMeta({
            projectName: metaData.projectName || '',
            projectManager: metaData.projectManager || '',
            sponsor: metaData.sponsor || '',
            startDate: metaData.startDate || '',
            endDate: metaData.endDate || '',
            riskPlan: metaData.riskPlan || '',
          });
        }
      }
      if (riskSheet) {
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(riskSheet);
        const records: Risk[] = rows.map((r) => ({
          id: (r['id'] as string) || Date.now().toString() + Math.random().toString(16).slice(2),
          description: (r['description'] as string) || '',
          category: (r['category'] as string) || '',
          probability: Number(r['probability']) || 1,
          impact: Number(r['impact']) || 1,
          owner: (r['owner'] as string) || '',
          mitigation: (r['mitigation'] as string) || '',
          response: (r['response'] as Risk['response']) || 'Mitigate',
          status: (r['status'] as Risk['status']) || 'Open',
          statusHistory: [],
          dateIdentified:
            (r['dateIdentified'] as string) || (r['startDate'] as string) || new Date().toISOString(),
          dateResolved: (r['dateResolved'] as string) || '',
          lastReviewed: (r['lastReviewed'] as string) || new Date().toISOString(),
        }));
        const updated = [...risks, ...records];
        saveRisks(updated);
      }
      e.target.value = '';
    };
    if (ext === 'csv') {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-950 text-white shadow">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Risk Manager</h1>
          <div className="space-x-2 relative">
            <div className="inline-block" ref={addRef}>
              <button
                onClick={() => setShowAddOptions((p) => !p)}
                className="border px-2 py-1 rounded hover:bg-gray-100 text-black bg-white"
              >
                Add +
              </button>
              {showAddOptions && (
                <div className="absolute right-0 mt-1 w-32 bg-white border rounded shadow z-10">
                  <Link
                    href={`/project/${pid}/risk/new`}
                    className="block px-3 py-1 hover:bg-gray-100"
                    onClick={() => setShowAddOptions(false)}
                  >
                    Risk
                  </Link>
                  <Link
                    href="/projects"
                    className="block px-3 py-1 hover:bg-gray-100"
                    onClick={() => setShowAddOptions(false)}
                  >
                    Project
                  </Link>
                </div>
              )}
            </div>
            <Link
              href={`/project/${pid}/settings`}
              className="border px-2 py-1 rounded hover:bg-gray-100 text-black bg-white"
            >
              Settings
            </Link>
          </div>
        </div>
      </nav>
      <main className="container mx-auto p-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <AggregatedRiskPanel score={aggregatedScore} />
            <RiskMatrixPanel
              matrix={matrix}
              filter={filter}
              onCellClick={handleCellClick}
            />
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold mb-2">Risk History Timeline</h2>
            <RiskHistoryTimeline risks={risks} project={meta} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Risk Register</h2>
            <div className="space-x-2">
              {filter && (
                <button onClick={() => setFilter(null)} className="border px-2 py-1 rounded hover:bg-gray-100">
                  Clear Filter
                </button>
              )}
              <div className="relative inline-block" ref={exportRef}>
                <button
                  onClick={() => setShowExportOptions((prev) => !prev)}
                  className="border px-2 py-1 rounded hover:bg-gray-100 flex items-center"
                >
                  Export
                  <svg
                    className="w-4 h-4 ml-1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06-.02L10 10.78l3.71-3.59a.75.75 0 111.04 1.08l-4.23 4.09a.75.75 0 01-1.04 0L5.25 8.27a.75.75 0 01-.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {showExportOptions && (
                  <div className="absolute right-0 mt-1 w-28 bg-white border rounded shadow">
                    <button
                      onClick={() => {
                        setShowExportOptions(false);
                        exportData('xlsx');
                      }}
                      className="block w-full text-left px-3 py-1 hover:bg-gray-100"
                    >
                      Excel
                    </button>
                    <button
                      onClick={() => {
                        setShowExportOptions(false);
                        exportData('csv');
                      }}
                      className="block w-full text-left px-3 py-1 hover:bg-gray-100"
                    >
                      CSV
                    </button>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept=".xlsx,.csv"
                ref={fileInput}
                onChange={importFile}
                className="hidden"
              />
              <button onClick={() => fileInput.current?.click()} className="border px-2 py-1 rounded hover:bg-gray-100">
                Import
              </button>
            </div>
          </div>
          <table className="w-full border rounded">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-1">ID</th>
                <th className="border p-1">Description</th>
                <th className="border p-1">Category</th>
                <th className="border p-1">Prob</th>
                <th className="border p-1">Impact</th>
                <th className="border p-1">Identified</th>
                <th className="border p-1">Resolved</th>
                <th className="border p-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRisks.map((r) => (
                <tr key={r.id} className="border-t hover:bg-gray-50 transition">
                  <td className="border p-1">{r.id}</td>
                  <td className="border p-1">{r.description}</td>
                  <td className="border p-1">{r.category}</td>
                  <td className="border p-1">{r.probability}</td>
                  <td className="border p-1">{r.impact}</td>
                  <td className="border p-1">{r.dateIdentified ? r.dateIdentified.split('T')[0] : ''}</td>
                  <td className="border p-1">{r.dateResolved ? r.dateResolved.split('T')[0] : ''}</td>
                  <td className="border p-1 space-x-2">
                    <Link href={`/project/${pid}/risk/${r.id}`} className="text-blue-600">
                      Manage
                    </Link>
                    <button onClick={() => removeRisk(r.id)} className="text-red-600">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
