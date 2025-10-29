---
sidebar_position: 1
---

# Start Support Access Session

**API Endpoint**: `POST /admin/support-access/requests`
**Priority**: P1
**User Story**: As an admin, I want to start a support access (act-as) session to troubleshoot.

## Overview

Initiate a time-limited impersonation session allowing support staff to access the system as a target user with a delegated JWT token for troubleshooting purposes.

## Scenarios

### Scenario 1: Create support session with default TTL

**Given**:
- Support staff is authenticated with scope `support:access:create`
- Target user `user_12345` exists in law firm `firm_abc`
- No active support session exists for this user

**When**:
- Support staff POSTs to `/admin/support-access/requests` with payload:
  ```json
  {
    "lawFirmId": "firm_abc",
    "targetUserId": "user_12345",
    "reason": "User cannot upload documents - investigating permissions"
  }
  ```

**Then**:
- Response status is `201 Created`
- Response body contains:
  | Field | Value | Description |
  |-------|-------|-------------|
  | session.id | Generated UUID | Unique session identifier |
  | session.lawFirmId | "firm_abc" | Law firm context |
  | session.targetUserId | "user_12345" | User being impersonated |
  | session.actorAdminUserId | Support staff ID | Who initiated session |
  | session.reason | "User cannot upload..." | Troubleshooting reason |
  | session.status | "active" | Session state |
  | session.startedAt | Current timestamp | When session began |
  | session.expiresAt | Now + 30 minutes | Session expiration |
  | session.ttlMinutes | 30 | Time to live |
  | delegatedToken | JWT string | Token for impersonation |
  | uiSwitchUrl | URL string | Frontend redirect URL |

- Delegated JWT token contains claims:
  | Claim | Value | Purpose |
  |-------|-------|---------|
  | sub | "user_12345" | Target user ID (primary subject) |
  | act.actorUserId | Support staff ID | Actor performing actions |
  | ctx.lawFirmId | "firm_abc" | Firm context |
  | act_as | true | Indicates impersonation mode |
  | exp | Now + 30 min | Token expiration timestamp |
  | iat | Now | Token issued at |
  | scope | Target user's scopes | Full permissions (if not narrowed) |

### Scenario 2: Create session with custom TTL

**Given**:
- Support staff is authenticated with scope `support:access:create`
- Target user exists

**When**:
- Support staff POSTs with custom TTL:
  ```json
  {
    "lawFirmId": "firm_abc",
    "targetUserId": "user_12345",
    "reason": "Quick permission check",
    "ttlMinutes": 15
  }
  ```

**Then**:
- Response status is `201 Created`
- Session `expiresAt` is 15 minutes from `startedAt`
- Delegated token `exp` claim matches session expiry

### Scenario 3: Create session with narrowed scopes

**Given**:
- Support staff is authenticated with scope `support:access:create`
- Target user has scopes: `["cases:read", "cases:write", "documents:read", "documents:write"]`

**When**:
- Support staff POSTs with scope limitation:
  ```json
  {
    "lawFirmId": "firm_abc",
    "targetUserId": "user_12345",
    "reason": "Check document read permissions only",
    "scopes": ["cases:read", "documents:read"]
  }
  ```

**Then**:
- Response status is `201 Created`
- Delegated token scope claim is `["cases:read", "documents:read"]`
- Support staff cannot perform write operations
- Session is more restricted than target user's full permissions

### Scenario 4: Invalid TTL rejection

**Given**:
- Support staff is authenticated with scope `support:access:create`

**When**:
- Support staff POSTs with TTL below minimum:
  ```json
  {
    "lawFirmId": "firm_abc",
    "targetUserId": "user_12345",
    "reason": "Test",
    "ttlMinutes": 3
  }
  ```

**Then**:
- Response status is `400 Bad Request`
- Response body contains:
  ```json
  {
    "error": "VALIDATION_ERROR",
    "message": "ttlMinutes must be between 5 and 120",
    "field": "ttlMinutes",
    "received": 3,
    "constraints": {"min": 5, "max": 120}
  }
  ```

### Scenario 5: Target user not found

**Given**:
- Support staff is authenticated with scope `support:access:create`
- No user with ID `user_nonexistent`

**When**:
- Support staff POSTs with nonexistent user:
  ```json
  {
    "lawFirmId": "firm_abc",
    "targetUserId": "user_nonexistent",
    "reason": "Test"
  }
  ```

**Then**:
- Response status is `404 Not Found`
- Response body contains:
  ```json
  {
    "error": "USER_NOT_FOUND",
    "message": "User 'user_nonexistent' not found in law firm 'firm_abc'"
  }
  ```

### Scenario 6: Missing required reason

**Given**:
- Support staff is authenticated with scope `support:access:create`

**When**:
- Support staff POSTs without reason:
  ```json
  {
    "lawFirmId": "firm_abc",
    "targetUserId": "user_12345"
  }
  ```

**Then**:
- Response status is `400 Bad Request`
- Response contains validation error for missing `reason` field

## Request Specification

### Request Body

| Field | Type | Required | Constraints | Default | Description |
|-------|------|----------|-------------|---------|-------------|
| lawFirmId | string | Yes | Must exist | - | Target law firm |
| targetUserId | string | Yes | Must exist in firm | - | User to impersonate |
| reason | string | Yes | Min 5 chars, max 500 | - | Justification for access |
| ttlMinutes | integer | No | 5-120 | 30 | Session duration in minutes |
| scopes | string[] | No | Valid scope strings | Target user's scopes | Scope limitation |

### Validation Rules

| Rule | Description |
|------|-------------|
| Required fields | `lawFirmId`, `targetUserId`, `reason` must be provided |
| TTL range | 5 ≤ ttlMinutes ≤ 120 |
| Reason length | 5 ≤ length(reason) ≤ 500 |
| Scopes subset | If provided, scopes must be subset of target user's scopes |
| Firm membership | Target user must be member of specified law firm |

## Response Specification

### Success Response (201 Created)

```json
{
  "session": {
    "id": "session_abc123",
    "lawFirmId": "firm_abc",
    "targetUserId": "user_12345",
    "actorAdminUserId": "admin_789",
    "reason": "User cannot upload documents - investigating permissions",
    "status": "active",
    "startedAt": "2025-10-18T14:30:00Z",
    "expiresAt": "2025-10-18T15:00:00Z",
    "ttlMinutes": 30,
    "scopesNarrowed": false,
    "scopes": null
  },
  "delegatedToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "uiSwitchUrl": "https://app.example.com/switch-user?token=..."
}
```

### Delegated Token Claims

```json
{
  "sub": "user_12345",
  "iss": "https://api.example.com",
  "aud": "law-firm-app",
  "exp": 1729264200,
  "iat": 1729262400,
  "act": {
    "actorUserId": "admin_789"
  },
  "ctx": {
    "lawFirmId": "firm_abc"
  },
  "act_as": true,
  "scope": "cases:read cases:write documents:read documents:write"
}
```

### Error Responses

| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid input (TTL, reason, scopes) |
| 401 | UNAUTHORIZED | Missing or invalid auth token |
| 403 | FORBIDDEN | Missing `support:access:create` scope |
| 404 | LAW_FIRM_NOT_FOUND | Law firm does not exist |
| 404 | USER_NOT_FOUND | Target user not found in firm |
| 409 | ACTIVE_SESSION_EXISTS | User already has active support session |

## Requirements Mapping

- **FR-001**: Accept POST with lawFirmId, targetUserId, reason, ttlMinutes, scopes
- **FR-002**: Validate all required fields present
- **FR-003**: Validate TTL between 5-120 minutes
- **FR-004**: Default TTL to 30 minutes
- **FR-005**: Validate reason minimum 5 characters
- **FR-006**: Create support session record
- **FR-007**: Generate delegated JWT token
- **FR-008**: Include sub claim (target user)
- **FR-009**: Include act claim (actor metadata)
- **FR-010**: Include ctx claim (firm context)
- **FR-011**: Include act_as flag
- **FR-012**: Set exp claim matching session expiry
- **FR-013**: Limit scopes when requested
- **FR-014**: Return session details and token
- **FR-015**: Generate UI switch URL for frontend
- **FR-016**: Prevent multiple active sessions per user
- **FR-017**: Audit log session creation
