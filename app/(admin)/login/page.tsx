"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminBrand from '@/app/components/Admin/AdminBrand';
import AdminButton from '@/app/components/Admin/AdminButton';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        router.push('/admin');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Login failed: ' + String(err));
    }
    setLoading(false);
  };

  return (
    <div className="admin-login-shell flex items-center justify-center p-4" data-admin-panel>
      <div className="w-full max-w-md">
        <div className="admin-login-card">
          <div className="mb-8 flex flex-col items-center text-center">
            <AdminBrand href="/" showAdminLabel={false} />
            <h2 className="mt-6 text-2xl font-bold text-[#1a2456]">Admin Login</h2>
            <p className="mt-2 text-sm text-[#4b5563]">
              Sign in to manage ScholarlyHelp content
            </p>
          </div>
          <form className="space-y-5" onSubmit={handleLogin}>
            {error ? (
              <div
                className="rounded-lg border border-[#f5c2c2] bg-[#fef2f2] px-4 py-3 text-sm text-[#da0e0e]"
                role="alert"
              >
                {error}
              </div>
            ) : null}
            <div>
              <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-[#353535]">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="block w-full rounded-lg border border-[#d1d8e8] px-3 py-2.5 text-[#353535] placeholder-[#9ca3af] focus:border-[#565add] focus:outline-none focus:ring-2 focus:ring-[#565add]/20 sm:text-sm"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[#353535]">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="block w-full rounded-lg border border-[#d1d8e8] px-3 py-2.5 text-[#353535] placeholder-[#9ca3af] focus:border-[#565add] focus:outline-none focus:ring-2 focus:ring-[#565add]/20 sm:text-sm"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <AdminButton
              type="submit"
              variant="primary"
              disabled={loading}
              loading={loading}
              className="w-full bg-[#283c88] hover:bg-[#1f2f6a]"
            >
              {loading ? "Signing in..." : "Sign in"}
            </AdminButton>
          </form>
        </div>
      </div>
    </div>
  );
}
