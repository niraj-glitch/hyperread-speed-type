import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(), // Extracted text content
  originalFilename: text("original_filename").notNull(),
  wordCount: integer("word_count").notNull(),
  currentWordIndex: integer("current_word_index").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  wpm: integer("wpm").default(300).notNull(),
  chunkSize: integer("chunk_size").default(1).notNull(),
  fontSize: integer("font_size").default(48).notNull(), // For RSVP display
  fontFamily: text("font_family").default("IBM Plex Sans").notNull(),
  orpHighlight: boolean("orp_highlight").default(true).notNull(),
  pauseOnPunctuation: boolean("pause_on_punctuation").default(true).notNull(),
  speedRamping: boolean("speed_ramping").default(false).notNull(),
  darkMode: boolean("dark_mode").default(true).notNull(),
});

// === SCHEMAS ===

export const insertDocumentSchema = createInsertSchema(documents).omit({ 
  id: true, 
  createdAt: true, 
  currentWordIndex: true 
});

export const insertSettingsSchema = createInsertSchema(settings).omit({ 
  id: true 
});

// === EXPLICIT API TYPES ===

export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;

// Request types
export type CreateDocumentRequest = {
  title: string;
  content: string;
  originalFilename: string;
  wordCount: number;
};

export type UpdateProgressRequest = {
  currentWordIndex: number;
};

export type UpdateSettingsRequest = Partial<InsertSettings>;

// Response types
export type DocumentResponse = Document;
export type SettingsResponse = Settings;
