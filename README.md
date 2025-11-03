This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Push Notifications Setup

This application includes a complete push notification system. To set it up:

### 1. Generate VAPID Keys

Run the VAPID key generator:

```bash
node lib/utils/vapid-keys.js
```

Copy the generated keys to your `.env` file:

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
```

### 2. Enable Push Notifications

1. Navigate to `/dashboard/settings/notifications`
2. Toggle "Enable Push Notifications"
3. Grant permission when prompted
4. Test notifications using the test component

### 3. Features

- **Web Push API**: Native browser push notifications
- **Service Worker**: Background notification handling
- **VAPID Authentication**: Secure push messaging
- **Fallback Support**: Local notifications when push fails
- **Bulk Notifications**: Send to multiple users
- **Rich Notifications**: Custom icons, actions, and data
- **Subscription Management**: Auto-cleanup of expired subscriptions

### 4. Usage in Broadcasts

Push notifications are automatically integrated with the broadcast system:

1. Create a broadcast in Communication Hub
2. Select "Push Notification" as delivery method
3. Choose target audience
4. Send or schedule the broadcast

### 5. API Endpoints

- `POST /api/push/subscribe` - Subscribe to push notifications
- `POST /api/push/send` - Send push notification
- `POST /api/push/unsubscribe` - Unsubscribe from notifications

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.