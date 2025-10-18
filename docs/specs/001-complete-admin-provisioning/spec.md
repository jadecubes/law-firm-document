---
sidebar_position: 1
---

# Feature Specification: Complete Admin Provisioning API System

**Feature Branch**: `001-complete-admin-provisioning`
**Created**: 2025-10-15
**Status**: Draft
**Input**: User description: "Complete Admin Provisioning API system for managing law firms, users, lawyers, RBAC via Logto organizations, resource access grants, and support access sessions"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Law Firm Onboarding (Priority: P1)

A platform administrator needs to onboard a new law firm by creating a tenant organization, setting up identity management, and provisioning the initial administrator account.

**Why this priority**: This is the foundation of the entire system. Without the ability to create law firms and set up their organizational structure, no other features can function. It's the entry point for all law firm customers.

**Independent Test**: Can be fully tested by creating a new law firm with a Logto organization, verifying the firm appears in the system with a linked identity provider organization, and confirming the initial admin user can authenticate and access their firm's resources.

**Acceptance Scenarios**:

1. **Given** no existing law firm with slug "acme-legal", **When** admin creates a new law firm with name "Acme Legal" and slug "acme-legal", **Then** the system creates a law firm record, establishes a Logto organization, and returns the firm ID with organization binding confirmation
2. **Given** a new law firm "Acme Legal" exists, **When** admin provisions the first user with admin role and lawyer credentials, **Then** the system creates an authentication account, firm profile, assigns organization admin role, and sends an invitation email
3. **Given** a law firm creation request with duplicate slug, **When** admin attempts to create the firm, **Then** the system rejects the request with a clear conflict error message

---

### User Story 2 - User Provisioning and Role Management (Priority: P1)

A platform administrator needs to provision various types of users (lawyers, paralegals, administrative staff) for a law firm, assigning appropriate roles and professional credentials based on their job functions.

**Why this priority**: User provisioning is critical for law firms to operate. Without the ability to add staff members with appropriate roles and credentials, the law firm cannot begin using the system for daily operations.

**Independent Test**: Can be fully tested by adding users with different roles (lawyer with bar license, paralegal without license, admin staff), verifying each user receives appropriate access in both the application and identity provider, and confirming credential information is properly stored and retrievable.

**Acceptance Scenarios**:

1. **Given** an existing law firm "Acme Legal", **When** admin provisions a lawyer with email "john@acme.com", role "LAWYER", and California bar license, **Then** the system creates the user account, firm profile with lawyer role, stores the bar license with jurisdiction "CA", and assigns appropriate organization roles in Logto
2. **Given** an existing law firm, **When** admin provisions a paralegal with email "jane@acme.com" and role "PARALEGAL" without credentials, **Then** the system creates the user account and firm profile without requiring professional credentials
3. **Given** an existing user "john@acme.com", **When** admin adds a second bar license for New York jurisdiction, **Then** the system stores the additional credential and the user now has licenses for both CA and NY jurisdictions
4. **Given** a law firm with multiple staff members, **When** admin retrieves the list of profiles filtered by role "LAWYER" and jurisdiction "CA", **Then** the system returns only users with the lawyer role who have an active California bar license

---

### User Story 3 - Support Access for Troubleshooting (Priority: P2)

A support staff member needs to temporarily access the system as a specific user to troubleshoot issues they are experiencing, with full audit trail and time-limited access.

**Why this priority**: This enables effective customer support without requiring users to share credentials or take screenshots. It's essential for production support but not needed for initial law firm operations.

**Independent Test**: Can be fully tested by initiating a support session for a target user, receiving a delegated authentication token, using that token to access resources as the target user, and verifying the session automatically expires after the specified time and is fully logged for audit purposes.

**Acceptance Scenarios**:

1. **Given** a support staff member needs to help user "john@acme.com", **When** they request support access for 30 minutes with reason "Troubleshoot document upload issue", **Then** the system creates a support session, returns a delegated token that acts as John, and logs the support staff member as the actor
2. **Given** an active support session, **When** the delegated token is used to access resources, **Then** all actions are attributed to the target user but logged with actor information showing the support staff member initiated the session
3. **Given** a support session created 35 minutes ago with 30-minute TTL, **When** the delegated token is used, **Then** the system rejects the token as expired
4. **Given** an active support session, **When** admin explicitly revokes the session, **Then** the delegated token immediately becomes invalid and further attempts to use it are rejected

---

### User Story 4 - Resource Access Management (Priority: P2)

A platform administrator needs to manage fine-grained access control by granting specific users access to individual resources (cases, documents, invoices) with different permission levels (view, edit, admin).

**Why this priority**: Fine-grained access control is important for data security and multi-user collaboration, but basic role-based access via Logto organizations provides sufficient access control for initial operations.

**Independent Test**: Can be fully tested by creating access grants for specific resources, verifying users can only access resources they have grants for, checking that access levels are properly enforced, and confirming grants can be revoked to immediately remove access.

**Acceptance Scenarios**:

1. **Given** a law firm with a case ID 12345, **When** admin grants user "jane@acme.com" VIEW access to case 12345, **Then** the system creates a resource access grant and the user can view but not modify the case
2. **Given** user "jane@acme.com" has VIEW access to case 12345, **When** admin upgrades the grant to EDIT access, **Then** the user can now modify the case
3. **Given** user "jane@acme.com" has EDIT access to case 12345, **When** admin revokes the access grant, **Then** the user can no longer view or edit the case
4. **Given** a case with multiple access grants, **When** admin queries all grants for case 12345, **Then** the system returns all users with access and their permission levels

---

### User Story 5 - User Capabilities and Permissions Query (Priority: P3)

A law firm application needs to efficiently query what a specific user can access and do within their firm context, including organization roles, resource-level permissions, and field-level policies.

**Why this priority**: This optimization improves application performance and user experience but is not required for basic functionality. The application can query individual permissions as needed.

**Independent Test**: Can be fully tested by querying a user's capabilities, verifying the response includes their organization scopes, resource field policies, and lists of accessible resource IDs, and confirming the aggregated information matches what would be obtained through individual permission checks.

**Acceptance Scenarios**:

1. **Given** user "john@acme.com" with lawyer role and access to cases 101, 102, 123, **When** admin queries their capabilities, **Then** the system returns their scopes (e.g., "cases:read", "cases:write"), field policies showing which case fields they can view/edit, and lists of case IDs organized by permission level
2. **Given** a user with complex field-level restrictions on the CASE resource, **When** admin queries their resource policies, **Then** the system returns field mode (ALL, ONLY, EXCEPT) and specific fields affected for each action (read, update)
3. **Given** a paralegal with limited permissions, **When** their capabilities are queried, **Then** the system returns only the scopes and resources they have access to based on their role

---

### User Story 6 - Organization Member Management (Priority: P2)

A platform administrator needs to manage law firm members in the identity provider (Logto) by adding members, assigning organization roles, updating role assignments, and removing members when they leave the firm.

**Why this priority**: This is essential for ongoing law firm operations as staff join and leave, but it's not required for initial setup since users can be provisioned with organization roles during creation.

**Independent Test**: Can be fully tested by adding a member to a Logto organization, verifying they receive the correct roles, updating their roles and confirming the changes take effect, and removing them to confirm their access is revoked.

**Acceptance Scenarios**:

1. **Given** a law firm with Logto organization, **When** admin adds member "newuser@acme.com" with org role "member", **Then** the system creates or links the user in Logto and assigns them the member role in the firm's organization
2. **Given** a member with org role "member", **When** admin updates their roles to ["admin"], **Then** the system replaces their role assignment and they gain administrative permissions in the organization
3. **Given** a member "departing@acme.com" in the organization, **When** admin removes them, **Then** the system revokes their organization membership and they can no longer access firm resources
4. **Given** a law firm organization, **When** admin requests a member list, **Then** the system returns all members with their roles and last sync timestamp

---

### Edge Cases

- What happens when a law firm is created with a slug that matches an existing Logto organization but the organization is not bound to any law firm in the application?
- How does the system handle provisioning a user with an email that already exists in the identity provider but not in the application?
- What occurs when a support access session is requested for a user who doesn't exist or belongs to a different law firm?
- How are resource access grants handled when the target resource (case, document) is deleted from the system?
- What happens when attempting to assign professional credentials with a duplicate jurisdiction and credential type to the same user?
- How does the system behave when Logto API is unavailable during user provisioning or member management operations?
- What validation occurs when attempting to filter users by a professional credential jurisdiction that doesn't match any existing credentials?
- How are time-limited resource access grants handled when the end time has passed?

## Requirements *(mandatory)*

### Functional Requirements

#### Law Firm Management

- **FR-001**: System MUST allow platform administrators to create new law firm tenant records with unique name and slug identifiers
- **FR-002**: System MUST support automatic creation of corresponding Logto organizations when creating law firms
- **FR-003**: System MUST allow binding existing Logto organizations to law firm records using organization ID
- **FR-004**: System MUST store law firm metadata including name, slug, address, phone, email, and contact information
- **FR-005**: System MUST maintain synchronization timestamp for each law firm's Logto organization binding
- **FR-006**: System MUST provide the ability to list all law firms with pagination support
- **FR-007**: System MUST allow retrieval of individual law firm details by firm ID
- **FR-008**: System MUST enforce unique slug constraints across all law firms (case-sensitive, alphanumeric with hyphens)

#### User Identity and Provisioning

- **FR-009**: System MUST support creating authentication user accounts with email, name, and optional Logto user ID
- **FR-010**: System MUST allow linking existing Logto users to application user accounts via Logto user ID
- **FR-011**: System MUST support automatic creation of new Logto users during provisioning with email and name
- **FR-012**: System MUST create firm user profiles associated with law firms and authentication users
- **FR-013**: System MUST store user profile information including display name, job title, office location, photo URL, and visibility settings
- **FR-014**: System MUST support assigning multiple functional roles to users (LAWYER, PARALEGAL, RECEPTIONIST, BILLING_ADMIN, IT_ADMIN, INTERN, OTHER)
- **FR-015**: System MUST track user active/inactive status independently for authentication and firm profiles
- **FR-016**: System MUST support sending invitation emails when provisioning new users with configurable locale and redirect URI
- **FR-017**: System MUST provide idempotency for user provisioning operations using idempotency keys
- **FR-018**: System MUST support searching for authentication users by Logto user ID or email address
- **FR-019**: System MUST allow listing all user profiles within a law firm with filtering by role, credential type, jurisdiction, and active status

#### Professional Credentials Management

- **FR-020**: System MUST support multiple credential types including BAR_LICENSE, NOTARY, and OTHER
- **FR-021**: System MUST store credential details including type, jurisdiction code, license number, issue date, and status
- **FR-022**: System MUST allow adding multiple professional credentials to a single user
- **FR-023**: System MUST support retrieving all credentials for a specific user
- **FR-024**: System MUST allow removing individual credentials by credential ID
- **FR-025**: System MUST track creation and update timestamps for all credentials
- **FR-026**: System MUST support filtering users by credential type (e.g., only users with bar licenses)
- **FR-027**: System MUST support filtering users by jurisdiction (e.g., only California-licensed users)

#### Logto Organization and Member Management

- **FR-028**: System MUST synchronize Logto organization information including members and role assignments
- **FR-029**: System MUST store local cached copies of organization member data with last sync timestamps
- **FR-030**: System MUST support adding new members to Logto organizations by Logto user ID or email
- **FR-031**: System MUST support inviting users by email when Logto user ID is not available
- **FR-032**: System MUST allow assigning organization roles (e.g., "admin", "member") to members
- **FR-033**: System MUST support replacing a member's organization role assignments (idempotent update)
- **FR-034**: System MUST allow removing members from organizations
- **FR-035**: System MUST provide the ability to list all members of an organization with pagination
- **FR-036**: System MUST support retrieving individual member details by Logto user ID
- **FR-037**: System MUST provide a catalog of available organization roles
- **FR-038**: System MUST track member join timestamps and last synchronization times

#### Resource Access Management

- **FR-039**: System MUST maintain a registry of allowed resource types with codes, names, scope types, and ID formats
- **FR-040**: System MUST support hierarchical resource structure with resource types and subresource types
- **FR-041**: System MUST allow creating manual resource access grants for specific users and resources
- **FR-042**: System MUST support four access levels: VIEW, EDIT, UPLOAD, and ADMIN
- **FR-043**: System MUST track grant source types (MANUAL, ROLE, CASE_MEMBER, PARTNER_MEMBER, SYSTEM)
- **FR-044**: System MUST support time-bounded grants with start and optional end timestamps
- **FR-045**: System MUST allow grants at both root resource level (e.g., CASE/12345) and subresource level (e.g., CASE/12345/NOTE/789)
- **FR-046**: System MUST provide the ability to search grants by resource type, resource ID, user, access level, and law firm
- **FR-047**: System MUST allow revoking manual access grants by user and access level
- **FR-048**: System MUST support listing all grants for a specific resource or subresource
- **FR-049**: System MUST provide resource type and subtype registry endpoints for discovery

#### User Capabilities and Permissions

- **FR-050**: System MUST compute effective resource field policies for users showing which fields they can access for each action
- **FR-051**: System MUST support three field policy modes: ALL (all fields), ONLY (specific fields only), EXCEPT (all except specific fields)
- **FR-052**: System MUST organize field policies by resource code and action (read, update, delete)
- **FR-053**: System MUST provide aggregated capabilities including scopes, resource policies, and resource ID sets
- **FR-054**: System MUST organize resource ID grants by access level for efficient querying
- **FR-055**: System MUST support optional inclusion of specific capability sections (scopes, resources, caseIds) in aggregated queries

#### Support Access (Act-As)

- **FR-056**: System MUST allow support staff to initiate support access sessions for specific users within a law firm
- **FR-057**: System MUST require a reason with minimum length of 5 characters for all support access requests
- **FR-058**: System MUST support configurable time-to-live (TTL) for support sessions between 5 and 120 minutes (default 30 minutes)
- **FR-059**: System MUST generate delegated authentication tokens that act as the target user
- **FR-060**: System MUST include actor information in delegated tokens identifying the support staff member
- **FR-061**: System MUST include act_as flag in delegated token claims
- **FR-062**: System MUST support optional scope narrowing for delegated tokens
- **FR-063**: System MUST provide a convenience UI switch URL for single-page applications to enter support mode
- **FR-064**: System MUST track support session status (active, revoked, expired)
- **FR-065**: System MUST allow listing active support sessions with filtering by law firm, actor, and target user
- **FR-066**: System MUST support retrieving individual support session details
- **FR-067**: System MUST allow explicit revocation of active support sessions
- **FR-068**: System MUST automatically expire sessions when TTL is reached
- **FR-069**: System MUST reject delegated tokens from expired or revoked sessions

#### Error Handling and Validation

- **FR-070**: System MUST return structured error responses with error code, message, optional field-level details, and request ID
- **FR-071**: System MUST validate email format for all email inputs
- **FR-072**: System MUST validate slug format (lowercase alphanumeric with hyphens only)
- **FR-073**: System MUST validate resource type codes (uppercase letters, digits, and underscores starting with letter)
- **FR-074**: System MUST enforce idempotency for create operations when idempotency key is provided
- **FR-075**: System MUST return appropriate HTTP status codes (400 for validation, 401 for authentication, 403 for authorization, 404 for not found, 409 for conflicts)
- **FR-076**: System MUST include correlation IDs (X-Request-Id header) for logging and tracing

#### Authentication and Security

- **FR-077**: System MUST require Bearer token authentication (JWT format) for all administrative endpoints
- **FR-078**: System MUST validate all authentication tokens before processing requests
- **FR-079**: System MUST enforce authorization rules based on administrative permissions
- **FR-080**: System MUST log all security-relevant events including user provisioning, access grants, and support sessions
- **FR-081**: System MUST maintain audit trail for support access sessions including actor, target user, reason, and all actions performed

### Key Entities

- **Law Firm**: Represents a tenant organization with identifying information (name, slug), contact details, optional Logto organization binding, and synchronization metadata
- **Authentication User**: Core identity record with email, name, optional Logto user ID link, email verification status, and active status
- **Firm User Profile**: Law firm-specific user profile with display name, job title, office location, photo, visibility settings, functional roles array, practice information, and active status
- **Professional Credential**: User credential record with type (bar license, notary, other), jurisdiction, license number, issue date, status, and timestamps
- **Logto Organization**: Identity provider organization mapping with Logto organization ID, display name, optional law firm binding, and sync timestamp
- **Organization Member**: Member of a Logto organization with user ID, email, name, assigned organization roles array, join timestamp, and sync metadata
- **Resource Type**: Domain resource definition with code (e.g., CASE, INVOICE), name, scope type (GLOBAL, FIRM, ORG_UNIT, CASE), ID format, and active status
- **Resource Subtype**: Hierarchical resource subtype with parent resource type code, own code (e.g., NOTE, LINE_ITEM), name, ID format, and active status
- **Resource Access Grant**: Fine-grained access control record specifying resource type, resource ID, optional subresource type/ID, user ID, access level (VIEW, EDIT, UPLOAD, ADMIN), grant source, time bounds (start/end), and law firm context
- **Resource Action Policy**: Field-level permission policy with field mode (ALL, ONLY, EXCEPT) and specific field list for a given resource and action
- **Support Access Session**: Temporary support session with session ID, law firm context, target user, actor admin user, time bounds (start, expiry), status (active, revoked, expired), and associated delegated token
- **Support Access Request**: Audit record of support access initiation with request ID, law firm, target user, actor, reason, request timestamp, and approval status

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Platform administrators can create a new law firm with linked Logto organization and provision the first admin user in under 3 minutes
- **SC-002**: User provisioning operations complete within 5 seconds for 95% of requests when Logto API is responsive
- **SC-003**: System successfully handles 100 concurrent user provisioning requests without errors or significant performance degradation
- **SC-004**: Support staff can initiate a support access session and receive a working delegated token within 10 seconds
- **SC-005**: Resource access grant queries return results in under 500 milliseconds for law firms with up to 1000 grants
- **SC-006**: User capabilities aggregation queries complete in under 2 seconds for users with complex permission structures
- **SC-007**: 100% of support access sessions are logged with full audit trail including actor, target user, reason, and timestamp
- **SC-008**: System achieves 99.9% success rate for idempotent operations when idempotency keys are provided
- **SC-009**: All administrative operations return detailed error messages with field-level validation information when requests fail
- **SC-010**: Platform administrators can successfully manage member organization roles with zero data loss during Logto synchronization operations
- **SC-011**: System correctly enforces time-to-live for support sessions with maximum 1-second variance from specified expiry time
- **SC-012**: User filtering operations by role and jurisdiction return accurate results for 100% of queries against law firms with up to 500 users
