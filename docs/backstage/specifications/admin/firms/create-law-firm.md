---
sidebar_position: 1
---

# Create Law Firm

**API Endpoint**: `POST /admin/law-firms`

**Priority**: P1

**User Story**: As an admin, I want to create a new law firm (tenant) with an automatically created Logto organization.

## Overview

Enables platform administrators to onboard new law firms by creating tenant records. Each law firm automatically gets a Logto organization created and bound during creation. There is no option to bind to existing orgs or update bindings - only create (with org) or delete (removes org).

## Scenarios

### Scenario 1: Create law firm with automatic Logto org

**Given**:
- Admin is authenticated with scope `firms:create`
- No existing law firm with slug `acme-legal`

**When**:
- Admin POSTs to `/admin/law-firms` with payload:
  ```json
  {
    "name": "Acme Legal Services",
    "slug": "acme-legal",
    "email": "contact@acme-legal.com",
    "phone": "+1-555-0100"
  }
  ```

**Then**:
- Response status is `201 Created`
- Response body contains:
  ```json
  {
    "id": "firm_abc123",
    "name": "Acme Legal Services",
    "slug": "acme-legal",
    "email": "contact@acme-legal.com",
    "phone": "+1-555-0100",
    "logtoOrgId": "org_xyz789",
    "createdAt": "2025-10-18T12:00:00Z",
    "updatedAt": "2025-10-18T12:00:00Z"
  }
  ```
- Logto organization is automatically created with ID `org_xyz789`
- Organization name matches law firm slug
- Law firm record is stored in database

### Scenario 2: Duplicate slug rejection

**Given**:
- Admin is authenticated with scope `firms:create`
- Existing law firm with slug `acme-legal`

**When**:
- Admin POSTs to `/admin/law-firms` with payload:
  ```json
  {
    "name": "Another Acme Legal",
    "slug": "acme-legal"
  }
  ```

**Then**:
- Response status is `409 Conflict`
- Response body contains:
  ```json
  {
    "error": "DUPLICATE_SLUG",
    "message": "Law firm with slug 'acme-legal' already exists"
  }
  ```
- No law firm is created
- No Logto organization is created

### Scenario 3: Invalid slug format

**Given**:
- Admin is authenticated with scope `firms:create`

**When**:
- Admin POSTs to `/admin/law-firms` with invalid slug:
  ```json
  {
    "name": "Test Firm",
    "slug": "Invalid Slug!"
  }
  ```

**Then**:
- Response status is `400 Bad Request`
- Response body contains validation error:
  ```json
  {
    "error": "VALIDATION_ERROR",
    "message": "Slug must contain only lowercase letters, numbers, and hyphens",
    "details": [
      {
        "field": "slug",
        "message": "Must match pattern: ^[a-z0-9][a-z0-9-]*[a-z0-9]$"
      }
    ]
  }
  ```

### Scenario 4: Missing required fields

**Given**:
- Admin is authenticated with scope `firms:create`

**When**:
- Admin POSTs without required name field:
  ```json
  {
    "slug": "test-firm"
  }
  ```

**Then**:
- Response status is `400 Bad Request`
- Response contains validation error for missing `name` field

### Scenario 5: Create with optional metadata

**Given**:
- Admin is authenticated with scope `firms:create`

**When**:
- Admin POSTs with additional metadata:
  ```json
  {
    "name": "Johnson Law",
    "slug": "johnson-law",
    "address": "123 Main St, NYC",
    "email": "info@johnson-law.com",
    "phone": "+1-555-0200",
    "contacts": "John Johnson (Managing Partner)",
    "metadata": {
      "billingTier": "enterprise",
      "contractStartDate": "2025-01-01"
    }
  }
  ```

**Then**:
- Response status is `201 Created`
- All fields including metadata are stored
- Logto organization is created

## Request Specification

### Request Body

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| name | string | Yes | 1-200 chars | Display name of the law firm |
| slug | string | Yes | lowercase, alphanumeric + hyphens, unique | URL-safe identifier |
| address | string | No | Max 500 chars | Physical address |
| phone | string | No | Max 50 chars | Contact phone number |
| email | string | No | Valid email format | Contact email |
| contacts | string | No | Max 1000 chars | Contact information |
| metadata | object | No | JSON object | Additional custom data |

### Validation Rules

| Rule | Description |
|------|-------------|
| Slug pattern | Must match: `^[a-z0-9][a-z0-9-]*[a-z0-9]$` |
| Slug uniqueness | No other law firm can have the same slug |
| Name length | 1 ≤ length ≤ 200 |
| Email format | Must be valid email if provided |

## Response Specification

### Success Response (201 Created)

```json
{
  "id": "firm_abc123",
  "name": "Acme Legal Services",
  "slug": "acme-legal",
  "address": "123 Main St, Suite 100",
  "phone": "+1-555-0100",
  "email": "contact@acme-legal.com",
  "contacts": "Jane Doe (Managing Partner)",
  "logtoOrgId": "org_xyz789",
  "createdAt": "2025-10-18T12:00:00Z",
  "updatedAt": "2025-10-18T12:00:00Z"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique law firm identifier (generated) |
| name | string | Display name |
| slug | string | URL-safe identifier |
| address | string \| null | Physical address |
| phone | string \| null | Contact phone |
| email | string \| null | Contact email |
| contacts | string \| null | Contact information |
| logtoOrgId | string | Associated Logto organization ID (auto-created) |
| createdAt | string | ISO 8601 creation timestamp |
| updatedAt | string | ISO 8601 last update timestamp |

### Error Responses

| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid input format or missing required fields |
| 401 | UNAUTHORIZED | Missing or invalid auth token |
| 403 | FORBIDDEN | Missing `firms:create` scope |
| 409 | DUPLICATE_SLUG | Slug already in use |
| 503 | SERVICE_UNAVAILABLE | Failed to create Logto organization |

## Deletion Behavior

**Note**: When a law firm is deleted:
- The law firm record is removed from database
- The associated Logto organization is automatically deleted
- All organization memberships are removed
- This operation is irreversible

## Requirements Mapping

- **FR-001**: Accept POST with name, slug, and optional contact fields
- **FR-002**: Validate slug format (lowercase, alphanumeric, hyphens only)
- **FR-003**: Validate slug uniqueness across all law firms
- **FR-004**: Automatically create Logto organization on law firm creation
- **FR-005**: Store logtoOrgId in law firm record
- **FR-006**: Return 409 Conflict for duplicate slug
- **FR-007**: Return 400 Bad Request for validation errors
- **FR-008**: Return complete law firm details including logtoOrgId
- **FR-009**: Set organization name based on law firm slug
- **FR-010**: Support optional metadata storage
- **FR-011**: Ensure atomic operation (rollback if Logto org creation fails)
- **FR-012**: Delete Logto org when law firm is deleted

## Notes

### Simplification Rationale

This design removes complexity by:
- **No manual org binding**: Can't bind to existing Logto orgs
- **No org updates**: Can't change org binding after creation
- **No sync endpoints**: Org is always created atomically with firm
- **Simple lifecycle**: Create firm → creates org; Delete firm → deletes org

This makes the system more predictable and easier to maintain.
