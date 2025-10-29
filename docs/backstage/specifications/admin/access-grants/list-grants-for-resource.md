---
sidebar_position: 4
---

# List Grants for Resource

**API Endpoint**: `GET /admin/resources/{type}/{id}/access-grants`

**Priority**: P1

**User Story**: As an admin, I want to list all users who have access to a specific resource.

## Overview

Retrieve all access grants for a specific resource, showing which users have access and at what level. Useful for resource permission management and access auditing.

## Scenarios

### Scenario 1: List grants for case resource

**Given**:
- Admin is authenticated with scope `access-grants:read`
- Case `case_abc123` exists
- Three users have access to the case

**When**:
- Admin GETs `/admin/resources/case/case_abc123/access-grants`

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
        "userEmail": "jane.doe@firm.com",
        "accessLevel": "ADMIN",
        "grantedBy": "admin_789",
        "grantedAt": "2024-01-15T10:00:00Z",
        "expiresAt": null
      },
      {
        "id": "grant_002",
        "userId": "user_67890",
        "userName": "John Smith",
        "userEmail": "john.smith@firm.com",
        "accessLevel": "WRITE",
        "grantedBy": "admin_789",
        "grantedAt": "2024-02-10T14:30:00Z",
        "expiresAt": null
      },
      {
        "id": "grant_003",
        "userId": "user_11111",
        "userName": "Alice Johnson",
        "userEmail": "alice.j@firm.com",
        "accessLevel": "READ",
        "grantedBy": "user_12345",
        "grantedAt": "2024-03-05T09:15:00Z",
        "expiresAt": "2024-06-05T09:15:00Z"
      }
    ]
  }
  ```

### Scenario 2: Resource has no grants

**Given**:
- Admin is authenticated with scope `access-grants:read`
- Document `doc_xyz456` exists
- No users have been granted access

**When**:
- Admin GETs `/admin/resources/document/doc_xyz456/access-grants`

**Then**:
- Response status is `200 OK`
- Response body contains:
  ```json
  {
    "data": []
  }
  ```

### Scenario 3: Filter by access level

**Given**:
- Admin is authenticated with scope `access-grants:read`
- Case has grants at multiple levels

**When**:
- Admin GETs `/admin/resources/case/case_abc123/access-grants?accessLevel=ADMIN`

**Then**:
- Response status is `200 OK`
- Response contains only grants with ADMIN access level
- READ and WRITE grants are excluded

### Scenario 4: Resource not found

**Given**:
- Admin is authenticated with scope `access-grants:read`
- No case with ID `case_nonexistent`

**When**:
- Admin GETs `/admin/resources/case/case_nonexistent/access-grants`

**Then**:
- Response status is `404 Not Found`
- Response body contains:
  ```json
  {
    "error": "NOT_FOUND",
    "message": "Resource 'case:case_nonexistent' not found"
  }
  ```

### Scenario 5: Invalid resource type

**Given**:
- Admin is authenticated with scope `access-grants:read`

**When**:
- Admin GETs `/admin/resources/invalid_type/some_id/access-grants`

**Then**:
- Response status is `400 Bad Request`
- Response body contains:
  ```json
  {
    "error": "VALIDATION_ERROR",
    "message": "Invalid resource type 'invalid_type'. Valid types: case, document, client, matter"
  }
  ```

### Scenario 6: Include expired grants

**Given**:
- Admin is authenticated with scope `access-grants:read`
- Resource has 2 active grants and 1 expired grant

**When**:
- Admin GETs `/admin/resources/case/case_abc123/access-grants?includeExpired=true`

**Then**:
- Response status is `200 OK`
- Response includes all 3 grants (active + expired)
- Without `includeExpired=true`, only 2 active grants returned

## Request Specification

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| type | string | Yes | Resource type (case, document, etc.) |
| id | string | Yes | Resource identifier |

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
      "accessLevel": "ADMIN",
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
| data[].accessLevel | string | Level of access (READ, WRITE, ADMIN) |
| data[].grantedBy | string | Admin who granted access |
| data[].grantedByName | string \| null | Granting admin's name |
| data[].grantedAt | string | Grant timestamp |
| data[].expiresAt | string \| null | Expiration timestamp |

### Error Responses

| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid resource type |
| 401 | UNAUTHORIZED | Missing or invalid auth token |
| 403 | FORBIDDEN | Missing `access-grants:read` scope |
| 404 | NOT_FOUND | Resource not found |

## Requirements Mapping

- **FR-162**: Accept GET with resource type and ID parameters
- **FR-163**: Validate resource type is supported
- **FR-164**: Verify resource exists
- **FR-165**: Return array of grants for resource
- **FR-166**: Include user metadata (name, email) in grants
- **FR-167**: Include grantor metadata (grantedBy, grantedByName)
- **FR-168**: Support filtering by access level
- **FR-169**: Default to excluding expired grants
- **FR-170**: Support includeExpired parameter
- **FR-171**: Return empty array when no grants
- **FR-172**: Return 404 if resource doesn't exist
- **FR-173**: Require `access-grants:read` scope

## Notes

### Use Cases

This endpoint is useful for:
- Managing resource permissions
- Seeing who has access to sensitive resources
- Preparing for access revocation
- Audit and compliance reporting
- Sharing resource access with stakeholders

### User Metadata

The response includes user details for convenience:
- Avoids need for separate user lookup requests
- Names and emails help identify users
- May be null if user deleted or not in profile system

### Expired Grants

By default, expired grants are excluded:
- Reduces noise in permission lists
- Use `includeExpired=true` for historical view
- Consider background cleanup of expired grants

### Grant Hierarchy

For resources with subresources:
- This endpoint shows grants on THIS resource only
- Does not include inherited grants from parent resources
- Does not include grants on subresources
- Use separate endpoints for subresource grants

### Performance

For resources with many grants:
- Consider pagination in future versions
- Current version returns all grants (no pagination)
- May need optimization for high-value resources

### Cross-Firm Access

If resource belongs to law firm:
- Grants may include users from same firm only
- Or may support cross-firm collaboration
- Check `lawFirmId` in grant details
- Ensure proper firm context in authorization
