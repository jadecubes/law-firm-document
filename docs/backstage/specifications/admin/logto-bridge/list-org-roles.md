---
sidebar_position: 6
---

# List Org Roles

**API Endpoint**: `GET /admin/logto/org-roles`

**Priority**: P2

**User Story**: As an admin, I want to list all available organization roles to know which roles can be assigned to members.

## Overview

Retrieve a list of all organization roles defined in Logto that can be assigned to organization members. This endpoint provides role metadata including names, descriptions, and permissions.

## Scenarios

### Scenario 1: List all organization roles

**Given**:
- Admin is authenticated with scope `logto-orgs:read`
- Logto has defined organization roles

**When**:
- Admin GETs `/admin/logto/org-roles`

**Then**:
- Response status is `200 OK`
- Response body contains:
  ```json
  {
    "data": [
      {
        "id": "role_admin",
        "name": "admin",
        "description": "Organization administrator with full permissions",
        "type": "PREDEFINED"
      },
      {
        "id": "role_member",
        "name": "member",
        "description": "Basic organization member",
        "type": "PREDEFINED"
      },
      {
        "id": "role_lawyer",
        "name": "lawyer",
        "description": "Licensed attorney with case access",
        "type": "CUSTOM"
      },
      {
        "id": "role_paralegal",
        "name": "paralegal",
        "description": "Paralegal with limited case access",
        "type": "CUSTOM"
      },
      {
        "id": "role_billing",
        "name": "billing",
        "description": "Billing and accounting staff",
        "type": "CUSTOM"
      }
    ]
  }
  ```

### Scenario 2: Filter by role type

**Given**:
- Admin is authenticated with scope `logto-orgs:read`

**When**:
- Admin GETs `/admin/logto/org-roles?type=CUSTOM`

**Then**:
- Response status is `200 OK`
- Response contains only custom-defined roles
- Predefined roles (admin, member) are excluded

### Scenario 3: Empty roles list (edge case)

**Given**:
- Admin is authenticated with scope `logto-orgs:read`
- No organization roles defined in Logto (unusual edge case)

**When**:
- Admin GETs `/admin/logto/org-roles`

**Then**:
- Response status is `200 OK`
- Response body contains:
  ```json
  {
    "data": []
  }
  ```

## Request Specification

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| type | string | No | (all) | Filter by role type: PREDEFINED or CUSTOM |

## Response Specification

### Success Response (200 OK)

```json
{
  "data": [
    {
      "id": "role_admin",
      "name": "admin",
      "description": "Organization administrator with full permissions",
      "type": "PREDEFINED",
      "scopes": [
        "read:all",
        "write:all",
        "delete:all",
        "manage:members",
        "manage:settings"
      ]
    },
    {
      "id": "role_lawyer",
      "name": "lawyer",
      "description": "Licensed attorney with case access",
      "type": "CUSTOM",
      "scopes": [
        "read:cases",
        "write:cases",
        "read:clients",
        "write:clients"
      ]
    }
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| data | array | Array of organization role objects |
| data[].id | string | Unique role identifier |
| data[].name | string | Role name (used when assigning roles) |
| data[].description | string \| null | Human-readable role description |
| data[].type | string | PREDEFINED (Logto default) or CUSTOM |
| data[].scopes | array | Optional: Array of permission scopes granted |

### Role Types

| Type | Description |
|------|-------------|
| PREDEFINED | Built-in Logto roles (admin, member) |
| CUSTOM | Organization-specific roles defined by admins |

### Error Responses

| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid type parameter |
| 401 | UNAUTHORIZED | Missing or invalid auth token |
| 403 | FORBIDDEN | Missing `logto-orgs:read` scope |
| 503 | SERVICE_UNAVAILABLE | Logto service unreachable |

## Requirements Mapping

- **FR-126**: Accept GET request for organization roles
- **FR-127**: Query Logto Management API for role definitions
- **FR-128**: Return array of all available roles
- **FR-129**: Include role metadata (id, name, description, type)
- **FR-130**: Support filtering by role type (PREDEFINED, CUSTOM)
- **FR-131**: Optionally include role scopes/permissions
- **FR-132**: Return empty array if no roles defined
- **FR-133**: Require `logto-orgs:read` scope

## Notes

### Use Cases

This endpoint is useful for:
- Populating role selection dropdowns in admin UI
- Validating role names before assigning
- Understanding available permissions
- Documentation of role hierarchy

### Role Management

Organization roles are managed in Logto Console:
- **Predefined roles**: Cannot be modified or deleted
- **Custom roles**: Can be created, updated, deleted by org admins
- Role changes in Logto are immediately reflected in this endpoint

### Scopes Field

The `scopes` field may or may not be included depending on Logto configuration:
- If included: Shows exact permissions granted by role
- If omitted: Scopes are defined but not exposed via API
- Use Logto Console to view full permission details

### Global vs Organization Roles

This endpoint returns **organization roles**, not global user roles:
- **Organization roles**: Scoped to specific organization
- **Global roles**: Apply across all of Logto (not returned here)

Only roles that can be assigned to organization members are returned.

### Caching Recommendations

Role definitions change infrequently. Consider:
- Caching response for 5-15 minutes
- Invalidating cache when roles are created/updated
- Using ETag/If-None-Match for conditional requests

### Creating Custom Roles

Custom roles are created via Logto Console or Logto Management API (separate from this endpoint):
1. Define role in Logto Console
2. Assign scopes/permissions to role
3. Role becomes available for assignment
4. This endpoint will return the new role

This endpoint is read-only for role definitions.
