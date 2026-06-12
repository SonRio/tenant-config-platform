import { Badge } from "@/components/ui/badge";
import type { ProcessResult } from "@/runtime/types";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 py-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span>{children}</span>
    </div>
  );
}

export function ProcessResultView({ result }: { result: ProcessResult }) {
  const { approval } = result;
  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-2">
        {result.accepted ? (
          <Badge>Accepted</Badge>
        ) : (
          <Badge variant="destructive">Not accepted</Badge>
        )}
        {result.errors.length > 0 && (
          <span className="text-sm text-destructive">
            {result.errors.join("; ")}
          </span>
        )}
      </div>

      <Row label="Approval">
        {approval.autoApproved
          ? "Auto-approved"
          : approval.approverRole
            ? `Tier ${approval.tier} → ${approval.approverRole}`
            : "Unrouted"}
      </Row>
      <Row label="SLA deadline">{result.slaDeadline ?? "—"}</Row>
      <Row label="Required docs">
        {result.requiredDocuments.length
          ? result.requiredDocuments.join(", ")
          : "—"}
      </Row>
      <Row label="Optional docs">
        {result.optionalDocuments.length
          ? result.optionalDocuments.join(", ")
          : "—"}
      </Row>
      <Row label="Notifications">
        {result.notifications.length ? (
          <div className="grid gap-1">
            {result.notifications.map((n) => (
              <span key={n.event}>
                {n.event}: {n.channels.join(", ")}
              </span>
            ))}
          </div>
        ) : (
          "—"
        )}
      </Row>
      {result.customFieldValidation.length > 0 && (
        <Row label="Custom fields">
          <div className="grid gap-1">
            {result.customFieldValidation.map((c) => (
              <span
                key={c.key}
                className={c.ok ? "" : "text-destructive"}
              >
                {c.key}: {c.ok ? "ok" : c.message}
              </span>
            ))}
          </div>
        </Row>
      )}
    </div>
  );
}
