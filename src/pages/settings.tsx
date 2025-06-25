import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ProjectMeta } from '@/types/project';

export default function Settings() {
  const router = useRouter();
  const [form, setForm] = useState<ProjectMeta>({
    projectName: '',
    projectManager: '',
    sponsor: '',
    startDate: '',
    endDate: '',
    riskPlan: '',
  });

  useEffect(() => {
    const saved = typeof window !== 'undefined' && localStorage.getItem('projectMeta');
    if (saved) {
      const parsed: ProjectMeta = JSON.parse(saved);
      setForm({
        projectName: parsed.projectName || '',
        projectManager: parsed.projectManager || '',
        sponsor: parsed.sponsor || '',
        startDate: parsed.startDate || '',
        endDate: parsed.endDate || '',
        riskPlan: parsed.riskPlan || '',
      });
    }
  }, []);

  const save = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('projectMeta', JSON.stringify(form));
    }
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-xl font-semibold mb-4">Project Details</h1>
      <div className="bg-white rounded-lg shadow p-4 space-y-3 max-w-xl mx-auto">
        <label htmlFor="projectName" className="block text-sm font-medium">
          Project Name
        </label>
        <input
          id="projectName"
          className="border p-2 rounded w-full"
          value={form.projectName}
          onChange={(e) => setForm({ ...form, projectName: e.target.value })}
        />

        <label htmlFor="projectManager" className="block text-sm font-medium">
          Project Manager
        </label>
        <input
          id="projectManager"
          className="border p-2 rounded w-full"
          value={form.projectManager}
          onChange={(e) => setForm({ ...form, projectManager: e.target.value })}
        />

        <label htmlFor="sponsor" className="block text-sm font-medium">
          Sponsor
        </label>
        <input
          id="sponsor"
          className="border p-2 rounded w-full"
          value={form.sponsor}
          onChange={(e) => setForm({ ...form, sponsor: e.target.value })}
        />

        <label htmlFor="startDate" className="block text-sm font-medium">
          Start Date
        </label>
        <input
          id="startDate"
          type="date"
          className="border p-2 rounded w-full"
          value={form.startDate}
          onChange={(e) => setForm({ ...form, startDate: e.target.value })}
        />

        <label htmlFor="endDate" className="block text-sm font-medium">
          End Date
        </label>
        <input
          id="endDate"
          type="date"
          className="border p-2 rounded w-full"
          value={form.endDate}
          onChange={(e) => setForm({ ...form, endDate: e.target.value })}
        />

        <label htmlFor="riskPlan" className="block text-sm font-medium">
          Risk Management Plan
        </label>
        <textarea
          id="riskPlan"
          className="border p-2 rounded w-full"
          value={form.riskPlan}
          onChange={(e) => setForm({ ...form, riskPlan: e.target.value })}
        />

        <div className="space-x-2 text-right pt-2">
          <button onClick={save} className="bg-indigo-600 text-white px-3 py-1 rounded">
            Save
          </button>
          <button onClick={() => router.push('/')} className="border px-3 py-1 rounded">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
