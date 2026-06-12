import { z } from "zod";
import { defineDimension } from "./types";
import { notifyEventSchema, channelSchema } from "./shared";

const eventRuleSchema = z.object({
  event: notifyEventSchema,
  channels: z.array(channelSchema).min(1, "Pick at least one channel"),
  template: z.string().optional(),
});

export const notificationsSchema = z.object({
  events: z.array(eventRuleSchema).default([]),
});

export type NotificationsConfig = z.infer<typeof notificationsSchema>;

export const notifications = defineDimension<NotificationsConfig>({
  key: "notifications",
  title: "Notifications",
  schema: notificationsSchema,
  default: { events: [] },
  summarize: (v) =>
    v.events.length === 0
      ? [{ label: "Events", value: "—" }]
      : v.events.map((e) => ({
          label: e.event,
          value: e.channels.join(", "),
        })),
});
