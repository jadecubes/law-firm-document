---
sidebar_position: 5
---

# Create Grant

**API Endpoint**: `POST /admin/resources/{type}/{id}/access-grants`

**Priority**: P1

**User Story**: As an admin, I want to grant a user access to a resource at a specific access level.

## Overview

Create a new access grant for a user on a specific resource. Grants define who can access a resource and at what level (READ, WRITE, ADMIN). Supports optional expiration for temporary access.

## Scenarios

### Scenario 1: Grant READ access to case

**Given**:
- Admin is authenticated with scope `access-grants:write`
- Case `case_abc123` exists
- User `user_12345` exists
- User does not have access to case

**When**:
- Admin POSTs to `/admin/resources/case/case_abc123/access-grants` with payload:
  ```json
  {
    "userId": "user_12345",
    "accessLevel": "READ"
  }
  ```

**Then**:
- Response status is `201 Created`
- Response body contains:
  ```json
  {
    "id": "grant_xyz789",
    "userId": "user_12345",
    "resourceType": "case",
    "resourceId": "case_abc123",
    "accessLevel": "READ",
    "grantedBy": "admin_789",
    "grantedAt": "2025-10-19T10:00:00Z",
    "expiresAt": null
  }
  ```
- User can now read the case

### Scenario 2: Grant ADMIN access with expiration

**Given**:
- Admin is authenticated with scope `access-grants:write`
- Document exists
- User exists

**When**:
- Admin POSTs with expiration:
  ```json
  {
    "userId": "user_67890",
    "accessLevel": "ADMIN",
    "expiresAt": "2025-12-31T23:59:59Z"
  }
  ```

**Then**:
- Response status is `201 Created`
- Grant is created with expiration date
- Access automatically revokes after expiration

### Scenario 3: Duplicate grant

**Given**:
- Admin is authenticated with scope `access-grants:write`
- User `user_12345` already has READ access to `case_abc123`

**When**:
- Admin attempts to grant READ access again:
  ```json
  {
    "userId": "user_12345",
    "accessLevel": "READ"
  }
  ```

**Then**:
- Response status is `409 Conflict`
- Response body contains:
  ```json
  {
    "error": "DUPLICATE_GRANT",
    "message": "User 'user_12345' already has READ access to resource 'case:case_abc123'"
  }
  ```

### Scenario 4: Upgrade existing grant

**Given**:
- Admin is authenticated with scope `access-grants:write`
- User has READ access to case

**When**:
- Admin grants WRITE access to same user:
  ```json
  {
    "userId": "user_12345",
    "accessLevel": "WRITE",
    "replaceExisting": true
  }
  ```

**Then**:
- Response status is `201 Created`
- Previous READ grant is revoked
- New WRITE grant is created
- User now has WRITE access (not both)

### Scenario 5: Resource not found

**Given**:
- Admin is authenticated with scope `access-grants:write`
- No case with ID `case_nonexistent`

**When**:
- Admin POSTs to `/admin/resources/case/case_nonexistent/access-grants`

**Then**:
- Response status is `404 Not Found`
- Response body contains:
  ```json
  {
    "error": "NOT_FOUND",
    "message": "Resource 'case:case_nonexistent' not found"
  }
  ```

### Scenario 6: User not found

**Given**:
- Admin is authenticated with scope `access-grants:write`
- Resource exists
- No user with ID `user_nonexistent`

**When**:
- Admin POSTs:
  ```json
  {
    "userId": "user_nonexistent",
    "accessLevel": "READ"
  }
  ```

**Then**:
- Response status is `404 Not Found`
- Response body contains:
  ```json
  {
    "error": "NOT_FOUND",
    "message": "User with ID 'user_nonexistent' not found"
  }
  ```

### Scenario 7: Invalid access level

**Given**:
- Admin is authenticated with scope `access-grants:write`

**When**:
- Admin POSTs with invalid access level:
  ```json
  {
    "userId": "user_12345",
    "accessLevel": "INVALID"
  }
  ```

**Then**:
- Response status is `400 Bad Request`
- Response body contains:
  ```json
  {
    "error": "VALIDATION_ERROR",
    "message": "Invalid access level",
    "details": [
      {
        "field": "accessLevel",
        "message": "Must be one of: READ, WRITE, ADMIN"
      }
    ]
  }
  ```

### Scenario 8: Expiration in past

**Given**:
- Admin is authenticated with scope `access-grants:write`

**When**:
- Admin POSTs with past expiration:
  ```json
  {
    "userId": "user_12345",
    "accessLevel": "READ",
    "expiresAt": "2020-01-01T00:00:00Z"
  }
  ```

**Then**:
- Response status is `400 Bad Request`
- Response body contains:
  ```json
  {
    "error": "VALIDATION_ERROR",
    "message": "Expiration date must be in the future"
  }
  ```

## Request Specification

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| type | string | Yes | Resource type (case, document, etc.) |
| id | string | Yes | Resource identifier |

### Request Body

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| userId | string | Yes | Valid user ID | User to grant access |
| accessLevel | string | Yes | READ, WRITE, ADMIN | Level of access |
| expiresAt | string | No | ISO 8601, future date | Optional expiration timestamp |
| replaceExisting | boolean | No | Default: false | Replace existing grant if any |

### Validation Rules

| Rule | Description |
|------|-------------|
| User uniqueness | User cannot have duplicate grant at same level (unless replaceExisting) |
| Future expiration | expiresAt must be in future if provided |
| Valid access level | Must be READ, WRITE, or ADMIN |
| Resource exists | Resource must exist in system |
| User exists | User must exist in system |

## Response Specification

### Success Response (201 Created)

```json
{
  "id": "grant_xyz789",
  "userId": "user_12345",
  "resourceType": "case",
  "resourceId": "case_abc123",
  "accessLevel": "WRITE",
  "grantedBy": "admin_789",
  "grantedAt": "2025-10-19T10:00:00Z",
  "expiresAt": "2026-01-19T10:00:00Z"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| id | string | Grant identifier (generated) |
| userId | string | User who has access |
| resourceType | string | Type of resource |
| resourceId | string | Resource identifier |
| accessLevel | string | Level of access |
| grantedBy | string | Admin who granted access |
| grantedAt | string | Grant timestamp |
| expiresAt | string \| null | Expiration timestamp |

### Error Responses

| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid input or expiration in past |
| 401 | UNAUTHORIZED | Missing or invalid auth token |
| 403 | FORBIDDEN | Missing `access-grants:write` scope |
| 404 | NOT_FOUND | Resource or user not found |
| 409 | DUPLICATE_GRANT | User already has access at this level |

## Requirements Mapping

- **FR-174**: Accept POST with userId and accessLevel
- **FR-175**: Validate resource exists
- **FR-176**: Validate user exists
- **FR-177**: Validate access level is valid
- **FR-178**: Support optional expiration timestamp
- **FR-179**: Validate expiration is in future
- **FR-180**: Prevent duplicate grants (same user, same level)
- **FR-181**: Support replaceExisting to upgrade grants
- **FR-182**: Record granting admin (grantedBy)
- **FR-183**: Return complete grant details
- **FR-184**: Return 409 for duplicate grants
- **FR-185**: Require `access-grants:write` scope

## Notes

### Access Levels

- **READ**: View/read resource only
- **WRITE**: Modify/update resource
- **ADMIN**: Full control including delete and manage permissions

Access levels are hierarchical in some systems (ADMIN > WRITE > READ).

### Temporary Access

Use `expiresAt` for:
- Guest access for external collaborators
- Time-limited project access
- Temporary elevated permissions
- Compliance with least-privilege principle

Consider background job to cleanup expired grants.

### Replacing Grants

With `replaceExisting: true`:
- Useful for upgrading from READ to WRITE
- Or downgrading from WRITE to READ
- Atomically replaces previous grant
- Maintains single grant per user per resource

Without it, attempting to upgrade results in 409 error.

### Grant Inheritance

This endpoint creates grants on specific resources:
- Does NOT grant access to parent resources
- Does NOT grant access to subresources
- Use separate endpoints for subresource grants
- Or implement grant inheritance in authorization logic

### Audit Trail

Each grant records:
- Who granted it (`grantedBy`)
- When it was granted (`grantedAt`)
- When it expires (`expiresAt`)

Consider additional audit logging for compliance.
