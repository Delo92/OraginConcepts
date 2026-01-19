import { getFirestore, admin } from './firebase';

type Timestamp = admin.firestore.Timestamp;

function toDate(timestamp: Timestamp | Date | string | undefined): Date | undefined {
  if (!timestamp) return undefined;
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp === 'string') return new Date(timestamp);
  return timestamp.toDate();
}

export interface CartItem {
  id: string;
  serviceId: number;
  serviceName: string;
  price: number;
  quantity: number;
  scheduledDate?: string;
  scheduledTime?: string;
  addedAt: string;
}

export interface UserCart {
  visitorId: string;
  items: CartItem[];
  updatedAt: string;
}

export const firestoreStorage = {
  async getServices(): Promise<any[]> {
    const firestore = getFirestore();
    const snapshot = await firestore.collection('services')
      .orderBy('sortOrder', 'asc')
      .get();
    
    return snapshot.docs.map((doc, index) => ({
      id: index + 1,
      firestoreId: doc.id,
      ...doc.data()
    }));
  },

  async getAllServices(): Promise<any[]> {
    const firestore = getFirestore();
    const snapshot = await firestore.collection('services')
      .orderBy('sortOrder', 'asc')
      .get();
    
    return snapshot.docs.map((doc, index) => ({
      id: index + 1,
      firestoreId: doc.id,
      ...doc.data()
    }));
  },

  async getActiveServices(): Promise<any[]> {
    const firestore = getFirestore();
    const snapshot = await firestore.collection('services')
      .where('isActive', '==', true)
      .orderBy('sortOrder', 'asc')
      .get();
    
    return snapshot.docs.map((doc, index) => ({
      id: index + 1,
      firestoreId: doc.id,
      ...doc.data()
    }));
  },

  async getServiceById(id: number): Promise<any | null> {
    const services = await this.getServices();
    return services.find(s => s.id === id) || null;
  },

  async getServiceByFirestoreId(firestoreId: string): Promise<any | null> {
    const firestore = getFirestore();
    const doc = await firestore.collection('services').doc(firestoreId).get();
    return doc.exists ? { id: 1, firestoreId: doc.id, ...doc.data() } : null;
  },

  async createService(data: any): Promise<any> {
    const firestore = getFirestore();
    const docRef = await firestore.collection('services').add({
      ...data,
      isActive: data.isActive ?? true,
      sortOrder: data.sortOrder ?? 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return {
      id: 1,
      firestoreId: docRef.id,
      ...data,
      isActive: data.isActive ?? true,
      sortOrder: data.sortOrder ?? 0
    };
  },

  async updateService(firestoreId: string, data: any): Promise<any | null> {
    const firestore = getFirestore();
    await firestore.collection('services').doc(firestoreId).update({
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    const doc = await firestore.collection('services').doc(firestoreId).get();
    return doc.exists ? { id: 1, firestoreId: doc.id, ...doc.data() } : null;
  },

  async deleteService(firestoreId: string): Promise<boolean> {
    const firestore = getFirestore();
    await firestore.collection('services').doc(firestoreId).delete();
    return true;
  },

  async getBookings(): Promise<any[]> {
    const firestore = getFirestore();
    const snapshot = await firestore.collection('bookings')
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map((doc, index) => {
      const data = doc.data();
      return {
        id: index + 1,
        firestoreId: doc.id,
        ...data,
        date: toDate(data.date)?.toISOString().split('T')[0],
        createdAt: toDate(data.createdAt)
      };
    });
  },

  async createBooking(data: any): Promise<any> {
    const firestore = getFirestore();
    const docRef = await firestore.collection('bookings').add({
      ...data,
      status: data.status || 'pending',
      paymentStatus: data.paymentStatus || 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return {
      id: 1,
      firestoreId: docRef.id,
      ...data,
      status: data.status || 'pending',
      paymentStatus: data.paymentStatus || 'pending',
      createdAt: new Date()
    };
  },

  async updateBookingStatus(firestoreId: string, status: string): Promise<any | null> {
    const firestore = getFirestore();
    await firestore.collection('bookings').doc(firestoreId).update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    const doc = await firestore.collection('bookings').doc(firestoreId).get();
    return doc.exists ? { id: 1, firestoreId: doc.id, ...doc.data() } : null;
  },

  async deleteBooking(firestoreId: string): Promise<boolean> {
    const firestore = getFirestore();
    await firestore.collection('bookings').doc(firestoreId).delete();
    return true;
  },

  async getSiteSettings(): Promise<any | null> {
    const firestore = getFirestore();
    const doc = await firestore.collection('site_settings').doc('main').get();
    
    if (!doc.exists) return null;
    return { id: 1, ...doc.data() };
  },

  async saveSiteSettings(data: any): Promise<any> {
    const firestore = getFirestore();
    await firestore.collection('site_settings').doc('main').set({
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    return { id: 1, ...data };
  },

  async getGalleryItems(): Promise<any[]> {
    const firestore = getFirestore();
    const snapshot = await firestore.collection('gallery')
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map((doc, index) => {
      const data = doc.data();
      return {
        id: index + 1,
        firestoreId: doc.id,
        ...data,
        createdAt: toDate(data.createdAt)
      };
    });
  },

  async getHeroGalleryItem(): Promise<any | null> {
    const firestore = getFirestore();
    const snapshot = await firestore.collection('gallery')
      .where('isHero', '==', true)
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    const data = doc.data();
    return {
      id: 1,
      firestoreId: doc.id,
      ...data,
      createdAt: toDate(data.createdAt)
    };
  },

  async createGalleryItem(data: any): Promise<any> {
    const firestore = getFirestore();
    const docRef = await firestore.collection('gallery').add({
      ...data,
      isHero: data.isHero ?? false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return {
      id: 1,
      firestoreId: docRef.id,
      ...data,
      isHero: data.isHero ?? false,
      createdAt: new Date()
    };
  },

  async updateGalleryItem(firestoreId: string, data: any): Promise<any | null> {
    const firestore = getFirestore();
    await firestore.collection('gallery').doc(firestoreId).update({
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    const doc = await firestore.collection('gallery').doc(firestoreId).get();
    return doc.exists ? { id: 1, firestoreId: doc.id, ...doc.data() } : null;
  },

  async deleteGalleryItem(firestoreId: string): Promise<boolean> {
    const firestore = getFirestore();
    await firestore.collection('gallery').doc(firestoreId).delete();
    return true;
  },

  async setHeroGalleryItem(firestoreId: string): Promise<boolean> {
    const firestore = getFirestore();
    const batch = firestore.batch();
    
    const currentHeroSnapshot = await firestore.collection('gallery')
      .where('isHero', '==', true)
      .get();
    
    currentHeroSnapshot.docs.forEach(doc => {
      batch.update(doc.ref, { isHero: false });
    });
    
    batch.update(firestore.collection('gallery').doc(firestoreId), { isHero: true });
    
    await batch.commit();
    return true;
  },

  async getAvailability(): Promise<any[]> {
    const firestore = getFirestore();
    const snapshot = await firestore.collection('availability')
      .orderBy('dayOfWeek', 'asc')
      .get();
    
    return snapshot.docs.map((doc, index) => ({
      id: index + 1,
      firestoreId: doc.id,
      ...doc.data()
    }));
  },

  async saveAvailability(data: any): Promise<any> {
    const firestore = getFirestore();
    const existingSnapshot = await firestore.collection('availability')
      .where('dayOfWeek', '==', data.dayOfWeek)
      .get();
    
    if (!existingSnapshot.empty) {
      const doc = existingSnapshot.docs[0];
      await doc.ref.update(data);
      return { id: 1, firestoreId: doc.id, ...data };
    }
    
    const docRef = await firestore.collection('availability').add(data);
    return { id: 1, firestoreId: docRef.id, ...data };
  },

  async getBlockedDates(): Promise<any[]> {
    const firestore = getFirestore();
    const snapshot = await firestore.collection('blocked_dates').get();
    
    return snapshot.docs.map((doc, index) => {
      const data = doc.data();
      return {
        id: index + 1,
        firestoreId: doc.id,
        ...data,
        date: toDate(data.date)?.toISOString().split('T')[0]
      };
    });
  },

  async addBlockedDate(data: any): Promise<any> {
    const firestore = getFirestore();
    const docRef = await firestore.collection('blocked_dates').add({
      ...data,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { id: 1, firestoreId: docRef.id, ...data };
  },

  async removeBlockedDate(firestoreId: string): Promise<boolean> {
    const firestore = getFirestore();
    await firestore.collection('blocked_dates').doc(firestoreId).delete();
    return true;
  },

  async getPaymentMethods(): Promise<any[]> {
    const firestore = getFirestore();
    const snapshot = await firestore.collection('payment_methods')
      .orderBy('sortOrder', 'asc')
      .get();
    
    return snapshot.docs.map((doc, index) => ({
      id: index + 1,
      firestoreId: doc.id,
      ...doc.data()
    }));
  },

  async getActivePaymentMethods(): Promise<any[]> {
    const firestore = getFirestore();
    const snapshot = await firestore.collection('payment_methods')
      .where('isActive', '==', true)
      .orderBy('sortOrder', 'asc')
      .get();
    
    return snapshot.docs.map((doc, index) => ({
      id: index + 1,
      firestoreId: doc.id,
      ...doc.data()
    }));
  },

  async createPaymentMethod(data: any): Promise<any> {
    const firestore = getFirestore();
    const docRef = await firestore.collection('payment_methods').add({
      ...data,
      isActive: data.isActive ?? true,
      sortOrder: data.sortOrder ?? 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return {
      id: 1,
      firestoreId: docRef.id,
      ...data,
      isActive: data.isActive ?? true,
      sortOrder: data.sortOrder ?? 0
    };
  },

  async updatePaymentMethod(firestoreId: string, data: any): Promise<any | null> {
    const firestore = getFirestore();
    await firestore.collection('payment_methods').doc(firestoreId).update({
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    const doc = await firestore.collection('payment_methods').doc(firestoreId).get();
    return doc.exists ? { id: 1, firestoreId: doc.id, ...doc.data() } : null;
  },

  async deletePaymentMethod(firestoreId: string): Promise<boolean> {
    const firestore = getFirestore();
    await firestore.collection('payment_methods').doc(firestoreId).delete();
    return true;
  },

  async getDisplayModeSettings(): Promise<any[]> {
    const firestore = getFirestore();
    const snapshot = await firestore.collection('display_mode_settings').get();
    
    return snapshot.docs.map((doc, index) => ({
      id: index + 1,
      firestoreId: doc.id,
      ...doc.data()
    }));
  },

  async saveDisplayModeSettings(mode: string, data: any): Promise<any> {
    const firestore = getFirestore();
    await firestore.collection('display_mode_settings').doc(mode).set({
      mode,
      ...data,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    return { id: 1, mode, ...data };
  },

  async getCart(visitorId: string): Promise<UserCart> {
    const firestore = getFirestore();
    const doc = await firestore.collection('carts').doc(visitorId).get();
    
    if (!doc.exists) {
      return { visitorId, items: [], updatedAt: new Date().toISOString() };
    }
    
    const data = doc.data()!;
    return {
      visitorId,
      items: data.items || [],
      updatedAt: toDate(data.updatedAt)?.toISOString() || new Date().toISOString()
    };
  },

  async addToCart(visitorId: string, item: Omit<CartItem, 'id' | 'addedAt'>): Promise<UserCart> {
    const firestore = getFirestore();
    const cartRef = firestore.collection('carts').doc(visitorId);
    const cart = await this.getCart(visitorId);
    
    const existingIndex = cart.items.findIndex(i => 
      i.serviceId === item.serviceId && 
      i.scheduledDate === item.scheduledDate && 
      i.scheduledTime === item.scheduledTime
    );
    
    if (existingIndex >= 0) {
      cart.items[existingIndex].quantity += item.quantity;
    } else {
      cart.items.push({
        ...item,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        addedAt: new Date().toISOString()
      });
    }
    
    await cartRef.set({
      visitorId,
      items: cart.items,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    return { ...cart, updatedAt: new Date().toISOString() };
  },

  async updateCartItem(visitorId: string, itemId: string, quantity: number): Promise<UserCart> {
    const firestore = getFirestore();
    const cart = await this.getCart(visitorId);
    
    const itemIndex = cart.items.findIndex(i => i.id === itemId);
    if (itemIndex >= 0) {
      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }
    }
    
    await firestore.collection('carts').doc(visitorId).set({
      visitorId,
      items: cart.items,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    
    return { ...cart, updatedAt: new Date().toISOString() };
  },

  async removeFromCart(visitorId: string, itemId: string): Promise<UserCart> {
    return this.updateCartItem(visitorId, itemId, 0);
  },

  async clearCart(visitorId: string): Promise<boolean> {
    const firestore = getFirestore();
    await firestore.collection('carts').doc(visitorId).delete();
    return true;
  },

  async createOrder(data: {
    visitorId: string;
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
    items: CartItem[];
    total: number;
    paymentMethod: string;
    notes?: string;
  }): Promise<{ orderId: string; bookings: any[] }> {
    const firestore = getFirestore();
    
    const orderRef = await firestore.collection('orders').add({
      ...data,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    const bookings: any[] = [];
    for (const item of data.items) {
      const booking = await this.createBooking({
        serviceId: item.serviceId,
        serviceName: item.serviceName,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        date: item.scheduledDate || new Date().toISOString().split('T')[0],
        time: item.scheduledTime || '09:00',
        notes: data.notes,
        status: 'pending',
        orderId: orderRef.id,
        price: item.price,
        quantity: item.quantity
      });
      bookings.push(booking);
    }
    
    await this.clearCart(data.visitorId);
    
    return { orderId: orderRef.id, bookings };
  },

  async getOrders(): Promise<any[]> {
    const firestore = getFirestore();
    const snapshot = await firestore.collection('orders')
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map((doc, index) => {
      const data = doc.data();
      return {
        id: index + 1,
        firestoreId: doc.id,
        ...data,
        createdAt: toDate(data.createdAt)
      };
    });
  },

  async updateOrderStatus(firestoreId: string, status: string): Promise<any | null> {
    const firestore = getFirestore();
    await firestore.collection('orders').doc(firestoreId).update({
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    const doc = await firestore.collection('orders').doc(firestoreId).get();
    return doc.exists ? { id: 1, firestoreId: doc.id, ...doc.data() } : null;
  }
};
