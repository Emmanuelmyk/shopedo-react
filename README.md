# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


# EDOFINDS.NG - React + Vite E-Commerce Platform

A modern, responsive e-commerce platform built with React and Vite, featuring infinite scroll, image lazy loading, wishlist functionality, and real-time search.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Development](#development)
- [Building for Production](#building-for-production)
- [Deployment](#deployment)
- [Component Documentation](#component-documentation)
- [Custom Hooks](#custom-hooks)
- [Utilities](#utilities)
- [Security](#security)
- [Contributing](#contributing)

## ✨ Features

### Core Features
- **Infinite Scroll Pagination** - Automatically loads more products as users scroll
- **Image Lazy Loading & Compression** - Optimizes image loading for better performance
- **Live Search** - Real-time product filtering with debounce (300ms)
- **Wishlist Management** - Save products with localStorage persistence
- **Category Filtering** - Filter products by category with breadcrumb navigation
- **Responsive Design** - Mobile-first approach with Bootstrap grid system
- **Share Functionality** - Native share API with clipboard fallback
- **Product Detail Pages** - Comprehensive product information with related products
- **Ads Carousel** - Auto-rotating advertisement carousel
- **Safety Tips** - Buyer safety guidelines on product pages

### Technical Features
- **React Router** - Client-side routing
- **Custom Hooks** - Reusable logic for infinite scroll, image observation, and wishlist
- **Supabase Integration** - Backend-as-a-Service for data management
- **Environment Variables** - Secure credential management
- **Skeleton Loading** - Smooth loading states
- **Toast Notifications** - User feedback for actions

## 🛠 Tech Stack

- **Frontend Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.8
- **Routing**: React Router DOM 6.20.1
- **Backend**: Supabase 2.39.0
- **Styling**: Bootstrap 5.3.3 + Custom CSS
- **Icons**: Bootstrap Icons 1.11.3

## 📁 Project Structure

```
edofinds-react/
├── public/
│   └── assets/
│       ├── logo.png
│       ├── emptypics.png
│       └── profilepics.png
├── src/
│   ├── components/
│   │   ├── AdsCarousel/
│   │   │   ├── AdsCarousel.jsx
│   │   │   └── AdsCarousel.css
│   │   ├── Breadcrumb/
│   │   │   ├── Breadcrumb.jsx
│   │   │   └── Breadcrumb.css
│   │   ├── Button/
│   │   │   ├── Button.jsx
│   │   │   └── Button.css
│   │   ├── CategoryMenu/
│   │   │   ├── CategoryMenu.jsx
│   │   │   └── CategoryMenu.css
│   │   ├── EmptyState/
│   │   │   ├── EmptyState.jsx
│   │   │   └── EmptyState.css
│   │   ├── Footer/
│   │   │   ├── Footer.jsx
│   │   │   └── Footer.css
│   │   ├── Navbar/
│   │   │   ├── Navbar.jsx
│   │   │   └── Navbar.css
│   │   ├── ProductCard/
│   │   │   ├── ProductCard.jsx
│   │   │   └── ProductCard.css
│   │   ├── SearchBar/
│   │   │   ├── SearchBar.jsx
│   │   │   └── SearchBar.css
│   │   ├── Sidebar/
│   │   │   ├── Sidebar.jsx
│   │   │   └── Sidebar.css
│   │   ├── Skeleton/
│   │   │   ├── ProductSkeleton.jsx
│   │   │   ├── DetailSkeleton.jsx
│   │   │   └── Skeleton.css
│   │   ├── Toast/
│   │   │   ├── Toast.jsx
│   │   │   └── Toast.css
│   │   └── Wishlist/
│   │       ├── WishlistOffcanvas.jsx
│   │       ├── WishlistItem.jsx
│   │       └── Wishlist.css
│   ├── hooks/
│   │   ├── useImageObserver.js
│   │   ├── useInfiniteScroll.js
│   │   └── useWishlist.js
│   ├── pages/
│   │   ├── Home/
│   │   │   ├── Home.jsx
│   │   │   └── Home.css
│   │   └── ProductDetail/
│   │       ├── ProductDetail.jsx
│   │       └── ProductDetail.css
│   ├── utils/
│   │   ├── categories.js
│   │   ├── formatUtils.js
│   │   ├── imageUtils.js
│   │   ├── supabaseClient.js
│   │   └── wishlistUtils.js
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── .env
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Steps

1. **Clone or create the project**
```bash
npm create vite@latest edofinds-react -- --template react
cd edofinds-react
```

2. **Install dependencies**
```bash
npm install
npm install @supabase/supabase-js
npm install react-router-dom
npm install bootstrap bootstrap-icons
```

3. **Create environment file**
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_key
```

4. **Add assets**
Place your logo and default images in `public/assets/`:
- `logo.png` - Site logo
- `emptypics.png` - Default product image
- `profilepics.png` - Default seller profile image

## ⚙️ Configuration

### Environment Variables

All environment variables must be prefixed with `VITE_` to be accessible in the application:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_KEY=your-anon-key
```

### Supabase Database Schema

The application expects the following tables:

#### Products Table
```sql
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category_id INTEGER NOT NULL,
  img_path TEXT,
  condition TEXT,
  location TEXT,
  seller_name TEXT,
  seller_profile_path TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Categories Table
```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);
```

#### Ads Table
```sql
CREATE TABLE ads (
  id SERIAL PRIMARY KEY,
  image_path TEXT NOT NULL,
  link TEXT
);
```

### Storage Buckets

Create the following storage buckets in Supabase:
- `products` - For product images
- `ads` - For advertisement images
- `profiles` - For seller profile images

## 💻 Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Hot Module Replacement (HMR)

Vite provides fast HMR, so changes to your code will be reflected immediately without a full page reload.

## 🏗 Building for Production

Build the application:

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

Preview the production build locally:

```bash
npm run preview
```

## 🚢 Deployment

### Vercel

1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Configure environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_KEY`
4. Deploy

### Netlify

1. Push your code to GitHub
2. Connect repository in Netlify
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variables in Netlify dashboard
5. Deploy

## 📚 Component Documentation

### Core Components

#### Navbar
Navigation bar with logo, wishlist counter, and mobile menu toggle.

**Props:**
- `wishlistCount` (number) - Number of items in wishlist
- `onWishlistClick` (function) - Handler for wishlist button
- `onMenuToggle` (function) - Handler for mobile menu
- `menuActive` (boolean) - Mobile menu state

#### ProductCard
Displays individual product with image, price, and save button.

**Props:**
- `product` (object) - Product data
- `onSaveToggle` (function) - Handler for save/unsave
- `isInWishlist` (boolean) - Wishlist state
- `imageObserver` (object) - Image observer instance

#### SearchBar
Search input with live filtering and debounce.

**Props:**
- `onSearch` (function) - Search handler
- `initialValue` (string) - Initial search value

#### WishlistOffcanvas
Sliding panel showing saved products.

**Props:**
- `show` (boolean) - Visibility state
- `onHide` (function) - Close handler
- `wishlistItems` (array) - Saved products
- `onRemove` (function) - Remove handler
- `onShare` (function) - Share handler
- `onStartShopping` (function) - Navigation handler

#### Sidebar
Desktop category navigation with ads.

**Props:**
- `activeCategory` (string) - Current category ID
- `onCategorySelect` (function) - Category change handler
- `ads` (array) - Advertisement data

### Utility Components

#### Button
Reusable button with variants.

**Props:**
- `variant` (string) - 'primary' | 'secondary' | 'outline'
- `onClick` (function) - Click handler
- `disabled` (boolean) - Disabled state
- `children` (node) - Button content

#### EmptyState
Displays when no content is available.

**Props:**
- `icon` (string) - Bootstrap icon class
- `title` (string) - Main message
- `message` (string) - Supporting text
- `actionLabel` (string) - Optional button text
- `onAction` (function) - Optional button handler

#### Toast
Notification component.

**Props:**
- `show` (boolean) - Visibility state
- `message` (string) - Notification text
- `onClose` (function) - Close handler
- `duration` (number) - Auto-close duration (ms)

## 🎣 Custom Hooks

### useWishlist
Manages wishlist state and operations.

**Returns:**
```javascript
{
  wishlistItems: Array,      // Current wishlist items
  wishlistCount: Number,     // Number of items
  toggleWishlist: Function,  // Add/remove product
  removeFromWishlist: Function, // Remove by ID
  isInWishlist: Function,    // Check if product saved
  refreshWishlist: Function  // Reload from localStorage
}
```

### useInfiniteScroll
Implements infinite scroll pagination.

**Parameters:**
- `loadMoreCallback` (function) - Function to load more data
- `options` (object) - Configuration options
  - `threshold` (number) - Intersection threshold
  - `rootMargin` (string) - Root margin
  - `enabled` (boolean) - Enable/disable observer

**Returns:**
```javascript
{
  sentinelRef: RefObject,    // Ref for sentinel element
  loading: Boolean,          // Loading state
  exhausted: Boolean,        // No more data
  reset: Function,           // Reset state
  setExhausted: Function     // Set exhausted manually
}
```

### useImageObserver
Lazy loads and compresses images.

**Parameters:**
- `enabled` (boolean) - Enable/disable observer

**Returns:**
```javascript
{
  observe: Function,         // Observe an image element
  unobserve: Function        // Stop observing element
}
```

## 🛠 Utilities

### formatUtils.js
- `escapeHtml(str)` - Sanitize HTML content
- `formatNumber(n)` - Format numbers with locale
- `formatDate(dateString)` - Format dates

### imageUtils.js
- `getPublicUrlFromPath(imgPath)` - Get product image URL
- `getAdPublicUrl(imgPath)` - Get ad image URL
- `getSellerProfileUrl(imgPath)` - Get profile image URL
- `loadAndCompressImage(src, options)` - Compress images

### wishlistUtils.js
- `getWishlistItems()` - Get all wishlist items
- `addToWishlist(product)` - Add product to wishlist
- `removeFromWishlist(productId)` - Remove from wishlist
- `isInWishlist(productId)` - Check if product saved
- `getWishlistCount()` - Get wishlist count
- `shareProduct(id, name, price)` - Share product

### categories.js
- `CATEGORIES` - Array of category definitions
- `getCategoryName(categoryId)` - Get category name
- `getCategoryIcon(categoryId)` - Get category icon

## 🔒 Security

### Environment Variables
- Never commit `.env` file to version control
- Use different keys for development and production
- All env variables must be prefixed with `VITE_`

### XSS Protection
All user inputs are sanitized using the `escapeHtml` utility function before rendering.

### API Security
- Supabase Row Level Security (RLS) should be configured
- Use service role key only for admin operations
- Public anon key is safe to expose for read operations

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Credits

Developed by **@innovativewebdevs**

## 🐛 Known Issues

- None at the moment

## 🗺 Roadmap

- [ ] Add user authentication
- [ ] Implement product reviews
- [ ] Add advanced filtering options
- [ ] Create admin dashboard
- [ ] Add payment integration
- [ ] Implement chat functionality
- [ ] Add email notifications

## 📞 Support

For support, email support@edofinds.ng or open an issue in the repository.

---

**Built with ❤️ using React + Vite**#   s h o p e d o - r e a c t  
 