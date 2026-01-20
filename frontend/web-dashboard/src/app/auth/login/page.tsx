'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthShell from '../../../components/AuthShell';
import { apiFetch } from '../../../lib/api';
import { setTokens } from '../../../lib/auth';

type LoginResponse = {
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
  mfaRequired?: boolean;
  mfaToken?: string;
  challengeExpiresIn?: number;
};

type ProfileResponse = {
  id: string;
  email: string;
  roles: string[];
  mfaEnabled: boolean;
  status: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaToken, setMfaToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);

  const redirectByRole = async (accessToken: string) => {
    const profile = await apiFetch<ProfileResponse>('/gateway/auth/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const roles = profile.roles || [];
    if (roles.includes('ADMIN')) {
      router.push('/dashboard/admin');
      return;
    }
    if (roles.includes('TEACHER')) {
      router.push('/dashboard/teacher');
      return;
    }
    router.push('/dashboard/student');
  };

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await apiFetch<LoginResponse>('/gateway/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.mfaRequired) {
        setMfaRequired(true);
        setMfaToken(response.mfaToken || '');
        setPassword('');
        return;
      }

      if (!response.accessToken || !response.refreshToken) {
        throw new Error('No se pudo iniciar sesión.');
      }

      setTokens({ accessToken: response.accessToken, refreshToken: response.refreshToken });
      await redirectByRole(response.accessToken);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar sesión.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleMfa = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await apiFetch<LoginResponse>('/gateway/auth/login/mfa', {
        method: 'POST',
        body: JSON.stringify({ mfaToken, code: mfaCode }),
      });

      if (!response.accessToken || !response.refreshToken) {
        throw new Error('No se pudo verificar MFA.');
      }

      setTokens({ accessToken: response.accessToken, refreshToken: response.refreshToken });
      await redirectByRole(response.accessToken);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Código MFA inválido.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Accede a la plataforma FCA"
      subtitle="Un único ingreso para estudiantes, docentes y administración."
    >
      <form onSubmit={mfaRequired ? handleMfa : handleLogin} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[var(--ink)]" htmlFor="email">
            Correo institucional
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={mfaRequired}
            className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm focus:border-[var(--primary)] focus:outline-none"
            placeholder="usuario@uce.edu.ec"
          />
        </div>
        {!mfaRequired && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--ink)]" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm focus:border-[var(--primary)] focus:outline-none"
              placeholder="••••••••"
            />
          </div>
        )}
        {mfaRequired && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[var(--ink)]" htmlFor="mfa">
              Código MFA
            </label>
            <input
              id="mfa"
              type="text"
              required
              value={mfaCode}
              onChange={(event) => setMfaCode(event.target.value)}
              className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm focus:border-[var(--primary)] focus:outline-none"
              placeholder="123 456"
            />
          </div>
        )}
        {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white shadow-[var(--shadow)] transition hover:bg-[var(--primary-dark)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Ingresando...' : mfaRequired ? 'Verificar MFA' : 'Ingresar'}
        </button>
        {!mfaRequired && (
          <div className="flex items-center justify-between text-sm">
            <a className="text-[var(--primary)] hover:underline" href="/auth/forgot-password">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
        )}
      </form>
    </AuthShell>
  );
}
