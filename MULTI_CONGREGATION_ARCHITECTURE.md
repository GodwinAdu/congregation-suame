# Multi-Congregation Architecture Plan

## Overview

This document outlines the plan to support multiple congregations using the same application instance simultaneously. The recommended approach is **Shared Database with Tenant Isolation** (Option A).

---

## Architecture: Shared Database, Congregation Scoped

Every record in the database will have a `congregationId` field that ties it to a specific congregation. All queries will be scoped by this field automatically.

---

## New Models

### 1. Congregation Model

```typescript
const CongregationSchema = new Schema({
    name: { type: String, required: true }, // e.g., "Suame"
    code: { type: String, required: true, unique: true }, // e.g., "suame", "atonsu"
    circuit: { type: String }, // e.g., "Circuit 5"
    district: { type: String },
    country: { type: String, default: "Ghana" },
    city: { type: String },
    address: { type: String },
    timezone: { type: String, default: "Africa/Accra" },
    meetingSchedule: {
        midweek: { day: String, startTime: String, endTime: String },
        weekend: { day: String, startTime: String, endTime: String }
    },
    settings: {
        smsEnabled: { type: Boolean, default: false },
        aiEnabled: { type: Boolean, default: false },
        maxMembers: { type: Number, default: 500 },
    },
    subscription: {
        plan: { type: String, enum: ['free', 'basic', 'premium'], default: 'free' },
        expiresAt: Date,
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "SuperAdmin" },
}, { timestamps: true });
```

### 2. SuperAdmin Model

```typescript
const SuperAdminSchema = new Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['super_admin', 'support'], default: 'super_admin' },
    congregations: [{ type: Schema.Types.ObjectId, ref: "Congregation" }], // can manage multiple
}, { timestamps: true });
```

---

## Migration Steps

### Phase 1: Add congregationId to All Models

Every existing model gets a new field:

```typescript
congregationId: { type: Schema.Types.ObjectId, ref: "Congregation", required: true, index: true }
```

**Models to update (40+):**
- Member (user.models.ts)
- FieldServiceReport
- DailyFieldServiceReport
- Attendance
- MemberAttendance
- Assignment / AssignmentHistory
- Territory / TerritoryAssignment
- ShepherdingCall
- Group
- Family
- BibleStudy
- Event / Announcement
- Communication (Message, Broadcast)
- Financial / Expense
- Notification
- Activity
- PublisherGoal / PublisherRecord
- TransportFee / MemberFeePayment
- SMSLog
- PushSubscription
- ReaderAssignment
- SchoolStudent
- COVisit / COReport
- MeetingSchedule
- Literature
- Document
- Role / Privilege
- Duty / Cleaning

### Phase 2: Create Tenant Context Middleware

```typescript
// lib/helpers/tenant.ts
import { cache } from 'react';
import { currentUser } from './session';

export const getCurrentCongregation = cache(async () => {
    const user = await currentUser();
    if (!user) return null;
    return user.congregationId;
});

// Wrapper for all DB queries
export function withTenant(query: any, congregationId: string) {
    return { ...query, congregationId };
}
```

### Phase 3: Update All Actions

Every server action that queries the database needs to scope by `congregationId`:

```typescript
// Before (current)
const members = await Member.find({});

// After (multi-tenant)
const congregationId = user.congregationId;
const members = await Member.find({ congregationId });
```

This applies to:
- All `find()`, `findOne()`, `countDocuments()` calls
- All `create()` / `save()` calls (inject congregationId)
- All `aggregate()` pipelines (add $match stage)
- All `distinct()` calls

### Phase 4: Update Authentication

```typescript
// JWT payload includes congregationId
{
    id: user._id,
    role: user.role,
    congregationId: user.congregationId
}
```

The middleware (proxy.ts) verifies both the user token AND their congregation access.

### Phase 5: Super Admin Dashboard

A new `/super-admin` route (separate from `/dashboard`) that allows:
- Create new congregations
- Assign congregation admins
- View all congregations' stats
- Enable/disable features per congregation
- Manage subscriptions/billing (if monetized)

---

## URL Strategy

Two options:

### Option A: Path-based (Simpler)
```
/en/dashboard          → User's congregation (from JWT)
/super-admin           → Super admin panel
```
No URL changes needed. Congregation is determined from the logged-in user's `congregationId`.

### Option B: Subdomain-based (More professional)
```
suame.jw-admin.com     → Suame congregation
atonsu.jw-admin.com    → Atonsu congregation
admin.jw-admin.com     → Super admin panel
```
Requires DNS wildcard + middleware to extract congregation from subdomain.

**Recommendation:** Start with Option A (path-based). It requires zero infrastructure changes.

---

## Data Isolation Rules

| Rule | Implementation |
|------|---------------|
| Members can only see their congregation's data | All queries filter by `congregationId` |
| Admins manage only their congregation | `congregationId` from JWT, not from request |
| Super admins can see all congregations | Special role bypasses tenant filter |
| Cross-congregation transfers | Create new member in target, mark as transferred in source |

---

## Database Indexing

Add compound indexes for performance:

```typescript
// Every collection needs this
schema.index({ congregationId: 1, createdAt: -1 });

// Key lookups
MemberSchema.index({ congregationId: 1, email: 1 });
FieldServiceReportSchema.index({ congregationId: 1, month: 1, publisher: 1 });
AttendanceSchema.index({ congregationId: 1, date: 1 });
```

---

## Migration Script (for existing Suame data)

```javascript
// scripts/add-congregation-id.js
const SUAME_CONGREGATION_ID = "..."; // Created first

const collections = [
    'members', 'fieldservicereports', 'attendances',
    'assignments', 'groups', 'families', // ... all 40+
];

for (const collection of collections) {
    await db.collection(collection).updateMany(
        { congregationId: { $exists: false } },
        { $set: { congregationId: SUAME_CONGREGATION_ID } }
    );
}
```

---

## Estimated Effort

| Phase | Effort | Description |
|-------|--------|-------------|
| Phase 1 | 1 day | Add congregationId field to all models |
| Phase 2 | 0.5 day | Create tenant context helper |
| Phase 3 | 2-3 days | Update all 50+ action files |
| Phase 4 | 0.5 day | Update auth flow |
| Phase 5 | 1-2 days | Super admin dashboard |
| Testing | 1-2 days | Verify isolation works |
| **Total** | **6-9 days** | |

---

## When to Implement

**Prerequisites:**
1. Current single-congregation version is stable and deployed
2. At least one other congregation has expressed interest
3. Hosting budget supports the additional load

**Trigger:** When a second congregation wants to use the system, implement this migration before onboarding them.

---

## Alternatives Considered

| Approach | Pros | Cons | Verdict |
|----------|------|------|---------|
| Shared DB + congregationId | Single deploy, low cost | Large refactor, filter discipline | **Recommended** |
| Separate DB per congregation | Complete isolation | Multiple connections, higher cost | Good for 10+ congregations |
| Separate deployment per congregation | Zero code changes | Multiple deploys, update overhead | Quick win but doesn't scale |

---

## Security Considerations

1. **Never trust client-side congregationId** — always derive from the authenticated user's JWT
2. **Add middleware validation** — reject any request where a user tries to access data outside their congregation
3. **Super admin audit logging** — log all cross-congregation access
4. **Rate limiting per congregation** — prevent one congregation from overwhelming shared resources
5. **Data export** — each congregation admin can only export their own data
