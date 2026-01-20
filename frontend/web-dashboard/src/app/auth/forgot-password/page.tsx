'use client';

import { FormEvent, useState } from 'react';
import AuthShell from '../../../components/AuthShell';
import { apiFetch } from '../../../lib/api';

type MessageResponse = {
  message: string;
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setStatus('');
    try {
      const response = await apiFetch<MessageResponse>('/gateway/auth/password/forgot', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setStatus(response.message || 'Si el correo existe, recibirás un enlace de restablecimiento.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No pudimos procesar la solicitud.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Recupera tu acceso"
      subtitle="Te enviaremos un enlace para restablecer tu contraseña institucional."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
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
            className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm focus:border-[var(--primary)] focus:outline-none"
            placeholder="usuario@uce.edu.ec"
          />
        </div>
        {status && <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{status}</p>}
        {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white shadow-[var(--shadow)] transition hover:bg-[var(--primary-dark)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? 'Enviando...' : 'Enviar enlace'}
        </button>
        <a className="text-sm font-semibold text-[var(--primary)] hover:underline" href="/auth/login">
          Volver al inicio de sesión
        </a>
      </form>
    </AuthShell>
  );
}
