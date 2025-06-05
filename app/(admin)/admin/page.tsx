'use client';

import { signIn, useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/admin/dashboard');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await signIn('credentials', {
      redirect: false,
      username,
      password,
    });

    if (res?.error) {
      setError(res.error);
    } else {
      router.push('/admin/dashboard');
    }
  };

  if (status === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <p className="text-gray-600 dark:text-gray-300">Checking session...</p>
      </main>
    );
  }

  if (status === 'authenticated') {
    return null; // avoid flickering
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 w-full max-w-sm p-6 bg-white dark:bg-gray-800 rounded shadow-md dark:shadow-lg transition-all"
      >
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100">
          Admin Login
        </h1>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded w-full transition-colors"
        >
          Sign In
        </button>
      </form>
    </main>
  );
}
