---
sidebar_position: 4
---

# Remove Credential

**API Endpoint**: `DELETE /admin/law-firms/{lawFirmId}/users/{userId}/credentials/{credentialId}`

**Priority**: P1

**User Story**: As an admin, I want to remove a professional credential from a user's profile.

## Overview

Delete a professional credential from a user's profile. This operation is irreversible and should be used when credentials are revoked, expired and no longer needed, or were added in error.

## Scenarios

### Scenario 1: Remove existing credential

**Given**:
- Admin is authenticated with scope `credentials:delete`
- Law firm `firm_abc123` exists
- User `user_12345` exists
- Credential `cred_xyz789` exists for user

**When**:
- Admin DELETEs `/admin/law-firms/firm_abc123/users/user_12345/credentials/cred_xyz789`

**Then**:
- Response status is `204 No Content`
- Credential is permanently deleted from database
- Subsequent GET requests for this credential return 404

### Scenario 2: Credential not found

**Given**:
- Admin is authenticated with scope `credentials:delete`
- Law firm and user exist
- No credential with ID `cred_nonexistent`

**When**:
- Admin DELETEs `/admin/law-firms/firm_abc123/users/user_12345/credentials/cred_nonexistent`

**Then**:
- Response status is `404 Not Found`
- Response body contains:
  ```json
  {
    "error": "NOT_FOUND",
    "message": "Credential with ID 'cred_nonexistent' not found for user 'user_12345'"
  }
  ```

### Scenario 3: Credential belongs to different user

**Given**:
- Admin is authenticated with scope `credentials:delete`
- User `user_12345` exists
- User `user_67890` exists
- Credential `cred_xyz789` belongs to `user_67890`

**When**:
- Admin DELETEs `/admin/law-firms/firm_abc123/users/user_12345/credentials/cred_xyz789`

**Then**:
- Response status is `404 Not Found`
- Response body contains:
  ```json
  {
    "error": "NOT_FOUND",
    "message": "Credential with ID 'cred_xyz789' not found for user 'user_12345'"
  }
  ```
- Credential remains associated with `user_67890`

### Scenario 4: User not found

**Given**:
- Admin is authenticated with scope `credentials:delete`
- Law firm exists
- No user with ID `user_nonexistent`

**When**:
- Admin DELETEs `/admin/law-firms/firm_abc123/users/user_nonexistent/credentials/cred_xyz789`

**Then**:
- Response status is `404 Not Found`
- Response body contains:
  ```json
  {
    "error": "NOT_FOUND",
    "message": "User with ID 'user_nonexistent' not found in law firm 'firm_abc123'"
  }
  ```

### Scenario 5: Law firm not found

**Given**:
- Admin is authenticated with scope `credentials:delete`
- No law firm with ID `firm_nonexistent`

**When**:
- Admin DELETEs `/admin/law-firms/firm_nonexistent/users/user_12345/credentials/cred_xyz789`

**Then**:
- Response status is `404 Not Found`
- Response body contains:
  ```json
  {
    "error": "NOT_FOUND",
    "message": "Law firm with ID 'firm_nonexistent' not found"
  }
  ```

### Scenario 6: Unauthorized access

**Given**:
- Request has no authentication token

**When**:
- Client DELETEs `/admin/law-firms/firm_abc123/users/user_12345/credentials/cred_xyz789`

**Then**:
- Response status is `401 Unauthorized`

### Scenario 7: Insufficient permissions

**Given**:
- Admin is authenticated but lacks `credentials:delete` scope
- Has only `credentials:read` scope

**When**:
- Admin DELETEs credential

**Then**:
- Response status is `403 Forbidden`
- Response body contains:
  ```json
  {
    "error": "FORBIDDEN",
    "message": "Missing required scope: credentials:delete"
  }
  ```

## Request Specification

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| lawFirmId | string | Yes | Law firm identifier |
| userId | string | Yes | User identifier |
| credentialId | string | Yes | Credential identifier to delete |

## Response Specification

### Success Response (204 No Content)

No response body. The credential has been successfully deleted.

### Error Responses

| Status | Error Code | Description |
|--------|------------|-------------|
| 401 | UNAUTHORIZED | Missing or invalid auth token |
| 403 | FORBIDDEN | Missing `credentials:delete` scope |
| 404 | NOT_FOUND | Law firm, user, or credential not found |

## Requirements Mapping

- **FR-049**: Accept DELETE with lawFirmId, userId, and credentialId parameters
- **FR-050**: Verify credential belongs to specified user
- **FR-051**: Permanently delete credential from database
- **FR-052**: Return 204 No Content on successful deletion
- **FR-053**: Return 404 if credential not found
- **FR-054**: Return 404 if credential belongs to different user
- **FR-055**: Require `credentials:delete` scope
- **FR-056**: Ensure operation is idempotent (repeated DELETEs return 404)

## Notes

### Soft Delete vs Hard Delete

This endpoint performs a **hard delete** - the credential is permanently removed from the database. If you need to maintain audit history, consider:

1. Using a status update to mark credentials as `REVOKED` or `DELETED` instead
2. Implementing a separate audit log table to track deletions
3. Using database triggers to archive deleted credentials

### Cascade Behavior

When deleting a credential:
- No cascade to user profile (user remains)
- No impact on other credentials
- Any references in audit logs remain (if implemented)

### Alternative: Revocation

For credentials that should be deactivated but not deleted (for audit purposes), consider using an update endpoint to set:
```json
{
  "status": "REVOKED",
  "verificationStatus": "FAILED"
}
```
