---
sidebar_position: 3
---

# Search Grants

**API Endpoint**: `GET /admin/resource-access-grants`

**Priority**: P2

**User Story**: As an admin, I want to search for access grants across all resources to audit permissions.

## Overview

Search and filter access grants across all resources in the system. Supports filtering by user, resource type, access level, and law firm for comprehensive permission auditing.

## Scenarios

### Scenario 1: Search grants for specific user

**Given**:
- Admin is authenticated with scope `access-grants:read`
- User `user_12345` has grants on multiple resources

**When**:
- Admin GETs `/admin/resource-access-grants?userId=user_12345`

**Then**:
- Response status is `200 OK`
- Response body contains:
  ```json
  {
    "data": [
      {
        "id": "grant_001",
        "userId": "user_12345",
        "resourceType": "case",
        "resourceId": "case_abc123",
        "accessLevel": "WRITE",
        "grantedBy": "admin_789",
        "grantedAt": "2024-01-15T10:00:00Z"
      },
      {
        "id": "grant_002",
        "userId": "user_12345",
        "resourceType": "document",
        "resourceId": "doc_xyz456",
        "accessLevel": "READ",
        "grantedBy": "admin_789",
        "grantedAt": "2024-02-20T14:30:00Z"
      }
    ],
    "meta": {
      "pagination": {
        "page": 1,
        "pageSize": 50,
        "totalItems": 2,
        "totalPages": 1
      }
    }
  }
  ```

### Scenario 2: Search grants by resource type

**Given**:
- Admin is authenticated with scope `access-grants:read`
- System has grants on various resource types

**When**:
- Admin GETs `/admin/resource-access-grants?resourceType=case`

**Then**:
- Response status is `200 OK`
- Response contains only grants for "case" resources
- Other resource types are excluded

### Scenario 3: Search grants by access level

**Given**:
- Admin is authenticated with scope `access-grants:read`

**When**:
- Admin GETs `/admin/resource-access-grants?accessLevel=ADMIN`

**Then**:
- Response status is `200 OK`
- Response contains only grants with ADMIN access level
- READ and WRITE grants are excluded

### Scenario 4: Filter by law firm

**Given**:
- Admin is authenticated with scope `access-grants:read`
- Resources belong to multiple law firms

**When**:
- Admin GETs `/admin/resource-access-grants?lawFirmId=firm_abc123`

**Then**:
- Response status is `200 OK`
- Response contains only grants for resources in `firm_abc123`
- Other law firms' grants are excluded

### Scenario 5: Combined filters

**Given**:
- Admin is authenticated with scope `access-grants:read`

**When**:
- Admin GETs `/admin/resource-access-grants?userId=user_12345&resourceType=case&accessLevel=WRITE`

**Then**:
- Response status is `200 OK`
- Response contains grants matching ALL criteria:
  - User is `user_12345` AND
  - Resource type is "case" AND
  - Access level is WRITE

### Scenario 6: Paginated results

**Given**:
- Admin is authenticated with scope `access-grants:read`
- System has 150 grants

**When**:
- Admin GETs `/admin/resource-access-grants?page[number]=1&page[size]=50`

**Then**:
- Response status is `200 OK`
- Response contains first 50 grants
- `meta.pagination.totalItems`: 150
- `meta.pagination.totalPages`: 3

### Scenario 7: No matching grants

**Given**:
- Admin is authenticated with scope `access-grants:read`
- No grants match filter criteria

**When**:
- Admin GETs `/admin/resource-access-grants?userId=user_nonexistent`

**Then**:
- Response status is `200 OK`
- Response body contains:
  ```json
  {
    "data": [],
    "meta": {
      "pagination": {
        "page": 1,
        "pageSize": 50,
        "totalItems": 0,
        "totalPages": 0
      }
    }
  }
  ```

## Request Specification

### Query Parameters

| Parameter | Type | Required | Default | Constraints | Description |
|-----------|------|----------|---------|-------------|-------------|
| userId | string | No | (all) | - | Filter by user ID |
| resourceType | string | No | (all) | Valid resource type | Filter by resource type |
| resourceId | string | No | (all) | - | Filter by specific resource ID |
| accessLevel | string | No | (all) | READ, WRITE, ADMIN | Filter by access level |
| lawFirmId | string | No | (all) | - | Filter by law firm |
| grantedBy | string | No | (all) | - | Filter by granting admin |
| page[number] | integer | No | 1 | Min: 1 | Page number |
| page[size] | integer | No | 50 | Min: 1, Max: 200 | Items per page |

## Response Specification

### Success Response (200 OK)

```json
{
  "data": [
    {
      "id": "grant_xyz789",
      "userId": "user_12345",
      "resourceType": "case",
      "resourceId": "case_abc123",
      "resourceSubtype": "litigation",
      "accessLevel": "WRITE",
      "lawFirmId": "firm_abc123",
      "grantedBy": "admin_789",
      "grantedAt": "2024-01-15T10:00:00Z",
      "expiresAt": null
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 50,
      "totalItems": 127,
      "totalPages": 3
    }
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| data | array | Array of access grant objects |
| data[].id | string | Grant identifier |
| data[].userId | string | User who has access |
| data[].resourceType | string | Type of resource |
| data[].resourceId | string | Resource identifier |
| data[].resourceSubtype | string \| null | Resource subtype |
| data[].accessLevel | string | Level of access (READ, WRITE, ADMIN) |
| data[].lawFirmId | string | Law firm that owns resource |
| data[].grantedBy | string | Admin who granted access |
| data[].grantedAt | string | Grant timestamp |
| data[].expiresAt | string \| null | Expiration timestamp (if temporary) |
| meta.pagination | object | Pagination metadata |

### Error Responses

| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid query parameters |
| 401 | UNAUTHORIZED | Missing or invalid auth token |
| 403 | FORBIDDEN | Missing `access-grants:read` scope |

## Requirements Mapping

- **FR-150**: Accept GET with optional filter parameters
- **FR-151**: Support filtering by userId
- **FR-152**: Support filtering by resourceType
- **FR-153**: Support filtering by resourceId
- **FR-154**: Support filtering by accessLevel
- **FR-155**: Support filtering by lawFirmId
- **FR-156**: Support filtering by grantedBy
- **FR-157**: Apply AND logic when multiple filters provided
- **FR-158**: Return paginated results
- **FR-159**: Include pagination metadata
- **FR-160**: Return empty array when no matches
- **FR-161**: Require `access-grants:read` scope

## Notes

### Use Cases

This endpoint is useful for:
- Auditing user permissions across resources
- Finding all grants for a specific resource
- Compliance reporting
- Identifying over-privileged users
- Cleanup of unused grants

### Performance Considerations

For large datasets:
- Use specific filters to narrow results
- Leverage pagination to limit response size
- Consider indexes on userId, resourceType, lawFirmId
- May need query optimization for complex filters

### Audit Trail

Each grant includes `grantedBy` and `grantedAt`:
- Track who granted access
- Track when access was granted
- Useful for compliance and security audits
- Consider logging grant revocations separately

### Expired Grants

Grants with `expiresAt` in the past:
- May still appear in results
- Should be filtered client-side if needed
- Consider background job to cleanup expired grants
- Or add `?includeExpired=false` parameter

### Cross-Firm Access

If your system supports cross-firm collaboration:
- User from firm A may have grants on firm B resources
- Filter by `lawFirmId` to see firm-specific grants
- Consider adding firm context to authorization checks
