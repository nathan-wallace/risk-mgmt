import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ProjectMeta, Project } from '@/types/project';

export default function Settings() {
  const router = useRouter();
  const { pid } = router.query as { pid?: string };
  const [form, setForm] = useState<ProjectMeta>({
    projectName: '',
    projectManager: '',
    sponsor: '',
    startDate: '',
    endDate: '',
    riskPlan: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectMeta, string>>>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    if (!router.isReady) return;
    const saved = typeof window !== 'undefined' && localStorage.getItem('projects');
    if (saved) {
      const projects: Project[] = JSON.parse(saved);
      const proj = projects.find((p) => p.id === pid);
      if (proj) {
        setForm({
          projectName: proj.meta.projectName || '',
          projectManager: proj.meta.projectManager || '',
          sponsor: proj.meta.sponsor || '',
          startDate: proj.meta.startDate || '',
          endDate: proj.meta.endDate || '',
          riskPlan: proj.meta.riskPlan || '',
        });
        setCategories(proj.categories || []);
      }
    }
  }, [router.isReady, pid]);

  const validate = () => {
    const errs: Partial<Record<keyof ProjectMeta, string>> = {};
    if (!form.projectName.trim()) errs.projectName = 'Title is required';
    if (!form.startDate) errs.startDate = 'Start date is required';
    if (!form.endDate) errs.endDate = 'End date is required';
    if (form.startDate && form.endDate && form.startDate > form.endDate) {
      errs.endDate = 'End date must be after start date';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const save = () => {
    if (!validate()) return;
    if (!router.isReady) return;
    const saved = typeof window !== 'undefined' && localStorage.getItem('projects');
    const projects: Project[] = saved ? JSON.parse(saved) : [];
    const idx = projects.findIndex((p) => p.id === pid);
    if (idx >= 0) {
      projects[idx].meta = form;
      projects[idx].categories = categories;
    } else {
      projects.push({ id: pid as string, meta: form, risks: [], categories });
    }
    localStorage.setItem('projects', JSON.stringify(projects));
    router.push(`/project/${pid}`);
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
        {errors.projectName && <p className="text-red-500 text-sm">{errors.projectName}</p>}

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
        {errors.startDate && <p className="text-red-500 text-sm">{errors.startDate}</p>}

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
        {errors.endDate && <p className="text-red-500 text-sm">{errors.endDate}</p>}

        <label htmlFor="riskPlan" className="block text-sm font-medium">
          Risk Management Plan
        </label>
        <textarea
          id="riskPlan"
          className="border p-2 rounded w-full"
          value={form.riskPlan}
          onChange={(e) => setForm({ ...form, riskPlan: e.target.value })}
        />

        <label className="block text-sm font-medium mt-4">Risk Categories</label>
        <ul className="space-y-1">
          {categories.map((cat, idx) => (
            <li key={idx} className="flex items-center">
              <span className="flex-1">{cat}</span>
              <button
                type="button"
                onClick={() => setCategories(categories.filter((_, i) => i !== idx))}
                className="text-red-600 ml-2"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
        <div className="flex items-center mt-1">
          <input
            className="border p-1 flex-1"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button
            type="button"
            onClick={() => {
              const trimmed = newCategory.trim();
              if (trimmed && !categories.includes(trimmed)) {
                setCategories([...categories, trimmed]);
              }
              setNewCategory('');
            }}
            className="ml-2 border px-2 py-1 rounded"
          >
            Add
          </button>
        </div>

        <div className="space-x-2 text-right pt-2">
          <button onClick={save} className="bg-indigo-600 text-white px-3 py-1 rounded">
            Save
          </button>
          <button onClick={() => router.push(`/project/${pid}`)} className="border px-3 py-1 rounded">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
