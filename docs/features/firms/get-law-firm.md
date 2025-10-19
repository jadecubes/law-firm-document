---
sidebar_position: 3
---

# Get Law Firm

**API Endpoint**: `GET /admin/law-firms/{lawFirmId}`

**Priority**: P1

**User Story**: As an admin, I want to fetch a firm by id.

## Overview

Retrieve detailed information about a specific law firm by its unique identifier.

## Scenarios

### Scenario 1: Get existing law firm

**Given**:
- Admin is authenticated with scope `firms:read`
- Law firm with ID `firm_abc123` exists

**When**:
- Admin GETs `/admin/law-firms/firm_abc123`

**Then**:
- Response status is `200 OK`
- Response body contains:
  ```json
  {
    "id": "firm_abc123",
    "name": "Acme Legal Services",
    "slug": "acme-legal",
    "logtoOrgId": "org_xyz789",
    "createdAt": "2025-10-18T12:00:00Z",
    "updatedAt": "2025-10-18T12:00:00Z"
  }
  ```

### Scenario 2: Law firm not found

**Given**:
- Admin is authenticated with scope `firms:read`
- No law firm with ID `firm_nonexistent`

**When**:
- Admin GETs `/admin/law-firms/firm_nonexistent`

**Then**:
- Response status is `404 Not Found`
- Response body contains:
  ```json
  {
    "error": "NOT_FOUND",
    "message": "Law firm with ID 'firm_nonexistent' not found"
  }
  ```

### Scenario 3: Unauthorized access

**Given**:
- Request has no authentication token

**When**:
- Client GETs `/admin/law-firms/firm_abc123`

**Then**:
- Response status is `401 Unauthorized`

## Request Specification

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| lawFirmId | string | Yes | Unique law firm identifier |

## Response Specification

### Success Response (200 OK)

```json
{
  "id": "firm_abc123",
  "name": "Acme Legal Services",
  "slug": "acme-legal",
  "logtoOrgId": "org_xyz789",
  "createdAt": "2025-10-18T12:00:00Z",
  "updatedAt": "2025-10-18T12:00:00Z"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique law firm identifier |
| name | string | Display name of the law firm |
| slug | string | URL-safe identifier |
| logtoOrgId | string \| null | Associated Logto organization ID |
| createdAt | string | ISO 8601 creation timestamp |
| updatedAt | string | ISO 8601 last update timestamp |

### Error Responses

| Status | Error Code | Description |
|--------|------------|-------------|
| 401 | UNAUTHORIZED | Missing or invalid auth token |
| 403 | FORBIDDEN | Missing `firms:read` scope |
| 404 | NOT_FOUND | Law firm does not exist |

## Requirements Mapping

- **FR-014**: Accept GET with lawFirmId path parameter
- **FR-015**: Return law firm details when found
- **FR-016**: Return 404 when law firm not found
- **FR-017**: Include all law firm fields in response
- **FR-018**: Require `firms:read` scope
