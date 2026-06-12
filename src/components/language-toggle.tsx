"use client";

import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";

export function LanguageToggle() {
  const { locale, setLocale, t } = useI18n();
  return (
    <Button
      variant="outline"
      size="sm"
      aria-label={t("nav.toggleLang")}
      className="font-mono text-xs font-semibold tabular-nums"
      onClick={() => setLocale(locale === "en" ? "vi" : "en")}
    >
      {locale === "en" ? "EN" : "VI"}
    </Button>
  );
}
