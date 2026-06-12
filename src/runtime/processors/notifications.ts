import type { TenantConfig } from "@/config/tenant-config-schema";

/** The configured notification events and their channels, in config order. */
export function resolveNotifications(config: TenantConfig) {
  return config.notifications.events.map((e) => ({
    event: e.event,
    channels: e.channels,
  }));
}
