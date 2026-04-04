# Suame - Project Structure

## Directory Organization

### `/app` - Next.js App Router
- **`[locale]/`** - Internationalization wrapper for all routes
  - **`(auth)/`** - Authentication pages (login, signup, password reset)
  - **`(dashboard)/`** - Protected dashboard routes with role-based access
    - **`(routes)/`** - Feature-specific dashboard pages
      - `dashboard/` - Main dashboard
      - `members/` - Member management
      - `field-service/` - Field service tracking
      - `events/` - Event management
      - `communication/` - Broadcast and messaging
      - `settings/` - User and system settings
      - `analytics/` - Analytics and reporting
      - `admin/` - Administrative functions
- **`api/`** - API routes
  - `auth/` - Authentication endpoints
  - `chat/` - AI assistant endpoints
  - `cron/` - Scheduled tasks
  - `members-with-location/` - Location-based queries
  - `push/` - Push notification endpoints

### `/components` - React Components
- **`ui/`** - Reusable UI components (Radix UI based)
  - Form elements: input, button, select, checkbox, radio-group, etc.
  - Layout: card, dialog, drawer, sheet, sidebar, tabs, accordion
  - Data display: table, pagination, badge, avatar, progress
  - Specialized: calendar, carousel, chart, command, context-menu
- **`commons/`** - Shared application components
  - `dashboard/` - Dashboard-specific components
  - `theme/` - Theme switching components
  - Selection components: AcademicDropdown, ClassSelection, DepartmentSelection
  - Modals: DeleteDialog, FeedbackModal, IntroModal
  - Utilities: Header, Notification, user-nav, user-dropdown
- **`sidebar/`** - Navigation sidebar components
- **`table/`** - Data table components with actions and modals
- **`profile/`** - User profile forms and settings
- **`location/`** - Map and location components
- **`history/`** - Activity history display
- **`auth/`** - Authentication components (PermissionGuard)
- **`ai/`** - AI assistant dialog component
- **`push-notification-*.tsx`** - Push notification UI components

### `/lib` - Core Business Logic
- **`actions/`** - Server actions (50+ files)
  - Feature-specific actions: `member.actions.ts`, `field-service.actions.ts`, etc.
  - Each action file handles CRUD operations for its domain
  - Pattern: `export async function actionName(params) { ... }`
- **`models/`** - Mongoose data models (40+ files)
  - Schema definitions for all entities
  - Validation and type definitions
- **`services/`** - Business logic services
  - `ai-assistant.service.ts` - OpenAI integration
  - `push-notification.service.ts` - Web Push API
  - `email.service.ts` - Email sending
  - `jw-scraper.service.ts` - JW Library scraping
  - `vector-search.service.ts` - Embedding-based search
- **`helpers/`** - Utility functions
  - `auth.ts` - Authentication helpers
  - `permission-check.ts` - Client-side permission validation
  - `server-permission-check.ts` - Server-side permission validation
  - `get-user-role.ts` - Role retrieval
  - `client-role.ts` - Client role context
- **`db/`** - IndexedDB utilities
  - `bibleReadingDB.ts` - Bible reading data
  - `meetingNotesDB.ts` - Meeting notes
  - `studyTrackerDB.ts` - Study tracking
  - `talkingPointsDB.ts` - Talking points
- **`data/`** - Static data
  - `bible-reading-plan.ts` - Bible reading schedules
- **`context/`** - React context
  - `role-context.tsx` - Role-based context provider
- **`hooks/`** - Custom React hooks
  - `usePermissions.ts` - Permission checking hook
- **`utils/`** - Utility functions
  - Vector index creation scripts
  - VAPID key generation
  - Embedding generation
- **`mcp/`** - Model Context Protocol tools
  - `database-tools.ts` - Database interaction tools
- **`sms/`** - SMS configuration
- **`mongoose.ts`** - MongoDB connection setup

### `/hooks` - Custom React Hooks
- `use-mobile.ts` - Mobile device detection
- `use-push-notifications.ts` - Push notification management

### `/i18n` - Internationalization
- `navigation.ts` - Locale-aware routing
- `request.ts` - i18n request handling
- `routing.ts` - Route configuration

### `/public` - Static Assets
- Service worker: `sw.js`
- Icons: PWA icons (192x192, 512x512)
- Images: SVG assets

### `/scripts` - Utility Scripts
- `update-admin-role.js` - Admin role setup
- `update-role-permissions.js` - Permission updates
- `update-roles.js` - Role management
- `add-page-protection.js` - Page protection setup
- `restore-backup.js` - Backup restoration

### `/messages` - i18n Messages
- `en.json` - English translations
- `tw.json` - Traditional Chinese translations

## Core Architectural Patterns

### Server Actions Pattern
All data mutations use Next.js server actions in `/lib/actions/`:
```
export async function actionName(params) {
  try {
    // Validation
    // Permission check
    // Database operation
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

### Component Organization
- UI components in `/components/ui/` (Radix UI primitives)
- Feature components in `/components/[feature]/`
- Shared components in `/components/commons/`
- Each component is self-contained with minimal dependencies

### Data Flow
1. Client component renders form
2. Form submission calls server action
3. Server action validates and processes
4. Response returned to client
5. UI updates with result

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Permission checking at server and client level
- Protected routes via middleware

### Database
- MongoDB with Mongoose ODM
- Models in `/lib/models/`
- Server actions handle all database operations
- IndexedDB for client-side caching

### Internationalization
- next-intl for routing and translations
- Locale-aware navigation
- Message files in `/messages/`
- Dynamic language switching
