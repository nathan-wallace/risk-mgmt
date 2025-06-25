import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Risk, RiskInput } from '@/types/risk';
import { Project } from '@/types/project';

export default function ManageRisk() {
  const router = useRouter();
  const { pid, id } = router.query as { pid?: string; id?: string };

  const [risks, setRisks] = useState<Risk[]>([]);
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

  useEffect(() => {
    if (!router.isReady) return;
    const saved = typeof window !== 'undefined' && localStorage.getItem('projects');
    if (saved) {
      const projects: Project[] = JSON.parse(saved);
      const proj = projects.find((p) => p.id === pid);
      if (proj) {
        setRisks(proj.risks);
        if (id && id !== 'new') {
          const risk = proj.risks.find((r) => r.id === id);
          if (risk) {
            const { id: discardId, lastReviewed: discardLast, statusHistory: discardHistory, ...rest } = risk;
            void discardId;
            void discardLast;
            void discardHistory;
            setForm({
              ...rest,
              dateIdentified: rest.dateIdentified || new Date().toISOString(),
              dateResolved: rest.dateResolved || '',
            });
          }
        }
      }
    }
  }, [router.isReady, pid, id]);

  const saveRisks = (items: Risk[]) => {
    setRisks(items);
    if (!router.isReady) return;
    const saved = typeof window !== 'undefined' && localStorage.getItem('projects');
    const projects: Project[] = saved ? JSON.parse(saved) : [];
    const idx = projects.findIndex((p) => p.id === pid);
    if (idx >= 0) {
      projects[idx].risks = items;
      localStorage.setItem('projects', JSON.stringify(projects));
    }
  };

  const validate = () => {
    const errs: Partial<Record<keyof RiskInput, string>> = {};
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.category.trim()) errs.category = 'Category is required';
    if (!form.owner.trim()) errs.owner = 'Owner is required';
    if (!form.mitigation.trim()) errs.mitigation = 'Mitigation is required';
    if (!form.response) errs.response = 'Response is required';
    if (form.probability < 1 || form.probability > 5) errs.probability = 'Probability must be 1-5';
    if (form.impact < 1 || form.impact > 5) errs.impact = 'Impact must be 1-5';
    if (!form.dateIdentified) errs.dateIdentified = 'Date Identified is required';
    if (form.dateResolved && form.dateIdentified && form.dateIdentified > form.dateResolved)
      errs.dateResolved = 'Date Resolved must be after Date Identified';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    if (id && id !== 'new') {
      const existing = risks.find((r) => r.id === id)!;
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
      saveRisks(risks.map((r) => (r.id === updated.id ? updated : r)));
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
      saveRisks([...risks, newRisk]);
    }
    router.push(`/project/${pid}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-xl font-semibold mb-4">{id === 'new' ? 'Add Risk' : 'Edit Risk'}</h1>
      <div className="bg-white rounded-lg shadow p-4 space-y-2 max-w-xl mx-auto">
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>
        <input
          id="description"
          className="border p-1 w-full"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}

        <label htmlFor="category" className="block text-sm font-medium">
          Category
        </label>
        <input
          id="category"
          className="border p-1 w-full"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
        {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}

        <label htmlFor="owner" className="block text-sm font-medium">
          Owner
        </label>
        <input
          id="owner"
          className="border p-1 w-full"
          value={form.owner}
          onChange={(e) => setForm({ ...form, owner: e.target.value })}
        />
        {errors.owner && <p className="text-red-500 text-sm">{errors.owner}</p>}

        <label htmlFor="mitigation" className="block text-sm font-medium">
          Mitigation
        </label>
        <textarea
          id="mitigation"
          className="border p-1 w-full"
          value={form.mitigation}
          onChange={(e) => setForm({ ...form, mitigation: e.target.value })}
        />
        {errors.mitigation && <p className="text-red-500 text-sm">{errors.mitigation}</p>}

        <label htmlFor="response" className="block text-sm font-medium">
          Response
        </label>
        <select
          id="response"
          className="border p-1 w-full"
          value={form.response}
          onChange={(e) => setForm({ ...form, response: e.target.value as Risk['response'] })}
        >
          <option>Avoid</option>
          <option>Mitigate</option>
          <option>Transfer</option>
          <option>Accept</option>
        </select>
        {errors.response && <p className="text-red-500 text-sm">{errors.response}</p>}

        <label htmlFor="status" className="block text-sm font-medium">
          Status
        </label>
        <select
          id="status"
          className="border p-1 w-full"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value as Risk['status'] })}
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
        {errors.dateIdentified && <p className="text-red-500 text-sm">{errors.dateIdentified}</p>}

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
        {errors.dateResolved && <p className="text-red-500 text-sm">{errors.dateResolved}</p>}

        <div className="flex gap-2">
          <label htmlFor="probability">Prob</label>
          <input
            id="probability"
            type="number"
            min="1"
            max="5"
            className="border"
            value={form.probability}
            onChange={(e) => setForm({ ...form, probability: Number(e.target.value) })}
          />
          <label htmlFor="impact">Impact</label>
          <input
            id="impact"
            type="number"
            min="1"
            max="5"
            className="border"
            value={form.impact}
            onChange={(e) => setForm({ ...form, impact: Number(e.target.value) })}
          />
        </div>
        {errors.probability && <p className="text-red-500 text-sm">{errors.probability}</p>}
        {errors.impact && <p className="text-red-500 text-sm">{errors.impact}</p>}

        <div className="space-x-2">
          <button onClick={submit} className="bg-indigo-600 text-white px-3 py-1 rounded">
            {id === 'new' ? 'Add' : 'Update'}
          </button>
          <button onClick={() => router.push(`/project/${pid}`)} className="border px-3 py-1 rounded">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
