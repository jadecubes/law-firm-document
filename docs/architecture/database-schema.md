---
sidebar_position: 1
sidebar_label: Database Schema
---

# Database Schema & ERD

## Interactive ERD Viewer

View the complete Entity Relationship Diagram with interactive navigation:

**[🔗 Open Interactive ERD on dbdocs.io](https://dbdocs.io/debra321/law-firm/v/71?view=relationships)**

Features:
- **Interactive Navigation**: Click on tables to explore relationships
- **Search**: Find specific tables, columns, or relationships
- **Zoom & Pan**: Navigate large schema sections easily
- **Relationship Views**: Toggle between different visualization modes

---

## Schema Overview

The database is organized into logical slices representing different business domains:

### Core Domain

#### SLICE 0 — Law Firms
Tenant boundary and firm-level configuration.

**Tables**: `LAW_FIRMS`

#### SLICE 1 — Authentication & User Profiles
Logto-integrated authentication with cached user data and firm-specific profiles.

**Tables**: `AUTH_USERS`, `LOGTO_ORGANIZATIONS`, `LOGTO_ORG_MEMBERSHIPS`, `FIRM_USER_PROFILES`, `LAWYER_LICENSES`, `LOCALES`, `USER_PROFILE_TRANSLATIONS`

**Key Principles**:
- `AUTH_USERS` = Cached mirror of Logto users (external auth)
- `FIRM_USER_PROFILES` = Employees of a specific law firm
- Logto handles: Authentication, basic user management, organizations
- App handles: Fine-grained RBAC, resource-level permissions, business logic

#### SLICE 5A — Clients & Cases
Core litigation and client management entities.

**Tables**: `CLIENTS`, `CLIENT_CONTACTS`, `CASES`, `CASE_SPECIALTY`, `CASE_BUDGETS`

### Authorization & Access Control

#### SLICE 10 — Authorization (Logto-integrated RBAC)
Fine-grained permissions, roles, and resource access control.

**Tables**: `PERMISSIONS`, `ROLES`, `ROLE_PERMISSIONS`, `USER_ROLE_ASSIGNMENTS`, `LOGTO_ORG_ROLE_MAPPINGS`, `RESOURCE_TYPES`, `RESOURCE_SUBTYPES`, `RESOURCE_ACCESS_GRANTS`, `LOGTO_SYNC_LOG`

**Key Features**:
- Polymorphic `RESOURCE_ACCESS_GRANTS` across all resource types
- Logto organization role → App role mappings
- Field-level permission policies
- Temporal access (starts_at/ends_at)

### Collaboration & Documents

#### SLICE 21 — Documents & File Management
Document storage, versioning, and access control.

**Tables**: `DOCUMENTS`

**Features**:
- File metadata (URL, size, type, hash)
- Document categorization (PLEADING, EVIDENCE, CONTRACT, etc.)
- Privileged/confidential flags
- Version control with parent relationships
- Soft delete support

#### SLICE 22 — Notifications
Real-time user notifications and alerts.

**Tables**: `NOTIFICATIONS`

**Features**:
- Polymorphic resource references
- Multiple channels (IN_APP, EMAIL, SMS, PUSH)
- Read/unread tracking
- Auto-expiration for cleanup

#### SLICE 23 — Collaboration (Comments)
Unified commenting system across all resources.

**Tables**: `COMMENTS`

**Features**:
- Polymorphic comments on any resource type
- @mentions support
- Threading (nested comments)
- Edit tracking
- Soft delete

### Time & Billing

#### SLICE 13 — Time & Expense Entries
Work tracking and client-billable expenses.

**Tables**: `LAWYER_TIME_ENTRIES`, `PARTNER_TIME_ENTRIES`, `EXPENSE_ENTRIES`

#### SLICE 14 — Invoicing, Credit Notes & Payments
Accounts receivable and payment processing.

**Tables**: `INVOICES`, `INVOICE_LINE_ITEMS`, `CREDIT_NOTES`, `PAYMENTS`, `PAYMENT_METHODS`, `PAYMENT_ALLOCATIONS`, `PAYMENT_EVENTS`

**Principles**:
- Financial events are append-only
- Never mutate historical rows
- Complete audit trail via `PAYMENT_EVENTS`

### Scheduling

#### SLICE 19 — Appointments
Meeting scheduling, attendees, and time tracking.

**Tables**: `APPOINTMENTS`, `APPOINTMENT_ATTENDEES`, `APPOINTMENT_NOTES`, `APPOINTMENT_CONSENTS`, `APPOINTMENT_EVENTS`

**Features**:
- Multi-attendee support (firm users, clients, partner attorneys)
- Response tracking (accepted/declined/tentative)
- Actual vs scheduled time tracking
- Consent management

---

## User Types

The system supports four distinct user types:

1. **Internal Staff User** (Logto + `FIRM_USER_PROFILES`)
   - Law firm employees (lawyers, paralegals, admins)
   - Full access to firm resources

2. **Partner Attorney Portal User** (Logto + `PARTNER_ATTORNEY_USERS`)
   - External attorneys from partner firms
   - Case-specific collaboration access

3. **Client Portal User** (Logto + `CLIENT_USERS`)
   - Clients accessing their cases and documents
   - Limited, permission-based access

4. **Platform Admin** (Logto with system roles)
   - System administrators
   - Support access via `SUPPORT_ACCESS_SESSIONS`

---

## Key Architectural Patterns

### Polymorphic Resource Pattern

Many tables use polymorphic references to support multiple resource types:

```sql
-- Example: COMMENTS table
resource_type varchar  // CASE|DOCUMENT|TIME_ENTRY|CLIENT
resource_id varchar    // ID of the resource being commented on
```

**Used in**:
- `COMMENTS` - Comments on any resource
- `NOTIFICATIONS` - Notifications about any resource
- `RESOURCE_ACCESS_GRANTS` - Access control for any resource

### Logto Integration Pattern

External authentication with local caching:

```sql
AUTH_USERS
├── logto_user_id (external key)
├── logto_synced_at (sync tracking)
└── app-specific fields (preferences, login tracking)
```

**Benefits**:
- Fast local queries (no API calls)
- Offline capability
- App-specific extensions

### Multi-Tenant Pattern

Every major table includes firm-level isolation:

```sql
law_firm_id bigint  // -> LAW_FIRMS.id
```

### Temporal Access Pattern

Time-bounded permissions and relationships:

```sql
starts_at datetime
ends_at datetime
```

**Used in**:
- `USER_ROLE_ASSIGNMENTS` - Temporary role grants
- `RESOURCE_ACCESS_GRANTS` - Time-limited access
- `CASE_ATTORNEYS` - Project-based assignments

---

## Database Documentation

### Viewing the ERD

**Interactive Viewer**: [dbdocs.io](https://dbdocs.io/debra321/law-firm/v/71?view=relationships)

**Download DBML**: [View Source](/database.dbml) *(if you publish the DBML file)*

### Updating the Schema

When the database schema changes:

1. Update the DBML file
2. Push to dbdocs.io: `dbdocs build schema.dbml`
3. Regenerate API documentation: `npm run docusaurus gen-api-docs`
4. Update this documentation page if major changes occur

---

## Related Documentation

- [Admin API Reference](/docs/backstage/apis/admin/law-firm-admin-provisioning-api-logto-managed-rbac)
- [User API Reference](/docs/backstage/apis/user/law-firm-user-portal-api)
- [RBAC & Permissions](/docs/backstage/specifications/)
