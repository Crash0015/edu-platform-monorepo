'use client';

import { FormEvent, Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthShell from '../../../components/AuthShell';
import { apiFetch } from '../../../lib/api';

type MessageResponse = {
  message: string;
};

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const email = useMemo(() => searchParams.get('email') || '', [searchParams]);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setStatus('');
    if (!token) {
      setError('El enlace no es válido. Solicita un nuevo reset.');
      return;
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      const response = await apiFetch<MessageResponse>('/gateway/auth/password/reset', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword: password }),
      });
      setStatus(response.message || 'Contraseña restablecida con éxito.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo restablecer la contraseña.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-[var(--ink)]">Cuenta</label>
        <input
          type="email"
          value={email}
          readOnly
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm text-[var(--ink-muted)]"
          placeholder="usuario@uce.edu.ec"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-[var(--ink)]" htmlFor="password">
          Nueva contraseña
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
      <div className="space-y-2">
        <label className="text-sm font-semibold text-[var(--ink)]" htmlFor="confirm">
          Confirmar contraseña
        </label>
        <input
          id="confirm"
          type="password"
          required
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm focus:border-[var(--primary)] focus:outline-none"
          placeholder="••••••••"
        />
      </div>
      {status && <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{status}</p>}
      {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white shadow-[var(--shadow)] transition hover:bg-[var(--primary-dark)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? 'Guardando...' : 'Restablecer contraseña'}
      </button>
      <a className="text-sm font-semibold text-[var(--primary)] hover:underline" href="/auth/login">
        Volver al inicio de sesión
      </a>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Restablece tu contraseña" subtitle="Crea una nueva clave para tu cuenta institucional.">
      <Suspense fallback={<p className="text-sm text-[var(--ink-muted)]">Cargando formulario...</p>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
