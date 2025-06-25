import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Project } from '@/types/project';

export default function Custom404() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    const saved = typeof window !== 'undefined' && localStorage.getItem('projects');
    const list: Project[] = saved ? JSON.parse(saved) : [];
    if (list.length > 0) {
      router.replace(`/project/${list[list.length - 1].id}`);
    } else {
      router.replace('/projects');
    }
  }, [router]);

  return null;
}
