'use client'

import RegisterForm from "@/components/auth/RegisterForm"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function RegisterPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/dashboard") // Redirect to login if not authenticated
    }
  }, [status, router])

  if (status === "loading") {
    return <div className="flex justify-center items-center h-screen">Loading...</div>
  }

  if (!session?.user) {
    return null // Return nothing while redirecting
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 p-6 rounded shadow dark:shadow-lg">
        <h1 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Register</h1>
        <RegisterForm />
      </div>
    </div>
  )
}
