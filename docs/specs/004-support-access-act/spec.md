---
sidebar_position: 4
---

# Feature Specification: Support Access (Act-As) Feature

**Feature Branch**: `004-support-access-act`
**Created**: 2025-10-15
**Status**: Draft
**Input**: User description: "Support Access Act-As Feature for admin support staff to temporarily impersonate users with delegated tokens, audit logging, and automatic expiration"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Initiate Support Session (Priority: P1)

A support staff member receives a help request from a user who cannot upload documents. The support staff needs to temporarily access the system as that user to diagnose and resolve the issue without asking for credentials or extensive screenshots.

**Why this priority**: This is the core functionality enabling effective customer support. Without this capability, support staff cannot efficiently troubleshoot user-specific issues, leading to longer resolution times and poor customer experience.

**Independent Test**: Can be fully tested by initiating a support session for a target user with 30-minute TTL and reason "Troubleshoot document upload", receiving a delegated token, using the token to access resources as the target user, and verifying all actions are attributed to the target user but logged with support staff actor information.

**Acceptance Scenarios**:

1. **Given** a support staff member needs to help user ID "user_12345" in law firm "firm_abc", **When** they request support access with lawFirmId="firm_abc", targetUserId="user_12345", reason="Cannot upload case documents", ttlMinutes=30, **Then** the system creates a support session, generates a delegated JWT token acting as user_12345 with actor metadata, and returns the session details with the token
2. **Given** support staff initiates a session, **When** the system generates the delegated token, **Then** the token contains claims: sub=user_12345 (target user), act=\{actorUserId: support_staff_id\}, ctx=\{lawFirmId: firm_abc\}, act_as=true, and expiry set to current time + 30 minutes
3. **Given** support staff requests a session with 15-minute TTL, **When** the session is created, **Then** the expiry timestamp is exactly 15 minutes from the session start time
4. **Given** support staff provides optional scopes array ["cases:read", "documents:read"], **When** delegated token is generated, **Then** the token is limited to only these scopes (narrower than target user's full permissions)

---

### User Story 2 - Use Delegated Token for Support (Priority: P1)

A support staff member has received a delegated token and needs to use it to access the application as the target user to view their cases, documents, and permissions to diagnose the reported issue.

**Why this priority**: The delegated token must work correctly for support to be effective. This is the actual troubleshooting step that resolves customer issues.

**Independent Test**: Can be fully tested by obtaining a delegated token, making API requests with the token in Authorization header, verifying requests succeed and return data as if the target user made them, and confirming backend logs show both target user (primary subject) and actor (support staff) for audit purposes.

**Acceptance Scenarios**:

1. **Given** a valid active support session with delegated token, **When** support staff uses the token in Authorization header to access user resources, **Then** the system grants access as if the target user made the request
2. **Given** a delegated token for user "user_123", **When** support staff requests user_123's case list, **Then** the system returns cases accessible to user_123 based on their permissions
3. **Given** a support session, **When** support staff performs actions using the delegated token, **Then** all audit logs record both the target user (sub) and the support staff actor (act.actorUserId) for accountability
4. **Given** a delegated token with narrowed scopes ["cases:read"], **When** support staff attempts actions requiring "cases:write" scope, **Then** the system denies access even if the target user has that permission

---

### User Story 3 - Automatic Session Expiration (Priority: P1)

A support session was created 35 minutes ago with a 30-minute TTL. The system must automatically prevent further use of the delegated token to ensure time-limited access and reduce security risk.

**Why this priority**: Automatic expiration is critical for security. Support sessions must not persist indefinitely, and expired tokens must be rejected to prevent unauthorized access if tokens are compromised.

**Independent Test**: Can be fully tested by creating a support session with TTL of 2 minutes, waiting 3 minutes, attempting to use the delegated token, and verifying the token is rejected with an expiration error.

**Acceptance Scenarios**:

1. **Given** a support session created at 10:00 AM with 30-minute TTL, **When** the current time is 10:35 AM (35 minutes later), **Then** the system rejects any requests using the delegated token with an expiration error
2. **Given** a support session approaching expiration (29 minutes elapsed), **When** support staff uses the token, **Then** the request succeeds (token still valid for 1 more minute)
3. **Given** an expired support session, **When** the session status is checked, **Then** the system returns status="expired"
4. **Given** JWT token has standard exp claim, **When** the token is validated, **Then** the system uses the exp claim to determine token validity (no separate session check required for every request)

---

### User Story 4 - List and Monitor Active Sessions (Priority: P2)

A platform administrator or security auditor needs to view all currently active support sessions to monitor support activity, ensure compliance, and identify any suspicious access patterns.

**Why this priority**: Session monitoring is important for security oversight and compliance, but not required for basic support operations to function.

**Independent Test**: Can be fully tested by creating 5 support sessions across different law firms and actors, querying the session list with various filters (lawFirmId, actorAdminUserId, targetUserId), and verifying only matching active sessions are returned with full details.

**Acceptance Scenarios**:

1. **Given** 10 active support sessions exist, **When** admin requests the session list, **Then** the system returns all active sessions with pagination metadata
2. **Given** multiple support sessions, **When** admin filters by lawFirmId="firm_abc", **Then** the system returns only sessions for that law firm
3. **Given** sessions by different support staff, **When** admin filters by actorAdminUserId="support_1", **Then** the system returns only sessions initiated by support_1
4. **Given** sessions for different target users, **When** admin filters by targetUserId="user_123", **Then** the system returns only sessions accessing user_123
5. **Given** a mix of active, expired, and revoked sessions, **When** admin requests session list without status filter, **Then** the system returns only active sessions by default

---

### User Story 5 - Retrieve Session Details (Priority: P2)

A support staff member or administrator needs to view complete details of a specific support session to verify the session parameters, check expiration time, or review the access reason for audit purposes.

**Why this priority**: Session detail retrieval supports accountability and audit workflows but is not required for basic support access functionality.

**Independent Test**: Can be fully tested by creating a support session, retrieving it by session ID, and verifying all fields match the created session (ID, law firm, target user, actor, start time, expiry, status, reason).

**Acceptance Scenarios**:

1. **Given** a support session exists with ID "session_xyz", **When** admin retrieves session "session_xyz", **Then** the system returns complete session details including ID, lawFirmId, targetUserId, actorAdminUserId, startedAt, expiresAt, status, and reason
2. **Given** no session exists with ID "session_nonexistent", **When** admin attempts to retrieve it, **Then** the system returns HTTP 404 Not Found
3. **Given** a session was created 10 minutes ago with 30-minute TTL, **When** the session is retrieved, **Then** the expiresAt timestamp shows 20 minutes in the future

---

### User Story 6 - Manually Revoke Active Session (Priority: P2)

A platform administrator discovers a support session that should be terminated immediately (e.g., support issue resolved, security concern, or accidental initiation). The administrator needs to manually revoke the session to immediately invalidate the delegated token.

**Why this priority**: Manual revocation is an important security control and cleanup mechanism, but automatic expiration handles most session lifecycle management.

**Independent Test**: Can be fully tested by creating an active support session, using the delegated token successfully, revoking the session, attempting to use the token again, and verifying the token is rejected with revocation error.

**Acceptance Scenarios**:

1. **Given** an active support session with ID "session_xyz", **When** admin revokes the session, **Then** the system updates the session status to "revoked" and returns HTTP 204 No Content
2. **Given** a recently revoked session, **When** support staff attempts to use the delegated token, **Then** the system rejects the request with a revocation error
3. **Given** an already expired session, **When** admin attempts to revoke it, **Then** the system returns HTTP 404 Not Found (cannot revoke non-active session)
4. **Given** a support session is revoked, **When** the session is retrieved, **Then** the status field shows "revoked"

---

### Edge Cases

- What happens when initiating a support session for a target user who doesn't exist or belongs to a different law firm?
- How does the system handle support session creation when the support staff member is not authorized for support access role?
- What validation occurs for session reason to prevent empty or excessively long reasons?
- How are delegated tokens handled when the target user's permissions change during an active support session?
- What happens when a support staff member has multiple concurrent active sessions for the same target user?
- How does the system behave when filtering sessions with invalid law firm ID or user ID parameters?
- What occurs when requesting a session with TTL below minimum (5 minutes) or above maximum (120 minutes)?
- How are delegated tokens invalidated when session is revoked (immediate invalidation vs. relying on token expiration)?

## Requirements *(mandatory)*

### Functional Requirements

#### Session Initiation

- **FR-001**: System MUST allow authorized support staff to initiate support access sessions
- **FR-002**: System MUST require lawFirmId, targetUserId, reason, and ttlMinutes for all session requests
- **FR-003**: System MUST validate reason has minimum length of 5 characters
- **FR-004**: System MUST validate ttlMinutes is between 5 and 120 minutes (inclusive)
- **FR-005**: System MUST default ttlMinutes to 30 when not specified
- **FR-006**: System MUST generate unique session ID for each support session
- **FR-007**: System MUST record session start timestamp (startedAt)
- **FR-008**: System MUST calculate and record expiry timestamp (expiresAt = startedAt + ttlMinutes)
- **FR-009**: System MUST set initial session status to "active"
- **FR-010**: System MUST store actor admin user ID (support staff initiating the session)
- **FR-011**: System MUST validate target user exists and belongs to specified law firm
- **FR-012**: System MUST validate support staff has support access authorization

#### Delegated Token Generation

- **FR-013**: System MUST generate JWT delegated token upon successful session creation
- **FR-014**: System MUST set token sub (subject) claim to target user ID
- **FR-015**: System MUST include act (actor) claim with actorUserId field containing support staff ID
- **FR-016**: System MUST include ctx (context) claim with lawFirmId field
- **FR-017**: System MUST include act_as claim set to true
- **FR-018**: System MUST set token exp (expiration) claim to session expiresAt timestamp
- **FR-019**: System MUST support optional scope narrowing via scopes array in request
- **FR-020**: System MUST limit delegated token to specified scopes when provided
- **FR-021**: System MUST inherit target user's full scopes when scopes array is omitted
- **FR-022**: System MUST sign delegated token with appropriate secret/key for validation

#### Delegated Token Usage

- **FR-023**: System MUST accept delegated tokens in Authorization: Bearer header
- **FR-024**: System MUST validate delegated token signature and expiration
- **FR-025**: System MUST grant access based on token sub claim (target user)
- **FR-026**: System MUST enforce scope restrictions when token has narrowed scopes
- **FR-027**: System MUST log all actions with both target user (sub) and actor (act.actorUserId) for audit
- **FR-028**: System MUST reject expired delegated tokens with appropriate error
- **FR-029**: System MUST reject revoked session tokens with appropriate error

#### Session Listing and Filtering

- **FR-030**: System MUST support listing support access sessions with pagination
- **FR-031**: System MUST default to listing only active sessions unless status filter specified
- **FR-032**: System MUST support filtering by lawFirmId
- **FR-033**: System MUST support filtering by actorAdminUserId (support staff member)
- **FR-034**: System MUST support filtering by targetUserId
- **FR-035**: System MUST return pagination metadata (page, size, total)
- **FR-036**: System MUST default to page 1 and size 50 when not specified
- **FR-037**: System MUST enforce maximum page size of 200

#### Session Retrieval

- **FR-038**: System MUST support retrieving individual session details by session ID
- **FR-039**: System MUST return complete session information including all fields
- **FR-040**: System MUST return HTTP 404 Not Found when session ID does not exist
- **FR-041**: System MUST return session fields: id, lawFirmId, targetUserId, actorAdminUserId, startedAt, expiresAt, status

#### Session Revocation

- **FR-042**: System MUST support manual revocation of active support sessions
- **FR-043**: System MUST update session status to "revoked" when revoked
- **FR-044**: System MUST return HTTP 204 No Content on successful revocation
- **FR-045**: System MUST return HTTP 404 Not Found when revoking non-existent or non-active session
- **FR-046**: System MUST immediately invalidate delegated tokens from revoked sessions
- **FR-047**: System MUST record revocation timestamp for audit purposes

#### Session Expiration

- **FR-048**: System MUST automatically mark sessions as "expired" when current time exceeds expiresAt
- **FR-049**: System MUST reject delegated tokens from expired sessions
- **FR-050**: System MUST use JWT exp claim for efficient token expiration validation
- **FR-051**: System MUST transition session status from "active" to "expired" at expiry time

#### Security and Audit

- **FR-052**: System MUST require authentication for all support access endpoints
- **FR-053**: System MUST enforce authorization check that requestor has support staff role
- **FR-054**: System MUST log all session creation events with full context (actor, target, reason, law firm)
- **FR-055**: System MUST log all session revocation events with revoker identity
- **FR-056**: System MUST log all delegated token usage with both target user and actor information
- **FR-057**: System MUST include correlation ID (X-Request-Id) in all audit logs

#### UI Support

- **FR-058**: System MUST optionally return a UI switch URL for single-page application support mode
- **FR-059**: System MUST construct UI URL with delegated token as parameter or state
- **FR-060**: System MUST allow UI to switch into support mode using the delegated token

#### Error Handling

- **FR-061**: System MUST return HTTP 400 Bad Request for invalid input (missing required fields, invalid TTL, short reason)
- **FR-062**: System MUST return HTTP 403 Forbidden when requestor lacks support access authorization
- **FR-063**: System MUST return HTTP 404 Not Found when target user or law firm does not exist
- **FR-064**: System MUST return structured error responses with code, message, and request ID
- **FR-065**: System MUST include field-level validation errors when applicable

### Key Entities

- **Support Access Session**: Session record with unique ID, law firm context, target user ID, actor admin user ID (support staff), start timestamp, expiry timestamp, status (active/revoked/expired), reason for access, and optional scope restrictions
- **Delegated Token (JWT)**: Short-lived authentication token with claims: sub (target user), act (actor metadata with actorUserId), ctx (law firm context), act_as flag, scope (optional narrowed scopes), exp (expiration), and standard JWT claims (iat, iss, aud)
- **Start Support Access Request**: Input for session creation with lawFirmId, targetUserId, reason (min 5 chars), ttlMinutes (5-120, default 30), optional scopes array
- **Start Support Access Response**: Session creation output with session details and delegated token string, plus optional uiSwitchUrl for convenience

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Support staff can initiate a support session and receive a working delegated token in under 5 seconds
- **SC-002**: Delegated tokens grant access with 100% accuracy based on target user's permissions or narrowed scopes
- **SC-003**: All actions performed with delegated tokens are logged with both target user and actor information for 100% of requests
- **SC-004**: Expired session tokens are rejected with 100% accuracy within 1 second of expiration
- **SC-005**: Manually revoked sessions are invalidated immediately, with tokens rejected within 2 seconds of revocation
- **SC-006**: Session listing queries return results in under 300 milliseconds for databases with up to 10,000 sessions
- **SC-007**: System correctly enforces TTL range (5-120 minutes) rejecting 100% of out-of-range requests
- **SC-008**: Reason validation rejects 100% of reasons shorter than 5 characters
- **SC-009**: Scope narrowing correctly limits delegated token permissions for 100% of sessions with specified scopes
- **SC-010**: Session retrieval by ID completes in under 200 milliseconds
- **SC-011**: Audit logs capture complete session lifecycle (creation, usage, expiration/revocation) with zero data loss
- **SC-012**: System prevents unauthorized users from initiating support sessions with 100% accuracy
