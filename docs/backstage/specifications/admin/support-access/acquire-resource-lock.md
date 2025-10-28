---
sidebar_position: 5
---

# Acquire Resource Lock

**API Endpoint**: `POST /admin/resource-locks`

**Priority**: P2

**User Story**: As support staff, I want to acquire a lock on a resource before making changes to prevent conflicts with user actions.

## Overview

Acquire an exclusive lock on a resource to prevent concurrent modifications during support access. Ensures that when support staff is working on a user's behalf, the resource is protected from simultaneous edits.

## Scenarios

### Scenario 1: Acquire lock successfully

**Given**:
- Support staff is authenticated with active support session
- Case `case_abc123` exists
- No existing lock on case

**When**:
- Support staff POSTs to `/admin/resource-locks` with payload:
  ```json
  {
    "resourceType": "case",
    "resourceId": "case_abc123",
    "sessionId": "session_xyz789",
    "reason": "Updating case details on behalf of user"
  }
  ```

**Then**:
- Response status is `201 Created`
- Response body contains:
  ```json
  {
    "id": "lock_123",
    "resourceType": "case",
    "resourceId": "case_abc123",
    "lockHolder": "support_789",
    "sessionId": "session_xyz789",
    "acquiredAt": "2025-10-19T10:00:00Z",
    "expiresAt": "2025-10-19T10:15:00Z"
  }
  ```

### Scenario 2: Resource already locked

**Given**:
- Resource is locked by another session

**When**:
- Support staff attempts to acquire lock

**Then**:
- Response status is `409 Conflict`
- Response body contains:
  ```json
  {
    "error": "RESOURCE_LOCKED",
    "message": "Resource 'case:case_abc123' is locked by another session",
    "lockHolder": "support_456",
    "expiresAt": "2025-10-19T10:10:00Z"
  }
  ```

## Request Specification

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| resourceType | string | Yes | Type of resource to lock |
| resourceId | string | Yes | Resource identifier |
| sessionId | string | Yes | Support session ID |
| reason | string | No | Reason for lock |
| ttlSeconds | integer | No | Lock TTL (default: 900 = 15 min) |

## Response Specification

### Success Response (201 Created)

```json
{
  "id": "lock_xyz789",
  "resourceType": "case",
  "resourceId": "case_abc123",
  "lockHolder": "support_789",
  "sessionId": "session_xyz789",
  "reason": "Updating case details",
  "acquiredAt": "2025-10-19T10:00:00Z",
  "expiresAt": "2025-10-19T10:15:00Z"
}
```

### Error Responses

| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid input |
| 401 | UNAUTHORIZED | Missing or invalid auth token |
| 404 | NOT_FOUND | Resource not found |
| 409 | RESOURCE_LOCKED | Resource already locked |

## Requirements Mapping

- **FR-273**: Accept POST with resource and session details
- **FR-274**: Check if resource is already locked
- **FR-275**: Create lock with expiration
- **FR-276**: Return 409 if locked by another session
- **FR-277**: Auto-release lock on expiration
