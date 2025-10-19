---
sidebar_position: 9
---

# Revoke Subresource Grant

**API Endpoint**: `DELETE /admin/resources/{type}/{id}/subresources/{subtype}/{subid}/access-grants/{userId}/{level}`

**Priority**: P1

**User Story**: As an admin, I want to revoke a user's access to a specific subresource.

## Overview

Revoke a specific access grant for a user on a subresource. This removes the user's explicit access at the specified level. The operation is idempotent. Note that the user may still have access via parent resource grants.

## Scenarios

### Scenario 1: Revoke existing subresource grant

**Given**:
- Admin is authenticated with scope `access-grants:write`
- Case `case_abc123` exists
- Document `doc_xyz456` exists as subresource of case
- User `user_12345` has READ access to document

**When**:
- Admin DELETEs `/admin/resources/case/case_abc123/subresources/document/doc_xyz456/access-grants/user_12345/READ`

**Then**:
- Response status is `204 No Content`
- User's READ access to document is revoked
- Grant is permanently deleted
- User may still have access via parent case grant

### Scenario 2: Grant does not exist

**Given**:
- Admin is authenticated with scope `access-grants:write`
- Subresource exists
- User does not have WRITE access to subresource

**When**:
- Admin DELETEs WRITE grant

**Then**:
- Response status is `204 No Content`
- Operation succeeds (idempotent)
- No error is returned

### Scenario 3: User retains access via parent

**Given**:
- Admin is authenticated with scope `access-grants:write`
- User has ADMIN access to parent case
- User also has explicit READ grant on document

**When**:
- Admin DELETEs READ grant on document

**Then**:
- Response status is `204 No Content`
- Explicit READ grant is revoked
- User still has access via parent case ADMIN grant
- Effective access determined by authorization logic

### Scenario 4: Parent resource not found

**Given**:
- Admin is authenticated with scope `access-grants:write`
- No case with ID `case_nonexistent`

**When**:
- Admin DELETEs grant on subresource of non-existent parent

**Then**:
- Response status is `404 Not Found`
- Response body contains:
  ```json
  {
    "error": "NOT_FOUND",
    "message": "Parent resource 'case:case_nonexistent' not found"
  }
  ```

### Scenario 5: Subresource not found

**Given**:
- Admin is authenticated with scope `access-grants:write`
- Case exists
- No document `doc_nonexistent` in case

**When**:
- Admin DELETEs grant on non-existent subresource

**Then**:
- Response status is `404 Not Found`
- Response body contains:
  ```json
  {
    "error": "NOT_FOUND",
    "message": "Subresource 'document:doc_nonexistent' not found in parent 'case:case_abc123'"
  }
  ```

### Scenario 6: Invalid access level

**Given**:
- Admin is authenticated with scope `access-grants:write`

**When**:
- Admin DELETEs with invalid level: `.../access-grants/user_12345/INVALID`

**Then**:
- Response status is `400 Bad Request`
- Response body contains:
  ```json
  {
    "error": "VALIDATION_ERROR",
    "message": "Invalid access level 'INVALID'. Must be one of: READ, WRITE, ADMIN"
  }
  ```

### Scenario 7: Invalid subresource type

**Given**:
- Admin is authenticated with scope `access-grants:write`

**When**:
- Admin DELETEs with invalid subtype: `.../subresources/invalid_type/...`

**Then**:
- Response status is `400 Bad Request`
- Response body contains:
  ```json
  {
    "error": "VALIDATION_ERROR",
    "message": "Invalid subresource type 'invalid_type' for parent type 'case'"
  }
  ```

## Request Specification

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| type | string | Yes | Parent resource type |
| id | string | Yes | Parent resource identifier |
| subtype | string | Yes | Subresource type |
| subid | string | Yes | Subresource identifier |
| userId | string | Yes | User whose access to revoke |
| level | string | Yes | Access level to revoke (READ, WRITE, ADMIN) |

## Response Specification

### Success Response (204 No Content)

No response body. The grant has been successfully revoked or did not exist.

### Error Responses

| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid resource/subresource type or access level |
| 401 | UNAUTHORIZED | Missing or invalid auth token |
| 403 | FORBIDDEN | Missing `access-grants:write` scope |
| 404 | NOT_FOUND | Parent or subresource not found |

## Requirements Mapping

- **FR-218**: Accept DELETE with parent, subresource, user, and level parameters
- **FR-219**: Validate parent resource exists
- **FR-220**: Validate subresource exists within parent
- **FR-221**: Validate subresource type is valid for parent type
- **FR-222**: Validate access level is valid
- **FR-223**: Delete grant if it exists
- **FR-224**: Return 204 No Content on success
- **FR-225**: Operation is idempotent
- **FR-226**: Return 404 if parent or subresource not found
- **FR-227**: Require `access-grants:write` scope

## Notes

### Idempotency

This endpoint is idempotent:
- First DELETE: Revokes grant, returns 204
- Subsequent DELETEs: No grant to revoke, still returns 204
- Safe to retry without side effects

### Effective Access After Revocation

After revoking subresource grant:
- User may still have access via parent grant
- Authorization logic determines effective access
- To fully revoke access, may need to revoke parent grant too
- Or use `overrideParent` on a lower-level grant

**Example**:
```
Parent case grant: ADMIN
Subresource doc grant: READ (revoked)
Result: User still has ADMIN via parent
```

To restrict to READ:
```
1. Create subresource grant: READ with overrideParent: true
2. This limits effective access to READ
```

### Resource Validation

The endpoint validates both parent and subresource exist:
- Returns 404 if parent not found
- Returns 404 if subresource not found
- Helps catch errors in client code
- Ensures consistency

### Multiple Access Levels

If user has multiple subresource grants:
- Must revoke each level separately
- DELETE .../READ revokes only READ
- Other levels remain unchanged

### Audit Logging

Consider logging revocations:
- Who revoked the grant
- When it was revoked
- What grant was revoked
- Subresource details

Important for compliance and security audits.

### Immediate Effect

Revocation takes effect immediately:
- User's next request will use parent grant (if any)
- Active sessions should recheck permissions
- No propagation delay

### Cleanup Scenarios

When cleaning up user access:
1. Get all grants for user (via search endpoint)
2. Filter for subresource grants
3. Revoke each subresource grant
4. Then revoke parent grants
5. Ensures complete access removal

### Cascading Deletes

When parent resource is deleted:
- All subresources are typically deleted
- All subresource grants are automatically removed
- No manual revocation needed

When subresource is deleted:
- All grants on that subresource are automatically removed
- Or become orphaned (depends on implementation)
- Background job may cleanup orphaned grants

### Permission Conflicts

Revoking subresource grant doesn't affect parent:
- Parent WRITE + Subresource READ (revoked) = WRITE via parent
- Use `overrideParent` grants to restrict, not revoke
- Or revoke parent grant and create lower subresource grant
