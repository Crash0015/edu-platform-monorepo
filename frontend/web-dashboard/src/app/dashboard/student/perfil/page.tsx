'use client';

import { FormEvent, useState } from 'react';
import DashboardShell from '../../../../components/DashboardShell';
import { apiFetchAuth } from '../../../../lib/api';
import { studentNav } from '../../../../lib/nav';
import { useProfile } from '../../../../hooks/useProfile';

type MfaSetup = {
  secret: string;
  otpauthUrl: string;
  qrCodeDataUrl: string;
};

export default function StudentProfilePage() {
  const { profile } = useProfile();
  const [setup, setSetup] = useState<MfaSetup | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [disablePassword, setDisablePassword] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [status, setStatus] = useState('');

  const handleSetup = async () => {
    const response = await apiFetchAuth<MfaSetup>('/gateway/auth/mfa/setup', { method: 'POST' });
    setSetup(response);
  };

  const handleVerify = async (event: FormEvent) => {
    event.preventDefault();
    await apiFetchAuth('/gateway/auth/mfa/verify', {
      method: 'POST',
      body: JSON.stringify({ code: mfaCode }),
    });
    setStatus('MFA activado correctamente.');
  };

  const handleDisable = async (event: FormEvent) => {
    event.preventDefault();
    await apiFetchAuth('/gateway/auth/mfa/disable', {
      method: 'POST',
      body: JSON.stringify({ password: disablePassword, code: disableCode }),
    });
    setStatus('MFA desactivado.');
  };

  return (
    <DashboardShell title="Estudiante" requiredRoles={['STUDENT']} navItems={studentNav}>
      <div className="grid gap-6">
        <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Perfil</h2>
          <p className="text-sm text-[var(--ink-muted)]">{profile?.email}</p>
          {status && <p className="mt-3 text-sm text-emerald-600">{status}</p>}
        </section>

        <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">MFA</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border)] p-4">
              <p className="text-sm font-semibold">Activar MFA</p>
              <p className="text-xs text-[var(--ink-muted)]">Escanea el QR y confirma con el código.</p>
              <button
                className="mt-3 rounded-full bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-white"
                onClick={handleSetup}
              >
                Generar QR
              </button>
              {setup && (
                <div className="mt-4 space-y-3">
                  <img src={setup.qrCodeDataUrl} alt="QR MFA" className="h-36 w-36 rounded-xl border" />
                  <form onSubmit={handleVerify} className="flex gap-2">
                    <input
                      className="flex-1 rounded-2xl border border-[var(--border)] px-3 py-2 text-xs"
                      placeholder="Código MFA"
                      value={mfaCode}
                      onChange={(event) => setMfaCode(event.target.value)}
                      required
                    />
                    <button className="rounded-full border border-[var(--border)] px-3 py-2 text-xs font-semibold">
                      Verificar
                    </button>
                  </form>
                </div>
              )}
            </div>
            <div className="rounded-2xl border border-[var(--border)] p-4">
              <p className="text-sm font-semibold">Desactivar MFA</p>
              <p className="text-xs text-[var(--ink-muted)]">Ingresa tu contraseña y el código actual.</p>
              <form onSubmit={handleDisable} className="mt-3 space-y-2">
                <input
                  className="w-full rounded-2xl border border-[var(--border)] px-3 py-2 text-xs"
                  placeholder="Contraseña"
                  type="password"
                  value={disablePassword}
                  onChange={(event) => setDisablePassword(event.target.value)}
                  required
                />
                <input
                  className="w-full rounded-2xl border border-[var(--border)] px-3 py-2 text-xs"
                  placeholder="Código MFA"
                  value={disableCode}
                  onChange={(event) => setDisableCode(event.target.value)}
                  required
                />
                <button className="rounded-full border border-[var(--border)] px-3 py-2 text-xs font-semibold">
                  Desactivar
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
