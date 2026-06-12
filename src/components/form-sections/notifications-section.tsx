"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  CHANNELS,
  NOTIFY_EVENTS,
  type Channel,
  type NotifyEvent,
} from "@/config/dimensions/shared";
import type { TenantFormValues } from "@/lib/tenant-form-schema";

type EventRule = { event: NotifyEvent; channels: Channel[]; template?: string };

export function NotificationsSection() {
  const { control, setValue } = useFormContext<TenantFormValues>();
  const events =
    (useWatch({ control, name: "config.notifications.events" }) as EventRule[]) ??
    [];

  const commit = (next: EventRule[]) =>
    setValue("config.notifications.events", next, { shouldValidate: true });

  const channelsFor = (event: NotifyEvent) =>
    events.find((e) => e.event === event)?.channels ?? [];

  const toggleChannel = (event: NotifyEvent, channel: Channel, on: boolean) => {
    const existing = events.find((e) => e.event === event);
    const base = existing ?? { event, channels: [] as Channel[] };
    const channels = on
      ? [...new Set([...base.channels, channel])]
      : base.channels.filter((c) => c !== channel);

    const others = events.filter((e) => e.event !== event);
    const next = [...others, { ...base, channels }].filter(
      (e) => e.channels.length > 0
    );
    // Keep event order stable for deterministic diffs.
    next.sort(
      (a, b) => NOTIFY_EVENTS.indexOf(a.event) - NOTIFY_EVENTS.indexOf(b.event)
    );
    commit(next);
  };

  return (
    <div className="grid gap-3">
      {NOTIFY_EVENTS.map((event) => {
        const active = channelsFor(event);
        return (
          <div
            key={event}
            className="flex flex-wrap items-center gap-4 rounded-lg border p-3"
          >
            <span className="w-40 text-sm font-medium">{event}</span>
            {CHANNELS.map((channel) => (
              <label key={channel} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={active.includes(channel)}
                  onCheckedChange={(c) => toggleChannel(event, channel, c === true)}
                />
                {channel}
              </label>
            ))}
          </div>
        );
      })}
      <Label className="text-xs text-muted-foreground">
        Select channels to enable an event. Unselected events send nothing.
      </Label>
    </div>
  );
}
