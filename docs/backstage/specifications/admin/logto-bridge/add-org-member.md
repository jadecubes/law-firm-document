---
sidebar_position: 2
---

# Add Org Member

**API Endpoint**: `POST /admin/logto/orgs/{lawFirmId}/members`

**Priority**: P1

**User Story**: As an admin, I want to add a user to a law firm's Logto organization with specific roles.

## Overview

Add an existing Logto user to a law firm's organization with designated organization roles. This grants the user access to organization-scoped resources and enables role-based permissions within the firm.

## Scenarios

### Scenario 1: Add member with single role

**Given**:
- Admin is authenticated with scope `logto-orgs:write`
- Law firm `firm_abc123` exists with `logtoOrgId: "org_xyz789"`
- Logto user `user_12345` exists
- User is not currently a member of organization

**When**:
- Admin POSTs to `/admin/logto/orgs/firm_abc123/members` with payload:
  ```json
  {
    "logtoUserId": "user_12345",
    "orgRoles": ["member"]
  }
  ```

**Then**:
- Response status is `201 Created`
- Response body contains:
  ```json
  {
    "logtoUserId": "user_12345",
    "email": "john.doe@example.com",
    "name": "John Doe",
    "orgRoles": ["member"],
    "joinedAt": "2025-10-19T10:00:00Z"
  }
  ```
- User is added to Logto organization
- User can now access organization resources

### Scenario 2: Add member with multiple roles

**Given**:
- Admin is authenticated with scope `logto-orgs:write`
- Law firm and Logto user exist
- User is not an org member

**When**:
- Admin POSTs with multiple roles:
  ```json
  {
    "logtoUserId": "user_67890",
    "orgRoles": ["admin", "lawyer", "billing"]
  }
  ```

**Then**:
- Response status is `201 Created`
- User is added with all specified roles
- User receives combined permissions from all roles

### Scenario 3: User already a member

**Given**:
- Admin is authenticated with scope `logto-orgs:write`
- User `user_12345` is already a member of organization

**When**:
- Admin attempts to add user again:
  ```json
  {
    "logtoUserId": "user_12345",
    "orgRoles": ["admin"]
  }
  ```

**Then**:
- Response status is `409 Conflict`
- Response body contains:
  ```json
  {
    "error": "ALREADY_MEMBER",
    "message": "User 'user_12345' is already a member of organization. Use PUT /members/{userId}/roles to update roles."
  }
  ```

### Scenario 4: Invalid organization role

**Given**:
- Admin is authenticated with scope `logto-orgs:write`

**When**:
- Admin POSTs with invalid role:
  ```json
  {
    "logtoUserId": "user_12345",
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

### Scenario 5: Logto user not found

**Given**:
- Admin is authenticated with scope `logto-orgs:write`
- No Logto user with ID `user_nonexistent`

**When**:
- Admin POSTs:
  ```json
  {
    "logtoUserId": "user_nonexistent",
    "orgRoles": ["member"]
  }
  ```

**Then**:
- Response status is `404 Not Found`
- Response body contains:
  ```json
  {
    "error": "NOT_FOUND",
    "message": "Logto user with ID 'user_nonexistent' not found"
  }
  ```

### Scenario 6: Empty roles array

**Given**:
- Admin is authenticated with scope `logto-orgs:write`

**When**:
- Admin POSTs with empty roles:
  ```json
  {
    "logtoUserId": "user_12345",
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

## Request Specification

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| lawFirmId | string | Yes | Law firm identifier |

### Request Body

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| logtoUserId | string | Yes | Valid Logto user ID | User to add to organization |
| orgRoles | array | Yes | Non-empty array of valid role names | Organization roles to assign |

### Validation Rules

| Rule | Description |
|------|-------------|
| User uniqueness | User cannot already be org member |
| Roles non-empty | Must provide at least one role |
| Role validity | All roles must exist in Logto organization |
| User exists | Logto user must exist |

## Response Specification

### Success Response (201 Created)

```json
{
  "logtoUserId": "user_12345",
  "email": "john.doe@example.com",
  "name": "John Doe",
  "avatar": "https://avatar.example.com/john.jpg",
  "orgRoles": ["admin", "lawyer"],
  "joinedAt": "2025-10-19T10:00:00Z"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| logtoUserId | string | Logto user identifier |
| email | string \| null | User's email address |
| name | string \| null | User's display name |
| avatar | string \| null | Avatar URL |
| orgRoles | array | Assigned organization roles |
| joinedAt | string | Timestamp when user joined org |

### Error Responses

| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid roles or empty roles array |
| 401 | UNAUTHORIZED | Missing or invalid auth token |
| 403 | FORBIDDEN | Missing `logto-orgs:write` scope |
| 404 | NOT_FOUND | Law firm or Logto user not found |
| 409 | ALREADY_MEMBER | User already in organization |
| 503 | SERVICE_UNAVAILABLE | Logto service unreachable |

## Requirements Mapping

- **FR-090**: Accept POST with logtoUserId and orgRoles
- **FR-091**: Validate user is not already org member
- **FR-092**: Validate all roles are defined in organization
- **FR-093**: Require at least one role
- **FR-094**: Call Logto Management API to add member
- **FR-095**: Return member details with assigned roles
- **FR-096**: Return 409 if user already member
- **FR-097**: Return 404 if Logto user not found
- **FR-098**: Require `logto-orgs:write` scope

## Notes

### Member vs Profile

Adding a user to a Logto organization (this endpoint) is separate from creating a user profile in the law firm:
- **This endpoint**: Adds Logto user to org for RBAC
- **Provision User endpoint**: Creates law firm profile with functional roles

Both may be needed for complete user setup.

### Organization Roles

Organization roles are managed in Logto and define permissions:
- **Predefined**: `admin`, `member`
- **Custom**: Defined per organization (e.g., `lawyer`, `paralegal`, `billing`)

Use `GET /admin/logto/org-roles` to list available roles.

### Invitation Flow

For new users who don't have Logto accounts yet:
1. Create Logto user (via separate Logto API or invitation)
2. Use this endpoint to add them to organization
3. User receives invitation email from Logto
4. User accepts and joins organization

### Automatic Cleanup

When a law firm is deleted:
- Logto organization is automatically deleted
- All memberships are removed
- No manual cleanup required
