'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function AdminLoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const res = await signIn('credentials', {
      redirect: false,
      username,
      password,
    })

    if (res?.error) {
      setError(res.error)
    } else {
      window.location.href = 'admin/dashboard' // ✅ updated path
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 w-full max-w-sm p-6 bg-white rounded shadow"
      >
        <h1 className="text-2xl font-bold text-center">Admin Login</h1>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="border rounded p-2 w-full"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border rounded p-2 w-full"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded w-full"
        >
          Sign In
        </button>
      </form>
    </main>
  )
}
