'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ email: '', password: '' });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error); return; }
            router.push('/dashboard');
            router.refresh();
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ width: '100%', maxWidth: '400px' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <a href="/" style={{ textDecoration: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4a9eff' }} />
                            <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.1em', color: '#555' }}>DIGITAL MEMORY VAULT</span>
                        </div>
                    </a>
                    <h1 style={{ fontSize: '26px', fontWeight: 600, letterSpacing: '-0.02em', color: '#f0f0f0', marginTop: '16px' }}>Welcome back</h1>
                    <p style={{ fontSize: '13px', color: '#444', marginTop: '6px' }}>Sign in to your intelligence dashboard</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="form-group">
                        <label className="label">Email</label>
                        <input
                            id="email"
                            type="email"
                            className="input"
                            placeholder="you@company.com"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Password</label>
                        <input
                            id="password"
                            type="password"
                            className="input"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            required
                        />
                    </div>

                    {error && (
                        <div style={{ padding: '12px 14px', background: 'rgba(255,91,91,0.06)', border: '1px solid rgba(255,91,91,0.2)', borderRadius: '8px', fontSize: '13px', color: '#ff5b5b' }}>
                            {error}
                        </div>
                    )}

                    <button
                        id="login-submit"
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '12px', marginTop: '8px' }}
                        disabled={loading}
                    >
                        {loading ? <div className="spinner" style={{ width: 16, height: 16 }} /> : 'Sign In'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '28px', fontSize: '13px', color: '#444' }}>
                    No account?{' '}
                    <a href="/auth/register" style={{ color: '#4a9eff', textDecoration: 'none' }}>
                        Create one
                    </a>
                </p>
            </div>
        </div>
    );
}
