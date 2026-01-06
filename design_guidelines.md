# Design Guidelines for Neitzke Way Booking Website

## Design Approach
**Reference-Based Approach** drawing inspiration from premium wellness platforms (Mindbody, Vagaro) and boutique spa websites. The design should evoke calm professionalism while maintaining functional clarity for the booking process.

## Core Design Principles
1. **Tranquil Professionalism**: Clean, uncluttered layouts that feel spa-like
2. **Clear Wayfinding**: Distinct visual separation between client experience and admin dashboard
3. **Trust-Building**: Professional presentation builds confidence in service quality
4. **Effortless Booking**: Streamlined flow from browsing to booking confirmation

---

## Typography System

**Primary Font**: Google Fonts - Cormorant Garamond (serif, elegant)
- Hero Headlines: text-5xl to text-6xl, font-light
- Section Headers: text-3xl to text-4xl, font-normal
- Service Titles: text-2xl, font-medium

**Secondary Font**: Inter (sans-serif, clean readability)
- Body Text: text-base to text-lg, font-normal, leading-relaxed
- UI Elements: text-sm to text-base, font-medium
- Form Labels: text-sm, font-medium, uppercase tracking-wide

---

## Layout System

**Spacing Units**: Tailwind units of 4, 6, 8, 12, 16, 20, 24 for consistent rhythm
- Section padding: py-16 to py-24 (desktop), py-12 to py-16 (mobile)
- Component spacing: gap-8 to gap-12 for grids
- Element margins: mb-6, mb-8, mb-12 for vertical flow

**Container Strategy**:
- Full-width hero with inner max-w-7xl
- Content sections: max-w-6xl
- Forms and booking flow: max-w-2xl (centered, focused)

---

## Page Layouts

### Client-Facing Pages

**Homepage**:
- Hero Section (70vh): Large background image of serene spa environment, centered headline "Welcome to The Neitzke Way" with subtitle about massage philosophy, primary CTA button with backdrop-blur-md background
- Services Preview Grid: 2-column (md) to 3-column (lg) card layout showcasing signature services with images, titles, brief descriptions, and "Learn More" links
- About Section: Single column max-w-prose with therapist bio and credentials
- Booking CTA Section: Centered with availability calendar preview and prominent "Book Your Session" button
- Footer: Contact info, business hours, social links, newsletter signup

**Services Page**:
- Page Header: Full-width with background texture, centered title
- Service Cards: Staggered 2-column layout (not uniform grid)
  - Each card: Service image (aspect-ratio-4/3), title, detailed description (150-200 words), duration, pricing, "Book This Service" button
- Testimonials Section: 3-column grid with client quotes, names (optional photos)

**Booking Flow**:
- Step 1 - Service Selection: Radio cards with service images thumbnail, title, price
- Step 2 - Date/Time Selection: Large calendar component (left 60%), available time slots list (right 40%)
- Step 3 - Contact Info: Simple form with name, email, phone (max-w-md)
- Step 4 - Payment Redirect: Confirmation summary with "Proceed to Payment" button that opens payment link in new tab
- Step 5 - Confirmation: Success message with booking details

### Admin Dashboard

**Layout**: Sidebar navigation (fixed, w-64) + main content area
- Sidebar: Dark treatment, vertical nav with icons + labels
- Main Area: Light, spacious with breadcrumbs and page titles

**Dashboard Screens**:
- Services Management: Table view with inline edit capabilities, image upload zones
- Availability Calendar: Week/month view with click-to-toggle availability blocks
- Bookings List: Table with filters, status badges, client details
- Payment Settings: Form inputs for CashApp link, Chime link, Apple Pay link with clear labels and helper text
- Profile/Settings: Standard form layout with save button

---

## Component Library

**Navigation**:
- Client Nav: Horizontal, centered logo, text links, "Book Now" button (sticky on scroll)
- Admin Nav: Sidebar with icon + text, collapsible on mobile to hamburger

**Buttons**:
- Primary: Rounded-full, px-8 py-3, text-base font-medium
- Secondary: Rounded-full with border, px-6 py-2
- Icon Buttons: Rounded-lg, p-2 for admin actions

**Cards**:
- Service Cards: Rounded-2xl with shadow-lg, hover:shadow-xl transition
- Booking Cards: Rounded-xl with border, p-6
- Admin Cards: Rounded-lg, clean and functional

**Forms**:
- Input Fields: Rounded-lg, px-4 py-3, border with focus ring
- Textareas: Same styling, min-h-32
- Select Dropdowns: Custom styled with chevron icon
- File Upload: Drag-and-drop zone with preview

**Calendar**:
- Large, readable date cells with hover states
- Available slots: Distinct visual treatment (border accent)
- Booked slots: Subtle disabled state
- Selected date: Bold highlight

**Modals/Overlays**:
- Backdrop: backdrop-blur-sm
- Content: Rounded-2xl, max-w-2xl, p-8 to p-12
- Close button: Absolute top-right

---

## Images

**Required Images**:
1. **Hero Image**: Peaceful massage therapy setting - soft lighting, massage table, calming environment (full-width, 70vh)
2. **Service Images**: 4-6 images showing different massage techniques and treatments (aspect-ratio-4/3 for cards)
3. **About Section**: Professional photo of the massage therapist (rounded-lg, max-w-sm)
4. **Texture/Pattern**: Subtle background texture for section dividers

**Image Treatment**: Soft shadows, rounded corners (rounded-xl to rounded-2xl), never harsh edges

---

## Responsive Behavior

**Breakpoints**:
- Mobile (base): Single column, stacked components
- Tablet (md): 2-column grids, horizontal nav remains
- Desktop (lg): 3-column grids, full layout complexity

**Mobile Optimizations**:
- Admin sidebar becomes bottom tab bar or hamburger menu
- Calendar switches to single-day view with scrollable times
- Service cards stack vertically with full-width images

---

## Animations
Use sparingly for polish:
- Smooth scroll behavior on navigation clicks
- Fade-in on scroll for service cards (subtle)
- Calendar date selection animation
- Form validation feedback

---

## Key Interaction Patterns

**Booking Flow**: Linear progression with clear "Back" and "Next" buttons, progress indicator at top
**Admin Edits**: Inline editing where possible, toast notifications for saves
**Image Uploads**: Immediate preview on selection
**Calendar**: Click to select date, time slots appear dynamically below