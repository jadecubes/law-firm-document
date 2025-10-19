---
sidebar_position: 2
---

# Add Credential

**API Endpoint**: `POST /admin/law-firms/{lawFirmId}/users/{userId}/credentials`

**Priority**: P1

**User Story**: As an admin, I want to add a professional credential to a user's profile.

## Overview

Attach professional credentials (bar licenses, notary certifications, etc.) to user profiles within a law firm. Credentials are verified and stored with metadata for compliance tracking.

## Scenarios

### Scenario 1: Add bar license credential

**Given**:
- Admin is authenticated with scope `credentials:create`
- Law firm `firm_abc123` exists
- User `user_12345` exists in law firm
- User has functional role `LAWYER`

**When**:
- Admin POSTs to `/admin/law-firms/firm_abc123/users/user_12345/credentials` with payload:
  ```json
  {
    "credentialType": "BAR_LICENSE",
    "issuingAuthority": "New York State Bar",
    "credentialNumber": "12345678",
    "issueDate": "2020-01-15",
    "expirationDate": "2025-12-31",
    "jurisdictions": ["NY"],
    "status": "ACTIVE",
    "verificationStatus": "VERIFIED",
    "metadata": {
      "admissionDate": "2020-01-15",
      "courtAdmissions": ["NY Supreme Court", "US District Court SDNY"]
    }
  }
  ```

**Then**:
- Response status is `201 Created`
- Response body contains:
  ```json
  {
    "id": "cred_xyz789",
    "userId": "user_12345",
    "credentialType": "BAR_LICENSE",
    "issuingAuthority": "New York State Bar",
    "credentialNumber": "12345678",
    "issueDate": "2020-01-15",
    "expirationDate": "2025-12-31",
    "jurisdictions": ["NY"],
    "status": "ACTIVE",
    "verificationStatus": "VERIFIED",
    "metadata": {
      "admissionDate": "2020-01-15",
      "courtAdmissions": ["NY Supreme Court", "US District Court SDNY"]
    },
    "createdAt": "2025-10-19T10:00:00Z",
    "updatedAt": "2025-10-19T10:00:00Z"
  }
  ```
- Credential is stored and linked to user profile

### Scenario 2: Add notary certification

**Given**:
- Admin is authenticated with scope `credentials:create`
- Law firm `firm_abc123` exists
- User `user_12345` exists with role `PARALEGAL`

**When**:
- Admin POSTs notary credential:
  ```json
  {
    "credentialType": "NOTARY_PUBLIC",
    "issuingAuthority": "California Secretary of State",
    "credentialNumber": "NP-987654",
    "issueDate": "2024-03-01",
    "expirationDate": "2028-03-01",
    "jurisdictions": ["CA"],
    "status": "ACTIVE",
    "verificationStatus": "PENDING"
  }
  ```

**Then**:
- Response status is `201 Created`
- Credential created with `PENDING` verification status
- Can be verified later through separate workflow

### Scenario 3: Duplicate credential rejection

**Given**:
- Admin is authenticated with scope `credentials:create`
- User `user_12345` already has BAR_LICENSE credential with number `12345678`

**When**:
- Admin attempts to add same credential:
  ```json
  {
    "credentialType": "BAR_LICENSE",
    "credentialNumber": "12345678",
    "issuingAuthority": "New York State Bar"
  }
  ```

**Then**:
- Response status is `409 Conflict`
- Response body contains:
  ```json
  {
    "error": "DUPLICATE_CREDENTIAL",
    "message": "User already has BAR_LICENSE credential with number '12345678'"
  }
  ```

### Scenario 4: Missing required fields

**Given**:
- Admin is authenticated with scope `credentials:create`
- User exists

**When**:
- Admin POSTs without required fields:
  ```json
  {
    "credentialType": "BAR_LICENSE"
  }
  ```

**Then**:
- Response status is `400 Bad Request`
- Response contains validation errors for missing fields:
  ```json
  {
    "error": "VALIDATION_ERROR",
    "message": "Missing required fields",
    "details": [
      {
        "field": "issuingAuthority",
        "message": "Required field"
      },
      {
        "field": "credentialNumber",
        "message": "Required field"
      }
    ]
  }
  ```

### Scenario 5: Invalid credential type

**Given**:
- Admin is authenticated with scope `credentials:create`

**When**:
- Admin POSTs with invalid credential type:
  ```json
  {
    "credentialType": "INVALID_TYPE",
    "issuingAuthority": "Some Authority",
    "credentialNumber": "12345"
  }
  ```

**Then**:
- Response status is `400 Bad Request`
- Response contains:
  ```json
  {
    "error": "VALIDATION_ERROR",
    "message": "Invalid credential type",
    "details": [
      {
        "field": "credentialType",
        "message": "Must be one of: BAR_LICENSE, NOTARY_PUBLIC, PROFESSIONAL_CERTIFICATION"
      }
    ]
  }
  ```

### Scenario 6: User not found

**Given**:
- Admin is authenticated with scope `credentials:create`
- No user with ID `user_nonexistent`

**When**:
- Admin POSTs to `/admin/law-firms/firm_abc123/users/user_nonexistent/credentials`

**Then**:
- Response status is `404 Not Found`
- Response body contains:
  ```json
  {
    "error": "NOT_FOUND",
    "message": "User with ID 'user_nonexistent' not found in law firm 'firm_abc123'"
  }
  ```

## Request Specification

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| lawFirmId | string | Yes | Law firm identifier |
| userId | string | Yes | User identifier |

### Request Body

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| credentialType | string | Yes | Enum: BAR_LICENSE, NOTARY_PUBLIC, PROFESSIONAL_CERTIFICATION | Type of credential |
| issuingAuthority | string | Yes | 1-200 chars | Organization that issued credential |
| credentialNumber | string | Yes | 1-100 chars | Unique credential identifier |
| issueDate | string | No | ISO 8601 date | Date credential was issued |
| expirationDate | string | No | ISO 8601 date | Date credential expires |
| jurisdictions | array | No | Array of strings | Jurisdictions where valid |
| status | string | No | Enum: ACTIVE, INACTIVE, SUSPENDED, REVOKED | Current status (defaults to ACTIVE) |
| verificationStatus | string | No | Enum: VERIFIED, PENDING, FAILED | Verification state (defaults to PENDING) |
| metadata | object | No | JSON object | Additional credential data |

### Validation Rules

| Rule | Description |
|------|-------------|
| Credential uniqueness | User cannot have duplicate credential (same type + number) |
| Date validation | expirationDate must be after issueDate if both provided |
| Jurisdiction format | Must be valid 2-letter state/country codes |
| Status values | Must be valid enum value |

## Response Specification

### Success Response (201 Created)

```json
{
  "id": "cred_xyz789",
  "userId": "user_12345",
  "credentialType": "BAR_LICENSE",
  "issuingAuthority": "New York State Bar",
  "credentialNumber": "12345678",
  "issueDate": "2020-01-15",
  "expirationDate": "2025-12-31",
  "jurisdictions": ["NY"],
  "status": "ACTIVE",
  "verificationStatus": "VERIFIED",
  "metadata": {
    "admissionDate": "2020-01-15",
    "courtAdmissions": ["NY Supreme Court", "US District Court SDNY"]
  },
  "createdAt": "2025-10-19T10:00:00Z",
  "updatedAt": "2025-10-19T10:00:00Z"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique credential identifier (generated) |
| userId | string | User this credential belongs to |
| credentialType | string | Type of credential |
| issuingAuthority | string | Issuing organization |
| credentialNumber | string | Credential number/ID |
| issueDate | string \| null | Issue date (ISO 8601) |
| expirationDate | string \| null | Expiration date (ISO 8601) |
| jurisdictions | array | Valid jurisdictions |
| status | string | Current status |
| verificationStatus | string | Verification state |
| metadata | object \| null | Additional data |
| createdAt | string | Creation timestamp |
| updatedAt | string | Last update timestamp |

### Error Responses

| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid input or missing required fields |
| 401 | UNAUTHORIZED | Missing or invalid auth token |
| 403 | FORBIDDEN | Missing `credentials:create` scope |
| 404 | NOT_FOUND | User or law firm not found |
| 409 | DUPLICATE_CREDENTIAL | User already has this credential |

## Requirements Mapping

- **FR-030**: Accept POST with credential details
- **FR-031**: Validate credential type against allowed enum
- **FR-032**: Ensure credential uniqueness per user (type + number)
- **FR-033**: Support optional date fields (issue/expiration)
- **FR-034**: Store verification status (VERIFIED, PENDING, FAILED)
- **FR-035**: Support jurisdictions array for multi-state licenses
- **FR-036**: Allow flexible metadata storage
- **FR-037**: Return complete credential details with generated ID
- **FR-038**: Prevent duplicate credentials (409 response)
- **FR-039**: Link credential to user profile
