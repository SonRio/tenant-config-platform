"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { useT } from "@/components/i18n-provider";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface TenantCard {
  id: string;
  name: string;
  slug: string;
  currentVersion: number;
  enabledTypes: string[];
  primaryColor: string;
}

interface Stats {
  tenants: number;
  claimTypes: number;
  versions: number;
}

export function TenantsView({
  tenants,
  stats,
}: {
  tenants: TenantCard[];
  stats: Stats;
}) {
  const t = useT();

  const statItems = [
    { label: t("home.stTenants"), value: stats.tenants },
    { label: t("home.stClaimTypes"), value: stats.claimTypes },
    { label: t("home.stVersions"), value: stats.versions },
  ];

  return (
    <div className="grid gap-10">
      {/* Hero */}
      <section className="grid-texture reveal relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-soft sm:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-gradient-to-br from-brand/25 to-brand-2/10 blur-3xl"
        />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("home.eyebrow")}
          </span>
          <h1 className="mt-4 text-balance font-display text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-[2.6rem]">
            {t("home.title")}
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-muted-foreground">
            {t("home.subtitle")}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/tenants/new"
              className={buttonVariants({ size: "lg" }) + " gap-1.5"}
            >
              <Plus className="size-4" />
              {t("home.newTenant")}
            </Link>
          </div>
        </div>

        <dl className="relative mt-8 flex flex-wrap gap-x-10 gap-y-4 border-t border-border/70 pt-6">
          {statItems.map((s) => (
            <div key={s.label}>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {s.label}
              </dt>
              <dd className="font-display text-2xl font-bold tabular-nums">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Tenant cards */}
      <section className="grid gap-4">
        <h2 className="font-display text-lg font-semibold">
          {t("home.sectionTitle")}
        </h2>
        {tenants.length === 0 ? (
          <p className="text-muted-foreground">{t("home.empty")}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {tenants.map((tenant, i) => (
              <article
                key={tenant.id}
                style={{ "--d": `${i * 70}ms` } as CSSProperties}
                className="reveal hover-lift group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft hover:border-brand/40 hover:shadow-lift"
              >
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-1"
                  style={{ backgroundColor: tenant.primaryColor }}
                />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-lg font-bold tracking-tight">
                      {tenant.name}
                    </h3>
                    <p className="font-mono text-xs text-muted-foreground">
                      {tenant.slug}
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 tabular-nums">
                    v{tenant.currentVersion}
                  </Badge>
                </div>

                <div className="mt-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t("home.claimTypes")}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {tenant.enabledTypes.map((ct) => (
                      <Badge key={ct} variant="outline">
                        {ct}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href={`/tenants/${tenant.id}/edit`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    {t("common.edit")}
                  </Link>
                  <Link
                    href={`/tenants/${tenant.id}/history`}
                    className={buttonVariants({ variant: "ghost", size: "sm" })}
                  >
                    {t("common.history")}
                  </Link>
                  <Link
                    href={`/preview?tenant=${tenant.id}`}
                    className={
                      buttonVariants({ variant: "ghost", size: "sm" }) +
                      " ml-auto gap-1 text-brand"
                    }
                  >
                    {t("common.preview")}
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
