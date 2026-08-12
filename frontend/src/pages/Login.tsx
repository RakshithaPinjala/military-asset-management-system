import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      login(res.data.token);
      navigate('/');
    } catch (err) {
      setError('AUTHENTICATION FAILED. INVALID CREDENTIALS.');
    }
  };

  return (
    <div className="min-h-screen w-screen bg-stencil-bg bg-technical-grid bg-grid-sm flex items-center justify-center font-sans text-stencil-ink selection:bg-stencil-ink selection:text-stencil-bg">
      <div className="callout-box bg-stencil-bg/95 backdrop-blur-sm w-full max-w-md p-10 relative shadow-2xl">
        {/* Technical Corner Accents */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-stencil-ink -translate-x-1 -translate-y-1"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-stencil-ink translate-x-1 -translate-y-1"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-stencil-ink -translate-x-1 translate-y-1"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-stencil-ink translate-x-1 translate-y-1"></div>

        <div className="text-center mb-10">
          <h1 className="font-stencil text-5xl tracking-widest text-stencil-ink mb-3">MAMS</h1>
          <p className="font-mono text-xs font-bold uppercase tracking-widest opacity-70">
            Authorization Required // Protocol 7
          </p>
        </div>

        {error && (
          <div className="mb-8 p-3 border-2 border-stencil-hazard text-stencil-hazard text-xs font-bold font-mono text-center uppercase tracking-widest">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-8">
          <div className="space-y-2 group">
            <label className="block text-xs font-bold uppercase tracking-widest group-focus-within:text-stencil-olive transition-colors">Operator ID</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b-2 border-stencil-ink/30 focus:border-stencil-ink outline-none py-2 font-mono transition-colors"
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2 group">
            <label className="block text-xs font-bold uppercase tracking-widest group-focus-within:text-stencil-olive transition-colors">Passcode</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b-2 border-stencil-ink/30 focus:border-stencil-ink outline-none py-2 font-mono transition-colors"
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-4 p-4 border-2 border-stencil-ink bg-stencil-ink text-stencil-bg font-bold tracking-widest uppercase hover:bg-stencil-bg hover:text-stencil-ink transition-all duration-300 relative group overflow-hidden"
          >
            <span className="relative z-10 block group-hover:scale-105 transition-transform">ENGAGE SYSTEM</span>
          </button>
        </form>
      </div>
    </div>
  );
};
