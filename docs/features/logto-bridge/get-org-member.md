---
sidebar_position: 3
---

# Get Org Member

**API Endpoint**: `GET /admin/logto/orgs/{lawFirmId}/members/{userId}`

**Priority**: P2

**User Story**: As an admin, I want to retrieve details about a specific organization member including their roles.

## Overview

Retrieve detailed information about a specific member of a law firm's Logto organization, including their assigned organization roles and membership metadata.

## Scenarios

### Scenario 1: Get existing member

**Given**:
- Admin is authenticated with scope `logto-orgs:read`
- Law firm `firm_abc123` exists with Logto organization
- User `user_12345` is a member of the organization

**When**:
- Admin GETs `/admin/logto/orgs/firm_abc123/members/user_12345`

**Then**:
- Response status is `200 OK`
- Response body contains:
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

### Scenario 2: Member not found in organization

**Given**:
- Admin is authenticated with scope `logto-orgs:read`
- Law firm and organization exist
- User `user_67890` exists in Logto but is not an org member

**When**:
- Admin GETs `/admin/logto/orgs/firm_abc123/members/user_67890`

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
- Admin is authenticated with scope `logto-orgs:read`
- No law firm with ID `firm_nonexistent`

**When**:
- Admin GETs `/admin/logto/orgs/firm_nonexistent/members/user_12345`

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
- Admin is authenticated with scope `logto-orgs:read`
- Law firm exists
- No Logto user with ID `user_nonexistent`

**When**:
- Admin GETs `/admin/logto/orgs/firm_abc123/members/user_nonexistent`

**Then**:
- Response status is `404 Not Found`
- Response body contains:
  ```json
  {
    "error": "NOT_FOUND",
    "message": "Logto user with ID 'user_nonexistent' not found"
  }
  ```

## Request Specification

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| lawFirmId | string | Yes | Law firm identifier |
| userId | string | Yes | Logto user identifier |

## Response Specification

### Success Response (200 OK)

```json
{
  "logtoUserId": "user_12345",
  "email": "jane.doe@example.com",
  "name": "Jane Doe",
  "avatar": "https://avatar.example.com/jane.jpg",
  "phoneNumber": "+1-555-0100",
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
| phoneNumber | string \| null | User's phone number |
| orgRoles | array | Array of organization role names |
| joinedAt | string | Timestamp when user joined org |

### Error Responses

| Status | Error Code | Description |
|--------|------------|-------------|
| 401 | UNAUTHORIZED | Missing or invalid auth token |
| 403 | FORBIDDEN | Missing `logto-orgs:read` scope |
| 404 | NOT_FOUND | Law firm, user, or membership not found |
| 503 | SERVICE_UNAVAILABLE | Logto service unreachable |

## Requirements Mapping

- **FR-099**: Accept GET with lawFirmId and userId parameters
- **FR-100**: Resolve law firm's logtoOrgId
- **FR-101**: Query Logto Management API for member details
- **FR-102**: Return member information with roles
- **FR-103**: Return 404 if user not member of org
- **FR-104**: Return 404 if Logto user doesn't exist
- **FR-105**: Include user metadata (email, name, avatar, phone)
- **FR-106**: Require `logto-orgs:read` scope

## Notes

### Use Cases

This endpoint is useful for:
- Verifying a user's organization membership
- Checking what roles a user has in an organization
- Displaying member details in admin interfaces
- Audit logging of member information

### Member vs Profile

This endpoint returns Logto organization membership data, not law firm profile data:
- **This endpoint**: Logto user + org roles
- **GET /admin/law-firms/\{lawFirmId\}/profiles**: Law firm profile + functional roles

A user may have both (Logto membership + law firm profile) or just one.

### Real-Time Data

This endpoint queries Logto Management API in real-time:
- Always returns current state from Logto
- No local caching of member data
- May experience latency based on Logto service
