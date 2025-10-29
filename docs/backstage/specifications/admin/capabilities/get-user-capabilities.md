---
sidebar_position: 2
---

# Get User Capabilities

**API Endpoint**: `GET /admin/law-firms/\{lawFirmId\}/users/\{userId\}/capabilities`

**Priority**: P2

**User Story**: As an admin, I want to see what actions a user can perform on specific resources to understand their effective permissions.

## Overview

Retrieve a user's effective capabilities on resources, showing the final computed access level after evaluating all policies (direct grants, role-based, case membership, etc.). This endpoint provides the "bottom line" of what a user can actually do.

## Scenarios

### Scenario 1: Get user capabilities

**Given**:
- Admin is authenticated with scope `capabilities:read`
- Law firm `firm_abc123` exists
- User `user_12345` has:
  - WRITE access to case_001 (direct grant)
  - ADMIN access to case_002 (case member)
  - READ access to all documents (role-based)

**When**:
- Admin GETs `/admin/law-firms/firm_abc123/users/user_12345/capabilities`

**Then**:
- Response status is `200 OK`
- Response body contains:
  ```json
  {
    "data": [
      {
        "resourceType": "case",
        "resourceId": "case_001",
        "effectiveAccess": "WRITE",
        "capabilities": ["read", "update", "comment"],
        "highestPolicy": {
          "accessLevel": "WRITE",
          "source": "MANUAL"
        }
      },
      {
        "resourceType": "case",
        "resourceId": "case_002",
        "effectiveAccess": "ADMIN",
        "capabilities": ["read", "update", "delete", "manage_access", "comment"],
        "highestPolicy": {
          "accessLevel": "ADMIN",
          "source": "CASE_MEMBER"
        }
      },
      {
        "resourceType": "document",
        "resourceId": "*",
        "effectiveAccess": "READ",
        "capabilities": ["read", "download"],
        "highestPolicy": {
          "accessLevel": "READ",
          "source": "ROLE",
          "role": "LAWYER"
        }
      }
    ]
  }
  ```

### Scenario 2: Check capabilities for specific resource

**Given**:
- Admin is authenticated with scope `capabilities:read`
- User has mixed policies on case_001

**When**:
- Admin GETs `/admin/law-firms/firm_abc123/users/user_12345/capabilities?resourceType=case&resourceId=case_001`

**Then**:
- Response status is `200 OK`
- Response contains only capabilities for case_001
- Shows effective access after evaluating all applicable policies

### Scenario 3: User has no access

**Given**:
- Admin is authenticated with scope `capabilities:read`
- User exists but has no resource access

**When**:
- Admin GETs user capabilities

**Then**:
- Response status is `200 OK`
- Response body contains:
  ```json
  {
    "data": []
  }
  ```

### Scenario 4: Multiple policies resolve to highest access

**Given**:
- Admin is authenticated with scope `capabilities:read`
- User has three policies on case_001:
  - READ (role-based)
  - WRITE (direct grant)
  - ADMIN (case member)

**When**:
- Admin GETs capabilities for case_001

**Then**:
- Response status is `200 OK`
- Response shows:
  ```json
  {
    "data": [
      {
        "resourceType": "case",
        "resourceId": "case_001",
        "effectiveAccess": "ADMIN",
        "capabilities": ["read", "update", "delete", "manage_access"],
        "highestPolicy": {
          "accessLevel": "ADMIN",
          "source": "CASE_MEMBER"
        },
        "allPolicies": [
          {"accessLevel": "READ", "source": "ROLE"},
          {"accessLevel": "WRITE", "source": "MANUAL"},
          {"accessLevel": "ADMIN", "source": "CASE_MEMBER"}
        ]
      }
    ]
  }
  ```

### Scenario 5: Filter by resource type

**Given**:
- Admin is authenticated with scope `capabilities:read`
- User has capabilities on cases and documents

**When**:
- Admin GETs `/admin/law-firms/firm_abc123/users/user_12345/capabilities?resourceType=document`

**Then**:
- Response status is `200 OK`
- Response contains only document capabilities
- Case capabilities are excluded

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
| includeAllPolicies | boolean | No | false | Include all policies, not just highest |

## Response Specification

### Success Response (200 OK)

```json
{
  "data": [
    {
      "resourceType": "case",
      "resourceId": "case_abc123",
      "resourceSubtype": "litigation",
      "effectiveAccess": "WRITE",
      "capabilities": ["read", "update", "comment", "attach_files"],
      "highestPolicy": {
        "accessLevel": "WRITE",
        "source": "MANUAL",
        "grantedBy": "admin_789",
        "grantedAt": "2024-01-15T10:00:00Z"
      },
      "allPolicies": [
        {
          "accessLevel": "READ",
          "source": "ROLE",
          "role": "LAWYER"
        },
        {
          "accessLevel": "WRITE",
          "source": "MANUAL",
          "grantedBy": "admin_789"
        }
      ]
    }
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| data | array | Array of capability objects |
| data[].resourceType | string | Type of resource |
| data[].resourceId | string | Resource ID or `*` for wildcard |
| data[].resourceSubtype | string \| null | Resource subtype |
| data[].effectiveAccess | string | Final computed access level |
| data[].capabilities | array | List of actions user can perform |
| data[].highestPolicy | object | Policy granting highest access |
| data[].allPolicies | array | All policies (if includeAllPolicies=true) |

### Capability Actions

Actions vary by resource type and access level:

**Case capabilities**:
- READ: `["read", "download_documents"]`
- WRITE: `["read", "update", "comment", "attach_files"]`
- ADMIN: `["read", "update", "delete", "manage_access", "comment", "attach_files"]`

**Document capabilities**:
- READ: `["read", "download"]`
- WRITE: `["read", "update", "download", "upload_version"]`
- ADMIN: `["read", "update", "delete", "download", "upload_version", "manage_access"]`

### Error Responses

| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid query parameters |
| 401 | UNAUTHORIZED | Missing or invalid auth token |
| 403 | FORBIDDEN | Missing `capabilities:read` scope |
| 404 | NOT_FOUND | User or law firm not found |

## Requirements Mapping

- **FR-238**: Accept GET with lawFirmId and userId parameters
- **FR-239**: Calculate effective access from all policies
- **FR-240**: Apply highest access level rule (ADMIN > WRITE > READ)
- **FR-241**: Return specific capabilities based on access level
- **FR-242**: Support filtering by resourceType
- **FR-243**: Support filtering by resourceId
- **FR-244**: Include highest policy details
- **FR-245**: Optionally include all policies
- **FR-246**: Return empty array when no capabilities
- **FR-247**: Require `capabilities:read` scope

## Notes

### Use Cases

This endpoint is useful for:
- Showing UI based on user permissions (hide/show buttons)
- Implementing frontend authorization
- Debugging access issues
- Auditing effective permissions
- Testing authorization logic

### Effective Access Calculation

The algorithm for computing effective access:

1. Collect all policies for user on resource
2. Include wildcard policies that match
3. Find policy with highest access level
4. Map access level to capabilities
5. Return effective access and capability list

**Access level hierarchy**: ADMIN > WRITE > READ

### Capabilities vs Policies

- **Policies** (`/resource-policies`): Raw grants from various sources
- **Capabilities** (this endpoint): Final computed permissions

Example:
```
Policies: READ (role), WRITE (manual), ADMIN (case member)
Effective: ADMIN with full capabilities
```

### Caching

Capabilities can be cached:
- Cache key: `{lawFirmId}:{userId}:{resourceType}:{resourceId}`
- Invalidate when:
  - User's roles change
  - Direct grants added/removed
  - Case membership changes
- TTL: 5-15 minutes recommended

### Performance

For users with many resources:
- Response can be large for wildcard queries
- Use filters to narrow results
- Consider pagination for future versions
- Cache frequently accessed capabilities

### Frontend Usage

Frontend can use this endpoint to:
```javascript
const caps = await getCapabilities(user.id, 'case', caseId);
if (caps.capabilities.includes('update')) {
  showEditButton();
}
if (caps.capabilities.includes('delete')) {
  showDeleteButton();
}
```

### Wildcards

Wildcard capabilities (`resourceId: "*"`) represent access to all resources:
- Frontend should apply to matching resources
- May be filtered by subtype
- Useful for role-based UI rendering
