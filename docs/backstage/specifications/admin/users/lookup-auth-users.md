---
sidebar_position: 6
---

# Lookup Auth Users

**API Endpoint**: `GET /admin/auth-users`

**Priority**: P2

**User Story**: As an admin, I want to search for Logto authentication users by email or phone to link them to law firm profiles.

## Overview

Search for existing Logto authentication users by email or phone number. This endpoint is used during user provisioning to determine if a Logto user already exists before creating a new one, enabling profile linking to existing identities.

## Scenarios

### Scenario 1: Lookup by email - user found

**Given**:
- Admin is authenticated with scope `auth-users:read`
- Logto user exists with email `jane.doe@example.com`
- Logto user ID is `logto_xyz789`

**When**:
- Admin GETs `/admin/auth-users?email=jane.doe@example.com`

**Then**:
- Response status is `200 OK`
- Response body contains:
  ```json
  {
    "data": [
      {
        "logtoUserId": "logto_xyz789",
        "email": "jane.doe@example.com",
        "phoneNumber": "+1-555-0100",
        "emailVerified": true,
        "phoneVerified": false,
        "name": "Jane Doe",
        "createdAt": "2024-01-15T10:00:00Z"
      }
    ]
  }
  ```

### Scenario 2: Lookup by email - not found

**Given**:
- Admin is authenticated with scope `auth-users:read`
- No Logto user with email `nonexistent@example.com`

**When**:
- Admin GETs `/admin/auth-users?email=nonexistent@example.com`

**Then**:
- Response status is `200 OK`
- Response body contains:
  ```json
  {
    "data": []
  }
  ```

### Scenario 3: Lookup by phone number

**Given**:
- Admin is authenticated with scope `auth-users:read`
- Logto user exists with phone `+1-555-0200`

**When**:
- Admin GETs `/admin/auth-users?phone=%2B1-555-0200`

**Then**:
- Response status is `200 OK`
- Response contains matching Logto user with phone number

### Scenario 4: Multiple matches (edge case)

**Given**:
- Admin is authenticated with scope `auth-users:read`
- Multiple Logto users share email domain wildcard match (e.g., partial search)

**When**:
- Admin GETs `/admin/auth-users?email=john@example.com`

**Then**:
- Response status is `200 OK`
- Response returns all exact matches only
- Partial matches are not included

### Scenario 5: Missing search parameter

**Given**:
- Admin is authenticated with scope `auth-users:read`

**When**:
- Admin GETs `/admin/auth-users` (no email or phone parameter)

**Then**:
- Response status is `400 Bad Request`
- Response body contains:
  ```json
  {
    "error": "VALIDATION_ERROR",
    "message": "Either 'email' or 'phone' parameter is required"
  }
  ```

### Scenario 6: Invalid email format

**Given**:
- Admin is authenticated with scope `auth-users:read`

**When**:
- Admin GETs `/admin/auth-users?email=invalid-email`

**Then**:
- Response status is `400 Bad Request`
- Response body contains:
  ```json
  {
    "error": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address"
      }
    ]
  }
  ```

### Scenario 7: Both email and phone provided

**Given**:
- Admin is authenticated with scope `auth-users:read`

**When**:
- Admin GETs `/admin/auth-users?email=jane@example.com&phone=%2B1-555-0100`

**Then**:
- Response status is `200 OK`
- Response returns users matching **either** email **or** phone (OR logic)
- If same user matches both, returned only once

## Request Specification

### Query Parameters

| Parameter | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| email | string | Conditional | Valid email format | Email address to search for |
| phone | string | Conditional | E.164 format recommended | Phone number to search for |

**Note**: At least one of `email` or `phone` is required.

### Validation Rules

| Rule | Description |
|------|-------------|
| Parameter requirement | Must provide at least email or phone |
| Email format | Must be valid email address if provided |
| Phone format | Should be E.164 format (+1234567890) |
| Exact matching | Only exact matches returned, no wildcards |

## Response Specification

### Success Response (200 OK)

```json
{
  "data": [
    {
      "logtoUserId": "logto_xyz789",
      "email": "jane.doe@example.com",
      "phoneNumber": "+1-555-0100",
      "emailVerified": true,
      "phoneVerified": false,
      "name": "Jane Doe",
      "avatar": "https://avatar.example.com/jane.jpg",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| data | array | Array of matching Logto user objects |
| data[].logtoUserId | string | Logto user identifier |
| data[].email | string \| null | User's email address |
| data[].phoneNumber | string \| null | User's phone number |
| data[].emailVerified | boolean | Whether email is verified |
| data[].phoneVerified | boolean | Whether phone is verified |
| data[].name | string \| null | User's display name |
| data[].avatar | string \| null | Avatar/profile picture URL |
| data[].createdAt | string | Account creation timestamp |

### Error Responses

| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | VALIDATION_ERROR | Missing required parameters or invalid format |
| 401 | UNAUTHORIZED | Missing or invalid auth token |
| 403 | FORBIDDEN | Missing `auth-users:read` scope |
| 503 | SERVICE_UNAVAILABLE | Logto service unreachable |

## Requirements Mapping

- **FR-070**: Accept GET with email or phone query parameters
- **FR-071**: Require at least one search parameter (email or phone)
- **FR-072**: Validate email format if provided
- **FR-073**: Support E.164 phone number format
- **FR-074**: Return array of matching Logto users
- **FR-075**: Use exact matching (no wildcards or partial matches)
- **FR-076**: Support OR logic when both email and phone provided
- **FR-077**: Return empty array when no matches found
- **FR-078**: Include verification status (emailVerified, phoneVerified)
- **FR-079**: Include user metadata (name, avatar) when available
- **FR-080**: Handle Logto API errors gracefully

## Notes

### Use Case: User Provisioning Flow

This endpoint is typically used during user provisioning:

1. Admin initiates user provisioning with email
2. System calls `GET /admin/auth-users?email={email}` to check if Logto user exists
3. If found: Link existing Logto user to new law firm profile
4. If not found: Create new Logto user, then create profile

### Privacy Considerations

This endpoint exposes Logto user data. Ensure:
- Only admins with `auth-users:read` scope can access
- Audit log all lookups for compliance
- Do not expose sensitive user data unnecessarily

### Rate Limiting

Consider implementing rate limiting on this endpoint to prevent:
- Email/phone enumeration attacks
- Bulk user harvesting
- Excessive Logto API calls

### Logto Integration

This endpoint makes real-time calls to Logto Management API:
- Requires Logto Management API credentials
- May experience latency based on Logto service
- Should implement caching for frequently looked-up users
- Handle Logto service outages gracefully (503 response)
