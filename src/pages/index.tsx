import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const saved = typeof window !== 'undefined' && localStorage.getItem('projects');
    if (saved) {
      const list = JSON.parse(saved) as { id: string }[];
      if (list.length > 0) {
        router.replace(`/project/${list[0].id}`);
        return;
      }
    }
    router.replace('/projects');
  }, [router]);

  return <p className="p-4">Redirecting...</p>;
}
