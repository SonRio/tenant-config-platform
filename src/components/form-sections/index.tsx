import type { FC } from "react";
import { BrandingSection } from "./branding-section";
import { ClaimTypesSection } from "./claim-types-section";
import { ApprovalSection } from "./approval-section";
import { NotificationsSection } from "./notifications-section";
import { SlaSection } from "./sla-section";
import { CustomFieldsSection } from "./custom-fields-section";

/**
 * Maps a dimension key to its admin form section. The form iterates the
 * registry and looks up the section here, so adding a dimension means adding
 * one entry (and only if it needs a bespoke editor).
 */
export const FORM_SECTIONS: Record<string, FC> = {
  branding: BrandingSection,
  claimTypes: ClaimTypesSection,
  approval: ApprovalSection,
  notifications: NotificationsSection,
  sla: SlaSection,
  customFields: CustomFieldsSection,
};
