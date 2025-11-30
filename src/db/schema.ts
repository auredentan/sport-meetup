import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  workosId: text("workos_id").unique().notNull(),
  email: text("email").unique().notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  avatarUrl: text("avatar_url"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const activities = sqliteTable("activities", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  sportType: text("sport_type").notNull(),
  location: text("location").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  date: integer("date", { mode: "timestamp" }).notNull(),
  maxParticipants: integer("max_participants").notNull(),
  skillLevel: text("skill_level").notNull(), // beginner, intermediate, advanced, all
  // Recurrence fields
  isRecurring: integer("is_recurring", { mode: "boolean" }).default(false),
  recurrenceType: text("recurrence_type"), // daily, weekly, biweekly, monthly
  recurrenceEndDate: integer("recurrence_end_date", { mode: "timestamp" }),
  recurrenceDay: integer("recurrence_day"), // Day of week (0-6) or day of month (1-31)
  organizerId: text("organizer_id")
    .notNull()
    .references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const participants = sqliteTable("participants", {
  id: text("id").primaryKey(),
  activityId: text("activity_id")
    .notNull()
    .references(() => activities.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  status: text("status").notNull().default("confirmed"), // confirmed, pending, cancelled
  joinedAt: integer("joined_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

// Relations
export const activitiesRelations = relations(activities, ({ many }) => ({
  participants: many(participants),
}));

export const participantsRelations = relations(participants, ({ one }) => ({
  activity: one(activities, {
    fields: [participants.activityId],
    references: [activities.id],
  }),
  user: one(users, {
    fields: [participants.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;
export type Participant = typeof participants.$inferSelect;
export type NewParticipant = typeof participants.$inferInsert;
