---
sidebar_position: 4
---

# Revoke Support Session

**API Endpoint**: `DELETE /admin/support-access/sessions/\{id\}`

**Priority**: P1

**User Story**: As an admin, I want to revoke an active support access session to immediately terminate impersonation.

## Overview

Revoke an active support access session before it naturally expires. This immediately invalidates the delegated token and prevents further use of the session.

## Scenarios

### Scenario 1: Revoke active session

**Given**:
- Admin is authenticated with scope `support-access:revoke`
- Session `session_xyz789` is active

**When**:
- Admin DELETEs `/admin/support-access/sessions/session_xyz789`

**Then**:
- Response status is `204 No Content`
- Session status changed to REVOKED
- Delegated token is invalidated
- Subsequent use of token returns 401

### Scenario 2: Revoke already revoked session

**Given**:
- Admin is authenticated with scope `support-access:revoke`
- Session is already revoked

**When**:
- Admin DELETEs session

**Then**:
- Response status is `204 No Content`
- Operation is idempotent

### Scenario 3: Revoke expired session

**Given**:
- Admin is authenticated with scope `support-access:revoke`
- Session has already expired

**When**:
- Admin DELETEs session

**Then**:
- Response status is `204 No Content`
- Status remains EXPIRED (not changed to REVOKED)

### Scenario 4: Session not found

**Given**:
- Admin is authenticated with scope `support-access:revoke`
- No session with ID exists

**When**:
- Admin DELETEs non-existent session

**Then**:
- Response status is `404 Not Found`

## Request Specification

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | Support session identifier |

## Response Specification

### Success Response (204 No Content)

No response body. Session has been revoked.

### Error Responses

| Status | Error Code | Description |
|--------|------------|-------------|
| 401 | UNAUTHORIZED | Missing or invalid auth token |
| 403 | FORBIDDEN | Missing `support-access:revoke` scope |
| 404 | NOT_FOUND | Session not found |

## Requirements Mapping

- **FR-265**: Accept DELETE with session ID
- **FR-266**: Set session status to REVOKED
- **FR-267**: Record revokedAt timestamp
- **FR-268**: Record revokedBy admin
- **FR-269**: Invalidate delegated token
- **FR-270**: Return 204 on success
- **FR-271**: Operation is idempotent
- **FR-272**: Require `support-access:revoke` scope

## Notes

### Immediate Effect

Revocation takes effect immediately:
- Delegated token is blacklisted
- Next API call with token returns 401
- Support staff loses access instantly

### Audit Trail

Revocation is logged:
- Who revoked (revokedBy)
- When revoked (revokedAt)
- Important for security investigations

### Use Cases

Revoke sessions when:
- Support task is complete
- Suspicious activity detected
- Support staff leaves organization
- User requests access termination
- Security incident response
