"use client";

import { Badge } from "@/components/ui/badge";
import { useT } from "@/components/i18n-provider";
import type { ProcessResult } from "@/runtime/types";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[130px_1fr] gap-2 border-b border-border/60 py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span>{children}</span>
    </div>
  );
}

export function ProcessResultView({ result }: { result: ProcessResult }) {
  const t = useT();
  const { approval } = result;
  return (
    <div className="grid gap-1">
      <div className="mb-2 flex items-center gap-2">
        {result.accepted ? (
          <Badge>{t("preview.accepted")}</Badge>
        ) : (
          <Badge variant="destructive">{t("preview.notAccepted")}</Badge>
        )}
        {result.errors.length > 0 && (
          <span className="text-sm text-destructive">
            {result.errors.join("; ")}
          </span>
        )}
      </div>

      <Row label={t("preview.approval")}>
        {approval.autoApproved
          ? t("preview.autoApproved")
          : approval.approverRole
            ? t("preview.tierRole", { tier: approval.tier ?? "", role: approval.approverRole })
            : t("preview.unrouted")}
      </Row>
      <Row label={t("preview.slaDeadline")}>
        {result.slaDeadline ?? t("common.none")}
      </Row>
      <Row label={t("preview.requiredDocs")}>
        {result.requiredDocuments.length
          ? result.requiredDocuments.join(", ")
          : t("common.none")}
      </Row>
      <Row label={t("preview.optionalDocs")}>
        {result.optionalDocuments.length
          ? result.optionalDocuments.join(", ")
          : t("common.none")}
      </Row>
      <Row label={t("preview.notifications")}>
        {result.notifications.length ? (
          <div className="grid gap-1">
            {result.notifications.map((n) => (
              <span key={n.event}>
                {n.event}: {n.channels.join(", ")}
              </span>
            ))}
          </div>
        ) : (
          t("common.none")
        )}
      </Row>
      {result.customFieldValidation.length > 0 && (
        <Row label={t("preview.customFields")}>
          <div className="grid gap-1">
            {result.customFieldValidation.map((c) => (
              <span key={c.key} className={c.ok ? "" : "text-destructive"}>
                {c.key}: {c.ok ? t("preview.ok") : c.message}
              </span>
            ))}
          </div>
        </Row>
      )}
    </div>
  );
}
