'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogin = async () => {
    const res = await fetch('http://localhost:4000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.access_token && isClient) {
      localStorage.setItem('token', data.access_token);
      router.push('/dashboard');
    } else {
      alert('Đăng nhập thất bại!');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl mb-4">🔐 Đăng nhập</h2>
      <input className="border px-2 mb-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} /><br />
      <input className="border px-2 mb-2" type="password" placeholder="Mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} /><br />
      <button className="bg-blue-500 text-white px-4 py-1" onClick={handleLogin}>Đăng nhập</button>
    </div>
  );
}
