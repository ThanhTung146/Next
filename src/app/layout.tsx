'use client';

import './globals.css'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    router.push('/login')
  }

  return (
    <html lang="vi" className='mds mdl-js'>

      <body className="bg-gray-50 text-gray-800">
        <nav className="bg-white shadow p-4 flex justify-between">
          <Link href="/dashboard" className="font-bold text-lg text-blue-600">
            🎓 Online Learning
          </Link>
          <div className="space-x-4">
            {isLoggedIn ? (
              <button onClick={handleLogout} className="text-sm text-red-600 hover:underline">
                Logout
              </button>
            ) : (
              <>
                <Link href="/login" className="text-sm text-blue-600 hover:underline">Login</Link>
                <Link href="/sign-up" className="text-sm text-blue-600 hover:underline">Signup</Link>
              </>
            )}
          </div>
        </nav>
        <main className="p-4">{children}</main>
      </body>
    </html>
  )
}
