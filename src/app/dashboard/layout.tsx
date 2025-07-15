'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [role, setRole] = useState('')
    const router = useRouter()
    const pathname = usePathname()

    useEffect(() => {
        const token = localStorage.getItem('token')
        const roleStored = localStorage.getItem('role')
        if (!token) router.push('/login')
        else setRole(roleStored || '')
    }, [])

    const links =
        role === 'student'
            ? [
                { href: '/dashboard', label: '🏠 Home' },
                { href: '/dashboard/student/groups', label: '👥 My groups' },
                { href: '/dashboard/student/lessons', label: '📚 Lessons' },
                { href: '/dashboard/student/homeworks', label: '📝 Assignments' },
            ]
            : [
                { href: '/dashboard', label: '🏠 Home' },
                { href: '/dashboard/teacher/groups', label: '👥 Groups management' },
                { href: '/dashboard/teacher/lessons', label: '📚 Lessons management' },
                { href: '/dashboard/teacher/homeworks', label: '📝 Assignment management' },
            ]

    return (
        <div className="flex min-h-screen">
            <aside className="w-64 bg-blue-50 p-4 border-r">
                <h2 className="text-xl font-bold text-blue-600 mb-6">📋 Dashboard</h2>
                <ul className="space-y-3">
                    {links.map((link) => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                className={`block px-3 py-2 rounded hover:bg-blue-100 ${pathname === link.href ? 'bg-blue-200 font-semibold' : ''
                                    }`}
                            >
                                {link.label}
                            </Link>
                        </li>
                    ))}
                    <li className="mt-6">
                        <button
                            onClick={() => {
                                localStorage.clear()
                                router.push('/login')
                            }}
                            className="text-red-600 hover:underline"
                        >
                            🔓 Logout
                        </button>
                    </li>
                </ul>
            </aside>

            <main className="flex-1 p-6">{children}</main>
        </div>
    )
}
