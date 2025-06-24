import { useEffect, useRef, useState } from 'react';
import { Risk, RiskInput } from '@/types/risk';

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
    status: 'Open',
    dateIdentified: new Date().toISOString(),
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RiskInput, string>>>({});

  useEffect(() => {
    const saved = typeof window !== 'undefined' && localStorage.getItem('risks');
    if (saved) {
      setRisks(JSON.parse(saved));
    } else {
      fetch('/risks.json')
        .then((res) => res.json())
        .then((data: Risk[]) => {
          setRisks(data);
          if (typeof window !== 'undefined') {
            localStorage.setItem('risks', JSON.stringify(data));
          }
        });
    }
  }, []);

  const validate = () => {
    const errs: Partial<Record<keyof RiskInput, string>> = {};
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.category.trim()) errs.category = 'Category is required';
    if (!form.owner.trim()) errs.owner = 'Owner is required';
    if (!form.mitigation.trim()) errs.mitigation = 'Mitigation is required';
    if (form.probability < 1 || form.probability > 5)
      errs.probability = 'Probability must be 1-5';
    if (form.impact < 1 || form.impact > 5)
      errs.impact = 'Impact must be 1-5';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const save = (items: Risk[]) => {
    setRisks(items);
    if (typeof window !== 'undefined') {
      localStorage.setItem('risks', JSON.stringify(items));
    }
  };

  const submit = () => {
    if (!validate()) return;
    if (editingId) {
      const updated: Risk = {
        ...risks.find((r) => r.id === editingId)!,
        ...form,
        lastReviewed: new Date().toISOString(),
      };
      save(risks.map((item) => (item.id === updated.id ? updated : item)));
    } else {
      const newRisk: Risk = {
        id: Date.now().toString(),
        lastReviewed: new Date().toISOString(),
        ...form,
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
      status: 'Open',
      dateIdentified: new Date().toISOString(),
    });
    setEditingId(null);
    setErrors({});
  };

  const startEdit = (risk: Risk) => {
    setEditingId(risk.id);
    const { id: discardId, lastReviewed: discardLast, ...rest } = risk;
    void discardId;
    void discardLast;
    setForm(rest);
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
      status: 'Open',
      dateIdentified: new Date().toISOString(),
    });
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

  const exportCSV = () => {
    const header = Object.keys(risks[0] || {}).join(',');
    const rows = risks.map((r) =>
      [
        r.id,
        r.description,
        r.category,
        r.probability,
        r.impact,
        r.owner,
        r.mitigation,
        r.status,
        r.dateIdentified,
        r.lastReviewed,
      ].join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'risks.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const fileInput = useRef<HTMLInputElement | null>(null);

  const importCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result);
      const lines = text.trim().split(/\r?\n/);
      if (lines.length < 2) return;
      const headers = lines[0].split(',');
      const records: Risk[] = lines.slice(1).map((l) => {
        const values = l.split(',');
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => (row[h.trim()] = values[idx]?.trim() || ''));
        return {
          id:
            row.id || Date.now().toString() + Math.random().toString(16).slice(2),
          description: row.description || '',
          category: row.category || '',
          probability: Number(row.probability) || 1,
          impact: Number(row.impact) || 1,
          owner: row.owner || '',
          mitigation: row.mitigation || '',
          status: (row.status as Risk['status']) || 'Open',
          dateIdentified: row.dateIdentified || new Date().toISOString(),
          lastReviewed: row.lastReviewed || new Date().toISOString(),
        };
      });
      const updated = [...risks, ...records];
      save(updated);
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const color = (score: number) => {
    if (score >= 15) return 'bg-red-500 text-white';
    if (score >= 5) return 'bg-yellow-300';
    return 'bg-green-300';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-600 text-white shadow">
        <div className="container mx-auto px-4 py-3">
          <h1 className="text-xl font-semibold">Risk Register</h1>
        </div>
      </nav>
      <main className="container mx-auto p-4 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow p-4 space-y-2">
          <h2 className="font-semibold">{editingId ? 'Edit Risk' : 'Add Risk'}</h2>
          <div className="space-y-2">
            <input
              className="border p-1 w-full"
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            {errors.description && (
              <p className="text-red-500 text-sm">{errors.description}</p>
            )}
            <input
              className="border p-1 w-full"
              placeholder="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            {errors.category && (
              <p className="text-red-500 text-sm">{errors.category}</p>
            )}
            <input
              className="border p-1 w-full"
              placeholder="Owner"
              value={form.owner}
              onChange={(e) => setForm({ ...form, owner: e.target.value })}
            />
            {errors.owner && (
              <p className="text-red-500 text-sm">{errors.owner}</p>
            )}
            <textarea
              className="border p-1 w-full"
              placeholder="Mitigation"
              value={form.mitigation}
              onChange={(e) => setForm({ ...form, mitigation: e.target.value })}
            />
            {errors.mitigation && (
              <p className="text-red-500 text-sm">{errors.mitigation}</p>
            )}
            <select className="border p-1 w-full" value={form.status} onChange={(e) => setForm({...form, status: e.target.value as Risk['status']})}>
              <option>Open</option>
              <option>In-Progress</option>
              <option>Mitigated</option>
              <option>Accepted</option>
            </select>
            <div className="flex gap-2">
              <label>Prob</label>
              <input
                type="number"
                min="1"
                max="5"
                className="border"
                value={form.probability}
                onChange={(e) =>
                  setForm({ ...form, probability: Number(e.target.value) })
                }
              />
              <label>Impact</label>
              <input
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
              <button onClick={submit} className="bg-blue-500 text-white px-3 py-1 rounded">
                {editingId ? 'Update' : 'Add'}
              </button>
              {editingId && (
                <button onClick={cancelEdit} className="border px-3 py-1 rounded">Cancel</button>
              )}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 overflow-auto">
          <h2 className="font-semibold">Risk Matrix</h2>
          <table className="border-collapse rounded shadow">
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
                        onClick={() => handleCellClick(prob, impact)}
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
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Risks</h2>
          <div className="space-x-2">
            {filter && (
              <button onClick={() => setFilter(null)} className="border px-2 py-1 rounded hover:bg-gray-100">Clear Filter</button>
            )}
            <button onClick={exportCSV} className="border px-2 py-1 rounded hover:bg-gray-100">Export CSV</button>
            <input
              type="file"
              accept=".csv"
              ref={fileInput}
              onChange={importCSV}
              className="hidden"
            />
            <button onClick={() => fileInput.current?.click()} className="border px-2 py-1 rounded hover:bg-gray-100">Import CSV</button>
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
    </div>
  );
}
