---
sidebar_position: 3
---

# Feature Specification: Generic User Provisioning System

**Feature Branch**: `003-generic-user-provisioning`
**Created**: 2025-10-15
**Status**: Draft
**Input**: User description: "Generic User Provisioning System for role and credential-driven user creation with identity management, firm profiles, functional roles, and professional credentials"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Provision Lawyer with Bar License (Priority: P1)

A platform administrator needs to onboard a new lawyer to a law firm by creating their authentication account, firm profile with lawyer role, California bar license credential, and assigning them organizational permissions in one operation.

**Why this priority**: This is the primary use case for law firm onboarding. Lawyers are the core users of the system, and they must have proper credentials and roles to perform their work. This must work flawlessly.

**Independent Test**: Can be fully tested by provisioning a user with email "attorney@firm.com", name "Jane Attorney", lawyer role, California bar license #12345, and organization admin role, then verifying the authentication user exists, firm profile is created with lawyer role, bar license is stored with correct jurisdiction and number, and the user can authenticate and access the organization.

**Acceptance Scenarios**:

1. **Given** a law firm "Acme Legal" exists, **When** admin provisions a new user with email "john@acme.com", name "John Smith", display name "John Smith, Esq.", lawyer role, California bar license #CA123456 issued 2020-01-15, and organization role "member", **Then** the system creates an authentication user, creates a Logto user account, creates a firm user profile with lawyer role, stores the bar license credential, assigns the organization role, and sends an invitation email
2. **Given** provisioning a lawyer, **When** admin provides two bar licenses (California #CA123 and New York #NY456), **Then** the system creates both credential records associated with the user
3. **Given** provisioning a lawyer with invitation settings, **When** admin specifies locale "es-MX" and custom redirect URI "https://app.acme.com/onboarding", **Then** the invitation email is sent in Spanish and contains the custom redirect link
4. **Given** an existing Logto user "existing_user_123", **When** admin provisions by linking to that Logto user ID instead of creating new, **Then** the system creates the firm profile and credentials but links to the existing authentication account

---

### User Story 2 - Provision Paralegal without Credentials (Priority: P1)

A platform administrator needs to onboard a paralegal who doesn't have professional credentials, assigning them the paralegal functional role and appropriate organization permissions without requiring bar license information.

**Why this priority**: Not all law firm staff are licensed attorneys. The system must support non-credentialed staff like paralegals, receptionists, and administrators who are equally important for firm operations.

**Independent Test**: Can be fully tested by provisioning a user with email "para@firm.com", paralegal role, no credentials, and basic organization member role, then verifying the user is created successfully without any credential requirements.

**Acceptance Scenarios**:

1. **Given** a law firm "Acme Legal" exists, **When** admin provisions a paralegal with email "sarah@acme.com", name "Sarah Johnson", display name "Sarah Johnson", paralegal role, no credentials, and organization role "member", **Then** the system creates the user account, firm profile with paralegal role, assigns organization role, and does not require any professional credentials
2. **Given** provisioning a paralegal, **When** admin provides job title "Senior Paralegal" and office location "San Francisco Office", **Then** the system stores this metadata in the firm profile
3. **Given** provisioning a receptionist, **When** admin assigns role "RECEPTIONIST" with visibility "internal", **Then** the system creates the profile with receptionist role and internal visibility (not public-facing)

---

### User Story 3 - Prevent Duplicate User Creation (Priority: P1)

The system must prevent creating duplicate users when the same email already exists, either in the authentication system or when an idempotency key is reused, ensuring data integrity and avoiding confusion.

**Why this priority**: Duplicate user accounts cause authentication issues, data inconsistencies, permission conflicts, and billing problems. Prevention is critical for data integrity.

**Independent Test**: Can be fully tested by creating a user with email "test@firm.com", attempting to create another user with the same email in the same or different firm, and verifying the system rejects the duplicate with a clear conflict error.

**Acceptance Scenarios**:

1. **Given** an existing user with email "john@acme.com", **When** admin attempts to provision another user with email "john@acme.com" (same firm or different firm), **Then** the system rejects the request with HTTP 409 Conflict status and error message indicating the email is already in use
2. **Given** a previous successful provisioning request with idempotency key "key_abc123", **When** admin retries the request with the same idempotency key, **Then** the system returns the existing user record without creating a duplicate
3. **Given** an existing Logto user "user_xyz" already linked to a firm profile, **When** admin attempts to provision using the same Logto user ID for a different firm, **Then** the system allows creation of a second firm profile for the same authentication user (multi-tenancy support)

---

### User Story 4 - Bulk User Listing and Filtering (Priority: P2)

A platform administrator or automated system needs to retrieve lists of users within a law firm, filtered by role, credential type, jurisdiction, or active status to generate reports, verify compliance, or support administrative workflows.

**Why this priority**: While not required for individual user provisioning, filtering and listing capabilities are essential for ongoing administration, compliance reporting, and user management at scale.

**Independent Test**: Can be fully tested by creating 50 users with various roles (lawyers, paralegals, admins) and jurisdictions (CA, NY, TX), then querying with different filters (role=LAWYER, jurisdiction=CA, credentialType=BAR_LICENSE) and verifying only matching users are returned.

**Acceptance Scenarios**:

1. **Given** a law firm with 20 lawyers, 10 paralegals, and 5 admins, **When** admin requests user list filtered by role=LAWYER, **Then** the system returns only the 20 lawyer profiles with pagination metadata
2. **Given** a law firm with users having California, New York, and Texas bar licenses, **When** admin filters by jurisdiction=CA, **Then** the system returns only users with at least one California credential
3. **Given** a law firm with 100 users, **When** admin requests profiles filtered by credentialType=BAR_LICENSE and jurisdiction=NY, **Then** the system returns only users with New York bar licenses
4. **Given** a law firm with active and inactive users, **When** admin filters by isActive=true, **Then** the system returns only users with active firm profiles
5. **Given** admin needs full credential details, **When** they request user list with include=credentials parameter, **Then** the system includes the full credentials array in each user profile response

---

### User Story 5 - Search Users by Identity Information (Priority: P2)

A platform administrator needs to find users by their Logto user ID or email address to resolve support tickets, verify account status, or link external systems to internal user IDs.

**Why this priority**: Essential for customer support and system integrations, but not required for basic user provisioning operations.

**Independent Test**: Can be fully tested by creating a user with known Logto user ID and email, searching by Logto user ID, verifying the correct user is returned, then searching by email and confirming the same result.

**Acceptance Scenarios**:

1. **Given** a user exists with Logto user ID "logto_abc123" and email "john@acme.com", **When** admin searches with logtoUserId=logto_abc123, **Then** the system returns the user's authentication record with ID, email, name, and verification status
2. **Given** a user exists with email "john@acme.com", **When** admin searches with email=john@acme.com, **Then** the system returns the user's authentication record
3. **Given** no user exists with email "nonexistent@acme.com", **When** admin searches with that email, **Then** the system returns an empty results array with appropriate metadata
4. **Given** multiple users match search criteria, **When** admin searches, **Then** the system returns paginated results with all matches

---

### Edge Cases

- What happens when provisioning a user with an email that exists in Logto but not in the application's authentication users table?
- How does the system handle provisioning when the Logto API is unavailable or returns an error during user creation?
- What validation occurs for professional credentials when jurisdiction code format is invalid or unrecognized?
- How are users handled when their Logto account is deleted directly in Logto after being provisioned in the application?
- What happens when attempting to provision a user with functional role array containing invalid or undefined roles?
- How does the system behave when sending invitation emails fails (email service unavailable)?
- What validation occurs for display names to prevent XSS or injection attacks in public-facing profiles?
- How are credential issue dates validated to prevent future dates or unrealistic historical dates?
- What happens when filtering users by credentials but some users have NULL or empty credential arrays?

## Requirements *(mandatory)*

### Functional Requirements

#### User Identity Creation

- **FR-001**: System MUST support creating new authentication user accounts with email and name
- **FR-002**: System MUST validate email format for all user creation requests
- **FR-003**: System MUST enforce unique email constraint across all authentication users
- **FR-004**: System MUST generate unique user ID for each created authentication user
- **FR-005**: System MUST support creating new Logto users during provisioning when createInLogto flag is true
- **FR-006**: System MUST support linking existing Logto users by providing Logto user ID
- **FR-007**: System MUST store Logto user ID in authentication user record when linked or created
- **FR-008**: System MUST set email verification status from Logto user data when available
- **FR-009**: System MUST default new users to active status (isActive=true)
- **FR-010**: System MUST record creation and update timestamps for all authentication users
- **FR-011**: System MUST require either logtoUserId (for linking) OR createInLogto+email+name (for new user creation)

#### Firm Profile Creation

- **FR-012**: System MUST create firm user profile linked to both authentication user and law firm
- **FR-013**: System MUST require displayName for all firm profile creation requests
- **FR-014**: System MUST support optional profile fields: jobTitle, officeLocation, photoUrl, visibility, listed, listedOrder
- **FR-015**: System MUST default visibility to "internal" when not specified
- **FR-016**: System MUST default listed flag to false when not specified
- **FR-017**: System MUST support three visibility levels: public, internal, hidden
- **FR-018**: System MUST store multiple functional roles in a roles array
- **FR-019**: System MUST support seven functional role types: LAWYER, PARALEGAL, RECEPTIONIST, BILLING_ADMIN, IT_ADMIN, INTERN, OTHER
- **FR-020**: System MUST allow empty roles array (for users without specific functional roles)
- **FR-021**: System MUST default new profiles to active status (isActive=true)
- **FR-022**: System MUST support optional practice-related fields: practiceTitle, practiceStartDate
- **FR-023**: System MUST generate unique profile ID for each firm user profile
- **FR-024**: System MUST record creation and update timestamps for all firm profiles

#### Professional Credentials Management

- **FR-025**: System MUST support adding zero or more professional credentials during user provisioning
- **FR-026**: System MUST support three credential types: BAR_LICENSE, NOTARY, OTHER
- **FR-027**: System MUST store credential details: type, jurisdictionCode, number, issuedAt, status
- **FR-028**: System MUST allow null values for optional credential fields (jurisdictionCode, number, issuedAt, status)
- **FR-029**: System MUST generate unique credential ID for each professional credential
- **FR-030**: System MUST record creation and update timestamps for all credentials
- **FR-031**: System MUST link credentials to authentication users (not firm profiles) to support multi-tenancy
- **FR-032**: System MUST support adding multiple credentials of the same type with different jurisdictions
- **FR-033**: System MUST validate credential issue dates are not in the future when provided
- **FR-034**: System MUST support adding credentials during initial provisioning via credentials array

#### Organization Role Assignment

- **FR-035**: System MUST support assigning Logto organization roles during user provisioning
- **FR-036**: System MUST add user to law firm's Logto organization when logtoOrgRoles are specified
- **FR-037**: System MUST support multiple organization roles per user
- **FR-038**: System MUST validate organization role names against available Logto org roles
- **FR-039**: System MUST handle Logto API errors gracefully during organization member creation
- **FR-040**: System MUST support provisioning users without organization roles (application-only accounts)

#### Invitation Management

- **FR-041**: System MUST support sending invitation emails when invite.send flag is true
- **FR-042**: System MUST support configurable invitation locale (default: en-US)
- **FR-043**: System MUST support custom redirect URI in invitation emails
- **FR-044**: System MUST include authentication setup instructions in invitation emails
- **FR-045**: System MUST handle email delivery failures gracefully without blocking user creation
- **FR-046**: System MUST log invitation send status for audit purposes

#### User Listing and Filtering

- **FR-047**: System MUST support listing all user profiles within a law firm with pagination
- **FR-048**: System MUST support filtering by functional role (e.g., role=LAWYER)
- **FR-049**: System MUST support filtering by credential type (e.g., credentialType=BAR_LICENSE)
- **FR-050**: System MUST support filtering by credential jurisdiction (e.g., jurisdiction=CA)
- **FR-051**: System MUST support filtering by credential existence (hasCredential=true/false)
- **FR-052**: System MUST support filtering by active status (isActive=true/false)
- **FR-053**: System MUST support including credentials in response via include=credentials parameter
- **FR-054**: System MUST return pagination metadata including page, size, and total count
- **FR-055**: System MUST default to page 1 and size 50 when not specified
- **FR-056**: System MUST enforce maximum page size of 200
- **FR-057**: System MUST join credentials data when filtering by credential-related parameters
- **FR-058**: System MUST return users who have ANY credential matching jurisdiction filter (OR logic)

#### User Search by Identity

- **FR-059**: System MUST support searching authentication users by Logto user ID
- **FR-060**: System MUST support searching authentication users by email address
- **FR-061**: System MUST return paginated results for user search queries
- **FR-062**: System MUST return empty array when no users match search criteria
- **FR-063**: System MUST support case-insensitive email search
- **FR-064**: System MUST return user fields: id, logtoUserId, name, email, emailVerified, isActive, createdAt, updatedAt

#### Idempotency and Error Handling

- **FR-065**: System MUST support idempotency for user provisioning using Idempotency-Key header
- **FR-066**: System MUST return existing user record when idempotency key matches previous successful request
- **FR-067**: System MUST return HTTP 400 Bad Request for invalid input data with field-level error details
- **FR-068**: System MUST return HTTP 409 Conflict when email already exists
- **FR-069**: System MUST return HTTP 404 Not Found when law firm does not exist
- **FR-070**: System MUST return HTTP 401 Unauthorized for unauthenticated requests
- **FR-071**: System MUST return HTTP 403 Forbidden for unauthorized users
- **FR-072**: System MUST include correlation ID (X-Request-Id header) in all responses

#### Transactional Integrity

- **FR-073**: System MUST create authentication user, firm profile, and credentials atomically (all or nothing)
- **FR-074**: System MUST roll back all database changes if any step of provisioning fails
- **FR-075**: System MUST roll back database changes if Logto user creation fails
- **FR-076**: System MUST roll back database changes if organization member addition fails
- **FR-077**: System MUST continue provisioning if invitation email send fails (email failure is non-critical)

#### Response and Return Values

- **FR-078**: System MUST return complete user details after successful provisioning
- **FR-079**: System MUST return authentication user object with all fields
- **FR-080**: System MUST return firm user profile object with all fields including roles array
- **FR-081**: System MUST return credentials array with all created professional credentials
- **FR-082**: System MUST return provisioning response within 10 seconds when Logto is available

### Key Entities

- **Authentication User**: Core identity with unique email, name, optional Logto user ID, email verification status, active status, and timestamps (shared across multiple firm profiles for multi-tenancy)
- **Provision User Identity**: Provisioning input specifying either existing Logto user link (logtoUserId) or new user creation (createInLogto, email, name) with optional invitation settings (send, locale, redirectUri)
- **Firm User Profile**: Law firm-specific user profile with display name, job title, office location, photo, visibility (public/internal/hidden), listed flag for directory, listed order, functional roles array (LAWYER, PARALEGAL, etc.), optional practice information (title, start date), active status, and timestamps
- **Provision User Profile**: Provisioning input for firm profile with display name, optional metadata (jobTitle, officeLocation, visibility, listed, listedOrder), and active status
- **Professional Credential**: User credential with type (BAR_LICENSE, NOTARY, OTHER), optional jurisdiction code, license number, issue date, status, and timestamps (linked to authentication user for multi-firm support)
- **Add Credential Request**: Input for adding credential with type, optional jurisdiction, number, issue date, and status
- **Provision User Request**: Complete provisioning input combining identity (link or create), profile details, functional roles array, optional credentials array, organization roles array, and custom metadata
- **Provision User Response**: Provisioning output with created authentication user, firm user profile, and credentials array

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Platform administrators can provision a complete user (identity + profile + credentials + org roles) in under 7 seconds when Logto is available
- **SC-002**: System successfully prevents duplicate email creation with 100% accuracy
- **SC-003**: User provisioning with Logto user creation succeeds in 99% of cases when Logto is available
- **SC-004**: System correctly rolls back ALL changes (auth user, profile, credentials) in 100% of cases when any provisioning step fails
- **SC-005**: Credential filtering returns accurate results for 100% of queries (users with matching jurisdiction and type)
- **SC-006**: User listing queries return results in under 500 milliseconds for law firms with up to 500 users
- **SC-007**: User search by email or Logto ID completes in under 200 milliseconds
- **SC-008**: Idempotent provisioning requests return identical results for 100% of duplicate idempotency keys
- **SC-009**: All validation errors include specific field-level details helping administrators correct input
- **SC-010**: Invitation emails are sent within 30 seconds for 95% of provisioning requests when email service is available
- **SC-011**: System maintains data consistency across authentication users, firm profiles, and credentials with zero orphaned records
- **SC-012**: Multi-role assignment works correctly for 100% of users assigned 2 or more functional roles
