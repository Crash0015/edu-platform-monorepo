type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export default function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--ink)]">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(47,125,123,0.2)_0%,rgba(47,125,123,0)_70%)]" />
        <div className="pointer-events-none absolute -right-24 top-40 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(216,154,109,0.16)_0%,rgba(216,154,109,0)_70%)]" />
        <div className="pointer-events-none absolute -left-20 bottom-16 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(47,125,123,0.12)_0%,rgba(47,125,123,0)_70%)]" />

        <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary)] text-white shadow-[var(--shadow)]">
              <span className="text-lg font-semibold tracking-tight">FCA</span>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--ink-muted)]">Universidad Central</p>
              <p className="text-lg font-semibold text-[var(--ink)]">Facultad de Ciencias Administrativas</p>
            </div>
          </div>
          <a className="text-sm font-semibold text-[var(--ink-muted)] transition hover:text-[var(--ink)]" href="/">
            Volver a la FCA
          </a>
        </header>

        <section className="mx-auto grid w-full max-w-5xl gap-10 px-6 pb-24 pt-2 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex flex-col gap-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--primary)]">Acceso institucional</p>
            <h1 className="text-4xl leading-tight sm:text-5xl">{title}</h1>
            <p className="text-lg text-[var(--ink-muted)]">{subtitle}</p>
            <div className="mt-6 rounded-3xl border border-[var(--border)] bg-white/80 p-6">
              <p className="text-sm text-[var(--ink-muted)]">Consulta tus clases, tutorías, materiales y comunicados de la FCA con una sola cuenta institucional.</p>
            </div>
          </div>
          <div className="rounded-3xl border border-[var(--border)] bg-white p-8 shadow-[var(--shadow)]">
            {children}
          </div>
        </section>
      </div>
    </div>
  );
}
