---
sidebar_position: 5
---

# Feature Specification: Resource Access Management

**Feature Branch**: `005-resource-access-management`
**Created**: 2025-10-16
**Status**: Draft
**Input**: Admin API documentation - Resource Access Grants endpoints

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Define Resource Types (Priority: P1)

A platform administrator needs to define the domain resource types that can be protected with access grants (e.g., CASE, CLIENT, INVOICE, ARTICLE) and configure their scope boundaries and ID formats to establish a consistent access control framework.

**Why this priority**: Resource type registry is foundational infrastructure. Without defined resource types, the system cannot grant or check access to any resources. This must exist before any access grants can be created.

**Independent Test**: Can be fully tested by retrieving the list of resource types, verifying that system-defined types (CASE, CLIENT, INVOICE, etc.) are present with correct scope types (GLOBAL, FIRM, ORG_UNIT, CASE) and ID formats (int64, uuid, string), and confirming that only active resource types are returned by default.

**Acceptance Scenarios**:

1. **Given** the system has resource types configured, **When** admin requests the resource type list, **Then** the system returns all active resource types with code, name, scopeType, idFormat, isActive, createdAt, and updatedAt fields
2. **Given** resource type "CASE" with scopeType=CASE and idFormat=int64, **When** admin retrieves resource types, **Then** CASE appears with these properties
3. **Given** resource type "CLIENT" with scopeType=FIRM, **When** admin retrieves resource types, **Then** CLIENT appears showing firm-level scoping
4. **Given** a resource type has been deactivated (isActive=false), **When** admin requests resource types, **Then** the inactive type is excluded from results (or marked inactive if filter allows)

---

### User Story 2 - Define Resource Subtypes (Priority: P1)

A platform administrator needs to define fine-grained subresource types within parent resource types (e.g., NOTE within CASE, LINE_ITEM within INVOICE) to enable granular access control at the subresource level.

**Why this priority**: Subresource types enable fine-grained permissions. For example, a user might have VIEW access to a CASE but need separate EDIT access for CASE/NOTE. This is essential for flexible authorization models.

**Independent Test**: Can be fully tested by creating resource type hierarchy (CASE with subtypes NOTE and DOCUMENT), retrieving subtypes for CASE, and verifying that each subtype has correct parent reference, code, name, and ID format.

**Acceptance Scenarios**:

1. **Given** resource type CASE has subtypes NOTE, DOCUMENT, ATTACHMENT, **When** admin requests subtypes for CASE, **Then** the system returns all subtypes with resourceTypeCode=CASE, code, name, idFormat, isActive
2. **Given** subtype INVOICE/LINE_ITEM with idFormat=int64, **When** admin retrieves INVOICE subtypes, **Then** LINE_ITEM appears with correct format
3. **Given** a subtype has been deactivated, **When** admin requests subtypes for parent, **Then** the inactive subtype is excluded (or marked inactive)
4. **Given** resource type has no subtypes defined, **When** admin requests subtypes, **Then** the system returns empty array

---

### User Story 3 - Create Resource Access Grant (Priority: P1)

An administrator needs to manually grant a user specific access level (VIEW, EDIT, UPLOAD, ADMIN) to a resource or subresource with optional time bounds to enable explicit permission assignments outside of role-based access.

**Why this priority**: Manual access grants are the core functionality for explicit permission management. This enables administrators to grant temporary or exceptional access that doesn't fit role-based patterns (e.g., consultant access to specific case for 3 months).

**Independent Test**: Can be fully tested by creating a grant with resourceType=CASE, resourceId=123, authUserId=user_abc, accessLevel=EDIT, startsAt=now, endsAt=now+30days, retrieving the grant, verifying all fields match, and confirming the user can access the resource with EDIT level.

**Acceptance Scenarios**:

1. **Given** admin wants to grant user "user_123" EDIT access to CASE 456, **When** admin creates grant with resourceType=CASE, resourceId=456, authUserId=user_123, accessLevel=EDIT, startsAt=now, **Then** the system creates the grant with grantSource=MANUAL and returns the grant record
2. **Given** admin creates a grant with endsAt timestamp, **When** the grant is created, **Then** the system stores the expiration time and the grant becomes inactive after endsAt
3. **Given** admin creates a grant for subresource (CASE/123/NOTE/456), **When** the grant is created, **Then** the system stores subresourceType=NOTE, subresourceId=456, and enforces access only to that specific note
4. **Given** admin attempts to create duplicate grant (same resource, user, access level), **When** duplicate is submitted, **Then** the system returns HTTP 409 Conflict
5. **Given** admin creates grant with lawFirmId context, **When** grant is created, **Then** the lawFirmId is stored for tenant isolation

---

### User Story 4 - List and Search Resource Access Grants (Priority: P1)

An administrator or security auditor needs to search and filter resource access grants by resource type, resource ID, user, access level, or law firm to audit permissions, troubleshoot access issues, and ensure compliance with access policies.

**Why this priority**: Grant visibility is essential for security auditing and troubleshooting. Without the ability to list who has access to what resources, administrators cannot verify security posture or diagnose access problems.

**Independent Test**: Can be fully tested by creating 20 grants across different resources/users/access levels, performing filtered searches (by resourceType=CASE, by authUserId=user_123, by accessLevel=ADMIN, by lawFirmId=firm_abc), and verifying only matching grants are returned with pagination working correctly.

**Acceptance Scenarios**:

1. **Given** 50 active grants exist, **When** admin requests grant list with default pagination, **Then** the system returns first 50 grants with pagination metadata (page=1, size=50, total count)
2. **Given** multiple grants, **When** admin filters by resourceType=CASE, **Then** the system returns only grants for CASE resources
3. **Given** grants for user "user_123" across multiple resources, **When** admin filters by authUserId=user_123, **Then** the system returns all grants for that user
4. **Given** grants with different access levels, **When** admin filters by accessLevel=ADMIN, **Then** the system returns only ADMIN-level grants
5. **Given** grants in multi-tenant system, **When** admin filters by lawFirmId=firm_abc, **Then** the system returns only grants for that law firm
6. **Given** grants for specific resource CASE/456, **When** admin filters by resourceType=CASE AND resourceId=456, **Then** the system returns all grants for case 456
7. **Given** grants for subresources, **When** admin filters by subresourceType=NOTE, **Then** the system returns only grants for NOTE subresources

---

### User Story 5 - List Access Grants for Specific Resource (Priority: P2)

An administrator needs to view all access grants for a specific resource (e.g., who has access to CASE 123) or subresource to quickly understand the complete access control list for that resource.

**Why this priority**: Resource-scoped grant listing supports resource-level permission management. This is important for resource owners to see who can access their resources, but is lower priority than general search since it's a convenience over filtered search.

**Independent Test**: Can be fully tested by creating grants for CASE/123 with different users and access levels (user_1 with VIEW, user_2 with EDIT, user_3 with ADMIN), retrieving grants for CASE/123, and verifying all three grants are returned with correct details.

**Acceptance Scenarios**:

1. **Given** resource CASE/456 has 5 grants, **When** admin requests grants for CASE/456, **Then** the system returns all 5 grants with user IDs and access levels
2. **Given** subresource CASE/456/NOTE/789 has 2 grants, **When** admin requests grants for that subresource, **Then** the system returns grants specific to that note
3. **Given** resource has no grants, **When** admin requests grants for it, **Then** the system returns empty array
4. **Given** resource has grants from different sources (MANUAL, ROLE, CASE_MEMBER), **When** admin requests grants, **Then** all grants are returned with grantSource field showing origin

---

### User Story 6 - Revoke Resource Access Grant (Priority: P1)

An administrator needs to immediately revoke a specific access grant when a user's access should be removed (e.g., consultant contract ends, security incident, role change) to maintain security and ensure timely access removal.

**Why this priority**: Timely access revocation is critical for security. When access should be removed (consultant leaves, security breach, role change), the system must support immediate revocation to prevent unauthorized access.

**Independent Test**: Can be fully tested by creating a grant, verifying user can access the resource, revoking the grant via DELETE endpoint, attempting access again, and confirming access is denied.

**Acceptance Scenarios**:

1. **Given** user "user_123" has EDIT access to CASE/456, **When** admin revokes the grant (DELETE with authUserId=user_123, accessLevel=EDIT), **Then** the system removes the grant and returns HTTP 204 No Content
2. **Given** grant has been revoked, **When** user attempts to access the resource, **Then** the system denies access (no longer included in access grant checks)
3. **Given** admin attempts to revoke non-existent grant, **When** revocation is attempted, **Then** the system returns HTTP 404 Not Found
4. **Given** user has multiple grants (EDIT and VIEW) for same resource, **When** admin revokes EDIT grant, **Then** only EDIT is removed and VIEW grant remains active
5. **Given** subresource grant exists, **When** admin revokes it using full path (resourceType/resourceId/subresourceType/subresourceId/userId/accessLevel), **Then** the system removes the subresource grant specifically

---

### User Story 7 - Retrieve Effective Resource Policies (Priority: P2)

An administrator or frontend application needs to retrieve the effective field-level permissions for a user within a firm context to understand which resource fields the user can read, update, or access, enabling fine-grained UI controls and authorization.

**Why this priority**: Field-level policies enable sophisticated authorization (e.g., paralegal can view case but not budget fields). This is important for compliance and security but is lower priority than basic resource-level grants.

**Independent Test**: Can be fully tested by assigning user roles with field policies (e.g., LAWYER role allows all CASE fields, PARALEGAL role excludes budget fields), retrieving resource policies for each user, and verifying the returned policies correctly reflect role-based field restrictions.

**Acceptance Scenarios**:

1. **Given** user has LAWYER role with all CASE field access, **When** admin requests resource policies for the user, **Then** the system returns CASE.read \{fieldMode: ALL\}, CASE.update \{fieldMode: ALL\}
2. **Given** user has PARALEGAL role excluding budget fields, **When** admin requests resource policies, **Then** the system returns CASE.update \{fieldMode: EXCEPT, fields: ["budget.*", "settlement_terms"]\}
3. **Given** user has role with specific field access (ONLY mode), **When** admin requests policies, **Then** the system returns \{fieldMode: ONLY, fields: ["status", "title", "assignee"]\}
4. **Given** user has no field restrictions, **When** admin requests policies, **Then** all resource actions return \{fieldMode: ALL\}
5. **Given** policies for multiple resource types (CASE, INVOICE, CLIENT), **When** admin requests policies, **Then** the system returns policies grouped by resource code and action

---

### User Story 8 - Retrieve User Capabilities Aggregate (Priority: P2)

A frontend application needs to retrieve a user's complete capabilities (scopes, resource field policies, and specific resource IDs they can access) in a single API call to initialize the application with full authorization context and minimize round trips.

**Why this priority**: Capabilities aggregation is a performance optimization for SPAs. It's valuable for reducing API calls and improving UX, but is lower priority since it combines existing endpoints (scopes, policies, grants).

**Independent Test**: Can be fully tested by setting up a user with Logto scopes (cases:read, cases:write), role-based field policies (CASE fields), and explicit case grants (case IDs 101, 102, 123), calling the capabilities endpoint, and verifying the response includes all three sections (scopes array, resources object, caseIds object with view/edit/admin arrays).

**Acceptance Scenarios**:

1. **Given** user has scopes ["cases:read", "cases:write"], field policies for CASE, and grants for cases 101, 102, 123, **When** admin requests user capabilities, **Then** the system returns complete capabilities with all three sections
2. **Given** user has VIEW grant for cases 101, 102 and EDIT grant for case 123, **When** admin requests capabilities, **Then** caseIds object shows view: [101, 102, 123], edit: [123], admin: []
3. **Given** admin requests capabilities with include=scopes,caseIds, **When** the system responds, **Then** only scopes and caseIds are included (resources section omitted)
4. **Given** user has no explicit grants, **When** admin requests capabilities, **Then** caseIds arrays are empty but scopes and resources (from roles) are still returned
5. **Given** user belongs to law firm "firm_abc", **When** admin requests capabilities for that firm context, **Then** all returned data is scoped to firm_abc

---

### Edge Cases

- What happens when creating a grant with startsAt in the future?
- How does the system handle grants with endsAt in the past?
- What validation occurs for resource type codes (must match registered types)?
- How are grants enforced when resource or user is deleted?
- What happens when creating a grant for non-existent user or resource?
- How does the system handle grant source conflicts (MANUAL vs ROLE-based grants)?
- What occurs when requesting policies for user with overlapping role permissions?
- How are subresource grants resolved when parent resource has different grant?
- What validation ensures access levels follow hierarchy (VIEW < EDIT < UPLOAD < ADMIN)?
- How does the system handle pagination for very large grant result sets (10,000+ grants)?

## Requirements *(mandatory)*

### Functional Requirements

#### Resource Type Registry

- **FR-001**: System MUST maintain registry of domain resource types (not database tables) with uppercase codes (e.g., CASE, CLIENT, INVOICE)
- **FR-002**: System MUST validate resource type codes match pattern ^[A-Z][A-Z0-9_]*$
- **FR-003**: System MUST store resource type attributes: code, name, scopeType, idFormat, isActive, createdAt, updatedAt
- **FR-004**: System MUST support scope types: GLOBAL, FIRM, ORG_UNIT, CASE
- **FR-005**: System MUST support ID formats: int64, uuid, string
- **FR-006**: System MUST allow retrieval of all active resource types via GET /admin/resource-types
- **FR-007**: System MUST return only active resource types by default (isActive=true)
- **FR-008**: System MUST include full resource type metadata in responses

#### Resource Subtype Registry

- **FR-009**: System MUST maintain registry of subresource types linked to parent resource types
- **FR-010**: System MUST store subtype attributes: resourceTypeCode (parent), code, name, idFormat, isActive, createdAt, updatedAt
- **FR-011**: System MUST validate subtype codes match pattern ^[A-Z][A-Z0-9_]*$
- **FR-012**: System MUST allow retrieval of subtypes for specific resource type via GET /admin/resource-types/\{resourceType\}/subtypes
- **FR-013**: System MUST return empty array when resource type has no subtypes
- **FR-014**: System MUST return only active subtypes by default

#### Access Grant Creation

- **FR-015**: System MUST allow creation of manual resource access grants via POST /admin/resources/\{resourceType\}/\{resourceId\}/access-grants
- **FR-016**: System MUST require authUserId, accessLevel, and startsAt for all grant creation requests
- **FR-017**: System MUST validate accessLevel is one of: VIEW, EDIT, UPLOAD, ADMIN
- **FR-018**: System MUST set grantSource to MANUAL for admin-created grants
- **FR-019**: System MUST support optional endsAt for time-bounded grants
- **FR-020**: System MUST support optional subresourceType and subresourceId for fine-grained grants
- **FR-021**: System MUST store lawFirmId context when provided for multi-tenant isolation
- **FR-022**: System MUST generate unique grant identifier
- **FR-023**: System MUST record createdAt and updatedAt timestamps
- **FR-024**: System MUST prevent duplicate grants (same resource, user, access level combination)
- **FR-025**: System MUST return HTTP 409 Conflict when duplicate grant is attempted
- **FR-026**: System MUST validate resource type exists in registry before creating grant
- **FR-027**: System MUST validate user exists before creating grant
- **FR-028**: System MUST return HTTP 201 Created with complete grant record on success
- **FR-029**: System MUST support idempotency via Idempotency-Key header

#### Access Grant Search and Listing

- **FR-030**: System MUST support searching grants via GET /admin/resource-access-grants
- **FR-031**: System MUST support filtering by resourceType
- **FR-032**: System MUST support filtering by resourceId
- **FR-033**: System MUST support filtering by subresourceType
- **FR-034**: System MUST support filtering by subresourceId
- **FR-035**: System MUST support filtering by authUserId
- **FR-036**: System MUST support filtering by accessLevel
- **FR-037**: System MUST support filtering by lawFirmId
- **FR-038**: System MUST support pagination with page[number] and page[size] parameters
- **FR-039**: System MUST default to page 1 and size 50 when not specified
- **FR-040**: System MUST enforce maximum page size of 200
- **FR-041**: System MUST return pagination metadata (page, size, total)
- **FR-042**: System MUST return grants with all fields: resourceType, resourceId, subresourceType, subresourceId, authUserId, accessLevel, grantSource, startsAt, endsAt, lawFirmId, createdAt, updatedAt
- **FR-043**: System MUST exclude expired grants (endsAt < current time) from active searches unless explicitly requested
- **FR-044**: System MUST support combining multiple filters in single query

#### Resource-Scoped Grant Listing

- **FR-045**: System MUST support listing grants for specific resource via GET /admin/resources/\{resourceType\}/\{resourceId\}/access-grants
- **FR-046**: System MUST return all grants for specified resource regardless of grant source
- **FR-047**: System MUST support listing grants for specific subresource via GET /admin/resources/\{resourceType\}/\{resourceId\}/\{subresourceType\}/\{subresourceId\}/access-grants
- **FR-048**: System MUST return empty array when resource has no grants
- **FR-049**: System MUST include grantSource field to distinguish MANUAL, ROLE, CASE_MEMBER, PARTNER_MEMBER, SYSTEM grants

#### Access Grant Revocation

- **FR-050**: System MUST support revoking grants via DELETE /admin/resources/\{resourceType\}/\{resourceId\}/access-grants/\{authUserId\}/\{accessLevel\}
- **FR-051**: System MUST return HTTP 204 No Content on successful revocation
- **FR-052**: System MUST return HTTP 404 Not Found when revoking non-existent grant
- **FR-053**: System MUST immediately remove grant from active grants (effective immediately)
- **FR-054**: System MUST support revoking subresource grants via full path including subresource identifiers
- **FR-055**: System MUST allow revoking only MANUAL grants (not ROLE or SYSTEM grants)
- **FR-056**: System MUST log all grant revocations with actor, reason, and timestamp

#### Grant Lifecycle and Expiration

- **FR-057**: System MUST automatically exclude grants where current time < startsAt (not yet active)
- **FR-058**: System MUST automatically exclude grants where current time > endsAt (expired)
- **FR-059**: System MUST support grants without endsAt (permanent until revoked)
- **FR-060**: System MUST evaluate grant active status at access check time
- **FR-061**: System MUST include grant status indicators in responses (active, pending, expired)

#### Resource Field Policies

- **FR-062**: System MUST support retrieving effective field policies via GET /admin/law-firms/\{lawFirmId\}/users/\{userId\}/resource-policies
- **FR-063**: System MUST compute effective policies by merging user's role-based policies
- **FR-064**: System MUST return policies grouped by resource code and action (read, update, delete, etc.)
- **FR-065**: System MUST support field modes: ALL, ONLY, EXCEPT
- **FR-066**: System MUST return field arrays for ONLY and EXCEPT modes
- **FR-067**: System MUST support wildcard patterns in field names (e.g., "budget.*")
- **FR-068**: System MUST return empty resources object when user has no field restrictions
- **FR-069**: System MUST resolve policy conflicts using most restrictive policy when multiple roles apply

#### User Capabilities Aggregation

- **FR-070**: System MUST support retrieving user capabilities via GET /admin/law-firms/\{lawFirmId\}/users/\{userId\}/capabilities
- **FR-071**: System MUST return scopes array with effective Logto scopes for user in firm context
- **FR-072**: System MUST return resources object with field-level policies
- **FR-073**: System MUST return caseIds object with view, edit, admin arrays containing accessible case IDs
- **FR-074**: System MUST support optional include parameter to filter returned sections
- **FR-075**: System MUST support include values: scopes, resources, caseIds (CSV format)
- **FR-076**: System MUST default to returning all sections when include is omitted
- **FR-077**: System MUST compute caseIds from all active grants (access level determines array placement)
- **FR-078**: System MUST include case in view array if user has VIEW, EDIT, UPLOAD, or ADMIN access
- **FR-079**: System MUST include case in edit array if user has EDIT, UPLOAD, or ADMIN access
- **FR-080**: System MUST include case in admin array only if user has ADMIN access

#### Security and Authorization

- **FR-081**: System MUST require authentication for all resource access management endpoints
- **FR-082**: System MUST enforce authorization that requestor has admin privileges
- **FR-083**: System MUST validate resource type codes against registry before operations
- **FR-084**: System MUST validate user IDs exist before grant creation
- **FR-085**: System MUST enforce tenant isolation via lawFirmId when provided
- **FR-086**: System MUST log all grant creation and revocation with actor identity
- **FR-087**: System MUST include correlation ID (X-Request-Id) in all audit logs

#### Error Handling

- **FR-088**: System MUST return HTTP 400 Bad Request for invalid input (invalid accessLevel, invalid resource type format, missing required fields)
- **FR-089**: System MUST return HTTP 401 Unauthorized when requestor is not authenticated
- **FR-090**: System MUST return HTTP 403 Forbidden when requestor lacks admin authorization
- **FR-091**: System MUST return HTTP 404 Not Found when resource type, user, or grant does not exist
- **FR-092**: System MUST return HTTP 409 Conflict when duplicate grant is attempted
- **FR-093**: System MUST return structured error responses with code, message, and request ID
- **FR-094**: System MUST include field-level validation errors when applicable

### Key Entities

- **Resource Type**: Registry entry with code (e.g., CASE, CLIENT), name, scopeType (GLOBAL, FIRM, ORG_UNIT, CASE), idFormat (int64, uuid, string), isActive flag, timestamps
- **Resource Subtype**: Registry entry with parent resourceTypeCode, code (e.g., NOTE, LINE_ITEM), name, idFormat, isActive flag, timestamps
- **Resource Access Grant**: Permission record with resourceType, resourceId, optional subresourceType/subresourceId, authUserId, accessLevel (VIEW, EDIT, UPLOAD, ADMIN), grantSource (MANUAL, ROLE, CASE_MEMBER, PARTNER_MEMBER, SYSTEM), startsAt, optional endsAt, optional lawFirmId, timestamps
- **Create Resource Access Grant Request**: Input with authUserId, accessLevel, startsAt, optional endsAt, optional subresourceType, optional subresourceId
- **Resource Action Policy**: Field-level permission with fieldMode (ALL, ONLY, EXCEPT) and fields array (for ONLY/EXCEPT modes)
- **Resource Policies Response**: Map of resource codes to actions to policies (e.g., CASE.read � \{fieldMode: ALL\}, CASE.update � \{fieldMode: EXCEPT, fields: ["budget.*"]\})
- **Capabilities Response**: Aggregate with scopes array, resources object (field policies), and caseIds object (view/edit/admin arrays of case IDs)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Resource type registry retrieval completes in under 100 milliseconds for up to 100 resource types
- **SC-002**: Subtype retrieval completes in under 100 milliseconds for up to 50 subtypes per resource type
- **SC-003**: Grant creation completes in under 300 milliseconds with immediate availability for access checks
- **SC-004**: Grant search with filters returns results in under 500 milliseconds for databases with up to 100,000 grants
- **SC-005**: Resource-scoped grant listing returns results in under 200 milliseconds for resources with up to 1,000 grants
- **SC-006**: Grant revocation completes in under 200 milliseconds with immediate effect
- **SC-007**: System correctly prevents 100% of duplicate grant attempts with HTTP 409 Conflict
- **SC-008**: System correctly validates resource type codes rejecting 100% of invalid formats
- **SC-009**: Grant lifecycle correctly excludes expired grants with 100% accuracy (evaluated at endsAt timestamp)
- **SC-010**: Effective resource policies retrieval completes in under 400 milliseconds for users with up to 10 roles
- **SC-011**: User capabilities aggregation completes in under 600 milliseconds for users with 1,000+ case grants
- **SC-012**: Field policy merging correctly applies most restrictive policy with 100% accuracy when multiple roles conflict
- **SC-013**: Pagination correctly handles result sets of 100,000+ grants with stable performance
- **SC-014**: Audit logs capture 100% of grant creation and revocation events with complete context
- **SC-015**: System enforces tenant isolation with 100% accuracy preventing cross-tenant grant visibility
