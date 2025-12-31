# iOS Marketplace App - Complete Guide

## Overview
A premium, high-fidelity iOS marketplace application with fintech-inspired design (Wise-style payment flow) and comprehensive e-commerce features.

## Features Implemented

### 🎨 Design System
- **iOS Human Interface Guidelines** compliant
- **Inter font** (Apple SF Pro style)
- Premium fintech aesthetic inspired by Wise
- Smooth 200-300ms animations throughout
- Spring physics for natural motion
- Soft shadows and rounded corners (14-20px radius)

### 📱 Complete User Journey

#### 1. Onboarding Flow
- **Splash Screen** - Animated logo with rotation
- **Welcome Screen** - Feature highlights with staggered animations
- **Phone Input** - Saudi phone number format (+966)
- **OTP Verification** - 6-digit code with auto-focus
- **Success Animation** - Checkmark with ripple effect

#### 2. Browsing & Discovery
- **Home Feed** - Product grid with images from Unsplash
- **Category Chips** - Horizontal scrollable categories
- **Search** - Real-time filtering with bottom sheet filters
- **Filters** - Category, price range, city, condition (new/used)
- **Categories Screen** - Full grid of all categories

#### 3. Product Experience
- **Product Details** - Image carousel, specs, seller info
- **Seller Profile** - Storefront with all seller products
- **Interactive Cards** - Tap animations and lift effects
- **Ratings & Reviews** - Star ratings and sales count

#### 4. Checkout Flow
- **Order Review** - Product summary, shipping address
- **Shipping Method** - Standard delivery with cost
- **Price Breakdown** - Clear itemization

#### 5. Payment (Wise-Style) ⭐
- **Large Total Display** - Prominent amount in USD + SAR
- **Payment Breakdown** - Product + Shipping + Service Fee
- **Payment Methods** - Card, Apple Pay, Mada (demo)
- **Button States** - Default → Loading → Success
- **Security Badge** - SSL encryption indicator
- **Smooth Animations** - Scale, fade, and spring transitions

#### 6. Order Management
- **Order Success** - Animated success screen with order number
- **Orders List** - Buying vs Selling tabs
- **Status Pills** - Paid, Shipped, Delivered, Completed
- **Order Tracking** - Visual timeline with progress indicators
- **Order Details** - Full tracking info and shipping address

#### 7. Seller Dashboard
- **Sales Analytics** - Total sales and net payout cards
- **Financial Breakdown** - Sale price, shipping, fees, net payout
- **Ship Now Button** - One-tap shipping label generation
- **Status Management** - Track order fulfillment

### 🎭 Animations & Interactions

#### Button States (All Buttons)
1. **Default** - Solid appearance
2. **Pressed** - Scale down to 0.98
3. **Loading** - Spinner animation
4. **Success** - Checkmark with spring animation
5. **Error** - Error icon with red background

#### Screen Transitions
- **Forward** - Slide in from right, fade previous
- **Back** - Slide in from left, fade previous
- **Duration** - 200-300ms with spring physics

#### Micro-interactions
- **Cards** - Lift on tap (scale 0.98)
- **Bottom Sheets** - Spring animation from bottom
- **Input Focus** - Ring animation (2px)
- **Loading States** - Skeleton screens with pulse
- **Success Animations** - Ripple effects

### 🎨 Color System
- **Primary** - `#030213` (Deep navy, almost black)
- **Background** - `#ffffff` (Pure white)
- **Secondary BG** - `#f8f8f9` (Soft gray)
- **Input BG** - `#f3f3f5` (Slightly darker gray)
- **Accent** - Green for success, Blue for info, Red for destructive

### 📦 Tech Stack
- **React 18** - Latest features
- **Motion (Framer Motion)** - Advanced animations
- **Tailwind CSS 4** - Utility-first styling
- **TypeScript** - Type safety
- **Lucide React** - Premium icon set
- **Unsplash** - Real product images

## Screen Flow Diagram

```
Splash → Welcome → Phone → OTP → Success → Home
                                              ↓
                                         ┌────┴────┐
                                         ↓         ↓
                                    Search    Categories
                                         ↓         ↓
                                    Product Details
                                         ↓
                                  Seller Profile
                                         ↓
                                     Checkout
                                         ↓
                                   Payment (Wise)
                                         ↓
                                  Order Success
                                         ↓
                                      Orders
                                    ↙        ↘
                          Order Details    Seller Dashboard
```

## Component Architecture

### Reusable Components
- **Button** - All states (default, loading, success, error)
- **BottomSheet** - Modal drawer with spring animation
- **ScreenTransition** - Page transitions with direction
- **Skeleton** - Loading placeholders

### Screen Components
All screens are modular and accept props for navigation:
- `SplashScreen`
- `WelcomeScreen`
- `PhoneScreen`
- `OTPScreen`
- `SuccessScreen`
- `HomeScreen`
- `CategoriesScreen`
- `SearchScreen`
- `ProductDetailScreen`
- `SellerProfileScreen`
- `CheckoutScreen`
- `PaymentScreen` ⭐ (Wise-inspired)
- `OrderSuccessScreen`
- `OrdersScreen`
- `OrderDetailScreen`
- `SellerDashboardScreen`

## Data Structure

### Product
```typescript
{
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  condition: "new" | "used";
  city: string;
  seller: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    totalSales: number;
  };
  description: string;
  specs: Array<{label: string; value: string}>;
}
```

### Order
```typescript
{
  id: string;
  orderNumber: string;
  productTitle: string;
  productImage: string;
  price: number;
  status: "paid" | "shipped" | "delivered" | "completed";
  date: string;
  seller: string;
}
```

## Key Design Principles

1. **iOS First** - Follows Apple's Human Interface Guidelines
2. **Premium Feel** - Inspired by fintech apps like Wise
3. **Smooth Animations** - 200-300ms transitions with spring physics
4. **Clear Hierarchy** - Visual weight guides user attention
5. **Trust & Security** - SSL badges, clear breakdowns
6. **User Feedback** - Every action has visual confirmation
7. **Mobile Optimized** - Touch targets 44x44px minimum
8. **Loading States** - Skeleton screens prevent layout shift

## Payment Screen (Wise-Style) - Detailed

The payment screen is the crown jewel of the app:

### Visual Hierarchy
1. **Large Total** - 5xl font size, center-aligned
2. **Currency Conversion** - Small text below total
3. **Breakdown Card** - White card with border, clear itemization
4. **Payment Methods** - Large touch targets with icons
5. **Security Badge** - Lock icon with SSL text
6. **CTA Button** - Fixed at bottom, shows amount

### Animations
- **Amount entrance** - Fade + slide up with delay
- **Card animation** - Scale from 0.95 to 1
- **Button states** - Smooth transitions between all 4 states
- **Success ripple** - Green wave effect on completion

### Breakdown Transparency
- Product price
- Shipping (buyer pays)
- Service fee (with info icon)
- **Total** (bold, larger text)

This mirrors Wise's transparent pricing model.

## Mobile Viewport
- Max width: 430px (iPhone 14 Pro Max)
- Centered on larger screens
- Safe area support for notch/home indicator
- Optimized for one-handed use

## Demo Features
- 8 products with real Unsplash images
- 8 categories with emojis
- Multiple sellers with avatars
- Order tracking timeline
- Seller dashboard with financial breakdown

## Future Enhancements
- Dark mode toggle
- User profile editing
- Chat/messaging
- Push notifications
- Real-time order tracking
- Multiple payment method management
- Saved addresses
- Wishlists/favorites
- Product reviews & ratings
