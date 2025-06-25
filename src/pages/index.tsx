import { useEffect, useRef, useState } from 'react';
import { Risk, RiskInput } from '@/types/risk';
import { ProjectMeta } from '@/types/project';
import RiskHistoryTimeline from '@/components/RiskHistoryTimeline';
import * as XLSX from 'xlsx';

export default function Home() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<{ prob: number; impact: number } | null>(null);
  const [form, setForm] = useState<RiskInput>({
    description: '',
    category: '',
    probability: 1,
    impact: 1,
    owner: '',
    mitigation: '',
    response: 'Mitigate',
    status: 'Open',
    dateIdentified: new Date().toISOString(),
    dateResolved: '',
  });
  const [statusNote, setStatusNote] = useState('');
  const [errors, setErrors] = useState<Partial<Record<keyof RiskInput, string>>>({});
  const [meta, setMeta] = useState<ProjectMeta>({
    projectName: '',
    projectManager: '',
    sponsor: '',
    startDate: '',
    endDate: '',
    riskPlan: '',
  });
  const [showMeta, setShowMeta] = useState(false);

  useEffect(() => {
    const savedRisks = typeof window !== 'undefined' && localStorage.getItem('risks');
    const savedMeta = typeof window !== 'undefined' && localStorage.getItem('projectMeta');
    if (savedRisks) {
      const parsed: Risk[] = JSON.parse(savedRisks);
      setRisks(
        parsed.map((r) => {
          const anyRisk = r as unknown as Record<string, unknown>;
          const di =
            r.dateIdentified ||
            (typeof anyRisk.startDate === 'string' ? anyRisk.startDate : '');
          return {
            ...r,
            dateIdentified: di || new Date().toISOString(),
            dateResolved: r.dateResolved || '',
          };
        }),
      );
    } else {
      fetch('/risks.json')
        .then((res) => res.json())
        .then((data: Risk[]) => {
          const mapped = data.map((r) => {
            const anyRisk = r as unknown as Record<string, unknown>;
            const di =
              r.dateIdentified ||
              (typeof anyRisk.startDate === 'string' ? anyRisk.startDate : '');
            return {
              ...r,
              dateIdentified: di || new Date().toISOString(),
              dateResolved: r.dateResolved || '',
            };
          });
          setRisks(mapped);
          if (typeof window !== 'undefined') {
            localStorage.setItem('risks', JSON.stringify(mapped));
          }
        });
    }
    if (savedMeta) {
      const parsed: ProjectMeta = JSON.parse(savedMeta);
      setMeta({
        projectName: parsed.projectName || '',
        projectManager: parsed.projectManager || '',
        sponsor: parsed.sponsor || '',
        startDate: parsed.startDate || '',
        endDate: parsed.endDate || '',
        riskPlan: parsed.riskPlan || '',
      });
    }
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setShowExportOptions(false);
      }
      if (scoreInfoRef.current && !scoreInfoRef.current.contains(e.target as Node)) {
        setShowScoreInfo(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const validate = () => {
    const errs: Partial<Record<keyof RiskInput, string>> = {};
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.category.trim()) errs.category = 'Category is required';
    if (!form.owner.trim()) errs.owner = 'Owner is required';
    if (!form.mitigation.trim()) errs.mitigation = 'Mitigation is required';
    if (!form.response) errs.response = 'Response is required';
    if (form.probability < 1 || form.probability > 5)
      errs.probability = 'Probability must be 1-5';
    if (form.impact < 1 || form.impact > 5)
      errs.impact = 'Impact must be 1-5';
    if (!form.dateIdentified) errs.dateIdentified = 'Date Identified is required';
    if (
      form.dateResolved &&
      form.dateIdentified &&
      form.dateIdentified > form.dateResolved
    )
      errs.dateResolved = 'Date Resolved must be after Date Identified';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const save = (items: Risk[]) => {
    setRisks(items);
    if (typeof window !== 'undefined') {
      localStorage.setItem('risks', JSON.stringify(items));
    }
  };

  const saveMeta = (data: ProjectMeta) => {
    setMeta(data);
    if (typeof window !== 'undefined') {
      localStorage.setItem('projectMeta', JSON.stringify(data));
    }
  };

  const submit = () => {
    if (!validate()) return;
    if (editingId) {
      const existing = risks.find((r) => r.id === editingId)!;
      const history = [...existing.statusHistory];
      if (existing.status !== form.status || statusNote.trim()) {
        history.push({
          date: new Date().toISOString(),
          status: form.status,
          note: statusNote,
        });
      }
      const updated: Risk = {
        ...existing,
        ...form,
        lastReviewed: new Date().toISOString(),
        statusHistory: history,
      };
      save(risks.map((item) => (item.id === updated.id ? updated : item)));
    } else {
      const newRisk: Risk = {
        id: Date.now().toString(),
        lastReviewed: new Date().toISOString(),
        ...form,
        statusHistory: [
          {
            date: new Date().toISOString(),
            status: form.status,
            note: statusNote,
          },
        ],
      };
      save([...risks, newRisk]);
    }
    setForm({
      description: '',
      category: '',
      probability: 1,
      impact: 1,
      owner: '',
      mitigation: '',
      response: 'Mitigate',
      status: 'Open',
      dateIdentified: new Date().toISOString(),
      dateResolved: '',
    });
    setStatusNote('');
    setEditingId(null);
    setErrors({});
  };

  const startEdit = (risk: Risk) => {
    setEditingId(risk.id);
    const { id: discardId, lastReviewed: discardLast, statusHistory: discardHistory, ...rest } = risk;
    void discardId;
    void discardLast;
    void discardHistory;
    setForm({
      ...rest,
      dateIdentified: rest.dateIdentified || new Date().toISOString(),
      dateResolved: rest.dateResolved || '',
    });
    setStatusNote('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm({
      description: '',
      category: '',
      probability: 1,
      impact: 1,
      owner: '',
      mitigation: '',
      response: 'Mitigate',
      status: 'Open',
      dateIdentified: new Date().toISOString(),
      dateResolved: '',
    });
    setStatusNote('');
    setErrors({});
  };

  const removeRisk = (id: string) => {
    const updated = risks.filter((item) => item.id !== id);
    save(updated);
    if (editingId === id) cancelEdit();
  };

  const matrix: Record<number, Record<number, Risk[]>> = {};
  for (let p = 1; p <= 5; p++) {
    matrix[p] = {};
    for (let i = 1; i <= 5; i++) matrix[p][i] = [];
  }
  risks.forEach((r) => matrix[r.probability][r.impact].push(r));

  const aggregatedScore =
    risks.length > 0
      ?
          risks.reduce(
            (sum, r) => sum + r.probability * r.impact,
            0
          ) / risks.length
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
  const exportRef = useRef<HTMLDivElement | null>(null);

  const [showScoreInfo, setShowScoreInfo] = useState(false);
  const scoreInfoRef = useRef<HTMLDivElement | null>(null);

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
        save(updated);
      }
      e.target.value = '';
    };
    if (ext === 'csv') {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  };

  const color = (score: number) => {
    if (score >= 15) return 'bg-red-500 text-white';
    if (score >= 5) return 'bg-yellow-300';
    return 'bg-green-300';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-950 text-white shadow">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Risk Manager</h1>
          <button
            onClick={() => setShowMeta(true)}
            className="border px-2 py-1 rounded hover:bg-gray-100 text-black"
          >
            Project Data
          </button>
        </div>
      </nav>
      <main className="container mx-auto p-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow p-4 space-y-2">
          <h2 className="font-semibold">{editingId ? 'Edit Risk' : 'Add Risk'}</h2>
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium">
              Description
            </label>
            <input
              id="description"
              className="border p-1 w-full"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description}</p>
            )}
            <label htmlFor="category" className="block text-sm font-medium">
              Category
            </label>
            <input
              id="category"
              className="border p-1 w-full"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            {errors.category && (
              <p className="text-red-500 text-sm">{errors.category}</p>
            )}
            <label htmlFor="owner" className="block text-sm font-medium">
              Owner
            </label>
            <input
              id="owner"
              className="border p-1 w-full"
              value={form.owner}
              onChange={(e) => setForm({ ...form, owner: e.target.value })}
            />
            {errors.owner && (
              <p className="text-red-500 text-sm">{errors.owner}</p>
            )}
            <label htmlFor="mitigation" className="block text-sm font-medium">
              Mitigation
            </label>
            <textarea
              id="mitigation"
              className="border p-1 w-full"
              value={form.mitigation}
              onChange={(e) => setForm({ ...form, mitigation: e.target.value })}
            />
            {errors.mitigation && (
              <p className="text-red-500 text-sm">{errors.mitigation}</p>
            )}
            <label htmlFor="response" className="block text-sm font-medium">
              Response
            </label>
            <select
              id="response"
              className="border p-1 w-full"
              value={form.response}
              onChange={(e) =>
                setForm({ ...form, response: e.target.value as Risk['response'] })
              }
            >
              <option>Avoid</option>
              <option>Mitigate</option>
              <option>Transfer</option>
              <option>Accept</option>
            </select>
            {errors.response && (
              <p className="text-red-500 text-sm">{errors.response}</p>
            )}
            <label htmlFor="status" className="block text-sm font-medium">
              Status
            </label>
            <select
              id="status"
              className="border p-1 w-full"
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value as Risk['status'] })
              }
            >
              <option>Open</option>
              <option>In-Progress</option>
              <option>Mitigated</option>
              <option>Accepted</option>
            </select>
            <label htmlFor="statusNote" className="block text-sm font-medium">
              Status Change Note
            </label>
            <textarea
              id="statusNote"
              className="border p-1 w-full"
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
            />
            <label htmlFor="dateIdentified" className="block text-sm font-medium">
              Date Identified
            </label>
            <input
              id="dateIdentified"
              type="date"
              className="border p-1 w-full"
              value={form.dateIdentified ? form.dateIdentified.split('T')[0] : ''}
              onChange={(e) => setForm({ ...form, dateIdentified: e.target.value })}
            />
            {errors.dateIdentified && (
              <p className="text-red-500 text-sm">{errors.dateIdentified}</p>
            )}
            <label htmlFor="dateResolved" className="block text-sm font-medium">
              Date Resolved
            </label>
            <input
              id="dateResolved"
              type="date"
              className="border p-1 w-full"
              value={form.dateResolved ? form.dateResolved.split('T')[0] : ''}
              onChange={(e) => setForm({ ...form, dateResolved: e.target.value })}
            />
            {errors.dateResolved && (
              <p className="text-red-500 text-sm">{errors.dateResolved}</p>
            )}
            <div className="flex gap-2">
              <label htmlFor="probability">Prob</label>
              <input
                id="probability"
                type="number"
                min="1"
                max="5"
                className="border"
                value={form.probability}
                onChange={(e) =>
                  setForm({ ...form, probability: Number(e.target.value) })
                }
              />
              <label htmlFor="impact">Impact</label>
              <input
                id="impact"
                type="number"
                min="1"
                max="5"
                className="border"
                value={form.impact}
                onChange={(e) =>
                  setForm({ ...form, impact: Number(e.target.value) })
                }
              />
            </div>
            {errors.probability && (
              <p className="text-red-500 text-sm">{errors.probability}</p>
            )}
            {errors.impact && (
              <p className="text-red-500 text-sm">{errors.impact}</p>
            )}
            <div className="space-x-2">
              <button onClick={submit} className="bg-indigo-600 text-white px-3 py-1 rounded">
                {editingId ? 'Update' : 'Add'}
              </button>
              {editingId && (
                <button onClick={cancelEdit} className="border px-3 py-1 rounded">Cancel</button>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 overflow-auto">
          <div className="flex items-start justify-between">
            <h2 className="font-semibold">Risk Matrix</h2>
            <div className="flex flex-col items-end">
              <div className="flex items-center">
                <h3 className="font-semibold mr-1">Aggregated Risk</h3>
                <div className="relative inline-block ml-1" ref={scoreInfoRef}>
                  <button
                    onClick={() => setShowScoreInfo((p) => !p)}
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
                  {showScoreInfo && (
                    <div className="absolute right-0 mt-1 w-64 bg-white border rounded shadow p-2 text-sm">
                      Aggregated score is the average of each risk&apos;s probability multiplied by impact. Scores 15 or higher indicate high risk (red), 5–14 moderate (yellow), and below 5 low (green). This metric reflects the overall project risk severity.
                    </div>
                  )}
                </div>
              </div>
              <span
                className={`mt-1 px-4 py-2 rounded text-2xl font-semibold ${color(
                  aggregatedScore
                )}`}
              >
                {aggregatedScore.toFixed(1)}
              </span>
            </div>
          </div>
          <table className="border-collapse rounded shadow">
            <caption className="sr-only">Risk matrix showing number of risks for each probability and impact score</caption>
            <tbody>
              {Array.from({ length: 5 }, (_, i) => 5 - i).map((impact) => (
                <tr key={impact}>
                  {Array.from({ length: 5 }, (_, j) => j + 1).map((prob) => {
                    const items = matrix[prob][impact];
                    const score = prob * impact;
                    const selected = filter && filter.prob === prob && filter.impact === impact;
                    return (
                      <td
                        key={prob}
                        role="button"
                        tabIndex={0}
                        aria-label={`Probability ${prob} Impact ${impact} contains ${items.length} risks`}
                        onClick={() => handleCellClick(prob, impact)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleCellClick(prob, impact);
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
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold mb-2">Risk History Timeline</h2>
        <RiskHistoryTimeline risks={risks} project={meta} />
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Risk Register</h2>
          <div className="space-x-2">
            {filter && (
              <button onClick={() => setFilter(null)} className="border px-2 py-1 rounded hover:bg-gray-100">Clear Filter</button>
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
            <button onClick={() => fileInput.current?.click()} className="border px-2 py-1 rounded hover:bg-gray-100">Import</button>
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
                  <button onClick={() => startEdit(r)} className="text-blue-600">Edit</button>
                  <button onClick={() => removeRisk(r.id)} className="text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </main>
      {showMeta && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded shadow w-80 space-y-2">
            <h2 className="font-semibold text-lg">Project Data</h2>
            <label className="block text-sm font-medium">Project Name</label>
            <input className="border p-1 w-full" value={meta.projectName} onChange={(e) => setMeta({ ...meta, projectName: e.target.value })} />
            <label className="block text-sm font-medium">Project Manager</label>
            <input className="border p-1 w-full" value={meta.projectManager} onChange={(e) => setMeta({ ...meta, projectManager: e.target.value })} />
            <label className="block text-sm font-medium">Sponsor</label>
            <input className="border p-1 w-full" value={meta.sponsor} onChange={(e) => setMeta({ ...meta, sponsor: e.target.value })} />
            <label className="block text-sm font-medium">Start Date</label>
            <input type="date" className="border p-1 w-full" value={meta.startDate} onChange={(e) => setMeta({ ...meta, startDate: e.target.value })} />
            <label className="block text-sm font-medium">End Date</label>
            <input type="date" className="border p-1 w-full" value={meta.endDate} onChange={(e) => setMeta({ ...meta, endDate: e.target.value })} />
            <label className="block text-sm font-medium">Risk Management Plan</label>
            <textarea className="border p-1 w-full" value={meta.riskPlan} onChange={(e) => setMeta({ ...meta, riskPlan: e.target.value })} />
            <div className="space-x-2 pt-2 text-right">
              <button onClick={() => { saveMeta(meta); setShowMeta(false); }} className="bg-indigo-600 text-white px-3 py-1 rounded">Save</button>
              <button onClick={() => setShowMeta(false)} className="border px-3 py-1 rounded">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
