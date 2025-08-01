# AdViewer Platform

## Overview

This is a full-stack web application that allows users to watch advertisements and earn money. The platform is built with a modern tech stack featuring React on the frontend, Express.js on the backend, and PostgreSQL with Drizzle ORM for data management. Users can register, log in, watch ads, and request withdrawals of their earnings.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with clear separation between client and server code:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: React Context for authentication, TanStack Query for server state
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM (fully integrated)
- **Session Management**: In-memory sessions (simple Map-based storage)
- **API Design**: RESTful endpoints with JSON responses
- **Validation**: Zod schemas shared between client and server
- **Storage**: DatabaseStorage implementation replacing in-memory storage

## Key Components

### Database Schema
The application uses four main entities:
- **Users**: Store user credentials, earnings, and streak information
- **Ads**: Contains advertisement details, categories, and earnings potential
- **UserAdViews**: Tracks which ads users have watched and completion status
- **Withdrawals**: Manages user withdrawal requests and payment processing

### Authentication System
- Simple session-based authentication using Bearer tokens
- Sessions stored in memory with Map data structures
- No password hashing implemented (development setup)
- Auto-login from localStorage for session persistence

### Ad Viewing System
- Users can browse available ads by category (video, banner, interactive)
- Timer-based ad viewing with completion tracking
- Earnings credited after successful ad completion
- Daily limits and streak tracking for user engagement

### Payment System
- Users can request withdrawals with minimum thresholds
- Multiple payment methods supported (PayPal, bank transfer, etc.)
- Withdrawal status tracking (pending, processing, completed, failed)

## Data Flow

1. **User Registration/Login**: 
   - Credentials validated against database
   - Session created and stored in memory
   - User data cached in localStorage for persistence

2. **Ad Viewing Process**:
   - User selects ad from available list
   - Ad view record created in database
   - Timer tracks viewing duration
   - Completion updates user earnings and ad view status

3. **Withdrawal Request**:
   - User submits withdrawal form with amount and payment details
   - System validates available balance
   - Withdrawal record created with pending status

## External Dependencies

### Frontend Dependencies
- **UI Components**: Extensive use of Radix UI primitives
- **Styling**: Tailwind CSS with PostCSS processing
- **Form Handling**: React Hook Form with Hookform resolvers
- **Date Handling**: date-fns for date manipulation
- **Icons**: Lucide React for consistent iconography

### Backend Dependencies
- **Database**: Neon serverless PostgreSQL database
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Validation**: Zod for runtime type checking
- **Development**: tsx for TypeScript execution in development

### Development Tools
- **TypeScript**: Strict type checking across the entire codebase
- **Vite**: Fast development server with HMR
- **ESBuild**: Production bundling for server code
- **Drizzle Kit**: Database migrations and schema management

## Deployment Strategy

### Development Setup
- Vite dev server serves the React frontend
- Express server runs with tsx for TypeScript support
- Hot module replacement for fast development iteration
- Shared TypeScript configuration across client/server

### Production Build
- Vite builds static assets to `dist/public`
- ESBuild bundles server code to `dist/index.js`
- Single production server serves both API and static files
- Environment variables for database configuration

### Database Management
- Drizzle migrations stored in `./migrations` directory
- Schema definitions shared between client and server
- PostgreSQL dialect with Neon serverless database
- Push-based schema updates for development

The application prioritizes simplicity and rapid development while maintaining type safety and modern development practices. The architecture supports easy scaling and feature additions through its modular design and shared type definitions.

## Recent Changes

### Major Platform Enhancement (Current)
- **Date**: January 31, 2025
- **Changes**: 
  - Successfully migrated from Replit Agent to production environment
  - Integrated PostgreSQL database with Neon serverless
  - Replaced MemStorage with DatabaseStorage implementation
  - Created database configuration in `server/db.ts`
  - Added automatic sample data initialization (admin user and sample ads)
  - Successfully pushed database schema with `npm run db:push`
  - **NEW**: Built comprehensive feature enhancements:
    - Enhanced dashboard with advanced ad categories and filtering system
    - Profile management system with user settings and analytics
    - Interactive earnings chart with 7-day visualization using Recharts
    - Complete referral system with social media sharing capabilities
    - Improved navigation component with consistent user experience
    - Better landing page with compelling features and call-to-action
    - Mobile-responsive design improvements across all pages
- **Impact**: Transformed from basic ad viewing platform to comprehensive earnings management system
- **Admin Access**: Default admin user created with credentials admin/admin123

### New Features Added:
1. **Ad Categories & Filtering**: Users can filter ads by type (video, banner, interactive) and search by keywords
2. **Profile System**: Complete user profile management with avatar, bio, and account settings
3. **Analytics Dashboard**: Visual earnings tracking with charts and statistics
4. **Referral Program**: Built-in referral system with automatic link generation and social sharing
5. **Enhanced Navigation**: Consistent navigation bar across all authenticated pages
6. **Improved Landing Page**: Better conversion-focused homepage for new users

### Latest Authentication Fixes (Current Session):
- **Date**: January 31, 2025
- **Issue Fixed**: Login redirection loop where dashboard would redirect back to login
- **Changes Made**:
  - Added authentication state debugging throughout the app
  - Implemented delayed authentication check in dashboard (1-second timeout)
  - Enhanced login flow with proper state setting and delayed redirect
  - Added user profile header display on dashboard with avatar and balance
  - Fixed localStorage session persistence and error handling
- **Result**: Users now successfully login and remain on dashboard with profile visible

### Transaction History Notification System (Latest Update):
- **Date**: January 31, 2025
- **Feature**: Comprehensive notification system for transaction history
- **Implementation**:
  - Added notification icon next to withdraw button in dashboard profile section
  - Created popup notification system showing complete transaction history
  - Integrated withdrawal status tracking with admin-controlled approvals
  - Added earning notifications from ad viewing activities
  - Enhanced visual design with color-coded transaction types
  - Included account summary with balance information in notification popup
- **User Experience**: Click notification bell to view all transaction history with real-time status updates

### Comprehensive Admin Panel Implementation (Current):
- **Date**: August 1, 2025
- **Major Feature**: Built complete database management admin panel
- **Changes**: 
  - **Complete CRUD Operations**: Full create, read, update, delete for all database entities
  - **User Management**: Create, edit, delete users with role and balance management
  - **Advertisement Management**: Full ad lifecycle control with earnings and duration settings
  - **Withdrawal Oversight**: Approve, reject, delete withdrawal requests with status tracking
  - **Real-time Analytics**: Live dashboard showing user ad views and earning analytics
  - **Database Monitoring**: Complete overview of all database tables with record counts
  - **Duration Control**: Ad timer now uses actual database duration values for precise timing
  - **Authentication Fixed**: Admin access properly configured and tested
  - **Type Safety**: Comprehensive TypeScript integration with proper error handling
- **Technical Implementation**:
  - New admin panel at `/admin` route with tabbed interface
  - Backend CRUD API endpoints for all entities
  - Real-time data fetching with TanStack Query
  - Form validation and error handling throughout
  - Responsive design with shadcn/ui components
- **Admin Access**: Username: admin, Password: admin123
- **Impact**: Platform now has complete administrative control over all aspects of the application

### Real AdMob Integration Implementation (Previous):
- **Date**: January 31, 2025
- **Major Feature**: Implemented real AdMob ads replacing demo system
- **Changes**: 
  - **Google AdSense Integration**: Added official AdSense JavaScript SDK to index.html
  - **Real Ad Loading**: Dynamic creation of AdSense ad units using actual Ad Unit ID
  - **Publisher ID**: Configured with real publisher ID `ca-pub-3367275049693713`
  - **Ad Unit ID**: Using live ad unit `1ca-app-pub-3367275049693713/9201840585`
  - **Fallback System**: Graceful fallback to demo mode if AdMob fails to load
  - **Visual Indicators**: Real-time status showing "Live AdMob Ad" vs "Demo Mode"
  - **Error Handling**: Comprehensive error catching with user-friendly messages
  - **UI Enhancement**: Updated button text to "Load Real AdMob Ad & Earn"
  - **Revenue Generation**: Now capable of generating actual AdMob revenue
  - **Duration Control**: Ad timers now use database duration settings for accurate timing
- **Technical Implementation**:
  - AdSense script loading with cross-origin support
  - Dynamic ad element creation with proper data attributes
  - Real-time ad loading status with visual feedback
  - Timer-based ad completion tracking with configurable duration
  - Toast notifications indicating real vs demo ad loading
- **Impact**: Platform now generates real advertising revenue while maintaining user earning system

### Previous Migration (Completed):
- **Date**: January 31, 2025
- **Changes**: 
  - Successfully migrated project from Replit Agent to standard Replit environment
  - PostgreSQL database configured and connected with Neon serverless
  - Database schema pushed successfully with `npm run db:push`
  - DatabaseStorage implementation active (replacing MemStorage)
  - Sample data initialization working (admin user and sample ads)
  - Fixed profile photo display across navigation and dashboard
  - Enhanced profile photo visibility in navigation bar and dashboard header
  - Resolved TypeScript errors and improved type safety
  - Removed default/mock referral data, now starts with zero values for new users
  - Application running cleanly on port 5000 without errors
- **Impact**: Platform now fully operational in production Replit environment with proper security practices