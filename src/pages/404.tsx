import Link from 'next/link';

export default function Custom404() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <Link href="/projects" className="text-blue-600">
          Go to Projects
        </Link>
      </div>
    </div>
  );
}
