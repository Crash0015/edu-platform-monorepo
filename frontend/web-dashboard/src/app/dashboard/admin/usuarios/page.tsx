'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import DashboardShell from '../../../../components/DashboardShell';
import { apiFetchAuth } from '../../../../lib/api';
import { adminNav } from '../../../../lib/nav';

type AdminUser = {
  id: string;
  fullName?: string | null;
  identificationNumber?: string | null;
  email: string;
  status: 'ACTIVE' | 'SUSPENDED';
  userType: 'STUDENT' | 'TEACHER' | 'ADMIN';
  roles: string[];
  mfaEnabled: boolean;
  createdAt: string;
};

type AdminUserList = {
  items: AdminUser[];
  total: number;
};

type CreateUserResponse = {
  user: AdminUser;
  temporaryPassword?: string;
  resetLink?: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ email: '', status: '', userType: '', search: '' });
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    identificationNumber: '',
    userType: 'STUDENT',
    status: 'ACTIVE',
  });
  const [createdInfo, setCreatedInfo] = useState<{ pass?: string; link?: string; email?: string } | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filters.email) params.set('email', filters.email);
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (filters.status) params.set('status', filters.status);
      if (filters.userType) params.set('userType', filters.userType);
      params.set('offset', String((page - 1) * pageSize));
      params.set('limit', String(pageSize));
      const response = await apiFetchAuth<AdminUserList>(`/gateway/admin/users?${params.toString()}`);
      setUsers(response.items || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo cargar usuarios.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, debouncedSearch]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(filters.search.trim());
      setPage(1);
    }, 450);
    return () => clearTimeout(timeout);
  }, [filters.search]);

  const handleFilter = (event: FormEvent) => {
    event.preventDefault();
    setPage(1);
    loadUsers();
  };

  const handleCreate = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      if (editingUser) {
        await apiFetchAuth(`/gateway/admin/users/${editingUser.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            email: formData.email,
            fullName: formData.fullName,
            identificationNumber: formData.identificationNumber || undefined,
          }),
        });
        setShowForm(false);
        setEditingUser(null);
        setFormData({ email: '', fullName: '', identificationNumber: '', userType: 'STUDENT', status: 'ACTIVE' });
        loadUsers();
      } else {
        const response = await apiFetchAuth<CreateUserResponse>('/gateway/admin/users', {
          method: 'POST',
          body: JSON.stringify({
            email: formData.email,
            fullName: formData.fullName,
            identificationNumber: formData.identificationNumber || undefined,
            userType: formData.userType,
            status: formData.status,
          }),
        });
        setCreatedInfo({ pass: response.temporaryPassword, link: response.resetLink, email: response.user.email });
        setShowForm(false);
        setFormData({ email: '', fullName: '', identificationNumber: '', userType: 'STUDENT', status: 'ACTIVE' });
        loadUsers();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar el usuario.';
      setError(message);
    }
  };

  const updateStatus = async (id: string, status: 'ACTIVE' | 'SUSPENDED') => {
    await apiFetchAuth(`/gateway/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    loadUsers();
  };

  const updateType = async (id: string, userType: string) => {
    await apiFetchAuth(`/gateway/admin/users/${id}/type`, {
      method: 'PATCH',
      body: JSON.stringify({ userType }),
    });
    loadUsers();
  };

  const resetMfa = async (id: string) => {
    await apiFetchAuth(`/gateway/admin/users/${id}/mfa/reset`, { method: 'POST' });
    loadUsers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar usuario? Esta acción no se puede deshacer.')) {
      return;
    }
    const confirmEmail = prompt('Escribe ELIMINAR para confirmar:');
    if (confirmEmail !== 'ELIMINAR') {
      return;
    }
    await apiFetchAuth(`/gateway/admin/users/${id}`, { method: 'DELETE' });
    loadUsers();
  };

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user);
    setShowForm(true);
    setFormData({
      email: user.email,
      fullName: user.fullName || '',
      identificationNumber: user.identificationNumber || '',
      userType: user.userType,
      status: user.status,
    });
  };

  return (
    <DashboardShell title="Administración" requiredRoles={['ADMIN']} navItems={adminNav}>
      <div className="grid gap-6">
        <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Usuarios</h2>
              <p className="text-sm text-[var(--ink-muted)]">Gestiona estudiantes, docentes y administradores.</p>
            </div>
            <button
              className="rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-white"
              onClick={() => {
                setShowForm(true);
                setEditingUser(null);
                setCreatedInfo(null);
                setFormData({ email: '', fullName: '', identificationNumber: '', userType: 'STUDENT', status: 'ACTIVE' });
              }}
            >
              Crear usuario
            </button>
          </div>
          <form onSubmit={handleFilter} className="mt-6 grid gap-3 md:grid-cols-[1.3fr_0.9fr_0.7fr_0.7fr_auto]">
            <input
              className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
              placeholder="Buscar por email"
              value={filters.email}
              onChange={(event) => setFilters({ ...filters, email: event.target.value })}
            />
            <input
              className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
              placeholder="Buscar por nombre"
              value={filters.search}
              onChange={(event) => setFilters({ ...filters, search: event.target.value })}
            />
            <select
              className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
              value={filters.status}
              onChange={(event) => setFilters({ ...filters, status: event.target.value })}
            >
              <option value="">Estado</option>
              <option value="ACTIVE">Activo</option>
              <option value="SUSPENDED">Suspendido</option>
            </select>
            <select
              className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
              value={filters.userType}
              onChange={(event) => setFilters({ ...filters, userType: event.target.value })}
            >
              <option value="">Rol</option>
              <option value="STUDENT">Estudiante</option>
              <option value="TEACHER">Docente</option>
              <option value="ADMIN">Admin</option>
            </select>
            <button className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold">
              Filtrar
            </button>
          </form>
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
          {createdInfo?.link ? (
            <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <strong>Usuario creado.</strong> Se envio un enlace de acceso a {createdInfo.email}.
              <p className="mt-1 text-xs opacity-80">Si no llega el correo, usa este enlace: <a className="underline" href={createdInfo.link} target="_blank" rel="noreferrer">{createdInfo.link}</a></p>
            </div>
          ) : createdInfo?.pass ? (
            <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              <strong>¡Usuario creado!</strong> Contraseña temporal: <code className="bg-white px-2 py-1 rounded border">{createdInfo.pass}</code>
              <p className="mt-1 text-xs opacity-80">Comparte esta contraseña con el usuario. Él/ella podrá cambiarla después.</p>
            </div>
          ) : null}
        </section>

        {showForm && (
          <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold">{editingUser ? 'Editar usuario' : 'Crear usuario'}</h3>
            <form onSubmit={handleCreate} className="mt-4 grid gap-4 md:grid-cols-2">
                <input
                  className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
                  placeholder="Email"
                value={formData.email}
                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                required
              />
              <input
                className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
                placeholder="Nombre completo"
                value={formData.fullName}
                onChange={(event) => setFormData({ ...formData, fullName: event.target.value })}
                required
              />
              <input
                className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
                placeholder="Cedula (opcional)"
                value={formData.identificationNumber}
                onChange={(event) => setFormData({ ...formData, identificationNumber: event.target.value })}
              />
              {!editingUser && (
                <>
                  <select
                    className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
                    value={formData.userType}
                    onChange={(event) => setFormData({ ...formData, userType: event.target.value })}
                  >
                    <option value="STUDENT">Estudiante</option>
                    <option value="TEACHER">Docente</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <select
                    className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm"
                    value={formData.status}
                    onChange={(event) => setFormData({ ...formData, status: event.target.value })}
                  >
                    <option value="ACTIVE">Activo</option>
                    <option value="SUSPENDED">Suspendido</option>
                  </select>
                </>
              )}
              <div className="flex gap-3 md:col-span-2">
                <button className="rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-white" type="submit">
                  {editingUser ? 'Actualizar usuario' : 'Crear usuario'}
                </button>
                <button
                  className="rounded-full border border-[var(--border)] px-5 py-2 text-sm font-semibold"
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingUser(null);
                    setFormData({ email: '', fullName: '', identificationNumber: '', userType: 'STUDENT', status: 'ACTIVE' });
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-[var(--ink-muted)]">
                <tr>
                    <th className="py-3">Usuario</th>
                    <th className="py-3">Rol</th>
                    <th className="py-3">Estado</th>
                    <th className="py-3">MFA</th>
                    <th className="py-3">Acciones</th>
                  </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="py-4 text-[var(--ink-muted)]" colSpan={5}>
                      Cargando usuarios...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td className="py-4 text-[var(--ink-muted)]" colSpan={5}>
                      No hay usuarios registrados.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-t border-[var(--border)]">
                      <td className="py-3">
                        <div className="font-semibold text-[var(--ink)]">{user.fullName || user.email}</div>
                        <div className="text-xs text-[var(--ink-muted)]">
                          {user.email} · {user.identificationNumber || 'Sin cedula'}
                        </div>
                        <div className="text-xs text-[var(--ink-muted)]">{new Date(user.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="py-3">
                        <select
                          className="rounded-xl border border-[var(--border)] px-3 py-1 text-xs"
                          value={user.userType}
                          onChange={(event) => updateType(user.id, event.target.value)}
                        >
                          <option value="STUDENT">Estudiante</option>
                          <option value="TEACHER">Docente</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            user.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-red-50 text-red-600'
                          }`}
                        >
                          {user.status === 'ACTIVE' ? 'Activo' : 'Suspendido'}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="text-xs">{user.mfaEnabled ? 'Habilitado' : 'No'}</span>
                      </td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold"
                            onClick={() =>
                              updateStatus(user.id, user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')
                            }
                          >
                            {user.status === 'ACTIVE' ? 'Suspender' : 'Activar'}
                          </button>
                          <button
                            className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold"
                            onClick={() => resetMfa(user.id)}
                          >
                            Reset MFA
                          </button>
                          <button
                            className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold"
                            onClick={() => handleEdit(user)}
                          >
                            Editar
                          </button>
                          <button
                            className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-semibold"
                            onClick={() => handleDelete(user.id)}
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <button
              className="rounded-full border border-[var(--border)] px-4 py-2 font-semibold"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
            >
              Anterior
            </button>
            <span className="text-[var(--ink-muted)]">Página {page}</span>
            <button
              className="rounded-full border border-[var(--border)] px-4 py-2 font-semibold"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={users.length < pageSize}
            >
              Siguiente
            </button>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
