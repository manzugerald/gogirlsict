'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function RegisterForm() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    const res = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify(form),
      headers: { "Content-Type": "application/json" },
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error || "Something went wrong")
      return
    }

    setSuccess("Account created! Redirecting to login...")
    setTimeout(() => router.push("/admin/dashboard"), 1500)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input name="firstName" placeholder="First Name" onChange={handleChange} required className="border p-2 w-full rounded" />
      <input name="lastName" placeholder="Last Name" onChange={handleChange} required className="border p-2 w-full rounded" />
      <input name="username" placeholder="Username" onChange={handleChange} required className="border p-2 w-full rounded" />
      <input type="email" name="email" placeholder="Email" onChange={handleChange} required className="border p-2 w-full rounded" />
      <input type="password" name="password" placeholder="Password" onChange={handleChange} required className="border p-2 w-full rounded" />

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">{success}</p>}

      <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">
        Register
      </button>
    </form>
  )
}
