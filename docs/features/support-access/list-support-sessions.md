---
sidebar_position: 2
---

# List Support Sessions

**API Endpoint**: `GET /admin/support-access/sessions`

**Priority**: P2

**User Story**: As an admin, I want to list all active and recent support access sessions for auditing and monitoring.

## Overview

Retrieve a paginated list of support access sessions, including active, expired, and revoked sessions. Supports filtering by user, support staff, and session status for comprehensive monitoring of impersonation activities.

## Scenarios

### Scenario 1: List active support sessions

**Given**:
- Admin is authenticated with scope `support-access:read`
- System has 3 active support sessions
- System has 2 expired sessions

**When**:
- Admin GETs `/admin/support-access/sessions?status=active`

**Then**:
- Response status is `200 OK`
- Response body contains:
  ```json
  {
    "data": [
      {
        "id": "session_001",
        "targetUserId": "user_12345",
        "targetUserName": "Jane Doe",
        "actorUserId": "support_789",
        "actorUserName": "Support Staff",
        "lawFirmId": "firm_abc123",
        "reason": "Help user resolve billing issue",
        "status": "ACTIVE",
        "startedAt": "2025-10-19T10:00:00Z",
        "expiresAt": "2025-10-19T10:30:00Z",
        "revokedAt": null,
        "delegatedToken": "session_token_xyz..."
      },
      {
        "id": "session_002",
        "targetUserId": "user_67890",
        "targetUserName": "John Smith",
        "actorUserId": "support_456",
        "actorUserName": "Senior Support",
        "lawFirmId": "firm_def456",
        "reason": "Investigate document upload error",
        "status": "ACTIVE",
        "startedAt": "2025-10-19T09:45:00Z",
        "expiresAt": "2025-10-19T10:15:00Z",
        "revokedAt": null,
        "delegatedToken": "session_token_abc..."
      }
    ],
    "meta": {
      "pagination": {
        "page": 1,
        "pageSize": 50,
        "totalItems": 3,
        "totalPages": 1
      }
    }
  }
  ```

### Scenario 2: List all sessions with pagination

**Given**:
- Admin is authenticated with scope `support-access:read`
- System has 75 total sessions

**When**:
- Admin GETs `/admin/support-access/sessions?page[number]=1&page[size]=25`

**Then**:
- Response status is `200 OK`
- Response contains first 25 sessions
- `meta.pagination.totalItems`: 75
- `meta.pagination.totalPages`: 3

### Scenario 3: Filter by target user

**Given**:
- Admin is authenticated with scope `support-access:read`
- User `user_12345` has been subject of 5 support sessions

**When**:
- Admin GETs `/admin/support-access/sessions?targetUserId=user_12345`

**Then**:
- Response status is `200 OK`
- Response contains only sessions for user_12345
- Sessions for other users are excluded

### Scenario 4: Filter by actor (support staff)

**Given**:
- Admin is authenticated with scope `support-access:read`
- Support staff `support_789` has initiated 10 sessions

**When**:
- Admin GETs `/admin/support-access/sessions?actorUserId=support_789`

**Then**:
- Response status is `200 OK`
- Response contains only sessions initiated by support_789

### Scenario 5: Filter by law firm

**Given**:
- Admin is authenticated with scope `support-access:read`
- Sessions exist for multiple law firms

**When**:
- Admin GETs `/admin/support-access/sessions?lawFirmId=firm_abc123`

**Then**:
- Response status is `200 OK`
- Response contains only sessions for firm_abc123

### Scenario 6: Filter by date range

**Given**:
- Admin is authenticated with scope `support-access:read`

**When**:
- Admin GETs `/admin/support-access/sessions?startedAfter=2025-10-01&startedBefore=2025-10-31`

**Then**:
- Response status is `200 OK`
- Response contains only sessions started in October 2025

### Scenario 7: Empty result set

**Given**:
- Admin is authenticated with scope `support-access:read`
- No sessions match filter criteria

**When**:
- Admin GETs `/admin/support-access/sessions?status=active&lawFirmId=firm_nonexistent`

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

## Request Specification

### Query Parameters

| Parameter | Type | Required | Default | Constraints | Description |
|-----------|------|----------|---------|-------------|-------------|
| status | string | No | (all) | ACTIVE, EXPIRED, REVOKED | Filter by session status |
| targetUserId | string | No | (all) | - | Filter by user being impersonated |
| actorUserId | string | No | (all) | - | Filter by support staff |
| lawFirmId | string | No | (all) | - | Filter by law firm |
| startedAfter | string | No | (none) | ISO 8601 date | Sessions started after date |
| startedBefore | string | No | (none) | ISO 8601 date | Sessions started before date |
| page[number] | integer | No | 1 | Min: 1 | Page number |
| page[size] | integer | No | 50 | Min: 1, Max: 200 | Items per page |

### Session Status Values

| Status | Description |
|--------|-------------|
| ACTIVE | Currently valid and usable |
| EXPIRED | TTL expired, no longer valid |
| REVOKED | Manually revoked before expiration |

## Response Specification

### Success Response (200 OK)

```json
{
  "data": [
    {
      "id": "session_xyz789",
      "targetUserId": "user_12345",
      "targetUserName": "Jane Doe",
      "targetUserEmail": "jane.doe@firm.com",
      "actorUserId": "support_789",
      "actorUserName": "Support Staff",
      "actorUserEmail": "support@platform.com",
      "lawFirmId": "firm_abc123",
      "lawFirmName": "Acme Legal Services",
      "reason": "Help user resolve billing issue",
      "status": "ACTIVE",
      "startedAt": "2025-10-19T10:00:00Z",
      "expiresAt": "2025-10-19T10:30:00Z",
      "revokedAt": null,
      "revokedBy": null,
      "delegatedToken": "eyJhbGc..."
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 50,
      "totalItems": 127,
      "totalPages": 3
    }
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| data | array | Array of support session objects |
| data[].id | string | Session identifier |
| data[].targetUserId | string | User being impersonated |
| data[].targetUserName | string \| null | Target user's name |
| data[].targetUserEmail | string \| null | Target user's email |
| data[].actorUserId | string | Support staff performing impersonation |
| data[].actorUserName | string \| null | Actor's name |
| data[].actorUserEmail | string \| null | Actor's email |
| data[].lawFirmId | string | Law firm context |
| data[].lawFirmName | string \| null | Law firm name |
| data[].reason | string | Reason for access |
| data[].status | string | Session status |
| data[].startedAt | string | Session start timestamp |
| data[].expiresAt | string | Expiration timestamp |
| data[].revokedAt | string \| null | Revocation timestamp |
| data[].revokedBy | string \| null | Admin who revoked |
| data[].delegatedToken | string | JWT for impersonation |
| meta.pagination | object | Pagination metadata |

### Error Responses

| Status | Error Code | Description |
|--------|------------|-------------|
| 400 | VALIDATION_ERROR | Invalid query parameters |
| 401 | UNAUTHORIZED | Missing or invalid auth token |
| 403 | FORBIDDEN | Missing `support-access:read` scope |

## Requirements Mapping

- **FR-248**: Accept GET with optional filter parameters
- **FR-249**: Support pagination with page[number] and page[size]
- **FR-250**: Default page size to 50, max 200
- **FR-251**: Return paginated array of support sessions
- **FR-252**: Include pagination metadata
- **FR-253**: Support filtering by status
- **FR-254**: Support filtering by targetUserId
- **FR-255**: Support filtering by actorUserId
- **FR-256**: Support filtering by lawFirmId
- **FR-257**: Support filtering by date range
- **FR-258**: Include user and firm metadata
- **FR-259**: Return empty array when no sessions
- **FR-260**: Require `support-access:read` scope

## Notes

### Use Cases

This endpoint is useful for:
- Monitoring active support access sessions
- Auditing support staff activities
- Compliance reporting
- Security investigations
- User access history

### Security Considerations

This endpoint exposes sensitive information:
- Who has access to which users
- When and why access was granted
- Delegated tokens (redacted in production)

Ensure:
- Only authorized admins can access
- Audit log all list requests
- Consider redacting delegated tokens
- Monitor for excessive querying

### Token Exposure

The `delegatedToken` field contains JWT:
- Use with caution in production
- Consider omitting or redacting
- Or require higher privilege scope
- Tokens can be used for impersonation

### Status Transitions

Session status lifecycle:
```
ACTIVE → EXPIRED (TTL reached)
ACTIVE → REVOKED (manual revocation)
```

Once EXPIRED or REVOKED, status does not change.

### Performance

For systems with many sessions:
- Use filters to narrow results
- Leverage pagination
- Consider indexes on commonly filtered fields
- May need archival strategy for old sessions

### Cleanup

Consider background job to:
- Delete sessions older than retention period
- Archive for compliance
- Maintain performance
