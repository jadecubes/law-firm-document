---
sidebar_position: 1
---

# Get Resource Policies

**API Endpoint**: `GET /admin/law-firms/\{lawFirmId\}/users/\{userId\}/resource-policies`

**Priority**: P2

**User Story**: As an admin, I want to see all resource access policies that apply to a specific user for debugging and auditing purposes.

## Overview

Retrieve a comprehensive view of all resource access policies that apply to a user, including grants from direct assignment, role inheritance, case membership, and system policies. This endpoint provides visibility into why a user has access to specific resources.

## Scenarios

### Scenario 1: Get user's resource policies

**Given**:
- Admin is authenticated with scope `capabilities:read`
- Law firm `firm_abc123` exists
- User `user_12345` exists with:
  - Direct grant: WRITE access to case_001
  - Role-based grant: READ access to all litigation cases
  - Case member grant: ADMIN access to case_002 (assigned attorney)

**When**:
- Admin GETs `/admin/law-firms/firm_abc123/users/user_12345/resource-policies`

**Then**:
- Response status is `200 OK`
- Response body contains:
  ```json
  {
    "data": [
      {
        "resourceType": "case",
        "resourceId": "case_001",
        "accessLevel": "WRITE",
        "source": "MANUAL",
        "grantedBy": "admin_789",
        "grantedAt": "2024-01-15T10:00:00Z"
      },
      {
        "resourceType": "case",
        "resourceId": "case_002",
        "accessLevel": "ADMIN",
        "source": "CASE_MEMBER",
        "reason": "User is assigned attorney on case",
        "grantedAt": "2024-02-01T14:30:00Z"
      },
      {
        "resourceType": "case",
        "resourceId": "*",
        "resourceSubtype": "litigation",
        "accessLevel": "READ",
        "source": "ROLE",
        "role": "LAWYER",
        "reason": "All lawyers have read access to litigation cases"
      }
    ]
  }
  ```

### Scenario 2: Filter by resource type

**Given**:
- Admin is authenticated with scope `capabilities:read`
- User has policies on multiple resource types

**When**:
- Admin GETs `/admin/law-firms/firm_abc123/users/user_12345/resource-policies?resourceType=case`

**Then**:
- Response status is `200 OK`
- Response contains only policies for "case" resources
- Other resource types are excluded

### Scenario 3: User has no policies

**Given**:
- Admin is authenticated with scope `capabilities:read`
- User exists but has no resource access policies

**When**:
- Admin GETs user's resource policies

**Then**:
- Response status is `200 OK`
- Response body contains:
  ```json
  {
    "data": []
  }
  ```

### Scenario 4: User not found

**Given**:
- Admin is authenticated with scope `capabilities:read`
- No user with ID `user_nonexistent` in law firm

**When**:
- Admin GETs `/admin/law-firms/firm_abc123/users/user_nonexistent/resource-policies`

**Then**:
- Response status is `404 Not Found`
- Response body contains:
  ```json
  {
    "error": "NOT_FOUND",
    "message": "User with ID 'user_nonexistent' not found in law firm 'firm_abc123'"
  }
  ```

### Scenario 5: Filter by specific resource

**Given**:
- Admin is authenticated with scope `capabilities:read`
- User has multiple case policies

**When**:
- Admin GETs `/admin/law-firms/firm_abc123/users/user_12345/resource-policies?resourceType=case&resourceId=case_001`

**Then**:
- Response status is `200 OK`
- Response contains only policies for case_001
- Wildcard policies (`*`) that apply to case_001 are also included

## Request Specification

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| lawFirmId | string | Yes | Law firm identifier |
| userId | string | Yes | User identifier |

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| resourceType | string | No | (all) | Filter by resource type |
| resourceId | string | No | (all) | Filter by specific resource ID |
| source | string | No | (all) | Filter by policy source |

### Policy Sources

| Source | Description |
|--------|-------------|
| MANUAL | Direct access grant by admin |
| ROLE | Access inherited from functional role |
| CASE_MEMBER | Access from case team membership |
| SYSTEM | System-generated access policy |

## Response Specification

### Success Response (200 OK)

```json
{
  "data": [
    {
      "resourceType": "case",
      "resourceId": "case_abc123",
      "resourceSubtype": "litigation",
      "accessLevel": "WRITE",
      "source": "MANUAL",
      "grantedBy": "admin_789",
      "grantedByName": "System Admin",
      "grantedAt": "2024-01-15T10:00:00Z",
      "expiresAt": null,
      "reason": null
    },
    {
      "resourceType": "case",
      "resourceId": "*",
      "resourceSubtype": "litigation",
      "accessLevel": "READ",
      "source": "ROLE",
      "role": "LAWYER",
      "reason": "All lawyers have read access to litigation cases"
    }
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| data | array | Array of resource policy objects |
| data[].resourceType | string | Type of resource |
| data[].resourceId | string | Resource ID or `*` for wildcard |
| data[].resourceSubtype | string \| null | Resource subtype if applicable |
| data[].accessLevel | string | Level of access (READ, WRITE, ADMIN) |
| data[].source | string | How policy was granted |
| data[].grantedBy | string \| null | Admin who granted (for MANUAL) |
| data[].grantedByName | string \| null | Granting admin's name |
| data[].grantedAt | string | Policy creation timestamp |
| data[].expiresAt | string \| null | Expiration timestamp |
| data[].role | string \| null | Functional role (for ROLE source) |
| data[].reason | string \| null | Human-readable explanation |

### Error Responses

| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid query parameters |
| 401 | UNAUTHORIZED | Missing or invalid auth token |
| 403 | FORBIDDEN | Missing `capabilities:read` scope |
| 404 | NOT_FOUND | User or law firm not found |

## Requirements Mapping

- **FR-228**: Accept GET with lawFirmId and userId parameters
- **FR-229**: Aggregate policies from all sources (MANUAL, ROLE, CASE_MEMBER, SYSTEM)
- **FR-230**: Return comprehensive policy list
- **FR-231**: Include policy source and reason
- **FR-232**: Support filtering by resourceType
- **FR-233**: Support filtering by resourceId
- **FR-234**: Support filtering by source
- **FR-235**: Include wildcard policies that apply to resources
- **FR-236**: Return empty array when no policies
- **FR-237**: Require `capabilities:read` scope

## Notes

### Use Cases

This endpoint is useful for:
- Debugging access issues ("Why does user have access to X?")
- Auditing user permissions
- Compliance reporting
- Understanding policy inheritance
- Troubleshooting authorization logic

### Policy Aggregation

The response aggregates policies from multiple sources:

1. **MANUAL**: Direct grants via access-grants API
2. **ROLE**: Policies inherited from functional roles (LAWYER, PARALEGAL, etc.)
3. **CASE_MEMBER**: Access from being assigned to cases
4. **SYSTEM**: Automatic policies (e.g., users can always access their own profile)

### Wildcard Policies

Policies with `resourceId: "*"` apply to all resources of that type:
- May be filtered by `resourceSubtype`
- Useful for role-based access (e.g., all lawyers can read all cases)
- Authorization logic must evaluate wildcards correctly

### Effective Access Calculation

This endpoint shows **policies**, not effective access:
- User may have multiple policies for same resource
- Highest access level typically wins (ADMIN > WRITE > READ)
- Use `GET .../capabilities` to see final effective access

### Performance

For users with many policies:
- Response can be large
- Consider pagination in future versions
- Use filters to narrow results
- May need caching for frequently accessed users

### Read-Only

This endpoint is read-only:
- Does not modify policies
- Use access-grants endpoints to create/revoke policies
- Role-based policies managed via user roles
- Case member policies managed via case assignments
