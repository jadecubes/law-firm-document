---
sidebar_position: 1
---

# Provision User

**API Endpoint**: `POST /admin/law-firms/{lawFirmId}/users`
**Priority**: P1
**User Story**: As an admin, I want to provision a user with identity + firm profile + roles and optional credentials.

## Overview

Create a new user with Logto authentication identity, firm-specific profile, functional roles, and optional professional credentials in a single atomic operation.

## Scenarios

### Scenario 1: Provision lawyer with bar license

**Given**:
- Admin is authenticated with scope `users:create`
- Law firm `firm_abc` exists with Logto org `org_xyz`
- No existing user with email `john.doe@acme.com`

**When**:
- Admin POSTs to `/admin/law-firms/firm_abc/users` with payload:
  ```json
  {
    "email": "john.doe@acme.com",
    "givenName": "John",
    "familyName": "Doe",
    "profile": {
      "title": "Senior Partner",
      "functionalRoles": ["LAWYER"]
    },
    "credentials": [
      {
        "type": "BAR_LICENSE",
        "jurisdictionCode": "CA",
        "number": "123456",
        "issuedAt": "2010-06-15"
      }
    ],
    "orgRoles": ["attorney", "admin"],
    "sendInvite": true
  }
  ```

**Then**:
- Response status is `201 Created`
- Response body contains:
  - `authUser`: Created Logto user with `logtoUserId`
  - `firmProfile`: Firm profile with functional roles
  - `credentials`: Array with created bar license
  - `orgMembership`: Logto org membership with roles
  - `inviteSent`: true
- Logto user account is created
- Firm user profile is created
- Credential is stored
- User is added to Logto org with specified roles
- Invitation email is sent

### Scenario 2: Provision paralegal without credentials

**Given**:
- Admin is authenticated with scope `users:create`
- Law firm `firm_abc` exists

**When**:
- Admin POSTs to `/admin/law-firms/firm_abc/users` with payload:
  ```json
  {
    "email": "jane.smith@acme.com",
    "givenName": "Jane",
    "familyName": "Smith",
    "profile": {
      "title": "Paralegal",
      "functionalRoles": ["PARALEGAL"]
    },
    "sendInvite": false
  }
  ```

**Then**:
- Response status is `201 Created`
- User is created without credentials
- No invitation email is sent
- User can log in when they set up their account

### Scenario 3: Link to existing Logto user

**Given**:
- Admin is authenticated with scope `users:create`
- Existing Logto user with ID `user_existing789`
- User not yet in law firm `firm_abc`

**When**:
- Admin POSTs to `/admin/law-firms/firm_abc/users` with payload:
  ```json
  {
    "logtoUserId": "user_existing789",
    "profile": {
      "title": "Associate",
      "functionalRoles": ["LAWYER"]
    }
  }
  ```

**Then**:
- Response status is `201 Created`
- No new Logto user is created
- Firm profile is created for existing user
- Existing user is added to law firm's Logto org

### Scenario 4: Duplicate email rejection

**Given**:
- Admin is authenticated with scope `users:create`
- Existing user with email `john.doe@acme.com` in law firm `firm_abc`

**When**:
- Admin POSTs to `/admin/law-firms/firm_abc/users` with:
  ```json
  {
    "email": "john.doe@acme.com",
    "givenName": "John",
    "familyName": "Doe"
  }
  ```

**Then**:
- Response status is `409 Conflict`
- Response body contains:
  ```json
  {
    "error": "DUPLICATE_USER",
    "message": "User with email 'john.doe@acme.com' already exists in this law firm"
  }
  ```

### Scenario 5: Multiple functional roles

**Given**:
- Admin is authenticated with scope `users:create`
- Law firm exists

**When**:
- Admin provisions user with multiple functional roles:
  ```json
  {
    "email": "admin@acme.com",
    "givenName": "Admin",
    "familyName": "User",
    "profile": {
      "functionalRoles": ["IT_ADMIN", "BILLING_ADMIN"]
    }
  }
  ```

**Then**:
- Response status is `201 Created`
- User profile contains both functional roles
- User has permissions associated with both roles

## Request Specification

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| lawFirmId | string | Yes | Target law firm identifier |

### Request Body

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| email | string | Conditional* | Valid email format | User's email address |
| givenName | string | Conditional* | 1-100 chars | User's first name |
| familyName | string | Conditional* | 1-100 chars | User's last name |
| logtoUserId | string | Conditional* | Must exist in Logto | Link to existing Logto user |
| profile | object | Yes | - | Firm-specific profile |
| profile.title | string | No | Max 200 chars | Job title |
| profile.functionalRoles | string[] | Yes | Valid roles | User's functional roles |
| credentials | array | No | - | Professional credentials |
| orgRoles | string[] | No | Valid Logto role IDs | Logto organization roles |
| sendInvite | boolean | No | default: false | Send invitation email |

\* Either provide `logtoUserId` OR (`email`, `givenName`, `familyName`)

### Functional Roles

| Role | Description |
|------|-------------|
| LAWYER | Licensed attorney |
| PARALEGAL | Paralegal staff |
| RECEPTIONIST | Front desk staff |
| BILLING_ADMIN | Billing administrator |
| IT_ADMIN | IT administrator |
| INTERN | Legal intern |
| OTHER | Other staff |

### Credential Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | string | Yes | BAR_LICENSE, NOTARY, OTHER |
| jurisdictionCode | string | Yes | State/country code (e.g., "CA", "NY") |
| number | string | No | License/credential number |
| issuedAt | string | No | ISO 8601 date |
| expiresAt | string | No | ISO 8601 date |
| status | string | No | ACTIVE, SUSPENDED, EXPIRED |

## Response Specification

### Success Response (201 Created)

```json
{
  "authUser": {
    "id": "usr_abc123",
    "logtoUserId": "user_xyz789",
    "email": "john.doe@acme.com",
    "givenName": "John",
    "familyName": "Doe"
  },
  "firmProfile": {
    "id": "profile_def456",
    "lawFirmId": "firm_abc",
    "userId": "usr_abc123",
    "title": "Senior Partner",
    "functionalRoles": ["LAWYER"],
    "isActive": true
  },
  "credentials": [
    {
      "id": "cred_ghi789",
      "type": "BAR_LICENSE",
      "jurisdictionCode": "CA",
      "number": "123456",
      "issuedAt": "2010-06-15",
      "status": "ACTIVE"
    }
  ],
  "orgMembership": {
    "logtoOrgId": "org_xyz",
    "logtoUserId": "user_xyz789",
    "roles": ["attorney", "admin"]
  },
  "inviteSent": true
}
```

### Error Responses

| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid input format |
| 401 | UNAUTHORIZED | Missing or invalid auth token |
| 403 | FORBIDDEN | Missing `users:create` scope |
| 404 | LAW_FIRM_NOT_FOUND | Law firm does not exist |
| 409 | DUPLICATE_USER | User already exists in firm |
| 409 | LOGTO_USER_NOT_FOUND | Provided logtoUserId not found |

## Requirements Mapping

- **FR-001**: Accept POST with user creation data
- **FR-002**: Create or link Logto user identity
- **FR-003**: Create firm-specific user profile
- **FR-004**: Assign functional roles to profile
- **FR-005**: Create professional credentials
- **FR-006**: Add user to Logto organization
- **FR-007**: Assign Logto organization roles
- **FR-008**: Send invitation email when requested
- **FR-009**: Validate email uniqueness within firm
- **FR-010**: Support multiple functional roles per user
- **FR-011**: Return complete user details in response
- **FR-012**: Perform all operations atomically (rollback on failure)
