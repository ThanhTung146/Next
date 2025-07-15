'use client';

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-4">🎓 Online Learning System</h1>
      <p className="text-gray-600 mb-6">Welcome to top 1 E-learning System.</p>
      <div className="flex gap-4">
        <button
          onClick={() => router.push('/login')}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Login
        </button>
        <button
          onClick={() => router.push('/sign-up')}
          className="px-6 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Signup
        </button>
      </div>
    </main>
  );
}
