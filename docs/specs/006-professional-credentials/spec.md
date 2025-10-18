---
sidebar_position: 6
---

# Feature Specification: Professional Credentials Management

**Feature Branch**: `006-professional-credentials`
**Created**: 2025-10-16
**Status**: Draft
**Input**: Admin API documentation - Professional Credentials endpoints

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add Professional Credential (Priority: P1)

A law firm administrator needs to add professional credentials (bar license, notary certification, etc.) to a user's profile to track qualifications, ensure compliance, and enable credential-based filtering and reporting.

**Why this priority**: Professional credential tracking is essential for law firms to verify attorney qualifications, maintain bar compliance, and assign work based on credentials. This is foundational for regulatory compliance and operational needs.

**Independent Test**: Can be fully tested by adding a BAR_LICENSE credential to user "user_123" in firm "firm_abc" with type=BAR_LICENSE, jurisdictionCode=CA, number=12345, issuedAt=2020-01-15, status=ACTIVE, retrieving the credential, and verifying all fields match and the credential is associated with the user.

**Acceptance Scenarios**:

1. **Given** user "user_123" in firm "firm_abc" needs a bar license added, **When** admin creates credential with type=BAR_LICENSE, jurisdictionCode=CA, number=12345, issuedAt=2020-01-15, **Then** the system creates the credential and returns credential record with unique ID
2. **Given** admin adds credential with status field, **When** credential is created, **Then** the system stores the status (e.g., ACTIVE, SUSPENDED, EXPIRED)
3. **Given** admin adds credential with partial data (only type required), **When** credential is created with type=NOTARY and optional fields null, **Then** the system accepts the credential with nullable fields empty
4. **Given** admin adds credential of type OTHER, **When** credential is created, **Then** the system accepts the credential allowing custom credential types
5. **Given** user already has credentials, **When** admin adds another credential, **Then** the system allows multiple credentials per user
6. **Given** admin attempts to add duplicate credential (same type, jurisdiction, number), **When** duplicate is submitted, **Then** the system returns HTTP 409 Conflict
7. **Given** admin uses Idempotency-Key header, **When** request is retried, **Then** the system returns existing credential without creating duplicate

---

### User Story 2 - List User Credentials (Priority: P1)

A law firm administrator or compliance officer needs to view all professional credentials for a user to verify qualifications, check expiration dates, and ensure the user meets requirements for assigned work.

**Why this priority**: Viewing user credentials is essential for compliance verification, work assignment validation, and audit purposes. Administrators must be able to quickly see all credentials for any user.

**Independent Test**: Can be fully tested by adding 3 credentials to user "user_123" (bar license CA, bar license NY, notary CA), retrieving credentials for that user, and verifying all 3 credentials are returned with complete details including type, jurisdiction, number, issued date, status.

**Acceptance Scenarios**:

1. **Given** user "user_123" has 3 credentials, **When** admin requests credentials for user_123, **Then** the system returns all 3 credentials in array with full details
2. **Given** user has credentials with different types (BAR_LICENSE, NOTARY, OTHER), **When** admin retrieves credentials, **Then** all types are included in response
3. **Given** user has no credentials, **When** admin requests credentials, **Then** the system returns empty array
4. **Given** credentials have nullable fields (jurisdictionCode, number, status), **When** admin retrieves credentials, **Then** null fields are included in response as null
5. **Given** credentials have timestamps, **When** admin retrieves credentials, **Then** createdAt and updatedAt are included for audit purposes

---

### User Story 3 - Remove Professional Credential (Priority: P1)

A law firm administrator needs to remove a professional credential from a user when it is no longer valid (e.g., license expired, user changed jurisdiction, credential was added in error) to maintain accurate credential records.

**Why this priority**: Credential removal is critical for maintaining accurate compliance records. When credentials expire, are revoked, or were added incorrectly, they must be removed to prevent false compliance assumptions.

**Independent Test**: Can be fully tested by adding a credential to user, verifying it exists, deleting the credential by ID, attempting to retrieve it, and confirming it no longer exists in the user's credential list.

**Acceptance Scenarios**:

1. **Given** user "user_123" has credential with ID "cred_456", **When** admin deletes the credential, **Then** the system removes it and returns HTTP 204 No Content
2. **Given** credential has been deleted, **When** admin attempts to retrieve user's credentials, **Then** the deleted credential is not included in the list
3. **Given** admin attempts to delete non-existent credential, **When** deletion is attempted, **Then** the system returns HTTP 404 Not Found
4. **Given** user has multiple credentials, **When** admin deletes one credential, **Then** only that credential is removed and others remain
5. **Given** credential is referenced in user provisioning history, **When** credential is deleted, **Then** historical references are preserved for audit (soft delete or audit log)

---

### User Story 4 - Filter Users by Credentials (Priority: P2)

A law firm administrator needs to find users with specific credentials (e.g., all users with CA bar license, all notaries, all lawyers with NY bar) to assign work, generate reports, and ensure proper staffing for jurisdiction-specific cases.

**Why this priority**: Credential-based filtering enables efficient work assignment and compliance reporting. This is important for operations but lower priority than basic CRUD operations.

**Independent Test**: Can be fully tested by creating 10 users with various credentials (5 with CA bar, 3 with NY bar, 2 notaries), filtering profiles by credentialType=BAR_LICENSE, filtering by jurisdiction=CA, filtering by hasCredential=true, and verifying correct users are returned for each filter.

**Acceptance Scenarios**:

1. **Given** firm has 20 users with various credentials, **When** admin filters profiles by credentialType=BAR_LICENSE, **Then** the system returns only users with bar licenses
2. **Given** users have credentials in different jurisdictions, **When** admin filters by jurisdiction=CA, **Then** the system returns only users with CA credentials
3. **Given** admin filters by credentialType=NOTARY, **When** the system responds, **Then** only users with notary credentials are included
4. **Given** admin filters by hasCredential=true, **When** the system responds, **Then** only users with at least one credential are returned
5. **Given** admin filters by hasCredential=false, **When** the system responds, **Then** only users with no credentials are returned
6. **Given** admin combines filters (credentialType=BAR_LICENSE AND jurisdiction=NY), **When** the system responds, **Then** only users with NY bar licenses are returned
7. **Given** admin uses include=credentials query param, **When** user profiles are returned, **Then** credentials array is expanded in each profile

---

### User Story 5 - Track Credential Status (Priority: P2)

A law firm administrator needs to track credential status (ACTIVE, SUSPENDED, EXPIRED, PENDING) to ensure users are only assigned work if their credentials are in good standing and to receive alerts for expiring credentials.

**Why this priority**: Status tracking enables proactive credential management and compliance enforcement. This is important for risk management but lower priority than basic credential CRUD.

**Independent Test**: Can be fully tested by adding credentials with different statuses (ACTIVE, EXPIRED, SUSPENDED), filtering users by status, and verifying that compliance checks can identify users with non-ACTIVE credentials.

**Acceptance Scenarios**:

1. **Given** admin adds credential with status=ACTIVE, **When** credential is retrieved, **Then** status field shows ACTIVE
2. **Given** admin adds credential with status=EXPIRED, **When** credential is retrieved, **Then** status field shows EXPIRED for tracking
3. **Given** credentials have status field, **When** admin lists credentials, **Then** status is included in response for all credentials
4. **Given** system needs to validate credential standing, **When** checking user qualifications, **Then** only ACTIVE credentials are considered valid
5. **Given** admin updates credential status (future enhancement), **When** status changes, **Then** updatedAt timestamp is modified

---

### User Story 6 - Support Multiple Credentials per User (Priority: P1)

A law firm user needs to have multiple professional credentials (e.g., bar licenses in multiple states, both attorney and notary certifications) to accurately reflect their qualifications and enable work assignment across jurisdictions.

**Why this priority**: Multi-credential support is essential for law firms where attorneys are barred in multiple states or hold multiple professional certifications. This is core functionality for the credential system.

**Independent Test**: Can be fully tested by adding 5 credentials to single user (CA bar, NY bar, TX bar, notary, mediator certification), retrieving credentials, and verifying all 5 are stored independently with unique IDs.

**Acceptance Scenarios**:

1. **Given** user needs multiple bar licenses, **When** admin adds credentials for CA, NY, and TX, **Then** the system stores all three independently with unique IDs
2. **Given** user has both attorney and notary credentials, **When** admin retrieves credentials, **Then** both types are returned in the array
3. **Given** user has multiple credentials with same type but different jurisdictions, **When** admin retrieves credentials, **Then** all jurisdictions are represented
4. **Given** user has credentials with different issued dates, **When** admin retrieves credentials, **Then** each credential shows its own issuedAt timestamp
5. **Given** user has 10+ credentials, **When** admin retrieves credentials, **Then** all credentials are returned without pagination (reasonable limit per user)

---

### Edge Cases

- What happens when adding credential for non-existent user?
- How does the system handle credentials with invalid jurisdiction codes?
- What validation occurs for credential numbers (format, length)?
- How are credentials affected when user is deleted from firm?
- What occurs when user moves to different firm (credential portability)?
- How does the system handle credential expiration dates (computed from issuedAt + validity period)?
- What validation ensures credential type matches expected format?
- How are duplicate credentials detected (same type, jurisdiction, number)?
- What happens when filtering by credentials for users with no credentials?
- How does the system handle credential status transitions (ACTIVE → SUSPENDED → EXPIRED)?

## Requirements *(mandatory)*

### Functional Requirements

#### Credential Creation

- **FR-001**: System MUST allow adding professional credentials to users via POST /admin/law-firms/\{lawFirmId\}/users/\{userId\}/credentials
- **FR-002**: System MUST require type field for all credential creation requests
- **FR-003**: System MUST validate type is one of: BAR_LICENSE, NOTARY, OTHER
- **FR-004**: System MUST support optional jurisdictionCode field (e.g., CA, NY, TX, UK, AU)
- **FR-005**: System MUST support optional number field for credential identifier
- **FR-006**: System MUST support optional issuedAt field as date format (YYYY-MM-DD)
- **FR-007**: System MUST support optional status field (e.g., ACTIVE, SUSPENDED, EXPIRED, PENDING)
- **FR-008**: System MUST generate unique credential ID for each credential
- **FR-009**: System MUST record createdAt and updatedAt timestamps
- **FR-010**: System MUST associate credential with specified user and law firm
- **FR-011**: System MUST prevent duplicate credentials (same type, jurisdiction, number combination for same user)
- **FR-012**: System MUST return HTTP 409 Conflict when duplicate credential is attempted
- **FR-013**: System MUST return HTTP 201 Created with complete credential record on success
- **FR-014**: System MUST validate user exists in specified law firm before creating credential
- **FR-015**: System MUST return HTTP 404 Not Found when user or law firm does not exist
- **FR-016**: System MUST support idempotency via Idempotency-Key header

#### Credential Retrieval

- **FR-017**: System MUST support retrieving all credentials for user via GET /admin/law-firms/\{lawFirmId\}/users/\{userId\}/credentials
- **FR-018**: System MUST return credentials as array with all fields: id, type, jurisdictionCode, number, issuedAt, status, createdAt, updatedAt
- **FR-019**: System MUST return empty array when user has no credentials
- **FR-020**: System MUST include null values for optional fields when not provided
- **FR-021**: System MUST return credentials sorted by createdAt descending (newest first)
- **FR-022**: System MUST return HTTP 200 OK with credentials array
- **FR-023**: System MUST return HTTP 404 Not Found when user or law firm does not exist

#### Credential Deletion

- **FR-024**: System MUST support removing credentials via DELETE /admin/law-firms/\{lawFirmId\}/users/\{userId\}/credentials/\{credentialId\}
- **FR-025**: System MUST return HTTP 204 No Content on successful deletion
- **FR-026**: System MUST return HTTP 404 Not Found when credential, user, or law firm does not exist
- **FR-027**: System MUST permanently remove credential from user's credential list
- **FR-028**: System MUST preserve credential references in audit logs even after deletion
- **FR-029**: System MUST validate credential belongs to specified user before deletion
- **FR-030**: System MUST prevent deletion of credentials belonging to different users

#### Multi-Credential Support

- **FR-031**: System MUST support unlimited credentials per user (within reasonable limits, e.g., 100)
- **FR-032**: System MUST allow multiple credentials of same type with different jurisdictions
- **FR-033**: System MUST allow multiple credentials of different types for same user
- **FR-034**: System MUST maintain independent lifecycle for each credential
- **FR-035**: System MUST assign unique ID to each credential regardless of duplicates in other fields

#### Credential-Based Filtering

- **FR-036**: System MUST support filtering user profiles by credentialType via GET /admin/law-firms/\{lawFirmId\}/profiles?credentialType=BAR_LICENSE
- **FR-037**: System MUST support filtering user profiles by jurisdiction via GET /admin/law-firms/\{lawFirmId\}/profiles?jurisdiction=CA
- **FR-038**: System MUST support filtering user profiles by hasCredential boolean via GET /admin/law-firms/\{lawFirmId\}/profiles?hasCredential=true
- **FR-039**: System MUST support combining credential filters with role filters
- **FR-040**: System MUST return only users matching all specified credential filters
- **FR-041**: System MUST support include=credentials parameter to expand credentials in profile responses
- **FR-042**: System MUST return empty array when no users match credential filters
- **FR-043**: System MUST apply pagination to credential-filtered results

#### Credential Status Management

- **FR-044**: System MUST store credential status field when provided
- **FR-045**: System MUST support status values: ACTIVE, SUSPENDED, EXPIRED, PENDING (or null)
- **FR-046**: System MUST include status in credential retrieval responses
- **FR-047**: System MUST allow null status when status tracking is not needed
- **FR-048**: System MUST preserve status during credential lifecycle
- **FR-049**: System SHOULD consider only ACTIVE credentials for compliance checks (implementation-dependent)

#### Credential Validation

- **FR-050**: System MUST validate credential type against allowed enum values
- **FR-051**: System MUST validate issuedAt is valid date format when provided
- **FR-052**: System MUST return HTTP 400 Bad Request for invalid type values
- **FR-053**: System MUST return HTTP 400 Bad Request for invalid date formats
- **FR-054**: System MUST validate jurisdictionCode is alphanumeric when provided (implementation may enforce standard codes)
- **FR-055**: System SHOULD validate jurisdiction codes against standard list (e.g., US states, countries)

#### Integration with User Provisioning

- **FR-056**: System MUST support adding credentials during user provisioning via credentials array in ProvisionUserRequest
- **FR-057**: System MUST create all specified credentials atomically with user creation
- **FR-058**: System MUST include credentials in ProvisionUserResponse when created during provisioning
- **FR-059**: System MUST allow adding credentials to existing users via dedicated credential endpoints
- **FR-060**: System MUST maintain credential associations when user profile is updated

#### Security and Authorization

- **FR-061**: System MUST require authentication for all credential management endpoints
- **FR-062**: System MUST enforce authorization that requestor has admin privileges for the law firm
- **FR-063**: System MUST enforce tenant isolation ensuring credentials are scoped to law firm
- **FR-064**: System MUST prevent cross-tenant credential access
- **FR-065**: System MUST log all credential creation and deletion with actor identity
- **FR-066**: System MUST include correlation ID (X-Request-Id) in all audit logs

#### Error Handling

- **FR-067**: System MUST return HTTP 400 Bad Request for invalid input (invalid type, invalid date format, missing required fields)
- **FR-068**: System MUST return HTTP 401 Unauthorized when requestor is not authenticated
- **FR-069**: System MUST return HTTP 403 Forbidden when requestor lacks admin authorization for the firm
- **FR-070**: System MUST return HTTP 404 Not Found when user, law firm, or credential does not exist
- **FR-071**: System MUST return HTTP 409 Conflict when duplicate credential is attempted
- **FR-072**: System MUST return structured error responses with code, message, and request ID
- **FR-073**: System MUST include field-level validation errors when applicable

### Key Entities

- **Professional Credential**: Credential record with unique ID, type (BAR_LICENSE, NOTARY, OTHER), optional jurisdictionCode, optional number, optional issuedAt date, optional status, userId reference, lawFirmId reference, createdAt, updatedAt timestamps
- **Add Credential Request**: Input with required type, optional jurisdictionCode, optional number, optional issuedAt, optional status
- **Credential Filter**: Query parameters for filtering users by credentialType, jurisdiction, hasCredential boolean, combined with role and other profile filters
- **Credentials Array**: Collection of credentials associated with user, returned in credential list API and optionally expanded in profile list API with include=credentials parameter

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Credential creation completes in under 200 milliseconds with immediate availability
- **SC-002**: Credential retrieval for user completes in under 150 milliseconds for users with up to 50 credentials
- **SC-003**: Credential deletion completes in under 150 milliseconds with immediate effect
- **SC-004**: System correctly prevents 100% of duplicate credential attempts (same type, jurisdiction, number)
- **SC-005**: Credential-based profile filtering returns results in under 400 milliseconds for firms with 1,000+ users
- **SC-006**: Multi-credential support correctly handles users with 10+ credentials without degradation
- **SC-007**: Audit logs capture 100% of credential creation and deletion events with actor identity
- **SC-008**: System validates credential type with 100% accuracy rejecting invalid enum values
- **SC-009**: Tenant isolation prevents 100% of cross-firm credential access attempts
- **SC-010**: Credential status tracking correctly preserves status through credential lifecycle
- **SC-011**: User provisioning with credentials creates all credentials atomically with 100% success or rollback
- **SC-012**: Credential filtering correctly combines multiple filters (type + jurisdiction) with 100% accuracy
