# Suame - Technology Stack

## Core Framework & Runtime
- **Next.js 16.1.0** - React framework with App Router
- **React 19.2.3** - UI library
- **TypeScript 5** - Type-safe JavaScript
- **Node.js** - Runtime environment

## Build & Development
- **Turbopack** - Fast bundler (used in dev and build)
- **Tailwind CSS 4** - Utility-first CSS framework
- **PostCSS 4** - CSS processing
- **ESLint 9** - Code linting

## UI & Component Libraries
- **Radix UI** - Headless component library
  - Accordion, Alert Dialog, Avatar, Badge, Button, Calendar, Card, Carousel
  - Checkbox, Collapsible, Command, Context Menu, Dialog, Drawer
  - Dropdown Menu, Form, Hover Card, Input, Label, Menubar
  - Navigation Menu, Pagination, Popover, Progress, Radio Group
  - Scroll Area, Select, Separator, Sheet, Sidebar, Skeleton
  - Slider, Switch, Tabs, Toggle, Tooltip
- **Lucide React** - Icon library
- **Sonner** - Toast notifications
- **Embla Carousel** - Carousel component
- **React Hook Form** - Form state management
- **Zod** - Schema validation

## Data & Database
- **MongoDB** - NoSQL database
- **Mongoose 9.0.2** - MongoDB ODM
- **IndexedDB** - Client-side storage
  - Bible reading data
  - Meeting notes
  - Study tracking
  - Talking points

## Authentication & Security
- **JWT (jsonwebtoken 9.0.3)** - Token-based authentication
- **Jose 6.1.3** - JWT handling
- **bcryptjs 3.0.3** - Password hashing
- **next-intl 4.6.1** - Internationalization with auth

## AI & LLM Integration
- **OpenAI 6.22.0** - GPT API
- **@ai-sdk/openai 3.0.29** - AI SDK for OpenAI
- **@ai-sdk/react 3.0.88** - React hooks for AI
- **ai 6.0.86** - Vercel AI SDK

## Communication & Notifications
- **web-push 3.6.7** - Web Push API
- **nodemailer 7.0.11** - Email sending
- **SMS Integration** - Custom SMS configuration

## Data Export & Visualization
- **jsPDF 3.0.4** - PDF generation
- **jspdf-autotable 5.0.2** - PDF tables
- **html2canvas 1.4.1** - HTML to canvas
- **file-saver 2.0.5** - File download
- **xlsx 0.18.5** - Excel export
- **Recharts 3.6.0** - Data visualization charts

## Location & Mapping
- **Leaflet 1.9.4** - Mapping library
- **React Leaflet 5.0.0** - React wrapper for Leaflet

## Utilities & Helpers
- **axios 1.13.2** - HTTP client
- **date-fns 4.1.0** - Date manipulation
- **uuid 13.0.0** - UUID generation
- **clsx 2.1.1** - Conditional className
- **tailwind-merge 3.4.0** - Tailwind class merging
- **class-variance-authority 0.7.1** - Component variants
- **cmdk 1.1.1** - Command menu
- **input-otp 1.4.2** - OTP input
- **react-markdown 10.1.0** - Markdown rendering
- **remark-gfm 4.0.1** - GitHub-flavored markdown
- **react-resizable-panels 4.0.12** - Resizable panels
- **vaul 1.1.2** - Drawer component
- **next-themes 0.4.6** - Theme management
- **nextjs-toploader 3.9.17** - Page loading indicator

## PWA & Service Worker
- **@ducanh2912/next-pwa 10.2.9** - PWA support
- Service Worker: `public/sw.js`
- Manifest: `app/manifest.ts`

## Development Tools
- **@types/*** - TypeScript type definitions
- **@next/bundle-analyzer** - Bundle analysis
- **@tailwindcss/postcss** - Tailwind PostCSS plugin
- **dotenv 17.2.3** - Environment variable management
- **tw-animate-css 1.4.0** - Tailwind animations

## Configuration Files
- **next.config.ts** - Next.js configuration
- **tsconfig.json** - TypeScript configuration
- **tailwind.config.ts** - Tailwind CSS configuration
- **postcss.config.mjs** - PostCSS configuration
- **components.json** - Shadcn/ui configuration
- **eslint.config.mjs** - ESLint configuration
- **.env** - Environment variables
- **vercel.json** - Vercel deployment config

## Development Commands
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production with Turbopack
npm start            # Start production server
npm run lint         # Run ESLint
npm run update-admin # Update admin role
```

## Environment Variables
```env
# Database
MONGODB_URI=

# Authentication
JWT_SECRET=
NEXTAUTH_SECRET=

# Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=

# AI/LLM
OPENAI_API_KEY=

# Email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# SMS
SMS_API_KEY=
SMS_SENDER_ID=

# Localization
NEXT_PUBLIC_DEFAULT_LOCALE=en
```

## Performance Optimizations
- Turbopack for fast builds
- Next.js Image optimization
- Font optimization with next/font
- Code splitting and lazy loading
- Service Worker caching
- IndexedDB for offline data
- Vector search for efficient queries

## Deployment
- **Vercel** - Primary deployment platform
- **PWA** - Installable web app
- **Docker** - Containerization ready
