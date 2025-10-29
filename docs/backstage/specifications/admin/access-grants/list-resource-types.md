---
sidebar_position: 1
---

# List Resource Types

**API Endpoint**: `GET /admin/resource-types`

**Priority**: P2

**User Story**: As an admin, I want to list all available resource types in the system to understand what resources can have access grants.

## Overview

Retrieve a list of all resource types supported by the access grant system. Resource types define the categories of resources that can have fine-grained access control (e.g., cases, documents, matters, clients).

## Scenarios

### Scenario 1: List all resource types

**Given**:
- Admin is authenticated with scope `resource-types:read`
- System has defined resource types

**When**:
- Admin GETs `/admin/resource-types`

**Then**:
- Response status is `200 OK`
- Response body contains:
  ```json
  {
    "data": [
      {
        "type": "case",
        "name": "Legal Case",
        "description": "Litigation or legal matter",
        "hasSubtypes": true,
        "supportsSubresources": true
      },
      {
        "type": "document",
        "name": "Document",
        "description": "Legal document or file",
        "hasSubtypes": true,
        "supportsSubresources": false
      },
      {
        "type": "client",
        "name": "Client",
        "description": "Client organization or individual",
        "hasSubtypes": false,
        "supportsSubresources": true
      },
      {
        "type": "matter",
        "name": "Matter",
        "description": "Legal matter or project",
        "hasSubtypes": true,
        "supportsSubresources": true
      }
    ]
  }
  ```

### Scenario 2: Empty resource types (edge case)

**Given**:
- Admin is authenticated with scope `resource-types:read`
- System has no configured resource types

**When**:
- Admin GETs `/admin/resource-types`

**Then**:
- Response status is `200 OK`
- Response body contains:
  ```json
  {
    "data": []
  }
  ```

## Request Specification

No parameters required.

## Response Specification

### Success Response (200 OK)

```json
{
  "data": [
    {
      "type": "case",
      "name": "Legal Case",
      "description": "Litigation or legal matter",
      "hasSubtypes": true,
      "supportsSubresources": true,
      "accessLevels": ["READ", "WRITE", "ADMIN"]
    }
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| data | array | Array of resource type objects |
| data[].type | string | Unique resource type identifier (used in API paths) |
| data[].name | string | Human-readable name |
| data[].description | string \| null | Resource type description |
| data[].hasSubtypes | boolean | Whether this type has subtypes |
| data[].supportsSubresources | boolean | Whether this type supports hierarchical subresources |
| data[].accessLevels | array | Available access levels for this resource type |

### Access Levels

| Level | Description |
|-------|-------------|
| READ | View/read access only |
| WRITE | Modify/update access |
| ADMIN | Full control including delete and manage access |

### Error Responses

| Status | Error Code | Description |
|--------|------------|-------------|
| 401 | UNAUTHORIZED | Missing or invalid auth token |
| 403 | FORBIDDEN | Missing `resource-types:read` scope |

## Requirements Mapping

- **FR-134**: Accept GET request for resource types
- **FR-135**: Return array of all available resource types
- **FR-136**: Include type metadata (name, description)
- **FR-137**: Indicate if type has subtypes
- **FR-138**: Indicate if type supports subresources
- **FR-139**: Include available access levels per type
- **FR-140**: Return empty array if no types configured
- **FR-141**: Require `resource-types:read` scope

## Notes

### Use Cases

This endpoint is useful for:
- Building resource selection UI in admin interfaces
- Validating resource types before creating grants
- Understanding system capabilities
- API discovery and documentation

### Resource Types vs Subtypes

- **Resource Type**: Top-level category (e.g., "case", "document")
- **Subtype**: Specific variant within a type (e.g., case subtype "litigation", "corporate")

Use `GET /admin/resource-types/{type}/subtypes` to list subtypes for a specific type.

### Subresources

Types with `supportsSubresources: true` allow hierarchical access grants:
- Parent resource: `case:12345`
- Subresource: `case:12345/document:67890`

Access to parent may or may not grant access to subresources (depends on grant configuration).

### Configuration

Resource types are typically configured:
- In application configuration files
- Via database seeding scripts
- Through system initialization

This endpoint returns the configured types - it does not create or modify them.

### Static Data

Resource type definitions are relatively static:
- Safe to cache for extended periods (hours/days)
- Changes require application deployment or migration
- Invalidate cache after system updates
