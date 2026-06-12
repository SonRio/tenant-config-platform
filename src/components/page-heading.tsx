"use client";

import { useT } from "@/components/i18n-provider";

export function PageHeading({
  titleKey,
  subtitleKey,
  vars,
}: {
  titleKey: string;
  subtitleKey?: string;
  vars?: Record<string, string | number>;
}) {
  const t = useT();
  return (
    <div>
      <h1 className="font-display text-2xl font-bold tracking-tight">
        {t(titleKey, vars)}
      </h1>
      {subtitleKey && (
        <p className="mt-1 text-sm text-muted-foreground">{t(subtitleKey, vars)}</p>
      )}
    </div>
  );
}
