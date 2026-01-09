import type { Express, RequestHandler } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import connectPg from "connect-pg-simple";
import express from "express";
import path from "path";
import {
  insertServiceSchema,
  insertBookingSchema,
  insertAvailabilitySchema,
  insertBlockedDateSchema,
  insertSiteSettingsSchema,
  insertGalleryItemSchema,
  insertPortfolioMediaSchema,
  insertDisplayModeSettingsSchema,
  AVAILABLE_FONTS,
  PAYMENT_PROVIDERS,
  type PaymentProviderType,
} from "@shared/schema";
import { encrypt, decrypt, isEncryptionKeySet } from "./encryption";
import { z } from "zod";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { seedDatabaseIfEmpty } from "./seed";

declare module "express-session" {
  interface SessionData {
    isAdmin: boolean;
  }
}

const isAdminAuthenticated: RequestHandler = (req, res, next) => {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  if (!process.env.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is required");
  }

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: sessionTtl,
      },
    })
  );

  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return res.status(500).json({ message: "Admin password not configured. Please set ADMIN_PASSWORD." });
    }

    if (password === adminPassword) {
      req.session.isAdmin = true;
      res.json({ success: true });
    } else {
      res.status(401).json({ message: "Invalid password" });
    }
  });

  app.get("/api/admin/session", (req, res) => {
    res.json({ isAdmin: req.session?.isAdmin || false });
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  app.get("/api/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const service = await storage.getService(id);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      console.error("Error fetching service:", error);
      res.status(500).json({ message: "Failed to fetch service" });
    }
  });

  app.post("/api/services", isAdminAuthenticated, async (req, res) => {
    try {
      const data = insertServiceSchema.parse(req.body);
      const service = await storage.createService(data);
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating service:", error);
      res.status(500).json({ message: "Failed to create service" });
    }
  });

  app.patch("/api/services/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertServiceSchema.partial().parse(req.body);
      const service = await storage.updateService(id, data);
      if (!service) {
        return res.status(404).json({ message: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating service:", error);
      res.status(500).json({ message: "Failed to update service" });
    }
  });

  app.delete("/api/services/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteService(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting service:", error);
      res.status(500).json({ message: "Failed to delete service" });
    }
  });

  app.get("/api/bookings", isAdminAuthenticated, async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      const data = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(data);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.patch("/api/bookings/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertBookingSchema.partial().parse(req.body);
      const booking = await storage.updateBooking(id, data);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating booking:", error);
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  app.get("/api/availability", async (req, res) => {
    try {
      const availability = await storage.getAvailability();
      res.json(availability);
    } catch (error) {
      console.error("Error fetching availability:", error);
      res.status(500).json({ message: "Failed to fetch availability" });
    }
  });

  app.post("/api/availability", isAdminAuthenticated, async (req, res) => {
    try {
      const data = insertAvailabilitySchema.parse(req.body);
      const availability = await storage.createAvailability(data);
      res.status(201).json(availability);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating availability:", error);
      res.status(500).json({ message: "Failed to create availability" });
    }
  });

  app.patch("/api/availability/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertAvailabilitySchema.partial().parse(req.body);
      const availability = await storage.updateAvailability(id, data);
      if (!availability) {
        return res.status(404).json({ message: "Availability not found" });
      }
      res.json(availability);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating availability:", error);
      res.status(500).json({ message: "Failed to update availability" });
    }
  });

  app.get("/api/availability/slots", async (req, res) => {
    try {
      const { date, serviceId } = req.query;
      if (!date || typeof date !== "string") {
        return res.status(400).json({ message: "Date is required" });
      }

      const dateObj = new Date(date);
      const dayOfWeek = dateObj.getDay();

      const dayAvailability = await storage.getAvailabilityByDay(dayOfWeek);
      if (!dayAvailability || !dayAvailability.isAvailable) {
        return res.json([]);
      }

      const existingBookings = await storage.getBookingsByDate(date);
      const bookedTimes = new Set(
        existingBookings
          .filter((b) => b.status !== "cancelled")
          .map((b) => b.bookingTime)
      );

      let serviceDuration = 60;
      if (serviceId && typeof serviceId === "string") {
        const service = await storage.getService(parseInt(serviceId));
        if (service) {
          serviceDuration = service.duration;
        }
      }

      const slots: { time: string; available: boolean }[] = [];
      const [startHour, startMin] = dayAvailability.startTime.split(":").map(Number);
      const [endHour, endMin] = dayAvailability.endTime.split(":").map(Number);

      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      for (let time = startMinutes; time + serviceDuration <= endMinutes; time += 30) {
        const hour = Math.floor(time / 60);
        const min = time % 60;
        const timeStr = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
        slots.push({
          time: timeStr,
          available: !bookedTimes.has(timeStr),
        });
      }

      res.json(slots);
    } catch (error) {
      console.error("Error fetching slots:", error);
      res.status(500).json({ message: "Failed to fetch slots" });
    }
  });

  app.get("/api/blocked-dates", async (req, res) => {
    try {
      const blockedDates = await storage.getBlockedDates();
      res.json(blockedDates);
    } catch (error) {
      console.error("Error fetching blocked dates:", error);
      res.status(500).json({ message: "Failed to fetch blocked dates" });
    }
  });

  app.post("/api/blocked-dates", isAdminAuthenticated, async (req, res) => {
    try {
      const data = insertBlockedDateSchema.parse(req.body);
      const blocked = await storage.createBlockedDate(data);
      res.status(201).json(blocked);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating blocked date:", error);
      res.status(500).json({ message: "Failed to create blocked date" });
    }
  });

  app.delete("/api/blocked-dates/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBlockedDate(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting blocked date:", error);
      res.status(500).json({ message: "Failed to delete blocked date" });
    }
  });

  app.get("/api/settings", async (req, res) => {
    try {
      let settings = await storage.getSettings();
      if (!settings) {
        settings = await storage.updateSettings({ businessName: "The Neitzke Way" });
      }
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.put("/api/settings", isAdminAuthenticated, async (req, res) => {
    try {
      const data = insertSiteSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateSettings(data);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  registerObjectStorageRoutes(app);

  // Serve static media files
  app.use("/media", express.static(path.join(process.cwd(), "public/media")));

  await seedDatabaseIfEmpty();

  app.get("/api/gallery", async (req, res) => {
    try {
      const items = await storage.getGalleryItems();
      res.json(items);
    } catch (error) {
      console.error("Error fetching gallery items:", error);
      res.status(500).json({ message: "Failed to fetch gallery items" });
    }
  });

  app.get("/api/gallery/hero", async (req, res) => {
    try {
      const hero = await storage.getHeroGalleryItem();
      res.json(hero || null);
    } catch (error) {
      console.error("Error fetching hero image:", error);
      res.status(500).json({ message: "Failed to fetch hero image" });
    }
  });

  app.get("/api/gallery/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.getGalleryItem(id);
      if (!item) {
        return res.status(404).json({ message: "Gallery item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error fetching gallery item:", error);
      res.status(500).json({ message: "Failed to fetch gallery item" });
    }
  });

  app.post("/api/gallery", isAdminAuthenticated, async (req, res) => {
    try {
      const data = insertGalleryItemSchema.parse(req.body);
      const item = await storage.createGalleryItem(data);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating gallery item:", error);
      res.status(500).json({ message: "Failed to create gallery item" });
    }
  });

  app.put("/api/gallery/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertGalleryItemSchema.partial().parse(req.body);
      const item = await storage.updateGalleryItem(id, data);
      if (!item) {
        return res.status(404).json({ message: "Gallery item not found" });
      }
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating gallery item:", error);
      res.status(500).json({ message: "Failed to update gallery item" });
    }
  });

  app.post("/api/gallery/:id/set-hero", isAdminAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.setHeroGalleryItem(id);
      if (!item) {
        return res.status(404).json({ message: "Gallery item not found" });
      }
      res.json(item);
    } catch (error) {
      console.error("Error setting hero image:", error);
      res.status(500).json({ message: "Failed to set hero image" });
    }
  });

  app.delete("/api/gallery/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteGalleryItem(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting gallery item:", error);
      res.status(500).json({ message: "Failed to delete gallery item" });
    }
  });

  app.get("/api/projects/:projectId/media", async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const media = await storage.getPortfolioMedia(projectId);
      res.json(media);
    } catch (error) {
      console.error("Error fetching portfolio media:", error);
      res.status(500).json({ message: "Failed to fetch portfolio media" });
    }
  });

  app.post("/api/projects/:projectId/media", isAdminAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const data = insertPortfolioMediaSchema.parse({ ...req.body, projectId });
      const media = await storage.createPortfolioMedia(data);
      res.status(201).json(media);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error creating portfolio media:", error);
      res.status(500).json({ message: "Failed to create portfolio media" });
    }
  });

  app.put("/api/projects/:projectId/media/:mediaId", isAdminAuthenticated, async (req, res) => {
    try {
      const mediaId = parseInt(req.params.mediaId);
      const data = insertPortfolioMediaSchema.partial().parse(req.body);
      const media = await storage.updatePortfolioMedia(mediaId, data);
      if (!media) {
        return res.status(404).json({ message: "Media not found" });
      }
      res.json(media);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating portfolio media:", error);
      res.status(500).json({ message: "Failed to update portfolio media" });
    }
  });

  app.delete("/api/projects/:projectId/media/:mediaId", isAdminAuthenticated, async (req, res) => {
    try {
      const mediaId = parseInt(req.params.mediaId);
      await storage.deletePortfolioMedia(mediaId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting portfolio media:", error);
      res.status(500).json({ message: "Failed to delete portfolio media" });
    }
  });

  app.post("/api/projects/:projectId/media/reorder", isAdminAuthenticated, async (req, res) => {
    try {
      const projectId = parseInt(req.params.projectId);
      const { mediaIds } = req.body;
      if (!Array.isArray(mediaIds)) {
        return res.status(400).json({ message: "mediaIds must be an array" });
      }
      await storage.reorderPortfolioMedia(projectId, mediaIds);
      res.json({ success: true });
    } catch (error) {
      console.error("Error reordering portfolio media:", error);
      res.status(500).json({ message: "Failed to reorder portfolio media" });
    }
  });

  // Display Mode Settings API
  app.get("/api/display-mode-settings", async (req, res) => {
    try {
      const allSettings = await storage.getAllDisplayModeSettings();
      res.json(allSettings);
    } catch (error) {
      console.error("Error fetching display mode settings:", error);
      res.status(500).json({ message: "Failed to fetch display mode settings" });
    }
  });

  app.get("/api/display-mode-settings/:mode", async (req, res) => {
    try {
      const { mode } = req.params;
      const settings = await storage.getDisplayModeSettings(mode);
      if (!settings) {
        return res.status(404).json({ message: "Settings not found for this mode" });
      }
      res.json(settings);
    } catch (error) {
      console.error("Error fetching display mode settings:", error);
      res.status(500).json({ message: "Failed to fetch display mode settings" });
    }
  });

  app.put("/api/display-mode-settings/:mode", isAdminAuthenticated, async (req, res) => {
    try {
      const { mode } = req.params;
      if (mode !== "professional" && mode !== "edge") {
        return res.status(400).json({ message: "Mode must be 'professional' or 'edge'" });
      }
      const data = insertDisplayModeSettingsSchema.partial().parse(req.body);
      const settings = await storage.upsertDisplayModeSettings(mode, data);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Error updating display mode settings:", error);
      res.status(500).json({ message: "Failed to update display mode settings" });
    }
  });

  app.get("/api/available-fonts", async (req, res) => {
    try {
      const customFontsList = await storage.getCustomFonts();
      const customHeadings = customFontsList
        .filter(f => f.fontType === "heading" || f.fontType === "both")
        .map(f => ({
          name: f.name,
          family: f.family,
          style: f.style || "custom",
          isCustom: true,
          id: f.id,
          fontUrl: f.fontUrl,
        }));
      const customBody = customFontsList
        .filter(f => f.fontType === "body" || f.fontType === "both")
        .map(f => ({
          name: f.name,
          family: f.family,
          style: f.style || "custom",
          isCustom: true,
          id: f.id,
          fontUrl: f.fontUrl,
        }));
      
      res.json({
        headings: [...AVAILABLE_FONTS.headings, ...customHeadings],
        body: [...AVAILABLE_FONTS.body, ...customBody],
      });
    } catch (error) {
      console.error("Error fetching available fonts:", error);
      res.json(AVAILABLE_FONTS);
    }
  });

  app.get("/api/custom-fonts", isAdminAuthenticated, async (req, res) => {
    try {
      const fonts = await storage.getCustomFonts();
      res.json(fonts);
    } catch (error) {
      console.error("Error fetching custom fonts:", error);
      res.status(500).json({ message: "Failed to fetch custom fonts" });
    }
  });

  app.post("/api/custom-fonts", isAdminAuthenticated, async (req, res) => {
    try {
      const { name, fontUrl, fontType, style } = req.body;
      if (!name || !fontUrl || !fontType) {
        return res.status(400).json({ message: "Name, fontUrl, and fontType are required" });
      }
      const family = `'${name}', sans-serif`;
      const font = await storage.createCustomFont({
        name,
        family,
        fontUrl,
        fontType,
        style: style || "custom",
      });
      res.json(font);
    } catch (error) {
      console.error("Error creating custom font:", error);
      res.status(500).json({ message: "Failed to create custom font" });
    }
  });

  app.delete("/api/custom-fonts/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCustomFont(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting custom font:", error);
      res.status(500).json({ message: "Failed to delete custom font" });
    }
  });

  // Payment Methods API
  app.get("/api/payment-providers", async (req, res) => {
    res.json(PAYMENT_PROVIDERS);
  });

  app.get("/api/payment-methods", async (req, res) => {
    try {
      const methods = await storage.getPaymentMethods();
      const sanitizedMethods = methods.map(method => ({
        ...method,
        encryptedCredentials: method.encryptedCredentials ? "[ENCRYPTED]" : null,
      }));
      res.json(sanitizedMethods);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      res.status(500).json({ message: "Failed to fetch payment methods" });
    }
  });

  app.get("/api/payment-methods/active", async (req, res) => {
    try {
      const methods = await storage.getPaymentMethods();
      const activeMethods = methods
        .filter(m => m.isActive)
        .map(method => ({
          id: method.id,
          providerType: method.providerType,
          displayName: method.displayName,
          paymentLink: method.paymentLink,
          hasCredentials: !!method.encryptedCredentials,
        }));
      res.json(activeMethods);
    } catch (error) {
      console.error("Error fetching active payment methods:", error);
      res.status(500).json({ message: "Failed to fetch payment methods" });
    }
  });

  app.post("/api/payment-methods", isAdminAuthenticated, async (req, res) => {
    try {
      const { providerType, credentials } = req.body;
      
      if (!providerType || !(providerType in PAYMENT_PROVIDERS)) {
        return res.status(400).json({ message: "Invalid provider type" });
      }

      const provider = PAYMENT_PROVIDERS[providerType as PaymentProviderType];
      let encryptedCredentials: string | null = null;
      let paymentLink: string | null = null;

      if (provider.type === "link") {
        paymentLink = credentials?.url || null;
      } else if (provider.type === "api") {
        if (!isEncryptionKeySet()) {
          return res.status(400).json({ 
            message: "ENCRYPTION_KEY is not set. Please set it in your environment secrets before adding API-based payment methods." 
          });
        }
        encryptedCredentials = encrypt(JSON.stringify(credentials));
      }

      const method = await storage.createPaymentMethod({
        providerType,
        displayName: provider.name,
        isActive: true,
        paymentLink,
        encryptedCredentials,
        sortOrder: 0,
      });

      res.status(201).json({
        ...method,
        encryptedCredentials: method.encryptedCredentials ? "[ENCRYPTED]" : null,
      });
    } catch (error) {
      console.error("Error creating payment method:", error);
      res.status(500).json({ message: "Failed to create payment method" });
    }
  });

  app.put("/api/payment-methods/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { credentials, isActive } = req.body;
      
      const existingMethod = await storage.getPaymentMethod(id);
      if (!existingMethod) {
        return res.status(404).json({ message: "Payment method not found" });
      }

      const updateData: any = {};
      
      if (isActive !== undefined) {
        updateData.isActive = isActive;
      }

      if (credentials) {
        const provider = PAYMENT_PROVIDERS[existingMethod.providerType as PaymentProviderType];
        if (provider.type === "link") {
          updateData.paymentLink = credentials?.url || null;
        } else if (provider.type === "api") {
          if (!isEncryptionKeySet()) {
            return res.status(400).json({ 
              message: "ENCRYPTION_KEY is not set." 
            });
          }
          updateData.encryptedCredentials = encrypt(JSON.stringify(credentials));
        }
      }

      const method = await storage.updatePaymentMethod(id, updateData);
      res.json({
        ...method,
        encryptedCredentials: method?.encryptedCredentials ? "[ENCRYPTED]" : null,
      });
    } catch (error) {
      console.error("Error updating payment method:", error);
      res.status(500).json({ message: "Failed to update payment method" });
    }
  });

  app.delete("/api/payment-methods/:id", isAdminAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePaymentMethod(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting payment method:", error);
      res.status(500).json({ message: "Failed to delete payment method" });
    }
  });

  return httpServer;
}
