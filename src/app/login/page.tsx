'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const res = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (data.access_token && data.user?.role?.name) {
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('email', data.user.email);
                localStorage.setItem('role', data.user.role.name); // <-- lưu role
                localStorage.setItem('id', data.user.id); // Lưu id nếu cần
                localStorage.setItem('name', data.user.name || ''); // Lưu tên nếu có
                alert('Successfully!');
                router.push('/dashboard');
            } else {
                alert('Wrong email or password!');
            }
        } catch (error) {
            alert('Failed to login!');
        }
    };


    return (
        <main className="flex flex-col items-center justify-center min-h-screen">
            <div className="w-full max-w-md bg-white p-8 shadow rounded">
                <h2 className="text-2xl font-bold mb-6 text-center">🔐 Login</h2>
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full border p-2 mb-4 rounded"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full border p-2 mb-6 rounded"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button
                    onClick={handleLogin}
                    className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                    Login
                </button>
            </div>
        </main>
    );
}
