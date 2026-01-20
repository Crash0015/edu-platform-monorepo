export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--ink)]">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(47,125,123,0.22)_0%,rgba(47,125,123,0)_70%)]" />
        <div className="pointer-events-none absolute -right-20 top-32 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(216,154,109,0.18)_0%,rgba(216,154,109,0)_70%)]" />
        <div className="pointer-events-none absolute -left-16 bottom-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(47,125,123,0.12)_0%,rgba(47,125,123,0)_70%)]" />

        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary)] text-white shadow-[var(--shadow)]">
              <span className="text-lg font-semibold tracking-tight">EDU</span>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--ink-muted)]">Universidad Central</p>
              <p className="text-lg font-semibold text-[var(--ink)]">Plataforma Académica</p>
            </div>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-[var(--ink-muted)] lg:flex">
            <a className="transition hover:text-[var(--ink)]" href="#portal">
              Portal
            </a>
            <a className="transition hover:text-[var(--ink)]" href="#roles">
              Roles
            </a>
            <a className="transition hover:text-[var(--ink)]" href="#tutorias">
              Tutorías
            </a>
            <a className="transition hover:text-[var(--ink)]" href="#seguridad">
              Seguridad
            </a>
            <a className="transition hover:text-[var(--ink)]" href="#contacto">
              Contacto
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <a
              className="hidden rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--primary)] lg:inline-flex"
              href="/auth/login"
            >
              Ingresar
            </a>
            <a
              className="rounded-full bg-[var(--primary)] px-5 py-2 text-sm font-semibold text-white shadow-[var(--shadow)] transition hover:bg-[var(--primary-dark)]"
              href="/auth/login"
            >
              Acceso institucional
            </a>
          </div>
        </header>

        <section className="mx-auto grid w-full max-w-6xl gap-12 px-6 pb-20 pt-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col gap-8">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--border)] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--primary)]">
              Facultad de Ciencias Administrativas · UCE
            </div>
            <h1 className="text-4xl leading-tight text-[var(--ink)] sm:text-5xl">
              Conecta con la FCA: formación, servicios y comunidad.
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-[var(--ink-muted)]">
              Descubre nuestras carreras, misión y vida académica. Ingresa con tu correo @uce.edu.ec para acceder a clases, materiales y tutorías en un portal unificado para estudiantes, docentes y el equipo académico.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <a
                className="rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white shadow-[var(--shadow)] transition hover:bg-[var(--primary-dark)]"
                href="/auth/login"
              >
                Ingresar con correo UCE
              </a>
              <a
                className="rounded-full border border-[var(--border)] px-6 py-3 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--primary)]"
                href="#portal"
              >
                Ver módulos
              </a>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-[var(--ink-muted)]">
              {[{ label: "Programas activos", value: "12" }, { label: "Docentes conectados", value: "80+" }, { label: "Tutorías agendadas este mes", value: "140" }].map((item) => (
                <div key={item.label}>
                  <p className="text-2xl font-semibold text-[var(--ink)]">{item.value}</p>
                  <p>{item.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="fce-glass rounded-3xl p-6 shadow-[var(--shadow)]">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">Lo que encontrarás</p>
              <h3 className="mt-3 text-2xl">FCA en un vistazo</h3>
              <div className="mt-6 space-y-4">
                {[{ label: "Campus virtual", value: "Clases y avisos" }, { label: "Tutorías", value: "Reserva en minutos" }, { label: "Recursos", value: "Materiales por asignatura" }].map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded-2xl bg-white/80 p-4">
                    <p className="text-sm text-[var(--ink-muted)]">{item.label}</p>
                    <p className="text-xl font-semibold text-[var(--ink)]">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-[var(--border)] bg-white p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">Acceso controlado</p>
              <p className="mt-3 text-base text-[var(--ink-muted)]">
                Solo correos @uce.edu.ec. Estudiantes ingresan y gestionan sus clases; docentes matriculan y comparten recursos; el equipo académico acompaña y monitorea.
              </p>
            </div>
          </div>
        </section>
      </div>

      <section id="portal" className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="grid gap-8 lg:grid-cols-[0.35fr_0.65fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">Portal unificado</p>
            <h2 className="mt-4 text-3xl">Ecosistema académico listo para operar.</h2>
            <p className="mt-4 text-[var(--ink-muted)]">
              Un portal pensado para la experiencia diaria: estudiantes revisan clases y tutorías, docentes organizan sus cursos y el equipo académico acompaña.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Estudiantes",
                text: "Accede con tu correo UCE, revisa tus clases, tutorías y materiales en un solo flujo sencillo.",
              },
              {
                title: "Docentes",
                text: "Organiza tus cursos, matricula a tus estudiantes y comparte recursos con tu grupo.",
              },
              {
                title: "Administración",
                text: "Supervisa el avance académico, comunica avisos y mantiene la plataforma ordenada.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-[var(--border)] bg-white p-5">
                <h3 className="text-xl">{item.title}</h3>
                <p className="mt-2 text-sm text-[var(--ink-muted)]">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="roles" className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">Flujos por rol</p>
          <h2 className="text-3xl">Cada rol, una ruta clara.</h2>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[{
            title: "Estudiante",
            bullets: ["Ingresa con tu correo UCE", "Ve tus clases y horarios", "Reserva o cancela tutorías", "Descarga materiales", "Activa o desactiva MFA"],
          }, {
            title: "Docente",
            bullets: ["Crea y edita tus cursos", "Matricula a tus estudiantes", "Publica materiales y avisos", "Define horarios de tutoría", "Monitorea la asistencia"],
          }, {
            title: "Admin",
            bullets: ["Gestiona accesos y estados", "Comparte comunicados", "Ve reportes y actividad", "Acompaña a docentes y estudiantes", "Asiste en recuperaciones de cuenta"],
          }].map((item) => (
            <div key={item.title} className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
              <h3 className="text-2xl">{item.title}</h3>
              <ul className="mt-4 space-y-2 text-sm text-[var(--ink-muted)]">
                {item.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section id="fca" className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="grid gap-8 lg:grid-cols-[0.6fr_0.4fr]">
          <div className="rounded-3xl border border-[var(--border)] bg-white p-8 shadow-[var(--shadow)]">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">Sobre la FCA</p>
            <h2 className="mt-4 text-3xl">Tradición académica y proyección profesional.</h2>
            <p className="mt-4 text-[var(--ink-muted)]">
              Formamos líderes en administración, finanzas, marketing y emprendimiento con enfoque ético y visión internacional. Comunidad docente cercana y programas vinculados al sector productivo.
            </p>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {["Acompañamiento académico continuo", "Proyectos y prácticas reales", "Red de docentes y graduados", "Tutorías y recursos digitales"].map((item) => (
                <div key={item} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="fce-glass rounded-3xl p-6 shadow-[var(--shadow)]">
            <div className="aspect-[4/5] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--primary)]/20 via-white to-[var(--accent-soft)]">
              <div className="flex h-full flex-col justify-between p-5 text-[var(--ink)]">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">Facultad</p>
                  <h3 className="mt-2 text-2xl">Campus, aulas y vida universitaria.</h3>
                </div>
                <div className="grid gap-2 text-sm text-[var(--ink-muted)]">
                  <span>• Espacios colaborativos y laboratorios</span>
                  <span>• Biblioteca y recursos digitales</span>
                  <span>• Eventos, charlas y ferias profesionales</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="tutorias" className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="rounded-3xl bg-[var(--surface-muted)] p-8 md:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">Tutorías y acompañamiento</p>
              <h2 className="mt-4 text-3xl">Conecta con tus docentes en minutos.</h2>
              <p className="mt-4 text-[var(--ink-muted)]">
                Elige horarios propuestos por tus docentes, confirma en segundos y recibe recordatorios. Cambia o cancela si necesitas.
              </p>
            </div>
            <div className="grid gap-4">
              {["Disponibilidad docente actualizada", "Reservas y cancelaciones en línea", "Historial por estudiante y materia"].map((item) => (
                <div key={item} className="rounded-2xl border border-[var(--border)] bg-white p-4 text-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-3">
          {[{
            title: "Carreras FCA",
            text: "Administración, Contabilidad y Auditoría, Marketing, Gestión del Talento Humano, Emprendimiento y más.",
          }, {
            title: "Nuestra misión",
            text: "Formar profesionales integrales con visión ética, innovación y compromiso social para liderar organizaciones.",
          }, {
            title: "Nuestra visión",
            text: "Ser referente nacional en formación administrativa, investigación aplicada y vinculación con la comunidad.",
          }].map((item) => (
            <div key={item.title} className="rounded-2xl border border-[var(--border)] bg-white p-6">
              <h3 className="text-xl">{item.title}</h3>
              <p className="mt-3 text-sm text-[var(--ink-muted)]">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="seguridad" className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="rounded-3xl border border-[var(--border)] bg-white p-8 md:p-12">
          <div className="grid gap-8 lg:grid-cols-[0.5fr_0.5fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">Seguridad y confianza</p>
              <h2 className="mt-4 text-3xl">Protegemos tu acceso y tu tiempo.</h2>
              <p className="mt-4 text-[var(--ink-muted)]">
                Solo correos institucionales, opción de MFA y perfiles separados. Tu información académica queda resguardada y disponible cuando la necesites.
              </p>
            </div>
            <div className="grid gap-4">
              {["Ingreso con tu correo UCE", "MFA opcional desde tu perfil", "Perfiles separados para cada rol", "Soporte cercano si necesitas ayuda"].map((item) => (
                <div key={item} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4 text-sm">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="contacto" className="mx-auto w-full max-w-6xl px-6 pb-24">
        <div className="rounded-3xl border border-[var(--border)] bg-white p-10 md:p-14">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">Acceso institucional</p>
              <h2 className="mt-3 text-3xl">Ingresa con tu correo @uce.edu.ec</h2>
              <p className="mt-3 text-[var(--ink-muted)]">
                ¿Necesitas ayuda? Secretaría Académica o soporte tecnológico pueden habilitar tu acceso y asistencia MFA.
              </p>
            </div>
            <a
              className="rounded-full bg-[var(--primary)] px-7 py-3 text-sm font-semibold text-white shadow-[var(--shadow)] transition hover:bg-[var(--primary-dark)]"
              href="/auth/login"
            >
              Acceso al portal
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] bg-white/80">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-10 text-sm text-[var(--ink-muted)] md:flex-row md:items-center md:justify-between">
          <p>EDU · Universidad Central del Ecuador</p>
          <p>Plataforma académica unificada · 2026</p>
        </div>
      </footer>
    </div>
  );
}
