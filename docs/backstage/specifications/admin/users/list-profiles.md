---
sidebar_position: 5
---

# List Profiles

**API Endpoint**: `GET /admin/law-firms/{lawFirmId}/profiles`

**Priority**: P1

**User Story**: As an admin, I want to list all user profiles within a law firm with pagination and filtering.

## Overview

Retrieve a paginated list of all user profiles within a specific law firm, including their Logto user ID, functional roles, and profile metadata. Supports filtering by role and search by name/email.

## Scenarios

### Scenario 1: List first page of profiles

**Given**:
- Admin is authenticated with scope `profiles:read`
- Law firm `firm_abc123` exists with 75 user profiles

**When**:
- Admin GETs `/admin/law-firms/firm_abc123/profiles?page[number]=1&page[size]=25`

**Then**:
- Response status is `200 OK`
- Response body contains:
  - `data`: Array of 25 profile objects
  - `meta.pagination.page`: 1
  - `meta.pagination.pageSize`: 25
  - `meta.pagination.totalItems`: 75
  - `meta.pagination.totalPages`: 3

### Scenario 2: Filter by functional role

**Given**:
- Admin is authenticated with scope `profiles:read`
- Law firm has 50 total profiles (20 LAWYER, 15 PARALEGAL, 10 RECEPTIONIST, 5 OTHER)

**When**:
- Admin GETs `/admin/law-firms/firm_abc123/profiles?functionalRole=LAWYER`

**Then**:
- Response status is `200 OK`
- Response contains only profiles with `LAWYER` role
- `meta.pagination.totalItems`: 20

### Scenario 3: Search by name or email

**Given**:
- Admin is authenticated with scope `profiles:read`
- Law firm has multiple profiles

**When**:
- Admin GETs `/admin/law-firms/firm_abc123/profiles?search=john`

**Then**:
- Response status is `200 OK`
- Response contains profiles where:
  - First name contains "john" (case-insensitive) OR
  - Last name contains "john" OR
  - Email contains "john"
- Profiles like "John Smith", "Johnson", "john@example.com" are included

### Scenario 4: Multiple functional roles filter

**Given**:
- Admin is authenticated with scope `profiles:read`

**When**:
- Admin GETs `/admin/law-firms/firm_abc123/profiles?functionalRole=LAWYER,PARALEGAL`

**Then**:
- Response status is `200 OK`
- Response contains profiles with either LAWYER or PARALEGAL roles
- Other roles are excluded

### Scenario 5: Empty result set

**Given**:
- Admin is authenticated with scope `profiles:read`
- Law firm `firm_abc123` has no user profiles

**When**:
- Admin GETs `/admin/law-firms/firm_abc123/profiles`

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

### Scenario 6: Law firm not found

**Given**:
- Admin is authenticated with scope `profiles:read`
- No law firm with ID `firm_nonexistent`

**When**:
- Admin GETs `/admin/law-firms/firm_nonexistent/profiles`

**Then**:
- Response status is `404 Not Found`
- Response body contains:
  ```json
  {
    "error": "NOT_FOUND",
    "message": "Law firm with ID 'firm_nonexistent' not found"
  }
  ```

### Scenario 7: Invalid page number

**Given**:
- Admin is authenticated with scope `profiles:read`

**When**:
- Admin GETs `/admin/law-firms/firm_abc123/profiles?page[number]=0`

**Then**:
- Response status is `400 Bad Request`
- Response contains validation error:
  ```json
  {
    "error": "VALIDATION_ERROR",
    "message": "Page number must be >= 1"
  }
  ```

## Request Specification

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| lawFirmId | string | Yes | Law firm identifier |

### Query Parameters

| Parameter | Type | Required | Default | Constraints | Description |
|-----------|------|----------|---------|-------------|-------------|
| page[number] | integer | No | 1 | Min: 1 | Page number to retrieve |
| page[size] | integer | No | 50 | Min: 1, Max: 200 | Items per page |
| functionalRole | string | No | (all) | CSV or single value | Filter by role(s) |
| search | string | No | (none) | Min: 2 chars | Search by name or email |
| includeInactive | boolean | No | false | - | Include inactive profiles |

### Functional Role Values

| Value | Description |
|-------|-------------|
| LAWYER | Licensed attorney |
| PARALEGAL | Paralegal or legal assistant |
| RECEPTIONIST | Front desk or administrative |
| BILLING_ADMIN | Billing and accounting |
| IT_ADMIN | IT and systems administration |
| INTERN | Student or intern |
| OTHER | Other roles |

## Response Specification

### Success Response (200 OK)

```json
{
  "data": [
    {
      "id": "user_12345",
      "lawFirmId": "firm_abc123",
      "logtoUserId": "logto_xyz789",
      "email": "jane.doe@acme-legal.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "functionalRoles": ["LAWYER", "BILLING_ADMIN"],
      "title": "Senior Partner",
      "department": "Corporate Law",
      "phoneNumber": "+1-555-0100",
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00Z",
      "updatedAt": "2024-06-20T14:30:00Z"
    },
    {
      "id": "user_67890",
      "lawFirmId": "firm_abc123",
      "logtoUserId": "logto_abc456",
      "email": "john.smith@acme-legal.com",
      "firstName": "John",
      "lastName": "Smith",
      "functionalRoles": ["PARALEGAL"],
      "title": "Senior Paralegal",
      "department": "Litigation",
      "phoneNumber": "+1-555-0101",
      "isActive": true,
      "createdAt": "2024-03-10T09:15:00Z",
      "updatedAt": "2024-03-10T09:15:00Z"
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

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| data | array | Array of user profile objects |
| data[].id | string | User profile identifier |
| data[].lawFirmId | string | Law firm identifier |
| data[].logtoUserId | string \| null | Logto user ID (if linked) |
| data[].email | string | User email address |
| data[].firstName | string | First name |
| data[].lastName | string | Last name |
| data[].functionalRoles | array | Array of functional role enums |
| data[].title | string \| null | Job title |
| data[].department | string \| null | Department name |
| data[].phoneNumber | string \| null | Phone number |
| data[].isActive | boolean | Whether profile is active |
| data[].createdAt | string | Creation timestamp |
| data[].updatedAt | string | Last update timestamp |
| meta.pagination | object | Pagination metadata |
| meta.pagination.page | integer | Current page number |
| meta.pagination.pageSize | integer | Items per page |
| meta.pagination.totalItems | integer | Total matching profiles |
| meta.pagination.totalPages | integer | Total number of pages |

### Error Responses

| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid query parameters |
| 401 | UNAUTHORIZED | Missing or invalid auth token |
| 403 | FORBIDDEN | Missing `profiles:read` scope |
| 404 | NOT_FOUND | Law firm not found |

## Requirements Mapping

- **FR-057**: Accept GET with lawFirmId path parameter
- **FR-058**: Support pagination with page[number] and page[size]
- **FR-059**: Default page size to 50, max 200
- **FR-060**: Return paginated array of user profiles
- **FR-061**: Include pagination metadata (page, pageSize, totalItems, totalPages)
- **FR-062**: Support filtering by functionalRole (single or comma-separated)
- **FR-063**: Support search query across firstName, lastName, email
- **FR-064**: Default to excluding inactive profiles
- **FR-065**: Support includeInactive parameter
- **FR-066**: Return empty array when no profiles exist
- **FR-067**: Include logtoUserId in response (may be null)
- **FR-068**: Validate page number >= 1
- **FR-069**: Validate page size between 1 and 200

## Notes

### Performance Considerations

For law firms with thousands of profiles:
- Use pagination to limit response size
- Consider adding indexes on functionalRoles and email fields
- Search queries may require full-text search optimization

### Profile vs User

This endpoint returns **profiles** (law firm-specific user records), not Logto users. A single Logto user may have profiles in multiple law firms.

### Sorting

Results are sorted by `createdAt` descending (newest first) by default. Future versions may support custom sorting via query parameters.
