---
sidebar_position: 5
---

# Update Member Roles

**API Endpoint**: `PUT /admin/logto/orgs/{lawFirmId}/members/{userId}/roles`

**Priority**: P1

**User Story**: As an admin, I want to update the organization roles assigned to a member.

## Overview

Update the organization roles for an existing member of a law firm's Logto organization. This replaces all current roles with the new set of roles provided.

## Scenarios

### Scenario 1: Update member roles

**Given**:
- Admin is authenticated with scope `logto-orgs:write`
- Law firm `firm_abc123` exists with Logto organization
- User `user_12345` is a member with roles `["member"]`

**When**:
- Admin PUTs to `/admin/logto/orgs/firm_abc123/members/user_12345/roles` with payload:
  ```json
  {
    "orgRoles": ["admin", "lawyer"]
  }
  ```

**Then**:
- Response status is `200 OK`
- Response body contains:
  ```json
  {
    "logtoUserId": "user_12345",
    "email": "jane.doe@example.com",
    "name": "Jane Doe",
    "orgRoles": ["admin", "lawyer"],
    "joinedAt": "2024-01-15T10:00:00Z"
  }
  ```
- User's previous roles are replaced with new roles
- User immediately receives permissions from new roles

### Scenario 2: Promote member to admin

**Given**:
- Admin is authenticated with scope `logto-orgs:write`
- User has role `["member"]`

**When**:
- Admin PUTs with admin role:
  ```json
  {
    "orgRoles": ["admin"]
  }
  ```

**Then**:
- Response status is `200 OK`
- User's role is updated to `["admin"]`
- Previous `["member"]` role is removed
- User gains admin permissions

### Scenario 3: Assign multiple roles

**Given**:
- Admin is authenticated with scope `logto-orgs:write`
- User has role `["member"]`

**When**:
- Admin PUTs with multiple roles:
  ```json
  {
    "orgRoles": ["member", "lawyer", "billing"]
  }
  ```

**Then**:
- Response status is `200 OK`
- User has all three roles
- User receives combined permissions from all roles

### Scenario 4: User not in organization

**Given**:
- Admin is authenticated with scope `logto-orgs:write`
- User `user_67890` is not a member of organization

**When**:
- Admin PUTs to `/admin/logto/orgs/firm_abc123/members/user_67890/roles`

**Then**:
- Response status is `404 Not Found`
- Response body contains:
  ```json
  {
    "error": "NOT_FOUND",
    "message": "User 'user_67890' is not a member of organization for law firm 'firm_abc123'"
  }
  ```

### Scenario 5: Invalid organization role

**Given**:
- Admin is authenticated with scope `logto-orgs:write`
- User is an org member

**When**:
- Admin PUTs with invalid role:
  ```json
  {
    "orgRoles": ["invalid_role"]
  }
  ```

**Then**:
- Response status is `400 Bad Request`
- Response body contains:
  ```json
  {
    "error": "VALIDATION_ERROR",
    "message": "Invalid organization role",
    "details": [
      {
        "field": "orgRoles",
        "message": "Role 'invalid_role' is not defined for this organization. Available roles: admin, member, lawyer, paralegal, billing"
      }
    ]
  }
  ```

### Scenario 6: Empty roles array

**Given**:
- Admin is authenticated with scope `logto-orgs:write`
- User is an org member

**When**:
- Admin PUTs with empty roles:
  ```json
  {
    "orgRoles": []
  }
  ```

**Then**:
- Response status is `400 Bad Request`
- Response body contains:
  ```json
  {
    "error": "VALIDATION_ERROR",
    "message": "At least one organization role is required",
    "details": [
      {
        "field": "orgRoles",
        "message": "Array must contain at least one role"
      }
    ]
  }
  ```

### Scenario 7: Duplicate roles in request

**Given**:
- Admin is authenticated with scope `logto-orgs:write`
- User is an org member

**When**:
- Admin PUTs with duplicate roles:
  ```json
  {
    "orgRoles": ["admin", "member", "admin"]
  }
  ```

**Then**:
- Response status is `200 OK`
- Duplicate roles are deduplicated
- Response contains unique roles: `["admin", "member"]`

## Request Specification

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| lawFirmId | string | Yes | Law firm identifier |
| userId | string | Yes | Logto user identifier |

### Request Body

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| orgRoles | array | Yes | Non-empty array of valid role names | New organization roles (replaces all existing) |

### Validation Rules

| Rule | Description |
|------|-------------|
| User membership | User must be member of organization |
| Roles non-empty | Must provide at least one role |
| Role validity | All roles must exist in Logto organization |
| Duplicates | Duplicate roles are automatically deduplicated |

## Response Specification

### Success Response (200 OK)

```json
{
  "logtoUserId": "user_12345",
  "email": "jane.doe@example.com",
  "name": "Jane Doe",
  "avatar": "https://avatar.example.com/jane.jpg",
  "orgRoles": ["admin", "lawyer"],
  "joinedAt": "2024-01-15T10:00:00Z"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| logtoUserId | string | Logto user identifier |
| email | string \| null | User's email address |
| name | string \| null | User's display name |
| avatar | string \| null | Avatar URL |
| orgRoles | array | Updated organization roles |
| joinedAt | string | Original join timestamp (unchanged) |

### Error Responses

| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid roles or empty roles array |
| 401 | UNAUTHORIZED | Missing or invalid auth token |
| 403 | FORBIDDEN | Missing `logto-orgs:write` scope |
| 404 | NOT_FOUND | Law firm, user, or membership not found |
| 503 | SERVICE_UNAVAILABLE | Logto service unreachable |

## Requirements Mapping

- **FR-116**: Accept PUT with userId and orgRoles
- **FR-117**: Verify user is member of organization
- **FR-118**: Validate all roles are defined in organization
- **FR-119**: Require at least one role
- **FR-120**: Replace all existing roles with new roles
- **FR-121**: Deduplicate roles if duplicates provided
- **FR-122**: Call Logto Management API to update roles
- **FR-123**: Return updated member details
- **FR-124**: Return 404 if user not member
- **FR-125**: Require `logto-orgs:write` scope

## Notes

### PUT vs PATCH Semantics

This endpoint uses PUT (full replacement), not PATCH (partial update):
- All existing roles are removed
- Only roles in request body are assigned
- To add a role, include all existing roles plus the new one
- To remove a role, include all existing roles except the one to remove

**Example - Adding a role**:
```json
// Current roles: ["member"]
// To add "lawyer", send: ["member", "lawyer"]
```

**Example - Removing a role**:
```json
// Current roles: ["member", "lawyer", "billing"]
// To remove "billing", send: ["member", "lawyer"]
```

### Role Hierarchy

Organization roles may have hierarchical permissions in Logto:
- `admin` may inherit all `member` permissions
- Assigning `admin` may not require also assigning `member`

Check your Logto organization role configuration.

### Immediate Effect

Role changes take effect immediately:
- User's next request will use new permissions
- Active sessions may need to refresh tokens
- No delay or propagation time

### Audit Logging

Consider logging role updates for compliance:
- Who made the change
- Previous roles
- New roles
- Timestamp
- Reason (if captured separately)
