---
sidebar_position: 8
---

# Create Subresource Grant

**API Endpoint**: `POST /admin/resources/{type}/{id}/subresources/{subtype}/{subid}/access-grants`

**Priority**: P1

**User Story**: As an admin, I want to grant a user access to a specific subresource within a parent resource.

## Overview

Create an access grant for a user on a subresource. This allows fine-grained control over nested resources, enabling scenarios like granting access to a specific document within a case without granting access to the entire case.

## Scenarios

### Scenario 1: Grant READ access to case document

**Given**:
- Admin is authenticated with scope `access-grants:write`
- Case `case_abc123` exists
- Document `doc_xyz456` exists as subresource of case
- User `user_12345` exists
- User does not have access to document

**When**:
- Admin POSTs to `/admin/resources/case/case_abc123/subresources/document/doc_xyz456/access-grants`:
  ```json
  {
    "userId": "user_12345",
    "accessLevel": "READ"
  }
  ```

**Then**:
- Response status is `201 Created`
- Response body contains:
  ```json
  {
    "id": "grant_xyz789",
    "userId": "user_12345",
    "parentResourceType": "case",
    "parentResourceId": "case_abc123",
    "subresourceType": "document",
    "subresourceId": "doc_xyz456",
    "accessLevel": "READ",
    "grantedBy": "admin_789",
    "grantedAt": "2025-10-19T10:00:00Z",
    "expiresAt": null
  }
  ```
- User can now read the document

### Scenario 2: Grant with expiration

**Given**:
- Admin is authenticated with scope `access-grants:write`
- Parent and subresource exist
- User exists

**When**:
- Admin POSTs with expiration:
  ```json
  {
    "userId": "user_67890",
    "accessLevel": "WRITE",
    "expiresAt": "2025-12-31T23:59:59Z"
  }
  ```

**Then**:
- Response status is `201 Created`
- Grant is created with expiration date
- Access automatically revokes after expiration

### Scenario 3: Override parent access

**Given**:
- Admin is authenticated with scope `access-grants:write`
- User has ADMIN access to parent case
- Admin wants to restrict access to specific document to READ

**When**:
- Admin POSTs READ grant on document:
  ```json
  {
    "userId": "user_12345",
    "accessLevel": "READ",
    "overrideParent": true
  }
  ```

**Then**:
- Response status is `201 Created`
- User's effective access to document is READ (not inherited ADMIN)
- User retains ADMIN on case itself

### Scenario 4: Duplicate grant

**Given**:
- Admin is authenticated with scope `access-grants:write`
- User already has WRITE access to subresource

**When**:
- Admin attempts to grant WRITE again:
  ```json
  {
    "userId": "user_12345",
    "accessLevel": "WRITE"
  }
  ```

**Then**:
- Response status is `409 Conflict`
- Response body contains:
  ```json
  {
    "error": "DUPLICATE_GRANT",
    "message": "User 'user_12345' already has WRITE access to subresource 'document:doc_xyz456'"
  }
  ```

### Scenario 5: Parent resource not found

**Given**:
- Admin is authenticated with scope `access-grants:write`
- No case with ID `case_nonexistent`

**When**:
- Admin POSTs to non-existent parent

**Then**:
- Response status is `404 Not Found`
- Response body contains:
  ```json
  {
    "error": "NOT_FOUND",
    "message": "Parent resource 'case:case_nonexistent' not found"
  }
  ```

### Scenario 6: Subresource not found

**Given**:
- Admin is authenticated with scope `access-grants:write`
- Case exists
- No document `doc_nonexistent` in case

**When**:
- Admin POSTs to non-existent subresource

**Then**:
- Response status is `404 Not Found`
- Response body contains:
  ```json
  {
    "error": "NOT_FOUND",
    "message": "Subresource 'document:doc_nonexistent' not found in parent 'case:case_abc123'"
  }
  ```

### Scenario 7: Invalid subresource type

**Given**:
- Admin is authenticated with scope `access-grants:write`

**When**:
- Admin POSTs with invalid subtype:
  ```json
  {
    "userId": "user_12345",
    "accessLevel": "READ"
  }
  ```
  To: `/admin/resources/case/case_abc123/subresources/invalid_type/sub_123/access-grants`

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

### Request Body

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| userId | string | Yes | Valid user ID | User to grant access |
| accessLevel | string | Yes | READ, WRITE, ADMIN | Level of access |
| expiresAt | string | No | ISO 8601, future date | Optional expiration timestamp |
| overrideParent | boolean | No | Default: false | Override inherited parent permissions |
| replaceExisting | boolean | No | Default: false | Replace existing grant if any |

### Validation Rules

| Rule | Description |
|------|-------------|
| Parent exists | Parent resource must exist |
| Subresource exists | Subresource must exist within parent |
| Subtype valid | Subresource type must be valid for parent type |
| User uniqueness | User cannot have duplicate grant at same level |
| Future expiration | expiresAt must be in future if provided |
| Valid access level | Must be READ, WRITE, or ADMIN |

## Response Specification

### Success Response (201 Created)

```json
{
  "id": "grant_xyz789",
  "userId": "user_12345",
  "parentResourceType": "case",
  "parentResourceId": "case_abc123",
  "subresourceType": "document",
  "subresourceId": "doc_xyz456",
  "accessLevel": "READ",
  "overrideParent": false,
  "grantedBy": "admin_789",
  "grantedAt": "2025-10-19T10:00:00Z",
  "expiresAt": null
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| id | string | Grant identifier (generated) |
| userId | string | User who has access |
| parentResourceType | string | Parent resource type |
| parentResourceId | string | Parent resource identifier |
| subresourceType | string | Subresource type |
| subresourceId | string | Subresource identifier |
| accessLevel | string | Level of access |
| overrideParent | boolean | Whether this overrides parent permissions |
| grantedBy | string | Admin who granted access |
| grantedAt | string | Grant timestamp |
| expiresAt | string \| null | Expiration timestamp |

### Error Responses

| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid input or subresource type |
| 401 | UNAUTHORIZED | Missing or invalid auth token |
| 403 | FORBIDDEN | Missing `access-grants:write` scope |
| 404 | NOT_FOUND | Parent or subresource not found |
| 409 | DUPLICATE_GRANT | User already has access at this level |

## Requirements Mapping

- **FR-206**: Accept POST with parent and subresource identifiers
- **FR-207**: Validate parent resource exists
- **FR-208**: Validate subresource exists within parent
- **FR-209**: Validate subresource type is valid for parent type
- **FR-210**: Accept userId and accessLevel in body
- **FR-211**: Support optional expiration timestamp
- **FR-212**: Support overrideParent flag
- **FR-213**: Prevent duplicate grants
- **FR-214**: Support replaceExisting to upgrade grants
- **FR-215**: Record granting admin
- **FR-216**: Return complete grant details
- **FR-217**: Require `access-grants:write` scope

## Notes

### Grant Inheritance vs Override

Without `overrideParent`:
- Subresource grant adds to inherited parent permissions
- User has higher of parent or subresource access
- Example: Parent ADMIN + Subresource READ = effective ADMIN

With `overrideParent: true`:
- Subresource grant replaces inherited permissions
- User has exactly subresource access level
- Example: Parent ADMIN + Subresource READ (override) = effective READ
- Useful for restricting access to sensitive subresources

### Use Cases

Fine-grained subresource access is useful for:
- **Sensitive documents**: Restrict access to privileged documents within case
- **Temporary sharing**: Grant short-term access to specific document
- **Role separation**: Paralegal can see case but not financial documents
- **Client portals**: Client access to specific documents only

### Access Level Hierarchy

In some systems, access levels are hierarchical:
- ADMIN > WRITE > READ
- ADMIN implies WRITE and READ
- WRITE implies READ

Check your authorization implementation.

### Performance Considerations

Subresource grants add complexity to authorization:
- Must check both parent and subresource grants
- Must apply inheritance/override logic
- May require multiple database queries
- Consider caching effective permissions

### Bulk Operations

For granting access to multiple subresources:
- This endpoint requires one call per subresource
- Consider bulk endpoint for efficiency
- Or use parent grant if appropriate
