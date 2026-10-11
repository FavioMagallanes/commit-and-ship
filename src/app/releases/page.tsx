import { Suspense } from "react";
import Link from "next/link";

import type { Metadata } from "next";

import { ReleaseList } from "@/features/release-radar/components/release-list";
import { ReleaseRadarSkeleton } from "@/features/release-radar/components/release-radar-skeleton";

// The root layout template turns this into "Versiones · Commit & Ship".
export const metadata: Metadata = {
  title: "Versiones",
};

export default function ReleasesPage() {
  return (
    <main className="mx-auto flex max-w-[1248px] flex-col gap-8 px-6 pt-10 pb-12 md:pt-16">
      <header className="flex max-w-3xl flex-col gap-4">
        <Link href="/" className="text-sm font-semibold text-accent-text">
          Volver al inicio
        </Link>
        <h1 className="font-heading text-4xl leading-tight font-extrabold tracking-tight text-ink">
          Versiones
        </h1>
        <p className="text-lg text-muted">
          La última versión publicada de cada proyecto que seguimos en GitHub, de la más reciente a
          la más antigua.
        </p>
      </header>
      <div className="max-w-3xl">
        <Suspense fallback={<ReleaseRadarSkeleton label="Cargando versiones" rows={8} />}>
          <ReleaseList />
        </Suspense>
      </div>
    </main>
  );
}
