import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function RiskIndex() {
  const router = useRouter();
  const { pid } = router.query;

  useEffect(() => {
    if (pid) {
      router.replace(`/project/${pid}`);
    }
  }, [router, pid]);

  return <p className="p-4">Redirecting...</p>;
}
