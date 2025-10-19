---
sidebar_position: 3
---

# Get Support Session

**API Endpoint**: `GET /admin/support-access/sessions/\{id\}`

**Priority**: P2

**User Story**: As an admin, I want to retrieve details about a specific support access session.

## Overview

Retrieve detailed information about a specific support access session, including its current status, target user, support staff, and session metadata.

## Scenarios

### Scenario 1: Get active session

**Given**:
- Admin is authenticated with scope `support-access:read`
- Session `session_xyz789` exists and is active

**When**:
- Admin GETs `/admin/support-access/sessions/session_xyz789`

**Then**:
- Response status is `200 OK`
- Response body contains complete session details

### Scenario 2: Session not found

**Given**:
- Admin is authenticated with scope `support-access:read`
- No session with ID `session_nonexistent`

**When**:
- Admin GETs `/admin/support-access/sessions/session_nonexistent`

**Then**:
- Response status is `404 Not Found`
- Response body contains:
  ```json
  {
    "error": "NOT_FOUND",
    "message": "Support session with ID 'session_nonexistent' not found"
  }
  ```

## Request Specification

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Support session identifier |

## Response Specification

### Success Response (200 OK)

```json
{
  "id": "session_xyz789",
  "targetUserId": "user_12345",
  "targetUserName": "Jane Doe",
  "actorUserId": "support_789",
  "actorUserName": "Support Staff",
  "lawFirmId": "firm_abc123",
  "reason": "Help user resolve billing issue",
  "status": "ACTIVE",
  "startedAt": "2025-10-19T10:00:00Z",
  "expiresAt": "2025-10-19T10:30:00Z",
  "revokedAt": null,
  "delegatedToken": "eyJhbGc..."
}
```

### Error Responses

| Status | Error Code | Description |
|--------|------------|-------------|
| 401 | UNAUTHORIZED | Missing or invalid auth token |
| 403 | FORBIDDEN | Missing `support-access:read` scope |
| 404 | NOT_FOUND | Session not found |

## Requirements Mapping

- **FR-261**: Accept GET with session ID parameter
- **FR-262**: Return complete session details
- **FR-263**: Return 404 if session not found
- **FR-264**: Require `support-access:read` scope
