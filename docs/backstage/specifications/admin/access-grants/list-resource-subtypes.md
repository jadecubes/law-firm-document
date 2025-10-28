---
sidebar_position: 2
---

# List Resource Subtypes

**API Endpoint**: `GET /admin/resource-types/{type}/subtypes`

**Priority**: P2

**User Story**: As an admin, I want to list all subtypes for a specific resource type to understand available variants.

## Overview

Retrieve all subtypes defined for a specific resource type. Subtypes provide finer-grained categorization within a resource type (e.g., case subtypes: litigation, corporate, family law).

## Scenarios

### Scenario 1: List subtypes for case resource type

**Given**:
- Admin is authenticated with scope `resource-types:read`
- Resource type "case" has defined subtypes

**When**:
- Admin GETs `/admin/resource-types/case/subtypes`

**Then**:
- Response status is `200 OK`
- Response body contains:
  ```json
  {
    "data": [
      {
        "subtype": "litigation",
        "name": "Litigation",
        "description": "Civil or criminal litigation matters"
      },
      {
        "subtype": "corporate",
        "name": "Corporate Law",
        "description": "Corporate transactions and compliance"
      },
      {
        "subtype": "family",
        "name": "Family Law",
        "description": "Divorce, custody, and family matters"
      },
      {
        "subtype": "real-estate",
        "name": "Real Estate",
        "description": "Property transactions and disputes"
      },
      {
        "subtype": "intellectual-property",
        "name": "Intellectual Property",
        "description": "Patents, trademarks, copyrights"
      }
    ]
  }
  ```

### Scenario 2: Resource type has no subtypes

**Given**:
- Admin is authenticated with scope `resource-types:read`
- Resource type "client" has no subtypes defined

**When**:
- Admin GETs `/admin/resource-types/client/subtypes`

**Then**:
- Response status is `200 OK`
- Response body contains:
  ```json
  {
    "data": []
  }
  ```

### Scenario 3: Resource type not found

**Given**:
- Admin is authenticated with scope `resource-types:read`
- No resource type with ID "nonexistent"

**When**:
- Admin GETs `/admin/resource-types/nonexistent/subtypes`

**Then**:
- Response status is `404 Not Found`
- Response body contains:
  ```json
  {
    "error": "NOT_FOUND",
    "message": "Resource type 'nonexistent' not found"
  }
  ```

### Scenario 4: List document subtypes

**Given**:
- Admin is authenticated with scope `resource-types:read`
- Resource type "document" has subtypes

**When**:
- Admin GETs `/admin/resource-types/document/subtypes`

**Then**:
- Response status is `200 OK`
- Response contains document subtypes:
  ```json
  {
    "data": [
      {
        "subtype": "contract",
        "name": "Contract",
        "description": "Legal contracts and agreements"
      },
      {
        "subtype": "brief",
        "name": "Legal Brief",
        "description": "Court filings and briefs"
      },
      {
        "subtype": "correspondence",
        "name": "Correspondence",
        "description": "Letters and emails"
      },
      {
        "subtype": "evidence",
        "name": "Evidence",
        "description": "Exhibits and evidence documents"
      }
    ]
  }
  ```

## Request Specification

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| type | string | Yes | Resource type identifier |

## Response Specification

### Success Response (200 OK)

```json
{
  "data": [
    {
      "subtype": "litigation",
      "name": "Litigation",
      "description": "Civil or criminal litigation matters",
      "isDefault": false
    }
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| data | array | Array of subtype objects |
| data[].subtype | string | Unique subtype identifier |
| data[].name | string | Human-readable name |
| data[].description | string \| null | Subtype description |
| data[].isDefault | boolean | Whether this is the default subtype |

### Error Responses

| Status | Error Code | Description |
|--------|------------|-------------|
| 401 | UNAUTHORIZED | Missing or invalid auth token |
| 403 | FORBIDDEN | Missing `resource-types:read` scope |
| 404 | NOT_FOUND | Resource type not found |

## Requirements Mapping

- **FR-142**: Accept GET with resource type path parameter
- **FR-143**: Validate resource type exists
- **FR-144**: Return array of subtypes for resource type
- **FR-145**: Include subtype metadata (name, description)
- **FR-146**: Indicate default subtype if applicable
- **FR-147**: Return empty array if no subtypes defined
- **FR-148**: Return 404 if resource type doesn't exist
- **FR-149**: Require `resource-types:read` scope

## Notes

### Use Cases

This endpoint is useful for:
- Populating subtype selection dropdowns
- Validating subtypes before creating resources
- Building dynamic forms based on resource type
- Understanding categorization within a resource type

### Subtypes vs Resource Types

- **Resource Type**: Broad category (case, document, client)
- **Subtype**: Specific variant within type (litigation case, contract document)

Both are relatively static configurations.

### Default Subtype

The `isDefault` field indicates which subtype is used when none is specified:
- Only one subtype per type can be default
- Used for backward compatibility
- May be null if no default configured

### Configuration

Subtypes are configured similarly to resource types:
- Application configuration
- Database migrations
- System initialization scripts

This endpoint is read-only.

### Optional Nature

Not all resource types require subtypes:
- Simple types may have no subtypes
- `hasSubtypes: false` in resource type definition
- Returns empty array in such cases

### Caching

Subtype definitions change infrequently:
- Safe to cache for extended periods
- Invalidate on system updates
- Consider ETag support for efficient caching
