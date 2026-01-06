import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, date, time } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

export const services = pgTable("services", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  duration: integer("duration").notNull(),
  price: integer("price").notNull(),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
});

export const servicesRelations = relations(services, ({ many }) => ({
  bookings: many(bookings),
}));

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
});

export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

export const availability = pgTable("availability", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  dayOfWeek: integer("day_of_week").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
  isAvailable: boolean("is_available").default(true).notNull(),
});

export const insertAvailabilitySchema = createInsertSchema(availability).omit({
  id: true,
});

export type InsertAvailability = z.infer<typeof insertAvailabilitySchema>;
export type Availability = typeof availability.$inferSelect;

export const blockedDates = pgTable("blocked_dates", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  date: date("date").notNull(),
  reason: text("reason"),
});

export const insertBlockedDateSchema = createInsertSchema(blockedDates).omit({
  id: true,
});

export type InsertBlockedDate = z.infer<typeof insertBlockedDateSchema>;
export type BlockedDate = typeof blockedDates.$inferSelect;

export const bookings = pgTable("bookings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  serviceId: integer("service_id").notNull().references(() => services.id),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  clientPhone: text("client_phone").notNull(),
  bookingDate: date("booking_date").notNull(),
  bookingTime: time("booking_time").notNull(),
  status: text("status").notNull().default("pending"),
  paymentStatus: text("payment_status").notNull().default("unpaid"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookingsRelations = relations(bookings, ({ one }) => ({
  service: one(services, {
    fields: [bookings.serviceId],
    references: [services.id],
  }),
}));

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
}).extend({
  status: z.string().optional().default("pending"),
  paymentStatus: z.string().optional().default("unpaid"),
  notes: z.string().nullable().optional(),
});

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

export const siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  businessName: text("business_name").notNull().default("Oraginal Concepts"),
  tagline: text("tagline"),
  aboutText: text("about_text"),
  heroImageUrl: text("hero_image_url"),
  cashappLink: text("cashapp_link"),
  chimeLink: text("chime_link"),
  applepayLink: text("applepay_link"),
  venmoLink: text("venmo_link"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  address: text("address"),
  hoursOfOperation: text("hours_of_operation"),
  footerTagline: text("footer_tagline"),
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({
  id: true,
});

export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type SiteSettings = typeof siteSettings.$inferSelect;

export const galleryItems = pgTable("gallery_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title"),
  description: text("description"),
  projectUrl: text("project_url"),
  mediaUrl: text("media_url").notNull(),
  mediaType: text("media_type").notNull(),
  isHero: boolean("is_hero").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGalleryItemSchema = createInsertSchema(galleryItems).omit({
  id: true,
  createdAt: true,
});

export type InsertGalleryItem = z.infer<typeof insertGalleryItemSchema>;
export type GalleryItem = typeof galleryItems.$inferSelect;
