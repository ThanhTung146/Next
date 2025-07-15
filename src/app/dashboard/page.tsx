'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { HomeworkStatus } from '@/types/homework'

type Group = {
  id: number
  name: string
  students?: Array<{
    id: number
    name: string
    email: string
  }>
  teacher?: {
    id: number
    name: string
    email: string
  }
}

export default function DashboardHome() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [homeworks, setHomeworks] = useState<any[]>([]) // for students
  const [lectures, setLectures] = useState<any[]>([]) // for teachers

  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    setEmail(localStorage.getItem('email') || '')
    const r = localStorage.getItem('role') || ''
    setRole(r)
    const id = localStorage.getItem('id') || ''
    setName(localStorage.getItem('name') || '')

    const fetchGroups = async () => {
      try {
        setLoading(true)
        setError('')

        if (r === 'teacher') {
          const response = await fetch('http://localhost:3000/groups/teacher', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ teacherId: id })
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          const data = await response.json()
          // Ensure data is array
          setGroups(Array.isArray(data) ? data : [])

        } else if (r === 'student') {
          const response = await fetch('http://localhost:3000/groups/student', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ studentId: id })
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          const data = await response.json()
          // Ensure data is array
          setGroups(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error('Error fetching groups:', error)
        setError('Cannot load group list')
        setGroups([]) // Ensure groups is always an array
      } finally {
        setLoading(false)
      }
    }

    if (r && token) {
      fetchGroups()
      // Fetch additional data based on role
      if (r === 'student') {
        fetchWeeklyHomeworks(id, token)
      } else if (r === 'teacher') {
        fetchLectures(id, token)
      }
    } else {
      setLoading(false)
    }
  }, [])

  const retryFetchGroups = async () => {
    const token = localStorage.getItem('token')
    const r = localStorage.getItem('role') || ''
    const id = localStorage.getItem('id') || ''

    const fetchGroups = async () => {
      try {
        setLoading(true)
        setError('')

        if (r === 'teacher') {
          const response = await fetch('http://localhost:3000/groups/teacher', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ teacherId: id })
          })

          if (!response.ok) {
            throw new Error(`Server error: ${response.status}`)
          }

          const data = await response.json()
          setGroups(Array.isArray(data) ? data : [])

        } else if (r === 'student') {
          const response = await fetch('http://localhost:3000/groups/student', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ studentId: id })
          })

          if (!response.ok) {
            throw new Error(`Server error: ${response.status}`)
          }

          const data = await response.json()
          setGroups(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error('Error fetching groups:', error)
        setError('Cannot load group list. Please try again.')
        setGroups([])
      } finally {
        setLoading(false)
      }
    }

    if (r && token) {
      await fetchGroups()
    }
  }
  const fetchWeeklyHomeworks = async (studentId: string, token: string) => {
    try {
      console.log('Fetching weekly homeworks for student:', studentId)
      const res = await fetch('http://localhost:3000/homeworks/student', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json();
      console.log('All homeworks received:', data)

      // Filter homeworks for this week
      const now = new Date()
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
      const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6))

      const thisWeekHomeworks = data.filter((hw: any) => {
        const dueDate = new Date(hw.homework.dueDate)
        return dueDate >= startOfWeek && dueDate <= endOfWeek && hw.status === HomeworkStatus.PENDING
      })

      console.log('This week homeworks:', thisWeekHomeworks)
      setHomeworks(thisWeekHomeworks);
    } catch (e) {
      console.error('Error fetching homework:', e);
      setHomeworks([]);
    }
  };

  const fetchLectures = async (teacherId: string, token: string) => {
    try {
      console.log('Fetching recent lectures for teacher:', teacherId)
      const res = await fetch('http://localhost:3000/lessons/teacher-recent', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json();
      console.log('Recent lectures received:', data)

      setLectures(data);
    } catch (e) {
      console.error('Error fetching lectures:', e);
      setLectures([]);
    }
  };


  return (
    <div>
      {/* Banner */}
      <div className="mb-6 p-6 bg-blue-100 rounded shadow">
        <h1 className="text-2xl font-bold mb-1">🎉 Hello {name}</h1>
        {role === 'student' && (
          <p className="text-gray-700">
            You have <strong>{homeworks.length}</strong> assignments to complete this week!
          </p>
        )}
      </div>


      {/* Group preview */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">📂 Your Groups</h2>
          <button
            className="text-blue-600 hover:underline"
            onClick={() =>
              router.push(
                role === 'teacher'
                  ? '/dashboard/teacher/groups'
                  : '/dashboard/student/groups'
              )
            }
          >
            View more →
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto">
          {loading ? (
            <div className="min-w-[200px] p-4 bg-gray-100 rounded border animate-pulse">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-3/4"></div>
            </div>
          ) : error ? (
            <div className="min-w-[300px] p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-red-600 text-sm mb-2">❌ {error}</p>
              <button
                onClick={retryFetchGroups}
                className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded"
              >
                🔄 Retry
              </button>
            </div>
          ) : groups.length === 0 ? (
            <div className="min-w-[200px] p-4 bg-gray-50 border border-gray-200 rounded">
              <p className="text-gray-500 text-sm">📭 No groups yet</p>
              <p className="text-gray-400 text-xs mt-1">
                {role === 'teacher' ? 'You have not created any groups yet' : 'You have not joined any groups yet'}
              </p>
            </div>
          ) : (
            groups.map((group) => (
              <div
                key={group.id}
                className="min-w-[200px] p-4 bg-white shadow rounded border cursor-pointer hover:bg-blue-50"
                onClick={() =>
                  router.push(
                    role === 'teacher'
                      ? `/dashboard/teacher/groups/${group.id}`
                      : `/dashboard/student/groups/${group.id}`
                  )
                }
              >
                <h3 className="text-md font-bold text-blue-700">{group.name}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {role === 'teacher' ? `${(group as any).students?.length || 0} students` : ''}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Homework (student) or Lecture (teacher) */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">
            {role === 'student' ? '📝 This Week\'s Assignments' : '🎓 Recent Lessons'}
          </h2>
          <button
            className="text-blue-600 hover:underline"
            onClick={() =>
              router.push(
                role === 'student'
                  ? '/dashboard/student/homeworks'
                  : '/dashboard/teacher/lessons'
              )
            }
          >
            View all →
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto">
          {(role === 'student' ? homeworks : lectures).length === 0 ? (
            <div className="min-w-[250px] p-4 bg-gray-50 border border-gray-200 rounded">
              <p className="text-gray-500 text-sm">
                {role === 'student' ? '📭 You have completed all assignments' : '📭 No recent lessons'}
              </p>
            </div>
          ) : (
            (role === 'student' ? homeworks : lectures).map((item) => (
              <div 
                key={item.id} 
                className="min-w-[250px] p-4 bg-white shadow rounded border cursor-pointer hover:bg-blue-50 transition-colors"
                onClick={() => {
                  if (role === 'student') {
                    router.push(`/dashboard/student/homeworks/${item.id}`)
                  } else {
                    router.push(`/dashboard/teacher/lessons/${item.id}`)
                  }
                }}
              >
                <h3 className="text-md font-bold text-blue-700">
                  {role === 'student' ? item.homework.title : item.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {role === 'student'
                    ? `Due date: ${new Date(item.homework.dueDate).toLocaleDateString()}`
                    : `Created: ${new Date(item.createdAt).toLocaleDateString()}`
                  }
                </p>
                {role === 'student' && (
                  <p className="text-xs text-gray-400 mt-1">
                    Teacher: {item.homework.createdBy.name}
                  </p>
                )}
                {role === 'teacher' && (
                  <p className="text-xs text-gray-400 mt-1">
                    Group: {item.group?.name || 'No group'}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
