const modules = [
  {
    title: "Shipment record",
    body: "Capture a shipment once — parties, goods, HS codes, weights, values — and reuse it everywhere.",
  },
  {
    title: "Document generation",
    body: "Generate commercial invoices, packing lists, proformas, certificates of origin, and bill of lading data.",
  },
  {
    title: "Requirement engine",
    body: "Know the documents and permits a shipment needs from HS code, origin, destination, and direction.",
  },
  {
    title: "Consistency checks",
    body: "Cross-document validation catches mismatches before anything reaches a customs desk.",
  },
  {
    title: "Incoterms guidance",
    body: "Compare terms on cost and risk, then choose with confidence and clear clause language.",
  },
  {
    title: "Landed cost",
    body: "Estimate duty, levies, and total landed cost using current tariff and customs FX data.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-hairline bg-deep-harbor text-white">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold tracking-[0.2em]">LADING</span>
          <div className="hidden items-center gap-8 text-sm text-white/70 md:flex">
            <a href="#modules" className="hover:text-white">Platform</a>
            <a href="#trade" className="hover:text-white">Import &amp; Export</a>
            <a href="#data" className="hover:text-white">Data</a>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <a href="/login" className="text-white/80 hover:text-white">Sign in</a>
            <a
              href="/signup"
              className="rounded-md bg-signal-teal px-4 py-2 font-medium text-white hover:bg-signal-teal/90"
            >
              Get started
            </a>
          </div>
        </nav>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="bg-deep-harbor text-white">
          <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-20 md:grid-cols-2 md:items-center md:py-28">
            <div>
              <p className="mb-4 inline-block rounded-full border border-white/15 px-3 py-1 text-xs tracking-wide text-white/70">
                Built for African trade corridors
              </p>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
                Every document,
                <br />
                right the first time.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
                Your forwarder&apos;s paperwork is only as good as the data you
                hand over. Lading makes it error-free before it leaves your
                desk — generating compliant import and export documents and
                catching the mistakes that cause demurrage.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a
                  href="/signup"
                  className="rounded-md bg-signal-teal px-6 py-3 font-medium text-white hover:bg-signal-teal/90"
                >
                  Start free
                </a>
                <a
                  href="#modules"
                  className="rounded-md border border-white/20 px-6 py-3 font-medium text-white hover:bg-white/5"
                >
                  See the platform
                </a>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <p className="font-mono text-xs uppercase tracking-widest text-white/50">
                Shipment · NG-IMP-0042
              </p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-white/60">Origin</span>
                  <span className="font-mono">CN → NG</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-white/60">HS Code</span>
                  <span className="font-mono">8471.30</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-white/60">Required</span>
                  <span className="font-mono text-manifest-amber">Form M · PAAR · SONCAP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/60">Consistency</span>
                  <span className="font-mono text-success">3 checks passed</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="modules" className="mx-auto w-full max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-semibold tracking-tight">
            One shipment record. A complete document set.
          </h2>
          <p className="mt-3 max-w-2xl text-muted">
            Six connected capabilities that replace scattered spreadsheets,
            email chains, and last-minute corrections at the port.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((m) => (
              <div
                key={m.title}
                className="rounded-xl border border-hairline bg-white p-6"
              >
                <h3 className="font-semibold text-deep-harbor">{m.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {m.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="trade" className="border-y border-hairline bg-white">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-20 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">
                Import and export, treated as first-class.
              </h2>
              <p className="mt-4 leading-relaxed text-muted">
                Lading is direction-aware. The same shipment record produces
                the right document set whether you are importing into Nigeria
                or exporting out of it — Form M and PAAR on the way in, NEPC
                and NACCIMA certificates on the way out.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-xl bg-cloud p-6">
                <p className="font-mono text-xs uppercase tracking-widest text-muted">
                  Import
                </p>
                <p className="mt-3 text-sm text-ink">
                  Form M · PAAR · SONCAP · NAFDAC · duty &amp; levies
                </p>
              </div>
              <div className="rounded-xl bg-cloud p-6">
                <p className="font-mono text-xs uppercase tracking-widest text-muted">
                  Export
                </p>
                <p className="mt-3 text-sm text-ink">
                  NEPC · NACCIMA COO · phytosanitary · COO preferential
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="data" className="mx-auto w-full max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-semibold tracking-tight">
            Current rules, from official sources.
          </h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted">
            Tariffs, permits, sanctions, and customs FX rates are tracked from
            single sources of truth and updated on a schedule — so your
            documents reflect today&apos;s rules, not last year&apos;s.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 font-mono text-xs text-muted">
            {[
              "NCS CET",
              "NTIP",
              "WTO TTD",
              "Consolidated Screening List",
              "NCS FX",
              "NAFDAC",
              "SON",
              "NEPC",
            ].map((s) => (
              <span
                key={s}
                className="rounded-full border border-hairline bg-white px-3 py-1"
              >
                {s}
              </span>
            ))}
          </div>
        </section>

        <section className="bg-deep-harbor text-white">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-6 py-16 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Make your next shipment right the first time.
              </h2>
              <p className="mt-2 text-white/70">
                Start free. No card required.
              </p>
            </div>
            <a
              href="/signup"
              className="rounded-md bg-signal-teal px-6 py-3 font-medium text-white hover:bg-signal-teal/90"
            >
              Create your account
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-hairline bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-4 px-6 py-8 text-sm text-muted md:flex-row md:items-center">
          <span className="font-semibold tracking-[0.2em] text-deep-harbor">
            LADING
          </span>
          <span>Trade documentation &amp; compliance for African markets.</span>
        </div>
      </footer>
    </div>
  );
}
