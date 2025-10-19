---
sidebar_position: 2
---

# List Law Firms

**API Endpoint**: `GET /admin/law-firms`

**Priority**: P1

**User Story**: As an admin, I want to list firms with paging.

## Overview

Retrieve a paginated list of all law firms in the system for administrative oversight and management.

## Scenarios

### Scenario 1: List first page of law firms

**Given**:
- Admin is authenticated with scope `firms:read`
- System has 75 law firms

**When**:
- Admin GETs `/admin/law-firms?page[number]=1&page[size]=25`

**Then**:
- Response status is `200 OK`
- Response body contains:
  - `data`: Array of 25 law firm objects
  - `meta.pagination.page`: 1
  - `meta.pagination.pageSize`: 25
  - `meta.pagination.totalItems`: 75
  - `meta.pagination.totalPages`: 3

### Scenario 2: Navigate to second page

**Given**:
- Admin is authenticated with scope `firms:read`
- System has 75 law firms

**When**:
- Admin GETs `/admin/law-firms?page[number]=2&page[size]=25`

**Then**:
- Response status is `200 OK`
- Response contains second set of 25 firms (items 26-50)
- Pagination metadata shows current page 2 of 3

### Scenario 3: Empty result set

**Given**:
- Admin is authenticated with scope `firms:read`
- System has 0 law firms

**When**:
- Admin GETs `/admin/law-firms`

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

### Scenario 4: Custom page size

**Given**:
- Admin is authenticated with scope `firms:read`
- System has 150 law firms

**When**:
- Admin GETs `/admin/law-firms?page[size]=100`

**Then**:
- Response status is `200 OK`
- Response contains 100 firms
- `meta.pagination.totalPages`: 2

### Scenario 5: Invalid page number

**Given**:
- Admin is authenticated with scope `firms:read`

**When**:
- Admin GETs `/admin/law-firms?page[number]=0`

**Then**:
- Response status is `400 Bad Request`
- Response contains validation error for page number

## Request Specification

### Query Parameters

| Parameter | Type | Required | Default | Constraints | Description |
|-----------|------|----------|---------|-------------|-------------|
| page[number] | integer | No | 1 | Min: 1 | Page number to retrieve |
| page[size] | integer | No | 50 | Min: 1, Max: 200 | Items per page |

## Response Specification

### Success Response (200 OK)

```json
{
  "data": [
    {
      "id": "firm_abc123",
      "name": "Acme Legal Services",
      "slug": "acme-legal",
      "logtoOrgId": "org_xyz789",
      "createdAt": "2025-10-18T12:00:00Z",
      "updatedAt": "2025-10-18T12:00:00Z"
    },
    {
      "id": "firm_def456",
      "name": "Smith & Partners",
      "slug": "smith-partners",
      "logtoOrgId": null,
      "createdAt": "2025-10-17T10:30:00Z",
      "updatedAt": "2025-10-17T10:30:00Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 50,
      "totalItems": 75,
      "totalPages": 2
    }
  }
}
```

### Error Responses

| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid query parameters |
| 401 | UNAUTHORIZED | Missing or invalid auth token |
| 403 | FORBIDDEN | Missing `firms:read` scope |

## Requirements Mapping

- **FR-008**: Accept GET with pagination parameters
- **FR-009**: Default page size to 50, max 200
- **FR-010**: Return paginated array of law firms
- **FR-011**: Include pagination metadata
- **FR-012**: Validate page number >= 1
- **FR-013**: Return empty array when no firms exist
