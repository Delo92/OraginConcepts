import { db } from './db';
import { initializeFirebaseAdmin, getFirestore, admin } from './firebase';
import { 
  services, 
  siteSettings, 
  galleryItems, 
  availability, 
  blockedDates, 
  paymentMethods,
  displayModeSettings,
  bookings
} from '@shared/schema';

export async function migrateToFirebase(): Promise<{ success: boolean; message: string; migrated: Record<string, number> }> {
  try {
    if (!initializeFirebaseAdmin()) {
      return { success: false, message: 'Firebase not configured', migrated: {} };
    }

    const firestore = getFirestore();
    const migrated: Record<string, number> = {};

    const existingCheck = await firestore.collection('services').limit(1).get();
    if (!existingCheck.empty) {
      return { success: true, message: 'Data already migrated to Firebase', migrated: {} };
    }

    const allServices = await db.select().from(services);
    for (const service of allServices) {
      await firestore.collection('services').add({
        name: service.name,
        description: service.description,
        duration: service.duration,
        price: service.price,
        imageUrl: service.imageUrl,
        displayMode: service.displayMode,
        isActive: service.isActive,
        sortOrder: service.sortOrder,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    migrated.services = allServices.length;

    const settings = await db.select().from(siteSettings);
    if (settings.length > 0) {
      await firestore.collection('site_settings').doc('main').set({
        ...settings[0],
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      migrated.siteSettings = 1;
    }

    const gallery = await db.select().from(galleryItems);
    for (const item of gallery) {
      await firestore.collection('gallery').add({
        title: item.title,
        description: item.description,
        projectUrl: item.projectUrl,
        mediaUrl: item.mediaUrl,
        mediaType: item.mediaType,
        displayMode: item.displayMode,
        isHero: item.isHero,
        createdAt: item.createdAt ? admin.firestore.Timestamp.fromDate(new Date(item.createdAt)) : admin.firestore.FieldValue.serverTimestamp()
      });
    }
    migrated.galleryItems = gallery.length;

    const avail = await db.select().from(availability);
    for (const a of avail) {
      await firestore.collection('availability').add({
        dayOfWeek: a.dayOfWeek,
        startTime: a.startTime,
        endTime: a.endTime,
        isAvailable: a.isAvailable
      });
    }
    migrated.availability = avail.length;

    const blocked = await db.select().from(blockedDates);
    for (const b of blocked) {
      await firestore.collection('blocked_dates').add({
        date: b.date,
        reason: b.reason,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    migrated.blockedDates = blocked.length;

    const payments = await db.select().from(paymentMethods);
    for (const p of payments) {
      await firestore.collection('payment_methods').add({
        providerType: p.providerType,
        displayName: p.displayName,
        paymentLink: p.paymentLink,
        encryptedCredentials: p.encryptedCredentials,
        isActive: p.isActive,
        sortOrder: p.sortOrder,
        createdAt: p.createdAt ? admin.firestore.Timestamp.fromDate(new Date(p.createdAt)) : admin.firestore.FieldValue.serverTimestamp()
      });
    }
    migrated.paymentMethods = payments.length;

    const displaySettings = await db.select().from(displayModeSettings);
    for (const ds of displaySettings) {
      await firestore.collection('display_mode_settings').doc(ds.mode).set({
        mode: ds.mode,
        heroGalleryItemId: ds.heroGalleryItemId,
        tagline: ds.tagline,
        headingFont: ds.headingFont,
        bodyFont: ds.bodyFont,
        backgroundColor: ds.backgroundColor,
        surfaceColor: ds.surfaceColor,
        accentColor: ds.accentColor,
        textColor: ds.textColor,
        secondaryTextColor: ds.secondaryTextColor,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    migrated.displayModeSettings = displaySettings.length;

    const allBookings = await db.select().from(bookings);
    for (const booking of allBookings) {
      await firestore.collection('bookings').add({
        serviceId: booking.serviceId,
        clientName: booking.clientName,
        clientEmail: booking.clientEmail,
        clientPhone: booking.clientPhone,
        date: booking.bookingDate,
        time: booking.bookingTime,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        notes: booking.notes,
        createdAt: booking.createdAt ? admin.firestore.Timestamp.fromDate(new Date(booking.createdAt)) : admin.firestore.FieldValue.serverTimestamp()
      });
    }
    migrated.bookings = allBookings.length;

    return { success: true, message: 'Migration completed successfully', migrated };
  } catch (error: any) {
    console.error('Migration error:', error);
    return { success: false, message: error.message || 'Migration failed', migrated: {} };
  }
}
