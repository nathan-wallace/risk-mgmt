import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function ProjectIndex() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/projects');
  }, [router]);
  return <p className="p-4">Redirecting...</p>;
}
