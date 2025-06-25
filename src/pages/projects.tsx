import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Project } from '@/types/project';

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const router = useRouter();

  useEffect(() => {
    const saved = typeof window !== 'undefined' && localStorage.getItem('projects');
    if (saved) setProjects(JSON.parse(saved));
  }, []);

  const deleteProject = (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('projects', JSON.stringify(updated));
    }
  };

  const createProject = () => {
    const id = Date.now().toString();
    const newProject: Project = {
      id,
      meta: {
        projectName: '',
        projectManager: '',
        sponsor: '',
        startDate: '',
        endDate: '',
        riskPlan: '',
      },
      risks: [],
      categories: [],
    };
    const updated = [...projects, newProject];
    setProjects(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('projects', JSON.stringify(updated));
    }
    router.push(`/project/${id}/settings`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <h1 className="text-xl font-semibold mb-4">Projects</h1>
      <div className="space-y-2">
        {projects.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded shadow p-3 flex justify-between items-center"
          >
            <span>{p.meta.projectName || 'Untitled Project'}</span>
            <div className="space-x-2">
              <Link href={`/project/${p.id}`} className="text-blue-600">
                Open
              </Link>
              <button
                onClick={() => deleteProject(p.id)}
                className="text-red-600"
                aria-label="Delete project"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={createProject}
        className="mt-4 bg-indigo-600 text-white px-3 py-1 rounded"
      >
        New Project
      </button>
    </div>
  );
}
