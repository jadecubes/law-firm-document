---
sidebar_position: 6
---

# Revoke Grant

**API Endpoint**: `DELETE /admin/resources/{type}/{id}/access-grants/{userId}/{level}`

**Priority**: P1

**User Story**: As an admin, I want to revoke a user's access to a resource.

## Overview

Revoke a specific access grant for a user on a resource. This permanently removes the user's access at the specified level. The operation is idempotent and returns success even if the grant doesn't exist.

## Scenarios

### Scenario 1: Revoke existing grant

**Given**:
- Admin is authenticated with scope `access-grants:write`
- Case `case_abc123` exists
- User `user_12345` has READ access to case

**When**:
- Admin DELETEs `/admin/resources/case/case_abc123/access-grants/user_12345/READ`

**Then**:
- Response status is `204 No Content`
- User's READ access is revoked
- User can no longer read the case
- Grant is permanently deleted

### Scenario 2: Grant does not exist

**Given**:
- Admin is authenticated with scope `access-grants:write`
- Case exists
- User does not have WRITE access to case

**When**:
- Admin DELETEs `/admin/resources/case/case_abc123/access-grants/user_12345/WRITE`

**Then**:
- Response status is `204 No Content`
- Operation succeeds (idempotent)
- No error is returned

### Scenario 3: Revoke one of multiple access levels

**Given**:
- Admin is authenticated with scope `access-grants:write`
- User has both READ and WRITE grants on case

**When**:
- Admin DELETEs READ grant: `/admin/resources/case/case_abc123/access-grants/user_12345/READ`

**Then**:
- Response status is `204 No Content`
- READ grant is revoked
- WRITE grant remains active
- User still has WRITE access

### Scenario 4: Resource not found

**Given**:
- Admin is authenticated with scope `access-grants:write`
- No case with ID `case_nonexistent`

**When**:
- Admin DELETEs `/admin/resources/case/case_nonexistent/access-grants/user_12345/READ`

**Then**:
- Response status is `404 Not Found`
- Response body contains:
  ```json
  {
    "error": "NOT_FOUND",
    "message": "Resource 'case:case_nonexistent' not found"
  }
  ```

### Scenario 5: Invalid access level

**Given**:
- Admin is authenticated with scope `access-grants:write`

**When**:
- Admin DELETEs with invalid level: `/admin/resources/case/case_abc123/access-grants/user_12345/INVALID`

**Then**:
- Response status is `400 Bad Request`
- Response body contains:
  ```json
  {
    "error": "VALIDATION_ERROR",
    "message": "Invalid access level 'INVALID'. Must be one of: READ, WRITE, ADMIN"
  }
  ```

### Scenario 6: Invalid resource type

**Given**:
- Admin is authenticated with scope `access-grants:write`

**When**:
- Admin DELETEs with invalid type: `/admin/resources/invalid_type/some_id/access-grants/user_12345/READ`

**Then**:
- Response status is `400 Bad Request`
- Response body contains:
  ```json
  {
    "error": "VALIDATION_ERROR",
    "message": "Invalid resource type 'invalid_type'. Valid types: case, document, client, matter"
  }
  ```

## Request Specification

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| type | string | Yes | Resource type (case, document, etc.) |
| id | string | Yes | Resource identifier |
| userId | string | Yes | User whose access to revoke |
| level | string | Yes | Access level to revoke (READ, WRITE, ADMIN) |

## Response Specification

### Success Response (204 No Content)

No response body. The grant has been successfully revoked or did not exist.

### Error Responses

| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid resource type or access level |
| 401 | UNAUTHORIZED | Missing or invalid auth token |
| 403 | FORBIDDEN | Missing `access-grants:write` scope |
| 404 | NOT_FOUND | Resource not found |

## Requirements Mapping

- **FR-186**: Accept DELETE with type, id, userId, and level parameters
- **FR-187**: Validate resource type is supported
- **FR-188**: Validate access level is valid (READ, WRITE, ADMIN)
- **FR-189**: Verify resource exists (return 404 if not)
- **FR-190**: Delete grant if it exists
- **FR-191**: Return 204 No Content on success
- **FR-192**: Operation is idempotent (204 even if grant doesn't exist)
- **FR-193**: Record revocation in audit log (if implemented)
- **FR-194**: Require `access-grants:write` scope

## Notes

### Idempotency

This endpoint is idempotent:
- First DELETE: Revokes grant, returns 204
- Subsequent DELETEs: No grant to revoke, still returns 204
- Safe to retry without side effects
- Simplifies error handling in clients

### Resource Validation

The endpoint validates resource exists:
- Returns 404 if resource not found
- Ensures you can't revoke grants on non-existent resources
- Helps catch errors in client code

### User Validation

The endpoint does NOT validate user exists:
- User may be deleted but grant remains
- Revoking grant for deleted user succeeds (cleanup)
- No error if userId is invalid (idempotent behavior)

### Multiple Access Levels

If user has multiple access levels:
- Must revoke each level separately
- DELETE .../READ revokes only READ
- DELETE .../WRITE revokes only WRITE
- To revoke all access, delete all levels

### Audit Logging

Consider logging revocations:
- Who revoked the grant
- When it was revoked
- What grant was revoked
- Why (if captured separately)

Important for compliance and security investigations.

### Immediate Effect

Revocation takes effect immediately:
- User's next request will be denied
- Active sessions should check permissions
- No propagation delay
- Consider invalidating user's cached permissions

### Cascading Revocations

When revoking grants, consider:
- Does not revoke subresource grants
- Does not revoke grants on related resources
- Only affects specified resource
- May need multiple API calls for complete cleanup

### Offboarding

When removing user from system:
1. Get all grants for user (via search endpoint)
2. Revoke each grant individually
3. Or implement bulk revocation endpoint
4. Then deactivate/delete user profile

### Unintended Revocation

To prevent accidental revocation:
- Implement confirmation in UI
- Log all revocations for audit
- Consider soft-delete with restore option
- Or require reason/justification in request body
