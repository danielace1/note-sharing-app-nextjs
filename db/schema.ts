import {
  pgEnum,
  pgTable,
  integer,
  text,
  timestamp,
  uuid,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const shareTypeEnum = pgEnum("share_type", ["ONE_TIME", "TIME_BASED"]);

export const accessTypeEnum = pgEnum("access_type", ["PUBLIC", "PASSWORD"]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    emailUniqueIndex: uniqueIndex("users_email_unique").on(table.email),
  }),
);

export const notes = pgTable(
  "notes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIndex: index("notes_user_id_index").on(table.userId),
  }),
);

export const shareLinks = pgTable(
  "share_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    noteId: uuid("note_id")
      .notNull()
      .references(() => notes.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    shareType: shareTypeEnum("share_type").notNull(),
    accessType: accessTypeEnum("access_type").notNull(),
    accessKeyHash: text("access_key_hash"),
    expiresAt: timestamp("expires_at", {
      withTimezone: true,
    }),
    usedAt: timestamp("used_at", {
      withTimezone: true,
    }),
    revokedAt: timestamp("revoked_at", {
      withTimezone: true,
    }),
    viewCount: integer("view_count").default(0).notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    tokenHashIndex: uniqueIndex("share_links_token_hash_unique").on(
      table.tokenHash,
    ),
    noteIdIndex: index("share_links_note_id_index").on(table.noteId),
  }),
);
