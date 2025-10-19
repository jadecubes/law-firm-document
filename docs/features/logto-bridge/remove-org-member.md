---
sidebar_position: 4
---

# Remove Org Member

**API Endpoint**: `DELETE /admin/logto/orgs/{lawFirmId}/members/{userId}`

**Priority**: P1

**User Story**: As an admin, I want to remove a user from a law firm's Logto organization.

## Overview

Remove a user from a law firm's Logto organization, revoking their organization-scoped access and permissions. This does not delete the Logto user account or the user's law firm profile.

## Scenarios

### Scenario 1: Remove existing member

**Given**:
- Admin is authenticated with scope `logto-orgs:write`
- Law firm `firm_abc123` exists with Logto organization
- User `user_12345` is a member of the organization

**When**:
- Admin DELETEs `/admin/logto/orgs/firm_abc123/members/user_12345`

**Then**:
- Response status is `204 No Content`
- User is removed from Logto organization
- User loses access to organization resources
- Subsequent GET for this member returns 404

### Scenario 2: Member not in organization

**Given**:
- Admin is authenticated with scope `logto-orgs:write`
- Law firm and organization exist
- User `user_67890` is not a member of organization

**When**:
- Admin DELETEs `/admin/logto/orgs/firm_abc123/members/user_67890`

**Then**:
- Response status is `404 Not Found`
- Response body contains:
  ```json
  {
    "error": "NOT_FOUND",
    "message": "User 'user_67890' is not a member of organization for law firm 'firm_abc123'"
  }
  ```

### Scenario 3: Law firm not found

**Given**:
- Admin is authenticated with scope `logto-orgs:write`
- No law firm with ID `firm_nonexistent`

**When**:
- Admin DELETEs `/admin/logto/orgs/firm_nonexistent/members/user_12345`

**Then**:
- Response status is `404 Not Found`
- Response body contains:
  ```json
  {
    "error": "NOT_FOUND",
    "message": "Law firm with ID 'firm_nonexistent' not found"
  }
  ```

### Scenario 4: Logto user doesn't exist

**Given**:
- Admin is authenticated with scope `logto-orgs:write`
- Law firm exists
- No Logto user with ID `user_nonexistent`

**When**:
- Admin DELETEs `/admin/logto/orgs/firm_abc123/members/user_nonexistent`

**Then**:
- Response status is `404 Not Found`
- Response body contains:
  ```json
  {
    "error": "NOT_FOUND",
    "message": "Logto user with ID 'user_nonexistent' not found"
  }
  ```

### Scenario 5: Unauthorized access

**Given**:
- Request has no authentication token

**When**:
- Client DELETEs `/admin/logto/orgs/firm_abc123/members/user_12345`

**Then**:
- Response status is `401 Unauthorized`

### Scenario 6: Insufficient permissions

**Given**:
- Admin is authenticated but lacks `logto-orgs:write` scope
- Has only `logto-orgs:read` scope

**When**:
- Admin DELETEs member

**Then**:
- Response status is `403 Forbidden`
- Response body contains:
  ```json
  {
    "error": "FORBIDDEN",
    "message": "Missing required scope: logto-orgs:write"
  }
  ```

## Request Specification

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| lawFirmId | string | Yes | Law firm identifier |
| userId | string | Yes | Logto user identifier to remove |

## Response Specification

### Success Response (204 No Content)

No response body. The user has been successfully removed from the organization.

### Error Responses

| Status | Error Code | Description |
|--------|------------|-------------|
| 401 | UNAUTHORIZED | Missing or invalid auth token |
| 403 | FORBIDDEN | Missing `logto-orgs:write` scope |
| 404 | NOT_FOUND | Law firm, user, or membership not found |
| 503 | SERVICE_UNAVAILABLE | Logto service unreachable |

## Requirements Mapping

- **FR-107**: Accept DELETE with lawFirmId and userId parameters
- **FR-108**: Resolve law firm's logtoOrgId
- **FR-109**: Verify user is member of organization
- **FR-110**: Call Logto Management API to remove member
- **FR-111**: Return 204 No Content on success
- **FR-112**: Return 404 if user not member
- **FR-113**: Return 404 if law firm or user doesn't exist
- **FR-114**: Require `logto-orgs:write` scope
- **FR-115**: Operation is idempotent (repeated DELETEs return 404)

## Notes

### What Gets Deleted

This endpoint removes:
- ✅ User's membership in Logto organization
- ✅ All organization roles assigned to user
- ✅ User's access to organization resources

This endpoint does NOT delete:
- ❌ Logto user account (user still exists in Logto)
- ❌ User's law firm profile (if exists)
- ❌ User's credentials or metadata
- ❌ User's memberships in other organizations

### Profile vs Membership

Removing a user from an organization is separate from deleting their profile:
- **This endpoint**: Removes Logto org membership only
- **Delete profile**: Would remove law firm profile (separate endpoint)

For complete user removal from a law firm, both may be needed.

### Offboarding Flow

Typical user offboarding process:

1. Remove user from Logto organization (this endpoint)
2. Revoke resource access grants
3. Deactivate or delete law firm profile
4. Optional: Delete Logto user account (if no longer needed)

### Automatic Cleanup

When a law firm is deleted:
- Logto organization is automatically deleted
- All memberships are removed automatically
- No need to call this endpoint for cleanup

### Re-adding Members

After removal, a user can be re-added using `POST /admin/logto/orgs/{lawFirmId}/members`:
- Same Logto user ID can be used
- New roles must be specified
- No history of previous membership is retained
