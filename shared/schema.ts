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
  displayMode: text("display_mode").notNull().default("both"),
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
  displayMode: text("display_mode").notNull().default("both"),
  isHero: boolean("is_hero").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGalleryItemSchema = createInsertSchema(galleryItems).omit({
  id: true,
  createdAt: true,
});

export type InsertGalleryItem = z.infer<typeof insertGalleryItemSchema>;
export type GalleryItem = typeof galleryItems.$inferSelect;

export const portfolioMedia = pgTable("portfolio_media", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  projectId: integer("project_id").notNull().references(() => galleryItems.id, { onDelete: "cascade" }),
  title: text("title"),
  mediaUrl: text("media_url").notNull(),
  mediaType: text("media_type").notNull(),
  sortOrder: integer("sort_order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPortfolioMediaSchema = createInsertSchema(portfolioMedia).omit({
  id: true,
  createdAt: true,
});

export type InsertPortfolioMedia = z.infer<typeof insertPortfolioMediaSchema>;
export type PortfolioMedia = typeof portfolioMedia.$inferSelect;

// Display mode settings for Yin/Yang theming
export const displayModeSettings = pgTable("display_mode_settings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  mode: text("mode").notNull().unique(), // "professional" (Yin) or "edge" (Yang)
  // Hero settings
  heroItemId: integer("hero_item_id").references(() => galleryItems.id),
  // Typography
  headingFont: text("heading_font").default("Cormorant Garamond"),
  bodyFont: text("body_font").default("Inter"),
  // Colors
  backgroundColor: text("background_color").default("#ffffff"),
  surfaceColor: text("surface_color").default("#f8f9fa"),
  accentColor: text("accent_color").default("#8B7355"),
  textColor: text("text_color").default("#1a1a1a"),
  // Additional styling
  tagline: text("tagline"),
});

export const insertDisplayModeSettingsSchema = createInsertSchema(displayModeSettings).omit({
  id: true,
});

export type InsertDisplayModeSettings = z.infer<typeof insertDisplayModeSettingsSchema>;
export type DisplayModeSettings = typeof displayModeSettings.$inferSelect;

// Available fonts list (for UI selection)
export const AVAILABLE_FONTS = {
  headings: [
    { name: "Cormorant Garamond", family: "'Cormorant Garamond', serif", style: "elegant" },
    { name: "Playfair Display", family: "'Playfair Display', serif", style: "elegant" },
    { name: "Lora", family: "'Lora', serif", style: "elegant" },
    { name: "DM Serif Display", family: "'DM Serif Display', serif", style: "elegant" },
    { name: "Montserrat", family: "'Montserrat', sans-serif", style: "modern" },
    { name: "Poppins", family: "'Poppins', sans-serif", style: "modern" },
    { name: "Raleway", family: "'Raleway', sans-serif", style: "modern" },
    { name: "Oswald", family: "'Oswald', sans-serif", style: "bold" },
    { name: "Bebas Neue", family: "'Bebas Neue', sans-serif", style: "bold" },
  ],
  body: [
    { name: "Inter", family: "'Inter', sans-serif", style: "clean" },
    { name: "Source Sans 3", family: "'Source Sans 3', sans-serif", style: "clean" },
    { name: "Open Sans", family: "'Open Sans', sans-serif", style: "clean" },
    { name: "Lato", family: "'Lato', sans-serif", style: "clean" },
    { name: "Roboto", family: "'Roboto', sans-serif", style: "clean" },
    { name: "Nunito", family: "'Nunito', sans-serif", style: "friendly" },
  ],
};
