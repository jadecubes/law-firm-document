---
sidebar_position: 6
---

# Release Resource Lock

**API Endpoint**: `DELETE /admin/resource-locks/\{id\}`

**Priority**: P2

**User Story**: As support staff, I want to release a resource lock when I'm done making changes.

## Overview

Release an exclusive lock on a resource to allow other users or support staff to modify it. Should be called when support work is complete to avoid blocking the resource unnecessarily.

## Scenarios

### Scenario 1: Release owned lock

**Given**:
- Support staff has acquired lock `lock_123` on case
- Lock is still active

**When**:
- Support staff DELETEs `/admin/resource-locks/lock_123`

**Then**:
- Response status is `204 No Content`
- Lock is released
- Resource is available for locking by others

### Scenario 2: Lock not found

**Given**:
- No lock with ID exists

**When**:
- Support staff DELETEs non-existent lock

**Then**:
- Response status is `404 Not Found`

### Scenario 3: Release lock owned by different session

**Given**:
- Lock is owned by different support session

**When**:
- Support staff attempts to release it

**Then**:
- Response status is `403 Forbidden`
- Response body contains:
  ```json
  {
    "error": "FORBIDDEN",
    "message": "Cannot release lock owned by another session"
  }
  ```

## Request Specification

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Lock identifier |

## Response Specification

### Success Response (204 No Content)

No response body. Lock has been released.

### Error Responses

| Status | Error Code | Description |
|--------|------------|-------------|
| 401 | UNAUTHORIZED | Missing or invalid auth token |
| 403 | FORBIDDEN | Lock owned by another session |
| 404 | NOT_FOUND | Lock not found or already expired |

## Requirements Mapping

- **FR-278**: Accept DELETE with lock ID
- **FR-279**: Verify lock ownership
- **FR-280**: Delete lock record
- **FR-281**: Return 204 on success
- **FR-282**: Return 403 if not lock owner

## Notes

### Automatic Release

Locks are automatically released:
- When TTL expires
- When support session ends/expires
- When session is revoked

### Best Practices

- Always release locks when done
- Use try/finally to ensure release
- Don't hold locks longer than necessary
- Monitor for orphaned locks
