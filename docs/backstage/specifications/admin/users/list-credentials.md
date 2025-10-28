---
sidebar_position: 3
---

# List Credentials

**API Endpoint**: `GET /admin/law-firms/{lawFirmId}/users/{userId}/credentials`

**Priority**: P1

**User Story**: As an admin, I want to list all professional credentials for a specific user.

## Overview

Retrieve all professional credentials associated with a user within a law firm, including bar licenses, notary certifications, and other professional qualifications.

## Scenarios

### Scenario 1: List user credentials

**Given**:
- Admin is authenticated with scope `credentials:read`
- Law firm `firm_abc123` exists
- User `user_12345` exists with 3 credentials

**When**:
- Admin GETs `/admin/law-firms/firm_abc123/users/user_12345/credentials`

**Then**:
- Response status is `200 OK`
- Response body contains:
  ```json
  {
    "data": [
      {
        "id": "cred_001",
        "userId": "user_12345",
        "credentialType": "BAR_LICENSE",
        "issuingAuthority": "New York State Bar",
        "credentialNumber": "12345678",
        "issueDate": "2020-01-15",
        "expirationDate": "2025-12-31",
        "jurisdictions": ["NY"],
        "status": "ACTIVE",
        "verificationStatus": "VERIFIED",
        "createdAt": "2024-01-10T10:00:00Z",
        "updatedAt": "2024-01-10T10:00:00Z"
      },
      {
        "id": "cred_002",
        "userId": "user_12345",
        "credentialType": "BAR_LICENSE",
        "issuingAuthority": "Connecticut Bar Association",
        "credentialNumber": "CT-87654",
        "issueDate": "2021-05-20",
        "expirationDate": "2026-05-20",
        "jurisdictions": ["CT"],
        "status": "ACTIVE",
        "verificationStatus": "VERIFIED",
        "createdAt": "2024-03-15T14:30:00Z",
        "updatedAt": "2024-03-15T14:30:00Z"
      },
      {
        "id": "cred_003",
        "userId": "user_12345",
        "credentialType": "NOTARY_PUBLIC",
        "issuingAuthority": "New York Secretary of State",
        "credentialNumber": "NP-445566",
        "issueDate": "2023-08-01",
        "expirationDate": "2027-08-01",
        "jurisdictions": ["NY"],
        "status": "ACTIVE",
        "verificationStatus": "VERIFIED",
        "createdAt": "2024-08-05T09:15:00Z",
        "updatedAt": "2024-08-05T09:15:00Z"
      }
    ]
  }
  ```

### Scenario 2: Filter by credential type

**Given**:
- Admin is authenticated with scope `credentials:read`
- User has multiple credential types

**When**:
- Admin GETs `/admin/law-firms/firm_abc123/users/user_12345/credentials?type=BAR_LICENSE`

**Then**:
- Response status is `200 OK`
- Response contains only BAR_LICENSE credentials
- Other credential types are excluded

### Scenario 3: Filter by verification status

**Given**:
- Admin is authenticated with scope `credentials:read`
- User has credentials with mixed verification statuses

**When**:
- Admin GETs `/admin/law-firms/firm_abc123/users/user_12345/credentials?verificationStatus=PENDING`

**Then**:
- Response status is `200 OK`
- Response contains only credentials with `verificationStatus: "PENDING"`

### Scenario 4: Empty credential list

**Given**:
- Admin is authenticated with scope `credentials:read`
- User `user_12345` has no credentials

**When**:
- Admin GETs `/admin/law-firms/firm_abc123/users/user_12345/credentials`

**Then**:
- Response status is `200 OK`
- Response body contains:
  ```json
  {
    "data": []
  }
  ```

### Scenario 5: User not found

**Given**:
- Admin is authenticated with scope `credentials:read`
- No user with ID `user_nonexistent`

**When**:
- Admin GETs `/admin/law-firms/firm_abc123/users/user_nonexistent/credentials`

**Then**:
- Response status is `404 Not Found`
- Response body contains:
  ```json
  {
    "error": "NOT_FOUND",
    "message": "User with ID 'user_nonexistent' not found in law firm 'firm_abc123'"
  }
  ```

### Scenario 6: Include expired credentials

**Given**:
- Admin is authenticated with scope `credentials:read`
- User has 1 active and 1 expired credential

**When**:
- Admin GETs `/admin/law-firms/firm_abc123/users/user_12345/credentials?includeExpired=true`

**Then**:
- Response status is `200 OK`
- Response includes both active and expired credentials
- Without `includeExpired=true`, only active credentials returned (default behavior)

## Request Specification

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| lawFirmId | string | Yes | Law firm identifier |
| userId | string | Yes | User identifier |

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| type | string | No | (all) | Filter by credential type |
| verificationStatus | string | No | (all) | Filter by verification status |
| status | string | No | ACTIVE | Filter by credential status |
| includeExpired | boolean | No | false | Include expired credentials |

## Response Specification

### Success Response (200 OK)

```json
{
  "data": [
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
        "admissionDate": "2020-01-15"
      },
      "createdAt": "2025-10-19T10:00:00Z",
      "updatedAt": "2025-10-19T10:00:00Z"
    }
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| data | array | Array of credential objects |
| data[].id | string | Credential identifier |
| data[].userId | string | User identifier |
| data[].credentialType | string | Type of credential |
| data[].issuingAuthority | string | Issuing organization |
| data[].credentialNumber | string | Credential number |
| data[].issueDate | string \| null | Issue date (ISO 8601) |
| data[].expirationDate | string \| null | Expiration date (ISO 8601) |
| data[].jurisdictions | array | Valid jurisdictions |
| data[].status | string | Current status |
| data[].verificationStatus | string | Verification state |
| data[].metadata | object \| null | Additional data |
| data[].createdAt | string | Creation timestamp |
| data[].updatedAt | string | Last update timestamp |

### Error Responses

| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid query parameters |
| 401 | UNAUTHORIZED | Missing or invalid auth token |
| 403 | FORBIDDEN | Missing `credentials:read` scope |
| 404 | NOT_FOUND | User or law firm not found |

## Requirements Mapping

- **FR-040**: Accept GET with userId path parameter
- **FR-041**: Return array of all user credentials
- **FR-042**: Support filtering by credential type
- **FR-043**: Support filtering by verification status
- **FR-044**: Support filtering by status (ACTIVE, INACTIVE, etc.)
- **FR-045**: Default to excluding expired credentials
- **FR-046**: Allow includeExpired parameter to show all
- **FR-047**: Return empty array when user has no credentials
- **FR-048**: Include all credential fields in response
