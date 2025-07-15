'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSignup = async () => {
        try {
            const res = await fetch('http://localhost:3000/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, }), // ❌ Không gửi role
            });

            if (res.ok) {
                alert('Successfully!');
                router.push('/login');
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to login!');
            }
        } catch (error) {
            alert('Something went wrong!');
        }
    };

    return (
        <main className="flex flex-col items-center justify-center min-h-screen">
            <div className="w-full max-w-md bg-white p-8 shadow rounded">
                <h2 className="text-2xl font-bold mb-6 text-center">📝 Signup</h2>
                <input
                    type="name"
                    placeholder="Name"
                    className="w-full border p-2 mb-4 rounded"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
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
                    onClick={handleSignup}
                    className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
                >
                    Signup
                </button>
            </div>
        </main>
    );
}
