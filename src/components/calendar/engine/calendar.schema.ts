// calendar.schema.ts
import { z } from 'zod';

export const calendarViewModeSchema = z.enum(['month', 'week', 'day']);

export const calendarSelectionModeSchema = z.enum([
  'single',
  'multiple',
  'week',
  'range',
]);

export const calendarConfigSchema = z.object({
  initialView: calendarViewModeSchema.default('month'),
  weekStartsOn: z.union([z.literal(0), z.literal(1)]).default(1),

  startHour: z.number().min(0).max(23).default(8),
  endHour: z.number().min(1).max(24).default(18),
  slotMinutes: z.number().min(5).max(240).default(30),

  selectionMode: calendarSelectionModeSchema.default('multiple'),
});

export type CalendarConfig = z.infer<typeof calendarConfigSchema>;