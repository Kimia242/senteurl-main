# Senteur L - PRD (Product Requirements Document)

## Original Problem Statement
Create a premium multibrand perfume e-commerce platform for Senteur L in Dakar to sell fragrances online, increase brand visibility, and enable secure online payments. Target users: Urban women 20–45 years old, elegant men 25–50 years old, premium customers sensitive to image, and buyers searching for gifts for weddings and special events in Dakar.

## User Personas
1. **Urban Professional Woman (25-40)**: Looking for signature fragrances, values brand authenticity and premium packaging
2. **Elegant Businessman (30-50)**: Seeking sophisticated scents for professional and social occasions
3. **Gift Buyer**: Shopping for weddings, anniversaries, and special events in Dakar
4. **Premium Customer**: Image-conscious, expects luxury shopping experience

## Core Requirements (Static)
- Product catalog with filtering by gender, brand, price, and promotions
- Real-time search functionality
- Product detail pages with images, descriptions, and stock status
- Persistent shopping cart
- Secure Stripe checkout integration
- Admin dashboard for product/brand/category/order management
- Stock management system
- Responsive design (mobile-first)
- Premium minimalist luxury design
- **Prices in XOF (Franc CFA)**
- **Contact: +221 77 482 36 61**

## Architecture
- **Frontend**: React 18 with React Router, Tailwind CSS, Shadcn/UI components
- **Backend**: FastAPI (Python) with async MongoDB driver
- **Database**: MongoDB (products, brands, categories, orders, carts, payment_transactions)
- **Payment**: Stripe Checkout integration via emergentintegrations library
- **Hosting**: Kubernetes container environment

## What's Been Implemented (Feb 2026)

### Phase 1 - Core E-commerce MVP ✅
- [x] Homepage with hero section, featured products, new arrivals, promotions
- [x] Shop page with advanced filtering (gender, brand, category, price range up to 200,000 FCFA)
- [x] Product detail pages with image gallery, specs, add-to-cart
- [x] Persistent shopping cart with drawer
- [x] Checkout flow with customer info form
- [x] Stripe payment integration (test mode)
- [x] Order confirmation page with payment status polling
- [x] Brands listing and detail pages
- [x] Complete Admin dashboard:
  - Dashboard with revenue in FCFA, orders, products stats
  - Products CRUD with all fields
  - Brands CRUD
  - Categories CRUD
  - Orders management with status updates
- [x] Responsive navigation with mobile menu
- [x] Search functionality with real-time results

### Phase 2 - Content & Localization ✅
- [x] Prices converted to XOF (FCFA) - Range: 72,000 - 175,000 FCFA
- [x] Phone number updated: +221 77 482 36 61
- [x] WhatsApp integration on Contact page and Footer
- [x] About page with rich content (Mission, Values, Stats, Why Choose Us)
- [x] Contact page with FAQ section
- [x] Footer with complete contact info and social links
- [x] Database seeded with 17 premium perfumes (enriched descriptions)

### Design Implementation ✅
- Dark luxury theme (Night Blue background)
- Vibrant Rose (#E11D48) as primary accent
- Playfair Display (headings) + Manrope (body) typography
- Sharp edges (rounded-none) for luxury aesthetic
- Glassmorphism effects on header
- Smooth animations and hover effects

### Products Catalog
- **6 Brands**: Chanel, Dior, Guerlain, Tom Ford, Yves Saint Laurent, Armani
- **5 Categories**: Eau de Parfum, Eau de Toilette, Parfum, Cologne, Body Mist
- **17 Products** with prices from 72,000 to 175,000 FCFA

## Prioritized Backlog

### P0 - Critical (Required for Production)
- [ ] User authentication (JWT-based)
- [ ] User order history
- [ ] Email confirmation after order (SendGrid/Resend)
- [ ] HTTPS enforcement in production

### P1 - High Priority
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Stock alerts (low stock notifications)
- [ ] Order tracking for customers
- [ ] SEO optimization (meta tags, sitemap)

### P2 - Medium Priority
- [ ] Multi-image upload for products (admin)
- [ ] Coupon/discount codes system
- [ ] Newsletter subscription
- [ ] Analytics dashboard
- [ ] Product recommendations

### P3 - Nice to Have
- [ ] Social media sharing
- [ ] Multiple language support (French/English)
- [ ] Gift wrapping option
- [ ] Loyalty points program

## Contact Information
- **Phone**: +221 77 482 36 61
- **WhatsApp**: wa.me/221774823661
- **Email**: contact@senteurl.sn
- **Location**: Centre Commercial Sea Plaza, Route de la Corniche Ouest, Dakar, Sénégal

## Next Tasks
1. Implement JWT authentication with user registration/login
2. Add user profile page with order history
3. Configure production environment variables
4. Set up email confirmation with SendGrid or Resend
5. Add SEO meta tags and sitemap generation
