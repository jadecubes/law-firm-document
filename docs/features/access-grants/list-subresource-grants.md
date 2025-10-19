---
sidebar_position: 7
---

# List Subresource Grants

**API Endpoint**: `GET /admin/resources/{type}/{id}/subresources/{subtype}/{subid}/access-grants`

**Priority**: P2

**User Story**: As an admin, I want to list all users who have access to a specific subresource within a parent resource.

## Overview

Retrieve all access grants for a subresource (e.g., a document within a case). Subresources have hierarchical relationships with parent resources and may inherit or override parent permissions.

## Scenarios

### Scenario 1: List grants for case document

**Given**:
- Admin is authenticated with scope `access-grants:read`
- Case `case_abc123` exists
- Document `doc_xyz456` exists as subresource of case
- Two users have access to document

**When**:
- Admin GETs `/admin/resources/case/case_abc123/subresources/document/doc_xyz456/access-grants`

**Then**:
- Response status is `200 OK`
- Response body contains:
  ```json
  {
    "data": [
      {
        "id": "grant_001",
        "userId": "user_12345",
        "userName": "Jane Doe",
        "accessLevel": "WRITE",
        "grantedBy": "admin_789",
        "grantedAt": "2024-01-15T10:00:00Z",
        "expiresAt": null
      },
      {
        "id": "grant_002",
        "userId": "user_67890",
        "userName": "John Smith",
        "accessLevel": "READ",
        "grantedBy": "user_12345",
        "grantedAt": "2024-02-20T14:30:00Z",
        "expiresAt": "2024-08-20T14:30:00Z"
      }
    ]
  }
  ```

### Scenario 2: Subresource has no grants

**Given**:
- Admin is authenticated with scope `access-grants:read`
- Parent resource and subresource exist
- No explicit grants on subresource

**When**:
- Admin GETs subresource grants

**Then**:
- Response status is `200 OK`
- Response body contains:
  ```json
  {
    "data": []
  }
  ```
- Note: Users may still have access via parent resource grants

### Scenario 3: Parent resource not found

**Given**:
- Admin is authenticated with scope `access-grants:read`
- No case with ID `case_nonexistent`

**When**:
- Admin GETs `/admin/resources/case/case_nonexistent/subresources/document/doc_123/access-grants`

**Then**:
- Response status is `404 Not Found`
- Response body contains:
  ```json
  {
    "error": "NOT_FOUND",
    "message": "Parent resource 'case:case_nonexistent' not found"
  }
  ```

### Scenario 4: Subresource not found

**Given**:
- Admin is authenticated with scope `access-grants:read`
- Case exists
- No document with ID `doc_nonexistent` in case

**When**:
- Admin GETs `/admin/resources/case/case_abc123/subresources/document/doc_nonexistent/access-grants`

**Then**:
- Response status is `404 Not Found`
- Response body contains:
  ```json
  {
    "error": "NOT_FOUND",
    "message": "Subresource 'document:doc_nonexistent' not found in parent 'case:case_abc123'"
  }
  ```

### Scenario 5: Invalid subresource type

**Given**:
- Admin is authenticated with scope `access-grants:read`

**When**:
- Admin GETs with invalid subtype: `/admin/resources/case/case_abc123/subresources/invalid/sub_123/access-grants`

**Then**:
- Response status is `400 Bad Request`
- Response body contains:
  ```json
  {
    "error": "VALIDATION_ERROR",
    "message": "Invalid subresource type 'invalid' for parent type 'case'. Valid subtypes: document, note, task"
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

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| accessLevel | string | No | (all) | Filter by access level |
| includeExpired | boolean | No | false | Include expired grants |

## Response Specification

### Success Response (200 OK)

```json
{
  "data": [
    {
      "id": "grant_xyz789",
      "userId": "user_12345",
      "userName": "Jane Doe",
      "userEmail": "jane.doe@firm.com",
      "accessLevel": "WRITE",
      "grantedBy": "admin_789",
      "grantedByName": "System Admin",
      "grantedAt": "2024-01-15T10:00:00Z",
      "expiresAt": null
    }
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| data | array | Array of access grant objects |
| data[].id | string | Grant identifier |
| data[].userId | string | User who has access |
| data[].userName | string \| null | User's display name |
| data[].userEmail | string \| null | User's email |
| data[].accessLevel | string | Level of access |
| data[].grantedBy | string | Admin who granted access |
| data[].grantedByName | string \| null | Granting admin's name |
| data[].grantedAt | string | Grant timestamp |
| data[].expiresAt | string \| null | Expiration timestamp |

### Error Responses

| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid resource or subresource type |
| 401 | UNAUTHORIZED | Missing or invalid auth token |
| 403 | FORBIDDEN | Missing `access-grants:read` scope |
| 404 | NOT_FOUND | Parent or subresource not found |

## Requirements Mapping

- **FR-195**: Accept GET with parent and subresource identifiers
- **FR-196**: Validate parent resource exists
- **FR-197**: Validate subresource exists within parent
- **FR-198**: Validate subresource type is valid for parent type
- **FR-199**: Return array of grants for subresource
- **FR-200**: Include user and grantor metadata
- **FR-201**: Support filtering by access level
- **FR-202**: Default to excluding expired grants
- **FR-203**: Return empty array when no grants
- **FR-204**: Return 404 if parent or subresource not found
- **FR-205**: Require `access-grants:read` scope

## Notes

### Subresource Hierarchy

Subresources have parent-child relationships:
- **Parent**: `case:case_abc123`
- **Subresource**: `case:case_abc123/document:doc_xyz456`

Path format: `/resources/{parent-type}/{parent-id}/subresources/{sub-type}/{sub-id}`

### Grant Inheritance

This endpoint shows explicit grants on subresource only:
- Does NOT include inherited grants from parent
- User may have access via parent grant even if no subresource grant
- Authorization logic should check both parent and subresource grants
- Or implement inheritance policy (e.g., parent ADMIN grants subresource ADMIN)

### Effective Permissions

To determine user's effective access:
1. Check subresource grants (this endpoint)
2. Check parent resource grants
3. Apply inheritance rules
4. Return highest access level

This may require multiple API calls.

### Use Cases

This endpoint is useful for:
- Managing fine-grained permissions on nested resources
- Overriding parent permissions for specific subresources
- Auditing access to sensitive documents within cases
- Temporary access to specific subresources

### Performance

For resources with many subresources:
- Each subresource requires separate API call
- Consider bulk endpoint for multiple subresources
- Or include subresource grants when listing parent grants
- Optimize for common access patterns

### Valid Subresource Types

Subresource types depend on parent type:
- **case**: document, note, task, event
- **client**: contact, matter, invoice
- **matter**: document, billing, timesheet

Use `GET /admin/resource-types/{type}/subtypes` to discover valid types.
