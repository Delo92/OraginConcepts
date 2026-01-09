# Client Deployment Guide - Oraginal Concepts Portfolio

Welcome to your new creative portfolio website! This guide will help you get set up and running independently.

---

## Quick Setup Checklist

1. [ ] Set up your ENCRYPTION_KEY (required for payment methods)
2. [ ] Change your admin password
3. [ ] Add your business information in Settings
4. [ ] Add your payment methods
5. [ ] Upload portfolio items to the Gallery
6. [ ] Set up your services and pricing

---

## Step 1: Set Up Your Encryption Key

Your payment credentials are securely encrypted. You need to create a unique encryption key for your site.

**How to create your key:**
1. Click the "Secrets" tab in your Replit project (lock icon in the left sidebar)
2. Click "New Secret"
3. Name: `ENCRYPTION_KEY`
4. Value: Generate a secure key by running this in the Shell:
   ```
   openssl rand -hex 32
   ```
5. Copy the output and paste it as the secret value
6. Click "Add Secret"

**Important:** Never share this key. Each deployment should have its own unique key.

---

## Step 2: Access the Admin Panel

1. Go to your site URL and add `/admin` to the end
   - Example: `https://yoursite.repl.co/admin`
2. Enter the admin password (your developer will provide this)
3. You now have full access to manage your site

---

## Step 3: Configure Your Business

Navigate to **Admin > Settings** to update:

- **Business Information**: Your business name, tagline, and about text
- **Contact Information**: Email, phone, address, hours of operation
- **Footer**: Custom footer tagline

---

## Step 4: Add Payment Methods

In **Admin > Settings**, scroll to the **Payment Methods** section:

1. Click "Add Payment Method"
2. Select your payment provider from the dropdown:
   - **Cash App** - Enter your Cash App link (https://cash.app/$yourusername)
   - **Venmo** - Enter your Venmo link
   - **Chime** - Enter your Chime payment link
   - **Apple Pay** - Enter your Apple Pay link
   - **PayPal** (API) - Enter your Client ID and Secret
   - **Stripe** (API) - Enter your Publishable Key and Secret Key
   - **Authorize.net** (API) - Enter your API Login ID and Transaction Key
   - **Shopify** (API) - Enter your Shop Domain and Storefront Access Token

**Link-based vs API-based:**
- Link-based (Cash App, Venmo, etc.): Just paste your payment link - clients will be redirected
- API-based (Stripe, PayPal, etc.): Enter your API credentials - they're encrypted and stored securely

You can add multiple payment methods. Remove any by clicking the trash icon.

---

## Step 5: Manage Your Portfolio (Gallery)

Navigate to **Admin > Gallery** to:

1. Upload images and videos of your work
2. Add titles, descriptions, and project URLs
3. Choose display mode (Yin/Yang) for each item
4. Set a featured hero item for your homepage

Supported formats: Images (JPG, PNG, WebP) and Videos (MP4, WebM)

---

## Step 6: Set Up Your Services

Navigate to **Admin > Services** to:

1. Add new services with name, description, duration, and price
2. Edit existing services
3. Reorder services by drag-and-drop
4. Activate/deactivate services

---

## Step 7: Customize Appearance (Yin/Yang Theming)

Navigate to **Admin > Appearance** to customize each display mode:

- **Yin Mode (Light)**: Professional, clean aesthetic
- **Yang Mode (Dark)**: Bold, edgy aesthetic

For each mode, you can customize:
- Hero image selection from your gallery
- Heading and body fonts (60+ options)
- Color scheme (background, surface, accent, text colors)
- Mode-specific tagline

---

## Managing Bookings

Navigate to **Admin > Bookings** to:

- View all client booking requests
- Update booking status (pending, confirmed, completed, cancelled)
- Update payment status (unpaid, paid, refunded)
- Contact clients directly

---

## Managing Availability

Navigate to **Admin > Availability** to:

- Set your weekly schedule (days and hours you're available)
- Block specific dates when you're unavailable
- Time slots will automatically appear in the booking flow

---

## Need Help?

If you have questions about:
- **Technical issues**: Contact your developer
- **Payment processing**: Contact your payment provider directly
- **Content updates**: All done through Admin panel - no coding needed!

---

## Environment Secrets Reference

| Secret | Purpose | Required |
|--------|---------|----------|
| ENCRYPTION_KEY | Encrypts payment API credentials | Yes (for API-based payments) |
| ADMIN_PASSWORD | Admin panel access | Yes |
| DATABASE_URL | Database connection | Auto-configured |
| SESSION_SECRET | Session security | Auto-configured |

---

*Your creative portfolio is ready to showcase your work and accept bookings!*
