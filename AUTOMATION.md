# Automation Setup

## Automated Tasks

### 1. SMS Report Reminders
**Endpoint**: `/api/cron/send-report-reminders`
**Schedule**: 25th of every month at 9:00 AM
**Function**: Automatically sends SMS reminders to members who haven't submitted field service reports

### 2. Monthly Report Generation
**Endpoint**: `/api/cron/generate-monthly-report`
**Schedule**: 1st of every month at midnight
**Function**: Generates comprehensive monthly statistics report

## Setup Instructions

### Option 1: Vercel Deployment (Recommended)
1. Deploy to Vercel
2. Add environment variable: `CRON_SECRET=your-secret-key`
3. Cron jobs will run automatically based on `vercel.json` schedule

### Option 2: External Cron Service
Use services like cron-job.org or EasyCron:

1. Add `CRON_SECRET` to your `.env`:
```env
CRON_SECRET=your-secret-key-here
```

2. Set up cron jobs to call:
- `https://your-domain.com/api/cron/send-report-reminders`
  - Schedule: `0 9 25 * *` (25th day, 9 AM)
  - Header: `Authorization: Bearer your-secret-key-here`

- `https://your-domain.com/api/cron/generate-monthly-report`
  - Schedule: `0 0 1 * *` (1st day, midnight)
  - Header: `Authorization: Bearer your-secret-key-here`

### Option 3: Manual Trigger
You can manually trigger by visiting the URLs with proper authorization header.

## Testing
```bash
curl -H "Authorization: Bearer your-secret-key" http://localhost:3000/api/cron/send-report-reminders
curl -H "Authorization: Bearer your-secret-key" http://localhost:3000/api/cron/generate-monthly-report
```

## Cron Schedule Format
```
* * * * *
│ │ │ │ │
│ │ │ │ └─ Day of week (0-7, Sunday = 0 or 7)
│ │ │ └─── Month (1-12)
│ │ └───── Day of month (1-31)
│ └─────── Hour (0-23)
└───────── Minute (0-59)
```
