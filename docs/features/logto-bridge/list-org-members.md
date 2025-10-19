---
sidebar_position: 1
---

# List Org Members

**API Endpoint**: `GET /admin/logto/orgs/{lawFirmId}/members`

**Priority**: P1

**User Story**: As an admin, I want to list all members of a law firm's Logto organization with their roles.

## Overview

Retrieve all members of a Logto organization associated with a law firm, including their organization roles and membership status. This endpoint bridges to Logto's organization member management.

## Scenarios

### Scenario 1: List organization members

**Given**:
- Admin is authenticated with scope `logto-orgs:read`
- Law firm `firm_abc123` exists with `logtoOrgId: "org_xyz789"`
- Organization has 3 members

**When**:
- Admin GETs `/admin/logto/orgs/firm_abc123/members`

**Then**:
- Response status is `200 OK`
- Response body contains:
  ```json
  {
    "data": [
      {
        "logtoUserId": "user_001",
        "email": "jane.doe@example.com",
        "name": "Jane Doe",
        "orgRoles": ["admin", "lawyer"],
        "joinedAt": "2024-01-15T10:00:00Z"
      },
      {
        "logtoUserId": "user_002",
        "email": "john.smith@example.com",
        "name": "John Smith",
        "orgRoles": ["member"],
        "joinedAt": "2024-03-20T14:30:00Z"
      },
      {
        "logtoUserId": "user_003",
        "email": "alice.johnson@example.com",
        "name": "Alice Johnson",
        "orgRoles": ["paralegal"],
        "joinedAt": "2024-06-10T09:15:00Z"
      }
    ]
  }
  ```

### Scenario 2: Empty organization

**Given**:
- Admin is authenticated with scope `logto-orgs:read`
- Law firm exists but organization has no members

**When**:
- Admin GETs `/admin/logto/orgs/firm_abc123/members`

**Then**:
- Response status is `200 OK`
- Response body contains:
  ```json
  {
    "data": []
  }
  ```

### Scenario 3: Law firm not found

**Given**:
- Admin is authenticated with scope `logto-orgs:read`
- No law firm with ID `firm_nonexistent`

**When**:
- Admin GETs `/admin/logto/orgs/firm_nonexistent/members`

**Then**:
- Response status is `404 Not Found`
- Response body contains:
  ```json
  {
    "error": "NOT_FOUND",
    "message": "Law firm with ID 'firm_nonexistent' not found"
  }
  ```

### Scenario 4: Law firm has no Logto org

**Given**:
- Admin is authenticated with scope `logto-orgs:read`
- Law firm exists but `logtoOrgId` is null (edge case)

**When**:
- Admin GETs `/admin/logto/orgs/firm_abc123/members`

**Then**:
- Response status is `404 Not Found`
- Response body contains:
  ```json
  {
    "error": "NOT_FOUND",
    "message": "Law firm 'firm_abc123' has no associated Logto organization"
  }
  ```

### Scenario 5: Filter by role

**Given**:
- Admin is authenticated with scope `logto-orgs:read`
- Organization has members with various roles

**When**:
- Admin GETs `/admin/logto/orgs/firm_abc123/members?role=admin`

**Then**:
- Response status is `200 OK`
- Response contains only members with "admin" role
- Members without admin role are excluded

## Request Specification

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| lawFirmId | string | Yes | Law firm identifier |

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| role | string | No | (all) | Filter by organization role |

## Response Specification

### Success Response (200 OK)

```json
{
  "data": [
    {
      "logtoUserId": "user_xyz789",
      "email": "jane.doe@example.com",
      "name": "Jane Doe",
      "avatar": "https://avatar.example.com/jane.jpg",
      "orgRoles": ["admin", "lawyer"],
      "joinedAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| data | array | Array of organization member objects |
| data[].logtoUserId | string | Logto user identifier |
| data[].email | string \| null | User's email address |
| data[].name | string \| null | User's display name |
| data[].avatar | string \| null | Avatar URL |
| data[].orgRoles | array | Array of organization role names |
| data[].joinedAt | string | Timestamp when user joined org |

### Error Responses

| Status | Error Code | Description |
|--------|------------|-------------|
| 401 | UNAUTHORIZED | Missing or invalid auth token |
| 403 | FORBIDDEN | Missing `logto-orgs:read` scope |
| 404 | NOT_FOUND | Law firm not found or no Logto org |
| 503 | SERVICE_UNAVAILABLE | Logto service unreachable |

## Requirements Mapping

- **FR-081**: Accept GET with lawFirmId path parameter
- **FR-082**: Resolve law firm's logtoOrgId
- **FR-083**: Query Logto Management API for organization members
- **FR-084**: Return array of members with roles
- **FR-085**: Support filtering by organization role
- **FR-086**: Include user metadata (email, name, avatar)
- **FR-087**: Return empty array when no members
- **FR-088**: Handle missing Logto organization gracefully
- **FR-089**: Require `logto-orgs:read` scope

## Notes

### Logto Integration

This endpoint makes real-time calls to Logto Management API:
- Uses law firm's `logtoOrgId` to query organization members
- Returns data directly from Logto (no local caching)
- May experience latency based on Logto service performance

### Organization Roles

Organization roles are defined in Logto and may include:
- `admin` - Organization administrator
- `member` - Basic member
- `lawyer`, `paralegal`, `billing` - Custom firm-specific roles

These are separate from functional roles in user profiles.

### Automatic Sync

Since Logto organizations are automatically created/deleted with law firms:
- This endpoint always reflects current Logto state
- No manual sync required
- Members added via this API are immediately visible
