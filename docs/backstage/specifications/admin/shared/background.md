---
sidebar_position: 1
---

# Common Background Steps

This document defines reusable **Given** steps used across multiple feature files.

## Authentication

### Authenticated Admin

```gherkin
Given admin is authenticated with scope "{scope}"
```

**Implementation**:
- Generate valid JWT token with specified scope
- Include token in Authorization header: `Bearer \{token\}`
- Token includes claims: `sub` (admin user ID), `scope`, `exp` (1 hour from now)

**Example scopes**:
- `firms:create`, `firms:read`
- `users:create`, `users:read`, `users:update`, `users:delete`
- `support:access:create`, `support:access:read`, `support:access:revoke`
- `access-grants:create`, `access-grants:read`, `access-grants:delete`

### Unauthenticated Request

```gherkin
Given request has no authentication token
```

**Implementation**:
- Omit Authorization header from request
- Used for testing 401 Unauthorized responses

## Data Fixtures

### Law Firms

```gherkin
Given law firm "{lawFirmId}" exists
```

**Implementation**:
- Create law firm record in database
- Default values unless specified:
  ```json
  {
    "id": "{lawFirmId}",
    "name": "Test Law Firm",
    "slug": "test-law-firm",
    "logtoOrgId": "org_{lawFirmId}",
    "createdAt": "2025-01-01T00:00:00Z"
  }
  ```

```gherkin
Given law firm "{lawFirmId}" exists with Logto org "{logtoOrgId}"
```

**Implementation**:
- Create law firm with specific Logto organization binding

```gherkin
Given no law firm with slug "{slug}" exists
```

**Implementation**:
- Delete any existing law firm with the specified slug
- Used for clean state before creation tests

### Users

```gherkin
Given user "{userId}" exists in law firm "{lawFirmId}"
```

**Implementation**:
- Create auth user record
- Create firm user profile
- Link to law firm
- Default functional role: `["LAWYER"]`

```gherkin
Given no user with email "{email}" exists
```

**Implementation**:
- Delete any existing user with the email
- Ensures clean state for user creation tests

```gherkin
Given existing Logto user with ID "{logtoUserId}"
```

**Implementation**:
- Create user in Logto system
- User can be linked to firm profiles

### Credentials

```gherkin
Given user "{userId}" has credential:
  | type | jurisdictionCode | number | status |
  | BAR_LICENSE | CA | 123456 | ACTIVE |
```

**Implementation**:
- Create professional credential for user
- Support all credential types: BAR_LICENSE, NOTARY, OTHER

### Logto Organizations

```gherkin
Given Logto org "{logtoOrgId}" exists
```

**Implementation**:
- Create organization in Logto
- Used for testing org binding

```gherkin
Given Logto org "{logtoOrgId}" has member "{userId}" with roles [{roles}]
```

**Implementation**:
- Add user to Logto organization
- Assign specified roles
- Example: `["attorney", "admin"]`

### Support Sessions

```gherkin
Given active support session exists for user "{userId}"
```

**Implementation**:
- Create support session record with:
  - status: "active"
  - expiresAt: 30 minutes in future
  - Generate delegated token

```gherkin
Given no active support session exists for user "{userId}"
```

**Implementation**:
- Delete or expire any active sessions for user
- Ensures clean state for session creation

### Access Grants

```gherkin
Given resource access grant exists:
  | resourceType | resourceId | userId | accessLevel | source |
  | CASE | case_123 | user_789 | EDIT | MANUAL |
```

**Implementation**:
- Create resource access grant record
- Support all access levels: VIEW, EDIT, UPLOAD, ADMIN
- Support all sources: MANUAL, ROLE, CASE_MEMBER, SYSTEM

## State Verification

### System State

```gherkin
Given system has {count} law firms
```

**Implementation**:
- Create specified number of law firms
- Used for pagination testing

```gherkin
Given system has 0 law firms
```

**Implementation**:
- Delete all law firms from database
- Used for empty result testing

## Time-Based Conditions

### Session Timing

```gherkin
Given support session was created {minutes} minutes ago with TTL {ttl}
```

**Implementation**:
- Create session with `startedAt` = current time - \{minutes\} minutes
- Set `expiresAt` = `startedAt` + \{ttl\} minutes
- Used for expiration testing

### Credential Expiration

```gherkin
Given credential was issued on "{date}" and expires on "{expirationDate}"
```

**Implementation**:
- Create credential with specific issuedAt and expiresAt dates
- Used for testing credential validity

## Composite Fixtures

### Complete User Setup

```gherkin
Given user "{userId}" is fully provisioned:
  | email | givenName | familyName | title | roles | credentials |
  | john@example.com | John | Doe | Partner | LAWYER | BAR_LICENSE:CA:123456 |
```

**Implementation**:
- Create auth user
- Create firm profile with all details
- Create credentials
- Add to Logto org

### Law Firm with Users

```gherkin
Given law firm "{lawFirmId}" has {count} users
```

**Implementation**:
- Create law firm
- Create specified number of users
- All users added to firm

## Usage Examples

### Example 1: Clean Slate User Creation

```gherkin
Given admin is authenticated with scope "users:create"
And law firm "firm_abc" exists
And no user with email "new@example.com" exists
When admin POSTs to /admin/law-firms/firm_abc/users with email "new@example.com"
Then response status is 201 Created
```

### Example 2: Duplicate Prevention

```gherkin
Given admin is authenticated with scope "firms:create"
And law firm "firm_abc" exists with slug "acme-legal"
When admin POSTs to /admin/law-firms with slug "acme-legal"
Then response status is 409 Conflict
```

### Example 3: Session Expiration

```gherkin
Given support staff is authenticated with scope "support:access:create"
And support session was created 35 minutes ago with TTL 30
When support staff uses the delegated token
Then response status is 401 Unauthorized
And error is "TOKEN_EXPIRED"
```
