import {
  services,
  bookings,
  availability,
  blockedDates,
  siteSettings,
  galleryItems,
  portfolioMedia,
  displayModeSettings,
  customFonts,
  paymentMethods,
  emailTemplates,
  type Service,
  type InsertService,
  type Booking,
  type InsertBooking,
  type Availability,
  type InsertAvailability,
  type BlockedDate,
  type InsertBlockedDate,
  type SiteSettings,
  type InsertSiteSettings,
  type GalleryItem,
  type InsertGalleryItem,
  type PortfolioMedia,
  type InsertPortfolioMedia,
  type DisplayModeSettings,
  type InsertDisplayModeSettings,
  type CustomFont,
  type InsertCustomFont,
  type PaymentMethod,
  type InsertPaymentMethod,
  type EmailTemplate,
  type InsertEmailTemplate,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  getServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;

  getBookings(): Promise<Booking[]>;
  getBooking(id: number): Promise<Booking | undefined>;
  getBookingsByDate(date: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking | undefined>;
  deleteBooking(id: number): Promise<boolean>;

  getAvailability(): Promise<Availability[]>;
  getAvailabilityByDay(dayOfWeek: number): Promise<Availability | undefined>;
  createAvailability(avail: InsertAvailability): Promise<Availability>;
  updateAvailability(id: number, avail: Partial<InsertAvailability>): Promise<Availability | undefined>;

  getBlockedDates(): Promise<BlockedDate[]>;
  getBlockedDate(date: string): Promise<BlockedDate | undefined>;
  createBlockedDate(blocked: InsertBlockedDate): Promise<BlockedDate>;
  deleteBlockedDate(id: number): Promise<boolean>;

  getSettings(): Promise<SiteSettings | undefined>;
  updateSettings(settings: Partial<InsertSiteSettings>): Promise<SiteSettings>;

  getGalleryItems(): Promise<GalleryItem[]>;
  getGalleryItem(id: number): Promise<GalleryItem | undefined>;
  getHeroGalleryItem(): Promise<GalleryItem | undefined>;
  createGalleryItem(item: InsertGalleryItem): Promise<GalleryItem>;
  updateGalleryItem(id: number, item: Partial<InsertGalleryItem>): Promise<GalleryItem | undefined>;
  deleteGalleryItem(id: number): Promise<boolean>;
  setHeroGalleryItem(id: number): Promise<GalleryItem | undefined>;

  getPortfolioMedia(projectId: number): Promise<PortfolioMedia[]>;
  createPortfolioMedia(media: InsertPortfolioMedia): Promise<PortfolioMedia>;
  updatePortfolioMedia(id: number, media: Partial<InsertPortfolioMedia>): Promise<PortfolioMedia | undefined>;
  deletePortfolioMedia(id: number): Promise<boolean>;
  reorderPortfolioMedia(projectId: number, mediaIds: number[]): Promise<boolean>;

  getDisplayModeSettings(mode: string): Promise<DisplayModeSettings | undefined>;
  getAllDisplayModeSettings(): Promise<DisplayModeSettings[]>;
  upsertDisplayModeSettings(mode: string, settings: Partial<InsertDisplayModeSettings>): Promise<DisplayModeSettings>;

  getCustomFonts(): Promise<CustomFont[]>;
  getCustomFont(id: number): Promise<CustomFont | undefined>;
  createCustomFont(font: InsertCustomFont): Promise<CustomFont>;
  deleteCustomFont(id: number): Promise<boolean>;

  getPaymentMethods(): Promise<PaymentMethod[]>;
  getPaymentMethod(id: number): Promise<PaymentMethod | undefined>;
  createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod>;
  updatePaymentMethod(id: number, method: Partial<InsertPaymentMethod>): Promise<PaymentMethod | undefined>;
  deletePaymentMethod(id: number): Promise<boolean>;

  getEmailTemplates(): Promise<EmailTemplate[]>;
  getEmailTemplate(templateType: string): Promise<EmailTemplate | undefined>;
  upsertEmailTemplate(templateType: string, template: Partial<InsertEmailTemplate>): Promise<EmailTemplate>;
}

export class DatabaseStorage implements IStorage {
  async getServices(): Promise<Service[]> {
    return db.select().from(services).orderBy(services.sortOrder);
  }

  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }

  async createService(service: InsertService): Promise<Service> {
    const [newService] = await db.insert(services).values(service).returning();
    return newService;
  }

  async updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined> {
    const [updated] = await db.update(services).set(service).where(eq(services.id, id)).returning();
    return updated;
  }

  async deleteService(id: number): Promise<boolean> {
    const result = await db.delete(services).where(eq(services.id, id));
    return true;
  }

  async getBookings(): Promise<Booking[]> {
    return db.select().from(bookings).orderBy(bookings.createdAt);
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking;
  }

  async getBookingsByDate(date: string): Promise<Booking[]> {
    return db.select().from(bookings).where(eq(bookings.bookingDate, date));
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async updateBooking(id: number, booking: Partial<InsertBooking>): Promise<Booking | undefined> {
    const [updated] = await db.update(bookings).set(booking).where(eq(bookings.id, id)).returning();
    return updated;
  }

  async deleteBooking(id: number): Promise<boolean> {
    await db.delete(bookings).where(eq(bookings.id, id));
    return true;
  }

  async getAvailability(): Promise<Availability[]> {
    return db.select().from(availability).orderBy(availability.dayOfWeek);
  }

  async getAvailabilityByDay(dayOfWeek: number): Promise<Availability | undefined> {
    const [avail] = await db.select().from(availability).where(eq(availability.dayOfWeek, dayOfWeek));
    return avail;
  }

  async createAvailability(avail: InsertAvailability): Promise<Availability> {
    const [newAvail] = await db.insert(availability).values(avail).returning();
    return newAvail;
  }

  async updateAvailability(id: number, avail: Partial<InsertAvailability>): Promise<Availability | undefined> {
    const [updated] = await db.update(availability).set(avail).where(eq(availability.id, id)).returning();
    return updated;
  }

  async getBlockedDates(): Promise<BlockedDate[]> {
    return db.select().from(blockedDates).orderBy(blockedDates.date);
  }

  async getBlockedDate(date: string): Promise<BlockedDate | undefined> {
    const [blocked] = await db.select().from(blockedDates).where(eq(blockedDates.date, date));
    return blocked;
  }

  async createBlockedDate(blocked: InsertBlockedDate): Promise<BlockedDate> {
    const [newBlocked] = await db.insert(blockedDates).values(blocked).returning();
    return newBlocked;
  }

  async deleteBlockedDate(id: number): Promise<boolean> {
    await db.delete(blockedDates).where(eq(blockedDates.id, id));
    return true;
  }

  async getSettings(): Promise<SiteSettings | undefined> {
    const [settings] = await db.select().from(siteSettings);
    return settings;
  }

  async updateSettings(settings: Partial<InsertSiteSettings>): Promise<SiteSettings> {
    const existing = await this.getSettings();
    if (existing) {
      const [updated] = await db.update(siteSettings).set(settings).where(eq(siteSettings.id, existing.id)).returning();
      return updated;
    } else {
      const [created] = await db.insert(siteSettings).values({
        businessName: "The Neitzke Way",
        ...settings,
      }).returning();
      return created;
    }
  }

  async getGalleryItems(): Promise<GalleryItem[]> {
    return db.select().from(galleryItems).orderBy(galleryItems.createdAt);
  }

  async getGalleryItem(id: number): Promise<GalleryItem | undefined> {
    const [item] = await db.select().from(galleryItems).where(eq(galleryItems.id, id));
    return item;
  }

  async getHeroGalleryItem(): Promise<GalleryItem | undefined> {
    const [item] = await db.select().from(galleryItems).where(eq(galleryItems.isHero, true));
    return item;
  }

  async createGalleryItem(item: InsertGalleryItem): Promise<GalleryItem> {
    const [newItem] = await db.insert(galleryItems).values(item).returning();
    return newItem;
  }

  async updateGalleryItem(id: number, item: Partial<InsertGalleryItem>): Promise<GalleryItem | undefined> {
    const [updated] = await db.update(galleryItems).set(item).where(eq(galleryItems.id, id)).returning();
    return updated;
  }

  async deleteGalleryItem(id: number): Promise<boolean> {
    await db.delete(galleryItems).where(eq(galleryItems.id, id));
    return true;
  }

  async setHeroGalleryItem(id: number): Promise<GalleryItem | undefined> {
    await db.update(galleryItems).set({ isHero: false }).where(eq(galleryItems.isHero, true));
    const [updated] = await db.update(galleryItems).set({ isHero: true }).where(eq(galleryItems.id, id)).returning();
    return updated;
  }

  async getPortfolioMedia(projectId: number): Promise<PortfolioMedia[]> {
    return db.select().from(portfolioMedia)
      .where(eq(portfolioMedia.projectId, projectId))
      .orderBy(portfolioMedia.sortOrder);
  }

  async createPortfolioMedia(media: InsertPortfolioMedia): Promise<PortfolioMedia> {
    const [newMedia] = await db.insert(portfolioMedia).values(media).returning();
    return newMedia;
  }

  async updatePortfolioMedia(id: number, media: Partial<InsertPortfolioMedia>): Promise<PortfolioMedia | undefined> {
    const [updated] = await db.update(portfolioMedia).set(media).where(eq(portfolioMedia.id, id)).returning();
    return updated;
  }

  async deletePortfolioMedia(id: number): Promise<boolean> {
    await db.delete(portfolioMedia).where(eq(portfolioMedia.id, id));
    return true;
  }

  async reorderPortfolioMedia(projectId: number, mediaIds: number[]): Promise<boolean> {
    for (let i = 0; i < mediaIds.length; i++) {
      await db.update(portfolioMedia)
        .set({ sortOrder: i })
        .where(and(eq(portfolioMedia.id, mediaIds[i]), eq(portfolioMedia.projectId, projectId)));
    }
    return true;
  }

  async getDisplayModeSettings(mode: string): Promise<DisplayModeSettings | undefined> {
    const [settings] = await db.select().from(displayModeSettings).where(eq(displayModeSettings.mode, mode));
    return settings;
  }

  async getAllDisplayModeSettings(): Promise<DisplayModeSettings[]> {
    return db.select().from(displayModeSettings);
  }

  async upsertDisplayModeSettings(mode: string, settings: Partial<InsertDisplayModeSettings>): Promise<DisplayModeSettings> {
    const existing = await this.getDisplayModeSettings(mode);
    if (existing) {
      const [updated] = await db.update(displayModeSettings)
        .set(settings)
        .where(eq(displayModeSettings.mode, mode))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(displayModeSettings)
        .values({ mode, ...settings })
        .returning();
      return created;
    }
  }

  async getCustomFonts(): Promise<CustomFont[]> {
    return db.select().from(customFonts);
  }

  async getCustomFont(id: number): Promise<CustomFont | undefined> {
    const [font] = await db.select().from(customFonts).where(eq(customFonts.id, id));
    return font;
  }

  async createCustomFont(font: InsertCustomFont): Promise<CustomFont> {
    const [created] = await db.insert(customFonts).values(font).returning();
    return created;
  }

  async deleteCustomFont(id: number): Promise<boolean> {
    await db.delete(customFonts).where(eq(customFonts.id, id));
    return true;
  }

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return db.select().from(paymentMethods).orderBy(paymentMethods.sortOrder);
  }

  async getPaymentMethod(id: number): Promise<PaymentMethod | undefined> {
    const [method] = await db.select().from(paymentMethods).where(eq(paymentMethods.id, id));
    return method;
  }

  async createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod> {
    const [created] = await db.insert(paymentMethods).values(method).returning();
    return created;
  }

  async updatePaymentMethod(id: number, method: Partial<InsertPaymentMethod>): Promise<PaymentMethod | undefined> {
    const [updated] = await db.update(paymentMethods).set(method).where(eq(paymentMethods.id, id)).returning();
    return updated;
  }

  async deletePaymentMethod(id: number): Promise<boolean> {
    await db.delete(paymentMethods).where(eq(paymentMethods.id, id));
    return true;
  }

  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return db.select().from(emailTemplates);
  }

  async getEmailTemplate(templateType: string): Promise<EmailTemplate | undefined> {
    const [template] = await db.select().from(emailTemplates).where(eq(emailTemplates.templateType, templateType));
    return template;
  }

  async upsertEmailTemplate(templateType: string, template: Partial<InsertEmailTemplate>): Promise<EmailTemplate> {
    const existing = await this.getEmailTemplate(templateType);
    if (existing) {
      const [updated] = await db.update(emailTemplates)
        .set({ ...template, updatedAt: new Date() })
        .where(eq(emailTemplates.templateType, templateType))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(emailTemplates)
        .values({ templateType, subject: template.subject || '', body: template.body || '', ...template })
        .returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
