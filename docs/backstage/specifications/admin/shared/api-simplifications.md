---
sidebar_position: 2
---

# API Simplifications - Logto Organization Management

## Overview

The API has been simplified to reduce complexity around Logto organization binding and synchronization.

## What Changed

### ❌ REMOVED Endpoints

| Endpoint | Method | Reason |
|----------|--------|--------|
| `/admin/logto/orgs` | GET | No longer needed - orgs are auto-created with firms |
| `/admin/logto/orgs/{lawFirmId}/sync` | POST | No manual sync - orgs stay in sync automatically |

### ❌ REMOVED Schema Fields

| Schema | Field | Reason |
|--------|-------|--------|
| `LawFirm` | `logtoSyncedAt` | No sync tracking needed |
| `LogtoOrg` | *(entire schema)* | Not exposed via API |
| `CreateLawFirmRequest` | `createLogtoOrg` | Always creates org automatically |
| `CreateLawFirmRequest` | `logtoOrgId` | Can't bind to existing orgs |

### ✅ SIMPLIFIED Behavior

#### Law Firm Creation

**Before** (complex):
```json
POST /admin/law-firms
{
  "name": "Acme Legal",
  "slug": "acme-legal",
  "createLogtoOrg": true,        // ❌ Removed - always true
  "logtoOrgId": "org_existing"   // ❌ Removed - can't bind to existing
}
```

**After** (simple):
```json
POST /admin/law-firms
{
  "name": "Acme Legal",
  "slug": "acme-legal"
  // Logto org is ALWAYS auto-created
}
```

**Response** (unchanged):
```json
{
  "id": "firm_abc123",
  "name": "Acme Legal",
  "slug": "acme-legal",
  "logtoOrgId": "org_xyz789",  // ✅ Auto-created
  "createdAt": "2025-10-18T12:00:00Z",
  "updatedAt": "2025-10-18T12:00:00Z"
}
```

#### Law Firm Deletion

When deleting a law firm:
```
DELETE /admin/law-firms/{lawFirmId}
```

**Automatic cleanup**:
1. Law firm record deleted
2. Logto organization automatically deleted
3. All org memberships removed
4. No orphaned organizations

### ✅ KEPT Endpoints

All organization member management endpoints remain:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/admin/logto/orgs/{lawFirmId}/members` | GET | List org members |
| `/admin/logto/orgs/{lawFirmId}/members` | POST | Add/invite member |
| `/admin/logto/orgs/{lawFirmId}/members/{userId}` | GET | Get member details |
| `/admin/logto/orgs/{lawFirmId}/members/{userId}` | DELETE | Remove member |
| `/admin/logto/orgs/{lawFirmId}/members/{userId}/roles` | PUT | Update member roles |
| `/admin/logto/org-roles` | GET | List available roles |

## Rationale

### Problems with Old Design

1. **Complexity**: Multiple ways to create orgs (auto, manual, bind existing)
2. **Sync issues**: Manual sync endpoint could get out of sync
3. **Edge cases**: What if sync fails? What if org deleted in Logto but not in app?
4. **Confusion**: When to use `createLogtoOrg` vs `logtoOrgId`?

### Benefits of New Design

1. **Predictable**: One law firm = one Logto org, always
2. **No drift**: Org lifecycle tied to firm lifecycle
3. **Atomic**: Create/delete operations are all-or-nothing
4. **Simple**: No manual sync or binding to worry about
5. **Maintainable**: Less code, fewer edge cases

## Migration Guide

### If You Were Using `createLogtoOrg: true`

**Before**:
```javascript
const response = await fetch('/admin/law-firms', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Acme Legal',
    slug: 'acme-legal',
    createLogtoOrg: true  // ❌ Remove this
  })
});
```

**After**:
```javascript
const response = await fetch('/admin/law-firms', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Acme Legal',
    slug: 'acme-legal'
    // Logto org created automatically
  })
});
```

### If You Were Using Manual Org Binding

**Before**:
```javascript
// ❌ This no longer works
const response = await fetch('/admin/law-firms', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Acme Legal',
    slug: 'acme-legal',
    logtoOrgId: 'org_existing123'
  })
});
```

**After**:
```javascript
// ✅ Org is always auto-created, can't bind to existing
const response = await fetch('/admin/law-firms', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Acme Legal',
    slug: 'acme-legal'
  })
});
// Response will include auto-created logtoOrgId
```

### If You Were Using Sync Endpoint

**Before**:
```javascript
// ❌ This endpoint no longer exists
await fetch(`/admin/logto/orgs/${lawFirmId}/sync`, {
  method: 'POST'
});
```

**After**:
```javascript
// ✅ No sync needed - always in sync
// Member management endpoints work directly:
await fetch(`/admin/logto/orgs/${lawFirmId}/members`, {
  method: 'POST',
  body: JSON.stringify({
    logtoUserId: 'user_123',
    orgRoles: ['admin']
  })
});
```

## Updated OpenAPI Changes Needed

### components.schemas.LawFirm

**Remove**:
```yaml
logtoSyncedAt: { type: string, format: date-time, nullable: true }
```

**Keep**:
```yaml
LawFirm:
  type: object
  properties:
    id: { type: string }
    name: { type: string }
    slug: { type: string }
    logtoOrgId: { type: string }  # Always set, never null
    createdAt: { type: string, format: date-time }
    updatedAt: { type: string, format: date-time }
```

### components.schemas.CreateLawFirmRequest

**Remove**:
```yaml
createLogtoOrg: { type: boolean }
logtoOrgId: { type: string }
```

**Keep**:
```yaml
CreateLawFirmRequest:
  type: object
  required: [name, slug]
  properties:
    name: { type: string }
    slug: { type: string }
    # Optional contact fields
    address: { type: string }
    phone: { type: string }
    email: { type: string }
```

### paths - Remove These

```yaml
# ❌ Remove GET /admin/logto/orgs
/admin/logto/orgs:
  get: ...  # DELETE THIS ENTIRE ENDPOINT

# ❌ Remove POST /admin/logto/orgs/{lawFirmId}/sync
/admin/logto/orgs/{lawFirmId}/sync:
  post: ...  # DELETE THIS ENTIRE ENDPOINT
```

### paths - Keep These

```yaml
# ✅ Keep all member management endpoints
/admin/logto/orgs/{lawFirmId}/members:
  get: ...   # ✅ KEEP
  post: ...  # ✅ KEEP

/admin/logto/orgs/{lawFirmId}/members/{userId}:
  get: ...     # ✅ KEEP
  delete: ...  # ✅ KEEP

/admin/logto/orgs/{lawFirmId}/members/{userId}/roles:
  put: ...  # ✅ KEEP

/admin/logto/org-roles:
  get: ...  # ✅ KEEP
```

## Summary

The simplified design:
- ✅ Always creates Logto org with law firm
- ✅ Always deletes Logto org with law firm
- ✅ No manual binding to existing orgs
- ✅ No manual sync endpoints
- ✅ Member management still fully supported
- ✅ Simpler, more predictable, easier to maintain
